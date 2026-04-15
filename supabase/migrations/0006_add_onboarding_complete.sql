-- Add onboarding_complete to profiles
alter table public.profiles
add column if not exists onboarding_complete boolean default false;

-- backfill: set onboarding_complete = true for profiles that have developer_profiles rows
update public.profiles p
set onboarding_complete = true
from public.developer_profiles d
where p.id = d.user_id;