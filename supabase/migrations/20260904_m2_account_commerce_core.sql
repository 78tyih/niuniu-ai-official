-- M2: Account & Commerce Core — 用户中心、权益、积分、推广、返佣、提现、通知、审计
-- 基于已存在的 profiles / plans / orders / subscriptions / card_keys / feedback / admin_audit_log

-- ============================================================
-- 1. 扩展现有表
-- ============================================================

-- 1a. plans 补充推荐标识与排序
alter table public.plans add column if not exists recommended boolean not null default false;
alter table public.plans add column if not exists sort_order integer not null default 0;
alter table public.plans add column if not exists commissionable boolean not null default true;

-- 1b. orders 补充完整字段
alter table public.orders add column if not exists currency text not null default 'CNY';
alter table public.orders add column if not exists discount_amount integer not null default 0;
alter table public.orders add column if not exists payable_amount integer;
alter table public.orders add column if not exists referral_id bigint;
alter table public.orders add column if not exists fulfilled_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists expired_at timestamptz;
alter table public.orders add column if not exists metadata jsonb not null default '{}'::jsonb;

-- 1c. subscriptions 补充字段
alter table public.subscriptions add column if not exists id bigint generated always as identity;
alter table public.subscriptions add column if not exists source_order_id text;
alter table public.subscriptions add column if not exists auto_renew boolean not null default false;
alter table public.subscriptions add column if not exists billing_provider text;
alter table public.subscriptions add column if not exists updated_at timestamptz not null default now();

-- 订阅过期计算：不额外存 status，由 expires_at 计算，保留 status 兼容
alter table public.subscriptions add column if not exists subscription_history jsonb not null default '[]'::jsonb;

-- 1d. profiles 补充字段
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists account_status text not null default 'active'
  check (account_status in ('active', 'suspended', 'closed'));
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists locale text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- ============================================================
-- 2. Entitlement Definitions（权益定义）
-- ============================================================
create table if not exists public.entitlement_definitions (
  code text primary key,
  name text not null,
  description text,
  category text not null default 'core', -- core / service / support
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2b. Plan → Entitlement 映射
create table if not exists public.plan_entitlements (
  id bigint generated always as identity primary key,
  plan_code text not null references public.plans(code) on delete cascade,
  entitlement_code text not null references public.entitlement_definitions(code) on delete cascade,
  value text not null default 'true',
  created_at timestamptz not null default now(),
  unique(plan_code, entitlement_code)
);

-- 2c. User Entitlements（实际授予用户的权益）
create table if not exists public.user_entitlements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_code text not null references public.entitlement_definitions(code) on delete cascade,
  source_type text not null, -- 'subscription' / 'admin_grant' / 'promotion'
  source_id text,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, entitlement_code, source_type, source_id)
);

-- ============================================================
-- 3. Credit Wallet & Ledger（牛气值钱包 + 流水账本）
-- ============================================================
create table if not exists public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_type text not null
    check (transaction_type in ('recharge', 'consume', 'refund', 'bonus', 'admin_adjustment', 'reversal', 'expiration')),
  amount integer not null, -- 正数=增加，负数=减少
  balance_before integer not null,
  balance_after integer not null,
  source_type text not null, -- 'order' / 'ai_call' / 'admin' / 'subscription'
  source_id text, -- order_no / ai_call_id / etc.
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, created_at desc);

-- 原子扣减牛气值（带并发安全）
create or replace function public.debit_credits(
  p_user_id uuid,
  p_amount integer,
  p_source_type text,
  p_source_id text,
  p_description text default null
) returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_balance integer;
begin
  select balance into v_balance from public.credit_wallets where user_id = p_user_id for update;
  if not found or v_balance < p_amount then
    return false;
  end if;
  update public.credit_wallets
    set balance = balance - p_amount, updated_at = now()
    where user_id = p_user_id;
  insert into public.credit_ledger (user_id, transaction_type, amount, balance_before, balance_after, source_type, source_id, description)
    values (p_user_id, 'consume', -p_amount, v_balance, v_balance - p_amount, p_source_type, p_source_id, p_description);
  return true;
end;
$function$;

-- 原子增加牛气值
create or replace function public.recharge_credits(
  p_user_id uuid,
  p_amount integer,
  p_source_type text,
  p_source_id text,
  p_description text default null
) returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_balance integer;
begin
  select balance into v_balance from public.credit_wallets where user_id = p_user_id for update;
  if not found then
    insert into public.credit_wallets (user_id, balance) values (p_user_id, p_amount);
    v_balance := 0;
  else
    update public.credit_wallets set balance = balance + p_amount, updated_at = now() where user_id = p_user_id;
  end if;
  insert into public.credit_ledger (user_id, transaction_type, amount, balance_before, balance_after, source_type, source_id, description)
    values (p_user_id, 'recharge', p_amount, v_balance, v_balance + p_amount, p_source_type, p_source_id, p_description);
end;
$function$;

-- ============================================================
-- 4. Referral（推广邀请）
-- ============================================================
create table if not exists public.referral_codes (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  alias text,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);
create index if not exists referral_codes_owner_idx on public.referral_codes (owner_user_id);

-- 每个用户自动生成一个邀请码
create or replace function public.generate_referral_code(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_code text;
  v_attempts int := 0;
begin
  loop
    v_code := 'NNAI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));
    begin
      insert into public.referral_codes (owner_user_id, code) values (p_user_id, v_code);
      return v_code;
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts >= 5 then
        raise exception 'failed to generate unique referral code';
      end if;
    end;
  end loop;
end;
$function$;

create table if not exists public.referrals (
  id bigint generated always as identity primary key,
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  referral_code_id bigint references public.referral_codes(id),
  status text not null default 'active' check (status in ('active', 'reversed')),
  attributed_at timestamptz not null default now(),
  first_paid_order_id bigint references public.orders(id),
  created_at timestamptz not null default now(),
  unique(referred_user_id) -- 一个用户只能有一个邀请人
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_user_id);

-- ============================================================
-- 5. Commission（佣金）
-- ============================================================
create table if not exists public.commission_rules (
  id bigint generated always as identity primary key,
  name text not null,
  partner_level text not null default 'default' check (partner_level in ('default', 'partner', 'agent', 'custom')),
  product_scope text not null default 'all' check (product_scope in ('all', 'subscription', 'credit')),
  commission_type text not null default 'percentage' check (commission_type in ('percentage', 'fixed')),
  rate numeric(5,2) not null default 0, -- 百分比 0.00-100.00
  fixed_amount integer not null default 0, -- 固定金额（分）
  hold_days integer not null default 30, -- 待结算天数
  status text not null default 'active' check (status in ('active', 'disabled')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

-- 默认返佣规则（可由后台配置覆盖）
insert into public.commission_rules (name, partner_level, rate, hold_days) values
  ('默认推广返佣', 'default', 5.00, 30)
on conflict do nothing;

create table if not exists public.commissions (
  id bigint generated always as identity primary key,
  beneficiary_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade,
  order_id bigint not null references public.orders(id),
  payment_id bigint,
  rule_id bigint references public.commission_rules(id),
  base_amount integer not null, -- 基数（分）
  commission_rate numeric(5,2) not null,
  commission_amount integer not null, -- 佣金金额（分）
  currency text not null default 'CNY',
  status text not null default 'pending'
    check (status in ('pending', 'available', 'reserved', 'paid', 'reversed')),
  available_at timestamptz,
  created_at timestamptz not null default now(),
  reversed_at timestamptz,
  paid_at timestamptz
);
create index if not exists commissions_beneficiary_idx on public.commissions (beneficiary_user_id, status);
create index if not exists commissions_order_idx on public.commissions (order_id);

-- ============================================================
-- 6. Payout（提现）
-- ============================================================
create table if not exists public.payout_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  currency text not null default 'CNY',
  method text not null check (method in ('wechat', 'alipay', 'bank', 'usdt')),
  account_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'approved', 'paid', 'rejected', 'cancelled')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  paid_at timestamptz,
  rejected_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now()
);
create index if not exists payout_requests_user_idx on public.payout_requests (user_id, status);

-- ============================================================
-- 7. Webhook Events（幂等存储）
-- ============================================================
create table if not exists public.webhook_events (
  id bigint generated always as identity primary key,
  provider text not null, -- stripe / wechat / alipay
  external_event_id text not null,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now(),
  unique(provider, external_event_id)
);

-- ============================================================
-- 8. Notifications（通知）
-- ============================================================
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- subscription_expiring / credit_low / commission_available / payout_status / order_update
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================
-- 9. Audit Logs（统一审计日志）
-- ============================================================
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_type text not null check (actor_type in ('user', 'admin', 'system')),
  actor_id text not null,
  action text not null,
  resource_type text,
  resource_id text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_type, actor_id, created_at desc);
create index if not exists audit_logs_resource_idx on public.audit_logs (resource_type, resource_id);

-- 审计日志写入函数
create or replace function public.write_audit_log(
  p_actor_type text,
  p_actor_id text,
  p_action text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_before_data jsonb default null,
  p_after_data jsonb default null,
  p_reason text default null
) returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.audit_logs (actor_type, actor_id, action, resource_type, resource_id, before_data, after_data, reason)
    values (p_actor_type, p_actor_id, p_action, p_resource_type, p_resource_id, p_before_data, p_after_data, p_reason);
end;
$function$;

-- ============================================================
-- 10. mark_order_paid 扩展（纳入新模型）
-- ============================================================
create or replace function public.mark_order_paid(p_order_no text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order public.orders%rowtype;
  v_plan public.plans%rowtype;
  v_sub public.subscriptions%rowtype;
  v_key public.card_keys%rowtype;
  v_interval interval;
  v_balance_before integer;
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if not found or v_order.status = 'paid' then
    return;
  end if;
  select * into v_plan from public.plans where code = v_order.plan_code;
  v_interval := case when v_plan.days > 0
    then make_interval(days => v_plan.days)
    else make_interval(months => v_plan.months) end;

  -- 自动发货
  select * into v_key from public.card_keys
    where plan_code = v_order.plan_code and status = 'available'
    order by id limit 1
    for update skip locked;
  if found then
    update public.card_keys
      set status = 'sold', order_no = p_order_no, sold_at = now()
      where id = v_key.id;
    update public.orders
      set status = 'paid', paid_at = now(),
          delivered_code = v_key.code, delivery_status = 'delivered'
      where order_no = p_order_no;
  else
    update public.orders
      set status = 'paid', paid_at = now(), delivery_status = 'out_of_stock'
      where order_no = p_order_no;
  end if;

  -- 订阅处理
  select * into v_sub from public.subscriptions where user_id = v_order.user_id;
  if found and v_sub.status = 'active' and v_sub.expires_at > now() then
    update public.subscriptions
      set expires_at = v_sub.expires_at + v_interval,
          nq_balance = v_sub.nq_balance + v_plan.nq_credit,
          last_order_no = p_order_no,
          source_order_id = p_order_no,
          updated_at = now()
      where user_id = v_order.user_id;
  else
    insert into public.subscriptions (user_id, plan_code, status, started_at, expires_at, nq_balance, last_order_no, source_order_id)
    values (v_order.user_id, v_plan.code, 'active', now(), now() + v_interval, v_plan.nq_credit, p_order_no, p_order_no)
    on conflict (user_id) do update
      set plan_code = excluded.plan_code, status = 'active',
          started_at = excluded.started_at, expires_at = excluded.expires_at,
          nq_balance = excluded.nq_balance, last_order_no = excluded.last_order_no,
          source_order_id = excluded.source_order_id, updated_at = now();
  end if;

  -- 牛气值发放
  if v_plan.nq_credit > 0 then
    perform public.recharge_credits(v_order.user_id, v_plan.nq_credit, 'order', p_order_no, '套餐赠送牛气值');
  end if;

  -- 写审计日志
  perform public.write_audit_log('system', 'mark_order_paid', 'order.paid',
    'order', p_order_no, null,
    jsonb_build_object('order_no', p_order_no, 'plan_code', v_plan.code, 'amount_cents', v_order.amount_cents));
end;
$function$;

-- ============================================================
-- 11. 种子数据：Entitlement Definitions
-- ============================================================
insert into public.entitlement_definitions (code, name, description, category, sort_order) values
  ('ai_analysis', 'AI 行情分析', 'AI 帮助整理行情、指标与交易条件', 'core', 1),
  ('risk_review', 'AI 风险审核', '在行动之前增加一次独立检查', 'core', 2),
  ('position_diagnosis', 'AI 持仓诊断', '对已有持仓进行 AI 辅助分析', 'core', 3),
  ('mt5_connection', 'MT5 连接', '一键同步行情与持仓，全程只读', 'core', 4),
  ('trade_review', 'AI 日志与复盘', '保存历史订单、分析与决策记录', 'core', 5),
  ('custom_prompt', '自定义 Prompt', '让 AI 更接近自己的交易逻辑', 'core', 6),
  ('prompt_library', '官方 Prompt 更新', '持续获取官方优化后的交易策略模板', 'core', 7),
  ('community_access', '社区教程', '使用社区与教程中心', 'service', 8),
  ('workflow_setup', '工作流配置指导', '季卡用户专属引导服务', 'service', 9),
  ('priority_support', '优先技术支持', '年卡用户专属服务', 'service', 10)
on conflict (code) do nothing;