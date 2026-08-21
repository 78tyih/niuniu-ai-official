-- ============================================================
-- 牛牛AI 官网后端 · Supabase 建库脚本
-- 用法：Supabase 项目 → SQL Editor → 新建查询 → 粘贴全文 → Run
-- ============================================================

-- 1. 用户资料（auth.users 的扩展，存昵称与手机号）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  created_at timestamptz not null default now()
);

-- 2. 套餐（官方 C 端直营价）
create table if not exists public.plans (
  code text primary key,
  name text not null,
  price_cents integer not null,
  currency text not null default 'CNY',
  interval text not null,               -- days3 / month / quarter / year
  months integer not null default 0,
  days integer not null default 0,
  nq_credit integer not null default 0, -- 牛气值（规则待厂家确认）
  features jsonb not null default '[]',
  is_active boolean not null default true
);

insert into public.plans (code, name, price_cents, interval, months, days, nq_credit, features) values
  ('days3',    '3天体验卡', 19900,  'days3',   0,  3, 300,
   '["完整功能 3 天体验","三层 AI 工作流（分析/审核/诊断）","适合渠道体验与活动","含 300 牛气值（规则待确认）"]'),
  ('monthly',  '月卡',      98000,  'month',   1,  0, 3000,
   '["三层 AI 工作流（分析/审核/诊断）","风控与过滤设置","AI 日志与复盘","含 3,000 牛气值（规则待确认）"]'),
  ('quarterly','季卡',      201800, 'quarter', 3,  0, 10000,
   '["包含月卡全部功能","克隆分析师（自定义提示词）","历史订单逻辑提炼","含 10,000 牛气值（规则待确认）"]'),
  ('yearly',   '年卡',      698000, 'year',   12,  0, 45000,
   '["包含季卡全部功能","优先兼容性检测与部署协助","版本更新优先体验","含 45,000 牛气值（规则待确认）"]')
on conflict (code) do nothing;

-- 3. 订单
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_no text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  amount_cents integer not null,
  channel text not null,                 -- wechat / alipay / stripe
  status text not null default 'pending',-- pending / paid / cancelled
  stripe_session_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- 4. 订阅
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status text not null default 'active', -- active / expired / cancelled
  started_at timestamptz not null,
  expires_at timestamptz not null,
  nq_balance integer not null default 0,
  last_order_no text
);

-- 5. 支付入账（原子操作：订单置为已支付 + 订阅开通/顺延 + 牛气值累加）
create or replace function public.mark_order_paid(p_order_no text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_plan public.plans%rowtype;
  v_sub public.subscriptions%rowtype;
  v_interval interval;
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if not found or v_order.status = 'paid' then
    return;
  end if;
  select * into v_plan from public.plans where code = v_order.plan_code;
  v_interval := case when v_plan.days > 0
    then make_interval(days => v_plan.days)
    else make_interval(months => v_plan.months) end;

  update public.orders set status = 'paid', paid_at = now() where order_no = p_order_no;

  select * into v_sub from public.subscriptions where user_id = v_order.user_id;
  if found and v_sub.status = 'active' and v_sub.expires_at > now() then
    -- 续费：顺延到期时间、累加牛气值，保留当前套餐标识（短期卡不覆盖长期卡）
    update public.subscriptions
      set expires_at = v_sub.expires_at + v_interval,
          nq_balance = v_sub.nq_balance + v_plan.nq_credit,
          last_order_no = p_order_no
      where user_id = v_order.user_id;
  else
    insert into public.subscriptions (user_id, plan_code, status, started_at, expires_at, nq_balance, last_order_no)
    values (v_order.user_id, v_plan.code, 'active', now(), now() + v_interval, v_plan.nq_credit, p_order_no)
    on conflict (user_id) do update
      set plan_code = excluded.plan_code, status = 'active',
          started_at = excluded.started_at, expires_at = excluded.expires_at,
          nq_balance = excluded.nq_balance, last_order_no = excluded.last_order_no;
  end if;
end;
$$;

-- 6. 行级安全（RLS）
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;

create policy "plans 所有人可读" on public.plans for select using (is_active);
create policy "profiles 本人可读" on public.profiles for select using (auth.uid() = id);
create policy "profiles 本人可建" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles 本人可改" on public.profiles for update using (auth.uid() = id);
create policy "orders 本人可读" on public.orders for select using (auth.uid() = user_id);
create policy "subscriptions 本人可读" on public.subscriptions for select using (auth.uid() = user_id);
-- 订单与订阅的写入只允许服务端（service role）进行，前端无法伪造支付结果
