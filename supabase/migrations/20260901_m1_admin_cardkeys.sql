-- M1: 管理台 MVP + 卡密库存与自动发货
-- 1) 卡密库存表：从上游 vendor 控制台手动搬运的授权码
create table if not exists public.card_keys (
  id bigint generated always as identity primary key,
  code text not null unique,
  plan_code text not null references public.plans(code),
  batch text not null default '',
  cost_cents integer,
  status text not null default 'available' check (status in ('available','sold','disabled')),
  order_no text,
  sold_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists card_keys_pick_idx on public.card_keys (plan_code, status, id);

-- 2) 用户反馈
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  type text not null default 'other',
  content text not null,
  contact text,
  status text not null default 'new' check (status in ('new','done')),
  created_at timestamptz not null default now()
);

-- 3) 管理操作审计
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 4) orders 增加发货字段
alter table public.orders add column if not exists delivered_code text;
alter table public.orders add column if not exists delivery_status text not null default 'none';

alter table public.card_keys enable row level security;
alter table public.feedback enable row level security;
alter table public.admin_audit_log enable row level security;
-- 不开放任何 anon/authenticated 策略：所有读写都走服务端 service role

-- 5) mark_order_paid 扩展：支付成功后原子化取码发货；无库存则标记 out_of_stock 不阻塞支付
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
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if not found or v_order.status = 'paid' then
    return;
  end if;
  select * into v_plan from public.plans where code = v_order.plan_code;
  v_interval := case when v_plan.days > 0
    then make_interval(days => v_plan.days)
    else make_interval(months => v_plan.months) end;

  -- 自动发货：取该套餐最早一条可用卡密
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
$function$;

-- 6) 手动补单发货：库存回补后给 out_of_stock 订单补发
create or replace function public.fulfill_order(p_order_no text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order public.orders%rowtype;
  v_key public.card_keys%rowtype;
begin
  select * into v_order from public.orders where order_no = p_order_no for update;
  if not found then
    return 'order_not_found';
  end if;
  if v_order.status <> 'paid' then
    return 'order_not_paid';
  end if;
  if v_order.delivery_status = 'delivered' then
    return 'already_delivered';
  end if;
  select * into v_key from public.card_keys
    where plan_code = v_order.plan_code and status = 'available'
    order by id limit 1
    for update skip locked;
  if not found then
    return 'out_of_stock';
  end if;
  update public.card_keys
    set status = 'sold', order_no = p_order_no, sold_at = now()
    where id = v_key.id;
  update public.orders
    set delivered_code = v_key.code, delivery_status = 'delivered'
    where order_no = p_order_no;
  return 'delivered';
end;
$function$;
