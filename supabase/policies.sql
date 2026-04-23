alter table gyms enable row level security;
alter table reviews enable row level security;
alter table busyness_reports enable row level security;
alter table gym_submission_requests enable row level security;
alter table gym_edit_suggestions enable row level security;
alter table gym_photos enable row level security;

create policy "Public gyms are readable"
on gyms for select
using (is_active = true);

create policy "Authenticated users can create crowd reports"
on busyness_reports for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Authenticated users can create reviews"
on reviews for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Authenticated users can submit missing gyms"
on gym_submission_requests for insert
to authenticated
with check (auth.uid() = submitted_by);
