-- 1. Aktifkan ekstensi pgcrypto untuk melakukan enkripsi password jika belum aktif
create extension if not exists pgcrypto;

-- 2. Jalankan skrip pembuatan user demo
do $$
declare
  new_user_id uuid := gen_random_uuid();
begin
  -- Hapus user demo lama jika ada agar tidak terjadi duplikat email
  delete from auth.users where email = 'admin@sekolah.com';

  -- Sisipkan user baru dengan email dan password terenkripsi langsung ke skema auth
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@sekolah.com',
    crypt('admin123', gen_salt('bf')), -- Enkripsi password menggunakan bcrypt
    now(),                             -- Konfirmasi email langsung aktif (tidak perlu verifikasi email)
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Administrator Sekolah"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Catatan: Trigger 'on_auth_user_created' yang kita buat sebelumnya akan otomatis menyisipkan data ini ke tabel 'public.user'
  
  -- Perbarui status role pengguna di public.user menjadi 'admin'
  update public.user set role = 'admin' where email = 'admin@sekolah.com';
end $$;
