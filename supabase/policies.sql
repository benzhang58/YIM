alter table gyms enable row level security;
alter table user_profiles enable row level security;
alter table reviews enable row level security;
alter table busyness_reports enable row level security;
alter table gym_submission_requests enable row level security;
alter table gym_edit_suggestions enable row level security;
alter table gym_photos enable row level security;
alter table content_reports enable row level security;
alter table account_deletion_requests enable row level security;

drop policy if exists "Public gyms are readable" on gyms;
create policy "Public gyms are readable"
on gyms for select
using (is_active = true);

drop policy if exists "Users can read their own profile" on user_profiles;
create policy "Users can read their own profile"
on user_profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on user_profiles;
create policy "Users can create their own profile"
on user_profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on user_profiles;
create policy "Users can update their own profile"
on user_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can create crowd reports" on busyness_reports;
create policy "Authenticated users can create crowd reports"
on busyness_reports for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can create reviews" on reviews;
create policy "Authenticated users can create reviews"
on reviews for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can submit missing gyms" on gym_submission_requests;
create policy "Authenticated users can submit missing gyms"
on gym_submission_requests for insert
to authenticated
with check (auth.uid() = submitted_by);

drop policy if exists "Authenticated users can file content reports" on content_reports;
create policy "Authenticated users can file content reports"
on content_reports for insert
to authenticated
with check (auth.uid() = reported_by);

drop policy if exists "Authenticated users can request account deletion" on account_deletion_requests;
create policy "Authenticated users can request account deletion"
on account_deletion_requests for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own deletion requests" on account_deletion_requests;
create policy "Users can read their own deletion requests"
on account_deletion_requests for select
to authenticated
using (auth.uid() = user_id);
