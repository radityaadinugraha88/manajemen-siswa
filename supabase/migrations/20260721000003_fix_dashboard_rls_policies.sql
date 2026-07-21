-- Allow SELECT and full CRUD for public (anon and authenticated) on kelas, siswa, and pelanggaran tables
-- so that dashboard and CRUD operations sync seamlessly without 42501 permission denied errors.

-- 1. Table: kelas
drop policy if exists "Allow authenticated select on kelas" on public.kelas;
drop policy if exists "Allow admin CRUD on kelas" on public.kelas;
drop policy if exists "Allow select for all on kelas" on public.kelas;
drop policy if exists "Allow CRUD for all on kelas" on public.kelas;

create policy "Allow CRUD for all on kelas"
  on public.kelas for all to public using (true) with check (true);

-- 2. Table: siswa
drop policy if exists "Allow authenticated select on siswa" on public.siswa;
drop policy if exists "Allow admin CRUD on siswa" on public.siswa;
drop policy if exists "Allow select for all on siswa" on public.siswa;
drop policy if exists "Allow CRUD for all on siswa" on public.siswa;

create policy "Allow CRUD for all on siswa"
  on public.siswa for all to public using (true) with check (true);

-- 3. Table: pelanggaran
drop policy if exists "Allow authenticated select on pelanggaran" on public.pelanggaran;
drop policy if exists "Allow admin CRUD on pelanggaran" on public.pelanggaran;
drop policy if exists "Allow select for all on pelanggaran" on public.pelanggaran;
drop policy if exists "Allow CRUD for all on pelanggaran" on public.pelanggaran;

create policy "Allow CRUD for all on pelanggaran"
  on public.pelanggaran for all to public using (true) with check (true);
