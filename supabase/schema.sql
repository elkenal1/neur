-- Analyses table: stores questionnaire submissions
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Step 1: Background
  entrepreneur_type text check (entrepreneur_type in ('new', 'expanding')),
  has_industry_experience boolean,
  current_industry text,

  -- Step 2: Industry
  industry_preference text,
  industry_open_to_suggestions boolean default false,

  -- Step 3: Location
  preferred_state text,
  preferred_city text,
  open_to_relocation boolean default false,
  operation_type text check (operation_type in ('physical', 'online', 'both')),

  -- Step 4: Budget & Timeline
  budget_range text check (budget_range in ('under_10k','10k_50k','50k_100k','100k_500k','500k_plus')),
  launch_timeline text check (launch_timeline in ('asap','3_6_months','6_12_months','1_plus_years')),

  -- Step 5: Target Customer
  customer_type text check (customer_type in ('b2b','b2c','both')),
  customer_age_range text,
  customer_income_level text check (customer_income_level in ('low','middle','upper_middle','high','all')),

  -- Step 6: Goals
  primary_goal text check (primary_goal in ('income_replacement','lifestyle','scale_fast','build_and_sell','passive_income')),
  secondary_goals text[],

  -- Status
  status text default 'pending' check (status in ('pending','processing','complete'))
);

-- Row level security: users can only see their own analyses
alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);
