"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// TypeScript Interfaces matching screenshots
interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  gender: "L" | "P";
  birthDate: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface Violation {
  id: string;
  studentName: string;
  nis: string;
  class: string;
  type: string; // Jenis Pelanggaran
  level: "Ringan" | "Sedang" | "Berat";
  points: number;
  date: string;
  status: "Aktif" | "Selesai";
  waktu?: string;
  lokasi?: string;
  deskripsi?: string;
  tindakanTanggal?: string;
  tindakanCatatan?: string;
  fotoUrl?: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Active Menu State: Dashboard, Siswa, Kelas, Pelanggaran
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Dashboard Chart Type: kelas | tingkat | siswa
  const [chartType, setChartType] = useState<"kelas" | "tingkat" | "siswa">("kelas");

  // Initial Mock Database based on screenshots
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Ahmad Rizki Pratama", nis: "2024001", class: "X RPL 1", gender: "L", birthDate: "2008-05-15" },
    { id: "2", name: "Siti Nurhaliza", nis: "2024002", class: "X RPL 1", gender: "P", birthDate: "2008-08-21" },
    { id: "3", name: "Budi Santoso", nis: "2024003", class: "X RPL 1", gender: "L", birthDate: "2009-01-10" },
    { id: "4", name: "Dewi Lestari", nis: "2024004", class: "X RPL 2", gender: "P", birthDate: "2008-11-02" },
    { id: "5", name: "Eko Prasetyo", nis: "2024005", class: "X RPL 2", gender: "L", birthDate: "2008-03-30" },
    { id: "6", name: "Fitri Handayani", nis: "2024006", class: "X RPL 2", gender: "P", birthDate: "2009-02-14" },
    { id: "7", name: "Galih Saputra", nis: "2023001", class: "XI RPL 1", gender: "L", birthDate: "2007-07-19" },
    { id: "8", name: "Hana Salsabila", nis: "2023002", class: "XI RPL 1", gender: "P", birthDate: "2007-09-25" },
    { id: "9", name: "Krisna Aditya", nis: "2023005", class: "XI RPL 2", gender: "L", birthDate: "2007-11-12" },
    { id: "10", name: "Irfan Maulana", nis: "2023003", class: "XI RPL 1", gender: "L", birthDate: "2007-05-10" },
    { id: "11", name: "Miko Ardiansyah", nis: "2022001", class: "XII RPL 1", gender: "L", birthDate: "2006-08-15" },
    { id: "12", name: "Rafi Hidayat", nis: "2022005", class: "XII RPL 2", gender: "L", birthDate: "2006-03-02" },
  ]);

  const [classes, setClasses] = useState<ClassItem[]>([
    { id: "1", name: "X RPL 1" },
    { id: "2", name: "X RPL 2" },
    { id: "3", name: "XI RPL 1" },
    { id: "4", name: "XI RPL 2" },
    { id: "5", name: "XII RPL 1" },
    { id: "6", name: "XII RPL 2" },
  ]);

  const [violations, setViolations] = useState<Violation[]>([
    { id: "1", studentName: "Budi Santoso", nis: "2024003", class: "X RPL 1", type: "Tidak Mengerjakan Tugas", level: "Ringan", points: 5, date: "2026-07-08", status: "Aktif" },
    { id: "2", studentName: "Ahmad Rizki Pratama", nis: "2024001", class: "X RPL 1", type: "Terlambat Masuk Kelas", level: "Ringan", points: 10, date: "2026-07-05", status: "Aktif" },
    { id: "3", studentName: "Galih Saputra", nis: "2023001", class: "XI RPL 1", type: "Membolos", level: "Sedang", points: 25, date: "2026-06-18", status: "Aktif" },
    { id: "4", studentName: "Eko Prasetyo", nis: "2024005", class: "X RPL 2", type: "Seragam Tidak Lengkap", level: "Ringan", points: 5, date: "2026-06-12", status: "Selesai" },
    { id: "5", studentName: "Krisna Aditya", nis: "2023005", class: "XI RPL 2", type: "Menggunakan HP saat Pelajaran", level: "Sedang", points: 15, date: "2026-05-15", status: "Selesai" },
    { id: "6", studentName: "Irfan Maulana", nis: "2023003", class: "XI RPL 1", type: "Terlambat Masuk Kelas", level: "Ringan", points: 10, date: "2026-05-03", status: "Selesai" },
    { id: "7", studentName: "Siti Nurhaliza", nis: "2024002", class: "X RPL 1", type: "Terlambat Masuk Kelas", level: "Ringan", points: 10, date: "2026-04-21", status: "Selesai" },
    { id: "8", studentName: "Miko Ardiansyah", nis: "2022001", class: "XII RPL 1", type: "Merokok", level: "Berat", points: 50, date: "2026-04-07", status: "Selesai" },
    { id: "9", studentName: "Rafi Hidayat", nis: "2022005", class: "XII RPL 2", type: "Tidak Mengerjakan Tugas", level: "Ringan", points: 5, date: "2026-03-25", status: "Selesai" },
  ]);

  // Global search & paging inputs matching UI
  const [siswaSearch, setSiswaSearch] = useState("");
  const [siswaClassFilter, setSiswaClassFilter] = useState("Semua Kelas");
  const [siswaLimit, setSiswaLimit] = useState(10);

  const [kelasSearch, setKelasSearch] = useState("");
  const [kelasLimit, setKelasLimit] = useState(10);

  const [pelanggaranSearch, setPelanggaranSearch] = useState("");
  const [pelanggaranLimit, setPelanggaranLimit] = useState(10);
  const [pelanggaranFilterLevel, setPelanggaranFilterLevel] = useState("Semua");

  // Notifications/Toasts
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Modals for CRUD operations
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [siswaModalMode, setSiswaModalMode] = useState<"add" | "edit">("add");
  const [currentSiswaId, setCurrentSiswaId] = useState("");
  const [siswaNameForm, setSiswaNameForm] = useState("");
  const [siswaNisForm, setSiswaNisForm] = useState("");
  const [siswaClassForm, setSiswaClassForm] = useState("X RPL 1");
  const [siswaGenderForm, setSiswaGenderForm] = useState<"L" | "P">("L");
  const [siswaBirthDateForm, setSiswaBirthDateForm] = useState("");

  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
  const [kelasModalMode, setKelasModalMode] = useState<"add" | "edit">("add");
  const [currentKelasId, setCurrentKelasId] = useState("");
  const [kelasNameForm, setKelasNameForm] = useState("");

  const [isPelanggaranModalOpen, setIsPelanggaranModalOpen] = useState(false);
  const [pelanggaranModalMode, setPelanggaranModalMode] = useState<"add" | "edit">("add");
  const [currentPelanggaranId, setCurrentPelanggaranId] = useState("");
  const [pelanggaranStudentNisForm, setPelanggaranStudentNisForm] = useState("");
  const [pelanggaranTypeForm, setPelanggaranTypeForm] = useState("");
  const [pelanggaranLevelForm, setPelanggaranLevelForm] = useState<"Ringan" | "Sedang" | "Berat">("Ringan");
  const [pelanggaranPointsForm, setPelanggaranPointsForm] = useState(5);
  const [pelanggaranDateForm, setPelanggaranDateForm] = useState("");
  const [pelanggaranStatusForm, setPelanggaranStatusForm] = useState<"Aktif" | "Selesai">("Aktif");
  const [pelanggaranWaktuForm, setPelanggaranWaktuForm] = useState("");
  const [pelanggaranLokasiForm, setPelanggaranLokasiForm] = useState("");
  const [pelanggaranDeskripsiForm, setPelanggaranDeskripsiForm] = useState("");
  const [pelanggaranTindakanTanggalForm, setPelanggaranTindakanTanggalForm] = useState("");
  const [pelanggaranTindakanCatatanForm, setPelanggaranTindakanCatatanForm] = useState("");
  const [pelanggaranFotoUrlForm, setPelanggaranFotoUrlForm] = useState("");

  // Photo modal proof
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalViolation, setPhotoModalViolation] = useState<Violation | null>(null);

  // Load data from Supabase
  const loadDataFromSupabase = async () => {
    try {
      const [classRes, siswaRes, violRes] = await Promise.all([
        supabase.from("kelas").select("*").order("name"),
        supabase.from("siswa").select("*").order("created_at", { ascending: false }),
        supabase.from("pelanggaran").select("*").order("date", { ascending: false }),
      ]);

      let classData = classRes.data || [];

      // Auto-seed default classes if the kelas table has no data
      if (classRes.data && classRes.data.length === 0) {
        const defaultClasses = [
          { name: "X RPL 1" },
          { name: "X RPL 2" },
          { name: "XI RPL 1" },
          { name: "XI RPL 2" },
          { name: "XII RPL 1" },
          { name: "XII RPL 2" },
        ];
        const { data: seededData, error: seedError } = await supabase
          .from("kelas")
          .insert(defaultClasses)
          .select();

        if (!seedError && seededData) {
          classData = seededData;
        } else if (seedError) {
          console.error("Error seeding default classes:", seedError);
        }
      }

      setClasses(classData.map((c: any) => ({ id: c.id.toString(), name: c.name })));

      if (siswaRes.data) {
        setStudents(
          siswaRes.data.map((s: any) => ({
            id: s.id.toString(),
            nis: s.nis,
            name: s.name,
            class: s.class || "",
            gender: s.gender as "L" | "P",
            birthDate: s.birth_date,
          }))
        );
      }

      if (violRes.data) {
        setViolations(
          violRes.data.map((v: any) => ({
            id: v.id.toString(),
            studentName: v.student_name,
            nis: v.student_nis,
            class: v.class || "",
            type: v.type,
            level: v.level as "Ringan" | "Sedang" | "Berat",
            points: v.points,
            date: v.date,
            status: v.status as "Aktif" | "Selesai",
            waktu: v.waktu || "",
            lokasi: v.lokasi || "",
            deskripsi: v.deskripsi || "",
            tindakanTanggal: v.tindakan_tanggal || "",
            tindakanCatatan: v.tindakan_catatan || "",
            fotoUrl: v.foto_url || "",
          }))
        );
      }
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    }
  };

  // Authentication protection, data loading, and real-time database subscriptions
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadDataFromSupabase();

      // Subscribe to real-time changes across all three tables
      const channel = supabase
        .channel("school-management-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "kelas" },
          () => {
            loadDataFromSupabase();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "siswa" },
          () => {
            loadDataFromSupabase();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pelanggaran" },
          () => {
            loadDataFromSupabase();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium text-sm">Memuat aplikasi...</p>
      </div>
    );
  }

  // --- CRUD HANDLERS FOR SISWA ---
  const handleOpenAddSiswa = () => {
    setSiswaModalMode("add");
    setSiswaNameForm("");
    setSiswaNisForm("");
    setSiswaClassForm(classes[0]?.name || "X RPL 1");
    setSiswaGenderForm("L");
    setSiswaBirthDateForm("");
    setIsSiswaModalOpen(true);
  };

  const handleOpenEditSiswa = (siswa: Student) => {
    setSiswaModalMode("edit");
    setCurrentSiswaId(siswa.id);
    setSiswaNameForm(siswa.name);
    setSiswaNisForm(siswa.nis);
    setSiswaClassForm(siswa.class);
    setSiswaGenderForm(siswa.gender);
    setSiswaBirthDateForm(siswa.birthDate);
    setIsSiswaModalOpen(true);
  };

  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaNameForm || !siswaNisForm || !siswaBirthDateForm) {
      alert("Semua kolom harus diisi!");
      return;
    }

    if (siswaModalMode === "add") {
      // Check duplicate NIS
      if (students.some((s) => s.nis === siswaNisForm)) {
        alert("NIS sudah digunakan!");
        return;
      }
      const newSiswa: Student = {
        id: Date.now().toString(),
        name: siswaNameForm,
        nis: siswaNisForm,
        class: siswaClassForm,
        gender: siswaGenderForm,
        birthDate: siswaBirthDateForm,
      };
      setStudents((prev) => [...prev, newSiswa]);
      await supabase.from("siswa").insert([
        {
          name: siswaNameForm,
          nis: siswaNisForm,
          class: siswaClassForm,
          gender: siswaGenderForm,
          birth_date: siswaBirthDateForm,
        },
      ]);
      showToast("Data siswa berhasil ditambahkan");
    } else {
      // Edit
      const targetStudent = students.find((s) => s.id === currentSiswaId);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === currentSiswaId
            ? { ...s, name: siswaNameForm, nis: siswaNisForm, class: siswaClassForm, gender: siswaGenderForm, birthDate: siswaBirthDateForm }
            : s
        )
      );
      setViolations((prev) =>
        prev.map((v) =>
          v.nis === targetStudent?.nis
            ? { ...v, studentName: siswaNameForm, nis: siswaNisForm, class: siswaClassForm }
            : v
        )
      );

      await supabase
        .from("siswa")
        .update({
          name: siswaNameForm,
          nis: siswaNisForm,
          class: siswaClassForm,
          gender: siswaGenderForm,
          birth_date: siswaBirthDateForm,
        })
        .eq("nis", targetStudent?.nis || siswaNisForm);

      if (targetStudent?.nis) {
        await supabase
          .from("pelanggaran")
          .update({
            student_name: siswaNameForm,
            class: siswaClassForm,
          })
          .eq("student_nis", targetStudent.nis);
      }

      showToast("Data siswa berhasil diperbarui");
    }
    setIsSiswaModalOpen(false);
    loadDataFromSupabase();
  };

  const handleDeleteSiswa = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      const deletedSiswa = students.find((s) => s.id === id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (deletedSiswa) {
        setViolations((prev) => prev.filter((v) => v.nis !== deletedSiswa.nis));
        await supabase.from("pelanggaran").delete().eq("student_nis", deletedSiswa.nis);
        await supabase.from("siswa").delete().eq("nis", deletedSiswa.nis);
      }
      showToast("Data siswa berhasil dihapus");
      loadDataFromSupabase();
    }
  };

  // --- CRUD HANDLERS FOR KELAS ---
  const handleOpenAddKelas = () => {
    setKelasModalMode("add");
    setKelasNameForm("");
    setIsKelasModalOpen(true);
  };

  const handleOpenEditKelas = (cls: ClassItem) => {
    setKelasModalMode("edit");
    setCurrentKelasId(cls.id);
    setKelasNameForm(cls.name);
    setIsKelasModalOpen(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasNameForm) {
      alert("Nama kelas harus diisi!");
      return;
    }

    if (kelasModalMode === "add") {
      if (classes.some((c) => c.name.toLowerCase() === kelasNameForm.toLowerCase())) {
        alert("Nama kelas sudah ada!");
        return;
      }
      const newCls: ClassItem = {
        id: Date.now().toString(),
        name: kelasNameForm,
      };
      setClasses((prev) => [...prev, newCls]);
      await supabase.from("kelas").insert([{ name: kelasNameForm }]);
      showToast("Data kelas berhasil ditambahkan");
    } else {
      const oldName = classes.find((c) => c.id === currentKelasId)?.name;
      setClasses((prev) =>
        prev.map((c) => (c.id === currentKelasId ? { ...c, name: kelasNameForm } : c))
      );
      if (oldName) {
        setStudents((prev) => prev.map((s) => (s.class === oldName ? { ...s, class: kelasNameForm } : s)));
        setViolations((prev) => prev.map((v) => (v.class === oldName ? { ...v, class: kelasNameForm } : v)));
        await supabase.from("kelas").update({ name: kelasNameForm }).eq("name", oldName);
        await supabase.from("siswa").update({ class: kelasNameForm }).eq("class", oldName);
        await supabase.from("pelanggaran").update({ class: kelasNameForm }).eq("class", oldName);
      }
      showToast("Data kelas berhasil diperbarui");
    }
    setIsKelasModalOpen(false);
    loadDataFromSupabase();
  };

  const handleDeleteKelas = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data kelas ini? Siswa dan pelanggaran di kelas ini akan terpengaruh.")) {
      const deletedCls = classes.find((c) => c.id === id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (deletedCls) {
        setStudents((prev) => prev.map(s => s.class === deletedCls.name ? { ...s, class: "" } : s));
        setViolations((prev) => prev.map(v => v.class === deletedCls.name ? { ...v, class: "" } : v));
        await supabase.from("kelas").delete().eq("name", deletedCls.name);
      }
      showToast("Data kelas berhasil dihapus");
      loadDataFromSupabase();
    }
  };

  // --- CRUD HANDLERS FOR PELANGGARAN ---
  const handleOpenAddPelanggaran = () => {
    setPelanggaranModalMode("add");
    setPelanggaranStudentNisForm(students[0]?.nis || "");
    setPelanggaranTypeForm("");
    setPelanggaranLevelForm("Ringan");
    setPelanggaranPointsForm(5);
    setPelanggaranDateForm(new Date().toISOString().split("T")[0]);
    setPelanggaranWaktuForm("");
    setPelanggaranLokasiForm("");
    setPelanggaranDeskripsiForm("");
    setPelanggaranTindakanTanggalForm("");
    setPelanggaranTindakanCatatanForm("");
    setPelanggaranFotoUrlForm("");
    setPelanggaranStatusForm("Aktif");
    setIsPelanggaranModalOpen(true);
  };

  const handleOpenEditPelanggaran = (viol: Violation) => {
    setPelanggaranModalMode("edit");
    setCurrentPelanggaranId(viol.id);
    setPelanggaranStudentNisForm(viol.nis);
    setPelanggaranTypeForm(viol.type);
    setPelanggaranLevelForm(viol.level);
    setPelanggaranPointsForm(viol.points);
    setPelanggaranDateForm(viol.date);
    setPelanggaranWaktuForm(viol.waktu || "");
    setPelanggaranLokasiForm(viol.lokasi || "");
    setPelanggaranDeskripsiForm(viol.deskripsi || "");
    setPelanggaranTindakanTanggalForm(viol.tindakanTanggal || "");
    setPelanggaranTindakanCatatanForm(viol.tindakanCatatan || "");
    setPelanggaranFotoUrlForm(viol.fotoUrl || "");
    setPelanggaranStatusForm(viol.status);
    setIsPelanggaranModalOpen(true);
  };

  const handleSavePelanggaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pelanggaranTypeForm || !pelanggaranStudentNisForm || !pelanggaranDateForm) {
      alert("Semua kolom harus diisi!");
      return;
    }

    const studentObj = students.find((s) => s.nis === pelanggaranStudentNisForm);
    if (!studentObj) {
      alert("Siswa tidak ditemukan berdasarkan NIS tersebut!");
      return;
    }

    if (pelanggaranModalMode === "add") {
      const newViol: Violation = {
        id: Date.now().toString(),
        studentName: studentObj.name,
        nis: studentObj.nis,
        class: studentObj.class,
        type: pelanggaranTypeForm,
        level: pelanggaranLevelForm,
        points: Number(pelanggaranPointsForm),
        date: pelanggaranDateForm,
        waktu: pelanggaranWaktuForm,
        lokasi: pelanggaranLokasiForm,
        deskripsi: pelanggaranDeskripsiForm,
        tindakanTanggal: pelanggaranTindakanTanggalForm,
        tindakanCatatan: pelanggaranTindakanCatatanForm,
        fotoUrl: pelanggaranFotoUrlForm,
        status: pelanggaranStatusForm,
      };
      setViolations((prev) => [newViol, ...prev]);

      await supabase.from("pelanggaran").insert([
        {
          student_nis: studentObj.nis,
          student_name: studentObj.name,
          class: studentObj.class,
          type: pelanggaranTypeForm,
          level: pelanggaranLevelForm,
          points: Number(pelanggaranPointsForm),
          date: pelanggaranDateForm,
          waktu: pelanggaranWaktuForm,
          lokasi: pelanggaranLokasiForm,
          deskripsi: pelanggaranDeskripsiForm,
          tindakan_tanggal: pelanggaranTindakanTanggalForm || null,
          tindakan_catatan: pelanggaranTindakanCatatanForm,
          foto_url: pelanggaranFotoUrlForm,
          status: pelanggaranStatusForm,
        },
      ]);
      showToast("Data pelanggaran berhasil ditambahkan");
    } else {
      setViolations((prev) =>
        prev.map((v) =>
          v.id === currentPelanggaranId
            ? {
              ...v,
              studentName: studentObj.name,
              nis: studentObj.nis,
              class: studentObj.class,
              type: pelanggaranTypeForm,
              level: pelanggaranLevelForm,
              points: Number(pelanggaranPointsForm),
              date: pelanggaranDateForm,
              waktu: pelanggaranWaktuForm,
              lokasi: pelanggaranLokasiForm,
              deskripsi: pelanggaranDeskripsiForm,
              tindakanTanggal: pelanggaranTindakanTanggalForm,
              tindakanCatatan: pelanggaranTindakanCatatanForm,
              fotoUrl: pelanggaranFotoUrlForm,
              status: pelanggaranStatusForm,
            }
            : v
        )
      );

      await supabase
        .from("pelanggaran")
        .update({
          student_nis: studentObj.nis,
          student_name: studentObj.name,
          class: studentObj.class,
          type: pelanggaranTypeForm,
          level: pelanggaranLevelForm,
          points: Number(pelanggaranPointsForm),
          date: pelanggaranDateForm,
          waktu: pelanggaranWaktuForm,
          lokasi: pelanggaranLokasiForm,
          deskripsi: pelanggaranDeskripsiForm,
          tindakan_tanggal: pelanggaranTindakanTanggalForm || null,
          tindakan_catatan: pelanggaranTindakanCatatanForm,
          foto_url: pelanggaranFotoUrlForm,
          status: pelanggaranStatusForm,
        })
        .eq("id", currentPelanggaranId);

      showToast("Data pelanggaran berhasil diperbarui");
    }
    setIsPelanggaranModalOpen(false);
    loadDataFromSupabase();
  };

  const handleDeletePelanggaran = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data pelanggaran ini?")) {
      setViolations((prev) => prev.filter((v) => v.id !== id));
      await supabase.from("pelanggaran").delete().eq("id", id);
      showToast("Data pelanggaran berhasil dihapus");
      loadDataFromSupabase();
    }
  };

  // --- EXPORTS & DUMMY HANDLERS ---
  const handleExport = (format: "Excel" | "PDF") => {
    showToast(`Berhasil mengekspor data pelanggaran dalam format ${format}`);
  };

  const handleDownloadPDF = (viol: Violation) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Pop-up diblokir browser.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Laporan Pelanggaran - ${viol.studentName}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.6;
              background-color: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #cbd5e1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
              color: #0f172a;
            }
            .header p {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #64748b;
            }
            .title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 30px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #1e3a8a;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .details-table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            .details-table td.label {
              font-weight: bold;
              color: #475569;
              width: 30%;
            }
            .details-table td.value {
              color: #0f172a;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              font-size: 12px;
              font-weight: bold;
              border-radius: 9999px;
            }
            .badge-ringan { background-color: #f0fdf4; color: #16a34a; }
            .badge-sedang { background-color: #fffbeb; color: #d97706; }
            .badge-berat { background-color: #fef2f2; color: #dc2626; }
            .image-section {
              margin-top: 30px;
              text-align: center;
              page-break-inside: avoid;
            }
            .image-section h3 {
              font-size: 14px;
              color: #475569;
              margin-bottom: 15px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .proof-image {
              max-width: 100%;
              max-height: 350px;
              border-radius: 12px;
              border: 1px solid #cbd5e1;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .footer {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #64748b;
              page-break-inside: avoid;
            }
            .signature {
              text-align: center;
              width: 200px;
            }
            .signature-space {
              height: 80px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SMK NEGERI 2 MALANG</h1>
            <p>Jl. Veteran No. 17, Lowokwaru, Malang, Jawa Timur</p>
          </div>
          <div class="title">Laporan Kasus Pelanggaran Kedisiplinan Siswa</div>
          
          <table class="details-table">
            <tr>
              <td class="label">Nama Siswa</td>
              <td class="value">${viol.studentName}</td>
            </tr>
            <tr>
              <td class="label">NIS</td>
              <td class="value">${viol.nis}</td>
            </tr>
            <tr>
              <td class="label">Kelas</td>
              <td class="value">${viol.class}</td>
            </tr>
            <tr>
              <td class="label">Jenis Pelanggaran</td>
              <td class="value">${viol.type}</td>
            </tr>
            <tr>
              <td class="label">Tingkat Pelanggaran</td>
              <td class="value">
                <span class="badge badge-${viol.level === "Berat" ? "berat" : viol.level === "Sedang" ? "sedang" : "ringan"}">${viol.level}</span>
              </td>
            </tr>
            <tr>
              <td class="label">Poin Pelanggaran</td>
              <td class="value"><strong>${viol.points} Poin</strong></td>
            </tr>
            <tr>
              <td class="label">Tanggal / Waktu</td>
              <td class="value">${viol.date} ${viol.waktu ? `• ${viol.waktu}` : ""}</td>
            </tr>
            <tr>
              <td class="label">Lokasi</td>
              <td class="value">${viol.lokasi || "-"}</td>
            </tr>
            <tr>
              <td class="label">Deskripsi Kasus</td>
              <td class="value">${viol.deskripsi || "-"}</td>
            </tr>
            <tr>
              <td class="label">Status Kasus</td>
              <td class="value">${viol.status}</td>
            </tr>
            ${(viol.tindakanTanggal || viol.tindakanCatatan) ? `
            <tr>
              <td class="label">Tindak Lanjut</td>
              <td class="value">
                ${viol.tindakanTanggal ? `Tanggal: ${viol.tindakanTanggal}<br/>` : ""}
                ${viol.tindakanCatatan ? `Catatan: ${viol.tindakanCatatan}` : ""}
              </td>
            </tr>
            ` : ""}
          </table>

          ${viol.fotoUrl ? `
          <div class="image-section">
            <h3>Bukti Foto Pelanggaran</h3>
            <img class="proof-image" src="${viol.fotoUrl}" alt="Bukti Foto" />
          </div>
          ` : ""}

          <div class="footer">
            <div>Dicetak secara otomatis pada: ${new Date().toLocaleString("id-ID")}</div>
            <div class="signature">
              <p>Petugas Kedisiplinan</p>
              <div class="signature-space"></div>
              <p><strong>Admin Sekolah</strong></p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Helper to shorten long names for labels
  const shortenName = (name: string) => {
    if (name.length <= 10) return name;
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return name.slice(0, 10) + "...";
  };

  // Dynamic Bar Chart Datasets
  // Calculate datasets based on chartType
  let chartData: { label: string; points: number; cases: number }[] = [];

  if (chartType === "kelas") {
    chartData = classes.map((c) => {
      const classViolations = violations.filter((v) => v.class === c.name);
      const points = classViolations.reduce((sum, v) => sum + v.points, 0);
      const cases = classViolations.length;
      return { label: c.name, points, cases };
    });
  } else if (chartType === "tingkat") {
    // Teringan (Ringan) hingga Terberat (Berat)
    const levels: ("Ringan" | "Sedang" | "Berat")[] = ["Ringan", "Sedang", "Berat"];
    chartData = levels.map((lvl) => {
      const lvlViolations = violations.filter((v) => v.level === lvl);
      const points = lvlViolations.reduce((sum, v) => sum + v.points, 0);
      const cases = lvlViolations.length;
      return { label: lvl, points, cases };
    });
  } else if (chartType === "siswa") {
    // Siswa dengan pelanggaran teringan (points terendah) hingga terberat (points tertinggi)
    chartData = students
      .map((s) => {
        const studViolations = violations.filter((v) => v.nis === s.nis);
        const points = studViolations.reduce((sum, v) => sum + v.points, 0);
        const cases = studViolations.length;
        return { label: s.name, points, cases };
      })
      .filter((s) => s.points > 0)
      .sort((a, b) => a.points - b.points); // Sort from teringan to terberat
  }

  const maxChartPoints = Math.max(...chartData.map((d) => d.points), 50);

  // Filters for Students Table
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      s.nis.includes(siswaSearch) ||
      s.class.toLowerCase().includes(siswaSearch.toLowerCase());

    const matchesClass =
      siswaClassFilter === "Semua Kelas" || s.class === siswaClassFilter;

    return matchesSearch && matchesClass;
  });

  // Filters for Classes Table
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(kelasSearch.toLowerCase())
  );

  // Filters for Violations Table
  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(pelanggaranSearch.toLowerCase()) ||
      v.nis.includes(pelanggaranSearch) ||
      v.type.toLowerCase().includes(pelanggaranSearch.toLowerCase()) ||
      v.class.toLowerCase().includes(pelanggaranSearch.toLowerCase());

    const matchesLevel =
      pelanggaranFilterLevel === "Semua" || v.level === pelanggaranFilterLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans antialiased text-slate-800">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Sidebar Layout matching mockups */}
      <aside className="w-64 bg-white border-r border-slate-200/80 shrink-0 hidden md:flex flex-col justify-between py-6 px-4">
        <div className="flex flex-col gap-8">

          {/* Logo / Title: "MS Manajemen Siswa" */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold text-sm tracking-tighter shrink-0 select-none">
              MS
            </div>
            <div>
              <span className="font-bold text-md tracking-tight text-slate-900 block leading-tight">Manajemen Siswa</span>
              <span className="text-[11px] text-slate-400 font-medium">SMK Negeri 2 Malang</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[
              { name: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { name: "Siswa", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
              { name: "Kelas", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
              { name: "Pelanggaran", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }
            ].map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3.5 text-[14px] font-semibold transition-all duration-150 cursor-pointer border-none outline-none ${isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <svg className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                  </svg>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer matching mockups */}
        <div className="pt-4 flex flex-col gap-4">
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 select-none">
              AS
            </div>
            <div className="truncate max-w-[130px]">
              <span className="font-bold text-[13px] text-slate-800 block leading-tight truncate">Admin Sekolah</span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">admin@sekolah.com</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 px-3.5 rounded-xl flex items-center gap-3.5 text-[14px] font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-screen">

        {/* Top Header matching screenshots */}
        <header className="bg-white border-b border-slate-200/80 py-4 px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              SMK Negeri 2 Malang || Raditya
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100/80 text-slate-600 flex items-center justify-center font-bold text-xs select-none border border-slate-200/40">
              AS
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6">

          {/* Header Title inside Content Body */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight select-none">
              {activeTab === "Dashboard" ? "Dashboard Analitik" : activeTab}
            </h1>
          </div>

          {/* 1. DASHBOARD VIEW (WITH BAR CHART) */}
          {activeTab === "Dashboard" && (
            <div className="flex flex-col gap-6">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: "Total Siswa", value: students.length, change: "Siswa terdaftar", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "from-blue-500 to-indigo-600" },
                  { title: "Total Kelas", value: classes.length, change: "Kelas terdaftar", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "from-emerald-500 to-teal-600" },
                  { title: "Kasus Pelanggaran", value: violations.length, change: "Kasus tercatat", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: "from-amber-500 to-orange-600" },
                  { title: "Akumulasi Poin", value: violations.reduce((sum, v) => sum + v.points, 0), change: "Poin kedisiplinan", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "from-rose-500 to-red-600" }
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4.5 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shrink-0 shadow-md shadow-slate-100`}>
                      <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                      </svg>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold text-[12px] uppercase tracking-wider block">{card.title}</span>
                      <span className="text-2xl font-bold text-slate-800 tracking-tight block my-0.5">{card.value}</span>
                      <span className="text-[11px] font-semibold text-slate-500 block leading-tight">{card.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* DIAGRAM BATANG (BAR CHART) CARD */}
              <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 flex flex-col gap-6">

                {/* Chart Header with analysis type tabs */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {chartType === "kelas" ? "Statistik Poin Pelanggaran per Kelas" :
                        chartType === "tingkat" ? "Perbandingan Jumlah Kasus (Teringan hingga Terberat)" :
                          "Urutan Siswa Penerima Pelanggaran (Teringan ke Terberat)"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {chartType === "kelas" ? "Analisis perbandingan akumulasi poin pelanggaran kedisiplinan per kelas." :
                        chartType === "tingkat" ? "Analisis perbandingan banyaknya kasus pelanggaran dari tingkat Ringan, Sedang, hingga Berat." :
                          "Analisis data pelanggaran siswa diurutkan berdasarkan akumulasi poin dari yang terendah ke tertinggi."}
                    </p>
                  </div>

                  {/* Toggle Selector */}
                  <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-start lg:self-auto">
                    {[
                      { type: "kelas", label: "Per Kelas" },
                      { type: "tingkat", label: "Per Tingkat" },
                      { type: "siswa", label: "Per Siswa" }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => setChartType(item.type as any)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border-none outline-none ${chartType === item.type
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Responsive Bar Chart Layout */}
                <div className="w-full relative mt-4">
                  {/* Grid Lines */}
                  <div className="absolute inset-y-0 left-12 right-0 flex flex-col justify-between pointer-events-none select-none h-[220px]">
                    {[100, 75, 50, 25, 0].map((percent) => (
                      <div key={percent} className="w-full border-t border-slate-100 relative">
                        <span className="absolute -left-12 -top-2.5 text-[10px] font-bold text-slate-400 w-8 text-right">
                          {Math.round((percent / 100) * maxChartPoints)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart Columns */}
                  <div className="h-[220px] ml-12 flex items-end justify-around relative z-10 pt-2 pb-0.5">
                    {chartData.map((stat, idx) => {
                      const barHeightPercent = (stat.points / maxChartPoints) * 100;
                      return (
                        <div key={idx} className="h-full flex flex-col justify-end items-center group w-1/8 max-w-[64px] relative">

                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none text-center whitespace-nowrap z-20 scale-95 group-hover:scale-100">
                            <div className="font-extrabold text-[11px] text-white leading-tight truncate max-w-[130px]">{stat.label}</div>
                            <div className="text-rose-400 font-extrabold mt-0.5">{stat.points} Poin</div>
                            <div className="text-[9px] text-slate-400 font-normal">{stat.cases} Kasus</div>
                          </div>

                          {/* Bar Element */}
                          <div
                            style={{ height: `${Math.max(barHeightPercent, 4)}%` }}
                            className={`w-full rounded-t-lg shadow-md group-hover:from-rose-500 group-hover:to-orange-500 group-hover:shadow-rose-100 transition-all duration-300 relative cursor-pointer flex items-end justify-center overflow-hidden bg-gradient-to-t ${chartType === "tingkat" && stat.label === "Ringan" ? "from-emerald-500 to-teal-400" :
                              chartType === "tingkat" && stat.label === "Sedang" ? "from-amber-500 to-orange-400" :
                                chartType === "tingkat" && stat.label === "Berat" ? "from-rose-600 to-red-500" :
                                  "from-blue-600 to-indigo-500"
                              }`}
                          >
                            {/* Inner Accent Line */}
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-white/20" />
                          </div>

                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="ml-12 border-t border-slate-200 mt-2 flex justify-around text-center pt-2 select-none">
                    {chartData.map((stat, idx) => (
                      <div
                        key={idx}
                        className="w-1/8 max-w-[64px] text-[10px] font-bold text-slate-500 truncate px-0.5"
                        title={stat.label}
                      >
                        {chartType === "siswa" ? shortenName(stat.label) : stat.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Violations Summary Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Siswa dengan Poin Tertinggi */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Siswa dengan Poin Pelanggaran</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Data akumulasi siswa pelanggar kedisiplinan tertinggi.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {students
                      .map((s) => {
                        const studentViolations = violations.filter((v) => v.nis === s.nis);
                        const totalPoints = studentViolations.reduce((sum, v) => sum + v.points, 0);
                        return { ...s, points: totalPoints };
                      })
                      .filter((s) => s.points > 0)
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 5)
                      .map((student, i) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                              {i + 1}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 text-[13.5px] block leading-tight">{student.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{student.class} • NIS: {student.nis}</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                            {student.points} Poin
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Kasus Pelanggaran Terbaru */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pelanggaran Terkini</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Laporan catatan kasus pelanggaran kedisiplinan terbaru.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {violations
                      .slice(0, 5)
                      .map((viol) => (
                        <div key={viol.id} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors">
                          <div>
                            <span className="font-semibold text-slate-800 text-[13.5px] block leading-tight">{viol.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{viol.type} • {viol.class}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${viol.level === "Ringan" ? "bg-emerald-50 text-emerald-600" :
                              viol.level === "Sedang" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                              }`}>
                              {viol.level}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{viol.date}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. SISWA VIEW */}
          {activeTab === "Siswa" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col overflow-hidden">

              {/* Filter and Control Area */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search field */}
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={siswaSearch}
                    onChange={(e) => setSiswaSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  />
                </div>

                {/* Right controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Filter by Kelas:</span>
                  <select
                    value={siswaClassFilter}
                    onChange={(e) => setSiswaClassFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Semua Kelas">Semua Kelas</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={siswaLimit}
                    onChange={(e) => setSiswaLimit(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>

                  <button
                    onClick={handleOpenAddSiswa}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                  >
                    Tambah Siswa
                  </button>
                </div>
              </div>

              {/* Table list */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 select-none">
                      <th className="py-4 px-6 text-center w-16">NO</th>
                      <th className="py-4 px-6">NAMA</th>
                      <th className="py-4 px-6">NIS</th>
                      <th className="py-4 px-6">KELAS</th>
                      <th className="py-4 px-6 text-center w-36">JENIS KELAMIN</th>
                      <th className="py-4 px-6">TANGGAL LAHIR</th>
                      <th className="py-4 px-6 text-center w-40">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13.5px]">
                    {filteredStudents.slice(0, siswaLimit).length > 0 ? (
                      filteredStudents.slice(0, siswaLimit).map((siswa, i) => (
                        <tr key={siswa.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-6 text-center text-slate-400 font-semibold">{i + 1}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-800">{siswa.name}</td>
                          <td className="py-3.5 px-6 font-mono text-slate-500">{siswa.nis}</td>
                          <td className="py-3.5 px-6 font-medium text-slate-600">{siswa.class || <span className="text-slate-300">-</span>}</td>
                          <td className="py-3.5 px-6 text-center font-bold text-slate-600">{siswa.gender}</td>
                          <td className="py-3.5 px-6 font-medium text-slate-500">{siswa.birthDate}</td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenEditSiswa(siswa)}
                                className="bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSiswa(siswa.id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          Tidak ada data siswa ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Navigation */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium select-none bg-slate-50/30">
                <span>Menampilkan {Math.min(filteredStudents.length, siswaLimit)} dari {filteredStudents.length} data</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    &lt; Sebelumnya
                  </button>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">1/1</span>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    Berikutnya &gt;
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 3. KELAS VIEW */}
          {activeTab === "Kelas" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col overflow-hidden">

              {/* Filter and Control Area */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={kelasSearch}
                    onChange={(e) => setKelasSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  />
                </div>

                {/* Limit select & add button */}
                <div className="flex items-center gap-3">
                  <select
                    value={kelasLimit}
                    onChange={(e) => setKelasLimit(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>

                  <button
                    onClick={handleOpenAddKelas}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                  >
                    Tambah Kelas
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 select-none">
                      <th className="py-4 px-6 text-center w-20">NO</th>
                      <th className="py-4 px-6">NAMA</th>
                      <th className="py-4 px-6 text-center w-40">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13.5px]">
                    {filteredClasses.slice(0, kelasLimit).length > 0 ? (
                      filteredClasses.slice(0, kelasLimit).map((cls, i) => (
                        <tr key={cls.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-6 text-center text-slate-400 font-semibold">{i + 1}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-800">{cls.name}</td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenEditKelas(cls)}
                                className="bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteKelas(cls.id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400 font-medium">
                          Tidak ada data kelas ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium select-none bg-slate-50/30">
                <span>Menampilkan {Math.min(filteredClasses.length, kelasLimit)} dari {filteredClasses.length} data</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    &lt; Sebelumnya
                  </button>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">1/1</span>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    Berikutnya &gt;
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* 4. PELANGGARAN VIEW */}
          {activeTab === "Pelanggaran" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col overflow-hidden">

              {/* Top Export Buttons */}
              <div className="px-6 pt-6 pb-2 flex items-center gap-3.5 select-none">
                <button
                  onClick={() => handleExport("Excel")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer border-none outline-none flex items-center gap-2"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => handleExport("PDF")}
                  className="bg-sky-400 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-sky-400/10 transition-all active:scale-95 cursor-pointer border-none outline-none flex items-center gap-2"
                >
                  Export PDF
                </button>
              </div>

              {/* Control and Search Area */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Search field */}
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={pelanggaranSearch}
                    onChange={(e) => setPelanggaranSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
                  />
                </div>

                {/* Filter tools */}
                <div className="flex flex-wrap items-center gap-3.5">

                  {/* Filter options level */}
                  <div className="bg-slate-100 p-0.5 rounded-xl flex gap-1">
                    {["Semua", "Ringan", "Sedang", "Berat"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setPelanggaranFilterLevel(lvl)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer border-none outline-none ${pelanggaranFilterLevel === lvl
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <select
                    value={pelanggaranLimit}
                    onChange={(e) => setPelanggaranLimit(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>

                  <button
                    onClick={handleOpenAddPelanggaran}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                  >
                    + Tambah Pelanggaran
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 select-none">
                      <th className="py-4 px-6 text-center w-16">No</th>
                      <th className="py-4 px-6">Nama Siswa</th>
                      <th className="py-4 px-6">NIS</th>
                      <th className="py-4 px-6">Kelas</th>
                      <th className="py-4 px-6">Jenis Pelanggaran</th>
                      <th className="py-4 px-6">Tingkat</th>
                      <th className="py-4 px-6 text-center">Poin</th>
                      <th className="py-4 px-6">Tanggal</th>
                      <th className="py-4 px-6 text-center w-20">Foto</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13.5px]">
                    {filteredViolations.slice(0, pelanggaranLimit).length > 0 ? (
                      filteredViolations.slice(0, pelanggaranLimit).map((v, i) => (
                        <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3.5 px-6 text-center text-slate-400 font-semibold">{i + 1}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-800">{v.studentName}</td>
                          <td className="py-3.5 px-6 font-mono text-slate-500">{v.nis}</td>
                          <td className="py-3.5 px-6 font-medium text-slate-600">{v.class || <span className="text-slate-300">-</span>}</td>
                          <td className="py-3.5 px-6 text-slate-600">{v.type}</td>
                          <td className="py-3.5 px-6">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg inline-block ${v.level === "Ringan" ? "bg-emerald-50 text-emerald-600" :
                              v.level === "Sedang" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                              }`}>
                              {v.level}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center font-bold text-slate-800">{v.points}</td>
                          <td className="py-3.5 px-6 text-slate-500 font-medium">{v.date}</td>
                          <td className="py-3.5 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoModalViolation(v);
                                setIsPhotoModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer border-none outline-none"
                              title="Lihat Bukti Foto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <circle cx="12" cy="13" r="3" strokeWidth="2" />
                              </svg>
                            </button>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg inline-block ${v.status === "Aktif" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                              }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => handleDownloadPDF(v)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                                title="Cetak Laporan PDF"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => handleOpenEditPelanggaran(v)}
                                className="bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePelanggaran(v.id)}
                                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border-none outline-none"
                                title="Hapus"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                          Tidak ada data pelanggaran ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium select-none bg-slate-50/30">
                <span>Menampilkan {Math.min(filteredViolations.length, pelanggaranLimit)} dari {filteredViolations.length} data</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    &lt; Sebelumnya
                  </button>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">1/1</span>
                  <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 cursor-not-allowed">
                    Berikutnya &gt;
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* --- MODAL DIALOGS --- */}

      {/* 1. Modal Siswa CRUD */}
      {isSiswaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-6 md:p-8 max-w-md w-full animate-scaleUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-950">
                {siswaModalMode === "add" ? "Tambah Data Siswa" : "Edit Data Siswa"}
              </h3>
              <button
                onClick={() => setIsSiswaModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer border-none outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveSiswa} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Rizki"
                  value={siswaNameForm}
                  onChange={(e) => setSiswaNameForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">NIS (Nomor Induk Siswa)</label>
                <input
                  type="text"
                  placeholder="Contoh: 2024001"
                  value={siswaNisForm}
                  onChange={(e) => setSiswaNisForm(e.target.value)}
                  disabled={siswaModalMode === "edit"}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 disabled:opacity-60"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Kelas</label>
                <select
                  value={siswaClassForm}
                  onChange={(e) => setSiswaClassForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Jenis Kelamin</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={siswaGenderForm === "L"}
                      onChange={() => setSiswaGenderForm("L")}
                      className="w-4 h-4 text-blue-600"
                    />
                    Laki-laki (L)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={siswaGenderForm === "P"}
                      onChange={() => setSiswaGenderForm("P")}
                      className="w-4 h-4 text-blue-600"
                    />
                    Perempuan (P)
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Tanggal Lahir</label>
                <input
                  type="date"
                  value={siswaBirthDateForm}
                  onChange={(e) => setSiswaBirthDateForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsSiswaModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-none outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Kelas CRUD */}
      {isKelasModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-6 md:p-8 max-w-sm w-full animate-scaleUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-950">
                {kelasModalMode === "add" ? "Tambah Data Kelas" : "Edit Data Kelas"}
              </h3>
              <button
                onClick={() => setIsKelasModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer border-none outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveKelas} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: X RPL 3, XI RPL 2"
                  value={kelasNameForm}
                  onChange={(e) => setKelasNameForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsKelasModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-none outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Pelanggaran CRUD */}
      {isPelanggaranModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-6 md:p-8 max-w-md w-full animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-950">
                {pelanggaranModalMode === "add" ? "Tambah Pelanggaran" : "Edit Pelanggaran"}
              </h3>
              <button
                onClick={() => setIsPelanggaranModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer border-none outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSavePelanggaran} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Pilih Siswa</label>
                <select
                  value={pelanggaranStudentNisForm}
                  onChange={(e) => setPelanggaranStudentNisForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.nis}>{s.name} ({s.class})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Jenis Pelanggaran *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Terlambat Masuk Kelas, Membolos"
                    value={pelanggaranTypeForm}
                    onChange={(e) => setPelanggaranTypeForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Tingkat *</label>
                  <select
                    value={pelanggaranLevelForm}
                    onChange={(e) => setPelanggaranLevelForm(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                  >
                    <option value="Ringan">Ringan</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Berat">Berat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Poin</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={pelanggaranPointsForm}
                    onChange={(e) => setPelanggaranPointsForm(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Tanggal</label>
                  <input
                    type="date"
                    value={pelanggaranDateForm}
                    onChange={(e) => setPelanggaranDateForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Waktu</label>
                  <input
                    type="time"
                    value={pelanggaranWaktuForm}
                    onChange={(e) => setPelanggaranWaktuForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Kelas X RPL 1"
                    value={pelanggaranLokasiForm}
                    onChange={(e) => setPelanggaranLokasiForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Status</label>
                <select
                  value={pelanggaranStatusForm}
                  onChange={(e) => setPelanggaranStatusForm(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi pelanggaran..."
                  value={pelanggaranDeskripsiForm}
                  onChange={(e) => setPelanggaranDeskripsiForm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 h-20 resize-none"
                />
              </div>

              {/* Tindakan Section */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tindakan / Tindak Lanjut</h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Tanggal Tindak Lanjut</label>
                  <input
                    type="date"
                    value={pelanggaranTindakanTanggalForm}
                    onChange={(e) => setPelanggaranTindakanTanggalForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Catatan</label>
                  <input
                    type="text"
                    placeholder="Catatan tambahan"
                    value={pelanggaranTindakanCatatanForm}
                    onChange={(e) => setPelanggaranTindakanCatatanForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Foto Bukti Section */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Foto Bukti</h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Foto Bukti (Upload file atau tempel URL link gambar)</label>
                  <input
                    type="text"
                    placeholder="Contoh: https://images.unsplash.com/photo-..."
                    value={pelanggaranFotoUrlForm}
                    onChange={(e) => setPelanggaranFotoUrlForm(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-slate-800"
                  />
                </div>

                {pelanggaranFotoUrlForm && (
                  <div className="relative border border-slate-200 rounded-2xl p-2 bg-slate-50">
                    <img
                      src={pelanggaranFotoUrlForm}
                      alt="Pratinjau Bukti"
                      className="w-full aspect-video rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPelanggaranFotoUrlForm("")}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors cursor-pointer border-none outline-none font-bold text-xs"
                      title="Hapus Foto"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPelanggaranModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all border-none outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95 border-none outline-none"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Photo Preview */}
      {isPhotoModalOpen && photoModalViolation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-2xl p-6 max-w-sm w-full animate-scaleUp flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-bold text-slate-950">Bukti Foto Pelanggaran</h3>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer border-none outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Proof */}
            {photoModalViolation.fotoUrl ? (
              <img
                src={photoModalViolation.fotoUrl}
                alt="Bukti Pelanggaran"
                className="w-full aspect-video rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-full aspect-video rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-center text-slate-400 gap-2 relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-transparent to-blue-50/30" />
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-[11px] font-bold text-slate-500 block leading-tight">{photoModalViolation.type}</div>
                <div className="text-[10px] text-slate-400 font-medium block mt-0.5">
                  NIS {photoModalViolation.nis} • {photoModalViolation.studentName}
                </div>
                <div className="text-[9px] text-slate-300 font-bold block mt-1 uppercase tracking-widest bg-slate-250 px-2 py-0.5 rounded border border-slate-200">
                  MOCK PROOF IMAGE
                </div>
              </div>
            )}

            <div className="w-full flex flex-col gap-1.5 text-xs font-semibold text-slate-650 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Kelas:</span>
                <span>{photoModalViolation.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tingkat:</span>
                <span className={photoModalViolation.level === "Berat" ? "text-rose-600" : photoModalViolation.level === "Sedang" ? "text-amber-600" : "text-emerald-600"}>
                  {photoModalViolation.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Poin:</span>
                <span className="font-extrabold text-slate-800">{photoModalViolation.points} Poin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span>{photoModalViolation.date} {photoModalViolation.waktu ? `• ${photoModalViolation.waktu}` : ""}</span>
              </div>
              {photoModalViolation.lokasi && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Lokasi:</span>
                  <span>{photoModalViolation.lokasi}</span>
                </div>
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPDF(photoModalViolation)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Simpan Laporan PDF
              </button>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
