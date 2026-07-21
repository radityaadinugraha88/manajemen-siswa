-- Add detailed fields to public.pelanggaran table for edit modal support
alter table public.pelanggaran 
  add column if not exists waktu text,
  add column if not exists lokasi text,
  add column if not exists deskripsi text,
  add column if not exists tindakan_tanggal date,
  add column if not exists tindakan_catatan text,
  add column if not exists foto_url text;
