create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text,
  login_id text unique,
  auth_email text unique,
  phone text,
  role text not null default 'STAFF' check (role in ('ADMIN','STAFF')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  contact_method text,
  insurance_company text,
  status text not null default 'NEW' check (status in ('NEW','IN_PROGRESS','CONTRACTED','CLOSED')),
  assigned_to uuid references public.profiles(id) on delete set null,
  manager_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.lead_contracts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  designated_fee_rate text,
  settlement_amount numeric(14,0),
  fee_amount numeric(14,0),
  memo text,
  primary_manager_id uuid references public.profiles(id) on delete set null,
  primary_manager_name text,
  secondary_manager_id uuid references public.profiles(id) on delete set null,
  secondary_manager_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.insurance_contacts (
  id uuid primary key default gen_random_uuid(),
  insurance_company text not null,
  manager_name text,
  position text,
  phone text,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.partner_companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  region text,
  phone text,
  contract_status text,
  manager_name text,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  hospital_name text not null,
  region text,
  hospital_type text,
  manager_name text,
  position text,
  phone text,
  partnership_status text,
  internal_manager_name text,
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.db_files (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('LEAD','INSURANCE','PARTNER','HOSPITAL')),
  target_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_url text,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default '기타',
  author_id uuid references public.profiles(id) on delete set null,
  is_notice boolean not null default false,
  pin_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.board_files (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  description text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_profile_id()
returns uuid language sql stable security definer as $$
  select id from public.profiles where auth_user_id = auth.uid() and is_active = true limit 1
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where auth_user_id = auth.uid() and role='ADMIN' and is_active=true)
$$;

create or replace function public.is_active_user()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where auth_user_id = auth.uid() and is_active=true)
$$;

-- triggers
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_leads_updated before update on public.leads for each row execute function public.set_updated_at();
create trigger trg_notes_updated before update on public.lead_notes for each row execute function public.set_updated_at();
create trigger trg_contracts_updated before update on public.lead_contracts for each row execute function public.set_updated_at();
create trigger trg_insurance_updated before update on public.insurance_contacts for each row execute function public.set_updated_at();
create trigger trg_partners_updated before update on public.partner_companies for each row execute function public.set_updated_at();
create trigger trg_hospitals_updated before update on public.hospitals for each row execute function public.set_updated_at();
create trigger trg_posts_updated before update on public.board_posts for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.app_settings for each row execute function public.set_updated_at();

-- indexes
create index if not exists idx_leads_deleted_created on public.leads(deleted_at, created_at desc);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_lead_notes_lead on public.lead_notes(lead_id, created_at desc);
create index if not exists idx_db_files_target on public.db_files(target_type, target_id, created_at desc);
create index if not exists idx_contracts_lead on public.lead_contracts(lead_id);
create index if not exists idx_board_notice on public.board_posts(is_notice, pin_order, created_at desc);

insert into public.app_settings(key,value,description) values
('staff_name_options','["강이삭","홍성원","이중호","장중원"]'::jsonb,'담당자 드롭다운 기본값')
on conflict(key) do update set value=excluded.value, description=excluded.description, updated_at=now();

insert into storage.buckets(id, name, public) values ('db-files','db-files', true) on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_contracts enable row level security;
alter table public.insurance_contacts enable row level security;
alter table public.partner_companies enable row level security;
alter table public.hospitals enable row level security;
alter table public.db_files enable row level security;
alter table public.board_posts enable row level security;
alter table public.board_files enable row level security;
alter table public.app_settings enable row level security;
alter table public.activity_logs enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (public.is_active_user());
create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy leads_select on public.leads for select to authenticated using (deleted_at is null and (public.is_admin() or assigned_to = public.current_profile_id() or assigned_to is null));
create policy leads_insert on public.leads for insert to authenticated with check (public.is_active_user());
create policy leads_update on public.leads for update to authenticated using (deleted_at is null and (public.is_admin() or assigned_to = public.current_profile_id())) with check (public.is_admin() or assigned_to = public.current_profile_id());

create policy notes_select on public.lead_notes for select to authenticated using (deleted_at is null and public.is_active_user());
create policy notes_insert on public.lead_notes for insert to authenticated with check (author_id = public.current_profile_id());
create policy notes_update on public.lead_notes for update to authenticated using (public.is_admin() or author_id = public.current_profile_id()) with check (public.is_admin() or author_id = public.current_profile_id());

create policy contracts_all_active on public.lead_contracts for all to authenticated using (public.is_active_user()) with check (public.is_active_user());
create policy insurance_all_active on public.insurance_contacts for all to authenticated using (deleted_at is null and public.is_active_user()) with check (public.is_active_user());
create policy partners_all_active on public.partner_companies for all to authenticated using (deleted_at is null and public.is_active_user()) with check (public.is_active_user());
create policy hospitals_all_active on public.hospitals for all to authenticated using (deleted_at is null and public.is_active_user()) with check (public.is_active_user());

create policy files_select on public.db_files for select to authenticated using (deleted_at is null and public.is_active_user());
create policy files_insert on public.db_files for insert to authenticated with check (uploaded_by = public.current_profile_id());
create policy files_update on public.db_files for update to authenticated using (public.is_admin() or uploaded_by = public.current_profile_id()) with check (public.is_admin() or uploaded_by = public.current_profile_id());

create policy posts_select on public.board_posts for select to authenticated using (deleted_at is null and public.is_active_user());
create policy posts_insert on public.board_posts for insert to authenticated with check (author_id = public.current_profile_id());
create policy posts_update on public.board_posts for update to authenticated using (public.is_admin() or author_id = public.current_profile_id()) with check (public.is_admin() or author_id = public.current_profile_id());
create policy board_files_select on public.board_files for select to authenticated using (deleted_at is null and public.is_active_user());
create policy board_files_all on public.board_files for all to authenticated using (public.is_active_user()) with check (public.is_active_user());

create policy settings_select on public.app_settings for select to authenticated using (public.is_active_user());
create policy settings_admin on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy logs_admin on public.activity_logs for select to authenticated using (public.is_admin());
create policy logs_insert on public.activity_logs for insert to authenticated with check (public.is_active_user());

grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
