-- 1. Perbarui tabel kelas yang sudah ada
alter table public.kelas alter column name set not null;
-- Tambahkan unique constraint jika belum ada
alter table public.kelas add constraint kelas_name_key unique (name);

-- 2. Buat tabel siswa
create table if not exists public.siswa (
  id uuid default gen_random_uuid() primary key,
  nis text not null unique,
  name text not null,
  class text references public.kelas(name) on update cascade on delete set null,
  gender char(1) check (gender in ('L', 'P')),
  birth_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Buat tabel pelanggaran
create table if not exists public.pelanggaran (
  id uuid default gen_random_uuid() primary key,
  student_nis text references public.siswa(nis) on update cascade on delete cascade not null,
  student_name text not null,
  class text,
  type text not null,
  level text check (level in ('Ringan', 'Sedang', 'Berat')) not null,
  points integer not null,
  date date not null,
  status text check (status in ('Aktif', 'Selesai')) default 'Aktif' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Buat tabel user (profiles) yang terintegrasi dengan auth.users
create table if not exists public.user (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Buat function & trigger untuk sinkronisasi otomatis user dari auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Aktifkan Row Level Security (RLS) pada tabel-tabel baru
alter table public.siswa enable row level security;
alter table public.pelanggaran enable row level security;
alter table public.user enable row level security;

-- 7. Buat Kebijakan RLS (Policies)
-- Kebijakan Kelas
drop policy if exists "Allow all operations for authenticated users on kelas" on public.kelas;
create policy "Allow all operations for authenticated users on kelas"
  on public.kelas for all to authenticated using (true) with check (true);

-- Kebijakan Siswa
drop policy if exists "Allow all operations for authenticated users on siswa" on public.siswa;
create policy "Allow all operations for authenticated users on siswa"
  on public.siswa for all to authenticated using (true) with check (true);

-- Kebijakan Pelanggaran
drop policy if exists "Allow all operations for authenticated users on pelanggaran" on public.pelanggaran;
create policy "Allow all operations for authenticated users on pelanggaran"
  on public.pelanggaran for all to authenticated using (true) with check (true);

-- Kebijakan User
drop policy if exists "Allow authenticated users to read profiles" on public.user;
create policy "Allow authenticated users to read profiles"
  on public.user for select to authenticated using (true);

drop policy if exists "Allow users to update their own profile" on public.user;
create policy "Allow users to update their own profile"
  on public.user for update to authenticated using (auth.uid() = id);
