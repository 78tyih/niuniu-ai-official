-- M3: Account & Commerce RLS Policies
-- 用户在 Supabase SQL Editor 以 service role 运行

-- ============================================================
-- 1. Enable RLS on all new tables
-- ============================================================
alter table public.entitlement_definitions enable row level security;
alter table public.plan_entitlements enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.commission_rules enable row level security;
alter table public.commissions enable row level security;
alter table public.payout_requests enable row level security;
alter table public.webhook_events enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================
-- 2. 公开可读（无需登录）
-- ============================================================
create policy "entitlement_definitions 所有人可读"
  on public.entitlement_definitions for select using (true);

create policy "plan_entitlements 所有人可读"
  on public.plan_entitlements for select using (true);

create policy "commission_rules 所有人可读"
  on public.commission_rules for select using (true);

-- ============================================================
-- 3. 本人可读（authenticated 用户仅能读自己的数据）
-- ============================================================
create policy "user_entitlements 本人可读"
  on public.user_entitlements for select using (auth.uid() = user_id);

create policy "credit_wallets 本人可读"
  on public.credit_wallets for select using (auth.uid() = user_id);

create policy "credit_ledger 本人可读"
  on public.credit_ledger for select using (auth.uid() = user_id);

create policy "referral_codes 本人可读"
  on public.referral_codes for select using (auth.uid() = owner_user_id);

create policy "referrals 本人可读（作为邀请人）"
  on public.referrals for select using (auth.uid() = referrer_user_id);

create policy "referrals 本人可读（作为被邀请人）"
  on public.referrals for select using (auth.uid() = referred_user_id);

create policy "commissions 本人可读"
  on public.commissions for select using (auth.uid() = beneficiary_user_id);

create policy "payout_requests 本人可读"
  on public.payout_requests for select using (auth.uid() = user_id);

create policy "notifications 本人可读"
  on public.notifications for select using (auth.uid() = user_id);

create policy "notifications 本人可改"
  on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- 4. 本人可写：referral_codes, payout_requests
-- ============================================================
create policy "referral_codes 本人可创建"
  on public.referral_codes for insert with check (auth.uid() = owner_user_id);

create policy "payout_requests 本人可创建"
  on public.payout_requests for insert with check (auth.uid() = user_id);

-- ============================================================
-- 5. 服务端专用：所有写入操作仅限 service role
-- 以下表不开放任何 anon/authenticated 写入策略
-- webhook_events, audit_logs, commissions, referrals, credit_ledger, credit_wallets
-- user_entitlements, plan_entitlements
-- ============================================================

-- 5a. referral_codes 生成函数（service role 专用）
-- 用户注册时由后端调用 generate_referral_code()

-- 5b. referrals 绑定：登录用户可查询自己的邀请关系，但不可直接写入
-- 写入由后端校验后调用

-- ============================================================
-- 6. 现有表追加 RLS 策略
-- ============================================================

-- orders 追加本人可创建
create policy "orders 本人可创建"
  on public.orders for insert with check (auth.uid() = user_id);

-- profiles 追加本人可创建 alias
drop policy if exists "profiles 本人可建" on public.profiles;
create policy "profiles 本人可建"
  on public.profiles for insert with check (auth.uid() = id);

-- subscriptions 追加 admin 可读（admin 管理用）
-- 需要先修改 admin 角色表或使用 email 白名单

-- ============================================================
-- 7. 现有表：orders 增加 pending 状态读取
-- ============================================================
-- 已存在：orders 本人可读，无需追加

-- ============================================================
-- 8. 安全备注
-- ============================================================
-- 前端 anon key 只能读取：
--   - entitlement_definitions, plan_entitlements, commission_rules
--   - 自己的 user_entitlements, credit_wallets, credit_ledger
--   - 自己的 orders, subscriptions, profiles
--   - 自己的 referral_codes, referrals, commissions, payout_requests
--   - 自己的 notifications
-- 所有写入（创建订单、支付回执、佣金发放等）均走 service role
-- 前端通过 API /auth 中间件触发 service role 操作