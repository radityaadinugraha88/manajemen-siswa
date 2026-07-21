-- 1. Tambahkan kolom role ke tabel public.user jika belum ada
alter table public.user add column if not exists role text default 'user';

-- 2. Perbarui trigger handle_new_user untuk menyinkronkan data role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    case
      when new.email = 'admin@sekolah.com' then 'admin'
      else 'user'
    end
  )
  on conflict (id) do update
  set role = excluded.role,
      name = excluded.name;
  return new;
end;
$$ language plpgsql security definer;

-- Pastikan admin demo yang sudah terdaftar diperbarui perannya menjadi 'admin'
update public.user set role = 'admin' where email = 'admin@sekolah.com';

-- 3. Buat helper function untuk memeriksa apakah user yang login adalah admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 4. Set Ulang Kebijakan (Policies) Kelas
drop policy if exists "Allow all operations for authenticated users on kelas" on public.kelas;
drop policy if exists "Allow admin CRUD on kelas" on public.kelas;
drop policy if exists "Allow authenticated select on kelas" on public.kelas;

create policy "Allow authenticated select on kelas"
  on public.kelas for select to authenticated using (true);
create policy "Allow admin CRUD on kelas"
  on public.kelas for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Set Ulang Kebijakan (Policies) Siswa
drop policy if exists "Allow all operations for authenticated users on siswa" on public.siswa;
drop policy if exists "Allow admin CRUD on siswa" on public.siswa;
drop policy if exists "Allow authenticated select on siswa" on public.siswa;

create policy "Allow authenticated select on siswa"
  on public.siswa for select to authenticated using (true);
create policy "Allow admin CRUD on siswa"
  on public.siswa for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 6. Set Ulang Kebijakan (Policies) Pelanggaran
drop policy if exists "Allow all operations for authenticated users on pelanggaran" on public.pelanggaran;
drop policy if exists "Allow admin CRUD on pelanggaran" on public.pelanggaran;
drop policy if exists "Allow authenticated select on pelanggaran" on public.pelanggaran;

create policy "Allow authenticated select on pelanggaran"
  on public.pelanggaran for select to authenticated using (true);
create policy "Allow admin CRUD on pelanggaran"
  on public.pelanggaran for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 7. Set Ulang Kebijakan (Policies) User (Profiles)
drop policy if exists "Allow authenticated users to read profiles" on public.user;
drop policy if exists "Allow users to update their own profile" on public.user;
drop policy if exists "Allow admin full access on profiles" on public.user;

create policy "Allow authenticated read on profiles"
  on public.user for select to authenticated using (true);
create policy "Allow users to update their own profile"
  on public.user for update to authenticated using (auth.uid() = id);
create policy "Allow admin full access on profiles"
  on public.user for all to authenticated using (public.is_admin()) with check (public.is_admin());
