create table if not exists public.global_notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(btrim(message)) > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  sent_at timestamptz not null default timezone('utc', now()),
  delivery_status text not null default 'sent'
    check (delivery_status in ('sent', 'failed'))
);

create index if not exists global_notifications_sent_at_idx
  on public.global_notifications (sent_at desc);

alter table public.global_notifications enable row level security;

create policy "Users can read global notifications"
  on public.global_notifications
  for select
  to authenticated
  using (true);

create policy "Admins can create global notifications"
  on public.global_notifications
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
