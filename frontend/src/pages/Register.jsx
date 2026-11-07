import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Eye, EyeOff, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    const fullName = form.name.trim();
    const email = form.email.trim();

    if (!fullName) {
      showToast({
        type: "error",
        title: "Nama belum diisi",
        message: "Silakan masukkan nama lengkap kamu.",
      });
      return;
    }

    if (form.password.length < 8) {
      showToast({
        type: "error",
        title: "Password terlalu pendek",
        message: "Gunakan password minimal 8 karakter.",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast({
        type: "error",
        title: "Password tidak cocok",
        message: "Pastikan konfirmasi password sama.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const data = await signUp({
        fullName,
        email,
        password: form.password,
      });

      if (data?.session) {
        showToast({
          type: "success",
          title: "Pendaftaran berhasil!",
          message: "Selamat datang di SmartCitizen.",
        });

        navigate("/", { replace: true });
      } else {
        showToast({
          type: "info",
          title: "Pendaftaran berhasil",
          message: "Silakan masuk untuk melanjutkan.",
        });

        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Pendaftaran gagal:", error);

      const message = error.message?.toLowerCase() || "";

      if (message.includes("already registered") || message.includes("already been registered") || message.includes("user already exists")) {
        showToast({
          type: "error",
          title: "Email sudah terdaftar",
          message: "Gunakan email lain atau masuk ke akun kamu.",
        });
      } else {
        showToast({
          type: "error",
          title: "Pendaftaran gagal",
          message: error.message || "Silakan coba lagi.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-[80vh] overflow-x-hidden bg-[#fafbf8] px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-14">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:rounded-3xl md:grid-cols-2">
        {/* Panel informasi desktop */}
        <div className="hidden flex-col justify-between bg-emerald-900 p-8 text-white md:flex lg:p-10">
          <Link to="/" className="inline-flex w-fit items-center gap-3">
            <MapPin size={28} />
            <span className="text-xl font-bold">SmartCitizen</span>
          </Link>

          <div className="my-10">
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-200">MULAI DARI SEKITARMU</p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">Perubahan baik dimulai dari kepedulian.</h1>

            <p className="mt-5 text-sm leading-7 text-emerald-100 lg:text-base">Bergabung untuk melaporkan fasilitas rusak dan memantau perkembangannya di kawasan TOD.</p>

            <div className="mt-8 space-y-4 text-sm text-emerald-50">
              {["Laporkan kerusakan fasilitas", "Pantau status laporanmu", "Lihat tindak lanjut petugas"].map((item) => (
                <p key={item} className="flex items-center gap-3">
                  <Check size={18} className="shrink-0" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <p className="text-xs text-emerald-200">Better spaces, together.</p>
        </div>

        {/* Form pendaftaran */}
        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
          {/* Logo khusus mobile */}
          <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-emerald-800 md:hidden">
            <MapPin size={23} />
            <span className="text-lg font-bold text-stone-900">SmartCitizen</span>
          </Link>

          <p className="mt-6 text-[11px] font-semibold tracking-[0.15em] text-emerald-800 sm:text-xs">BUAT AKUN BARU</p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Bergabung dengan kami</h2>

          <p className="mt-3 text-sm leading-6 text-stone-500">Isi data berikut untuk mulai menggunakan SmartCitizen.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 sm:mt-8">
            {/* Nama lengkap */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-stone-700">
                Nama lengkap
                <span className="text-red-600"> *</span>
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={form.name}
                onChange={update}
                placeholder="Masukkan nama lengkap"
                className="min-h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-sm placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
                Email
                <span className="text-red-600"> *</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update}
                placeholder="nama@email.com"
                className="min-h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-sm placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/10 sm:text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-700">
                Password
                <span className="text-red-600"> *</span>
              </label>

              <div className="flex min-h-12 min-w-0 items-center rounded-xl border border-stone-200 bg-white pr-2 transition focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update}
                  placeholder="Minimal 8 karakter"
                  className="h-full min-h-11 w-full min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-sm placeholder:text-stone-400 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <p className="mt-2 text-xs leading-5 text-stone-400">Gunakan minimal 8 karakter.</p>
            </div>

            {/* Konfirmasi password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-stone-700">
                Konfirmasi password
                <span className="text-red-600"> *</span>
              </label>

              <div className="flex min-h-12 min-w-0 items-center rounded-xl border border-stone-200 bg-white pr-2 transition focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-800/10">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={update}
                  placeholder="Ulangi password"
                  className="h-full min-h-11 w-full min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-sm placeholder:text-stone-400 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                  aria-pressed={showConfirm}
                  className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              {form.confirmPassword.length > 0 && (
                <p className={`mt-2 text-xs ${form.password === form.confirmPassword ? "text-emerald-700" : "text-stone-500"}`}>{form.password === form.confirmPassword ? "Password cocok." : "Pastikan kedua password sama."}</p>
              )}
            </div>

            {/* Tombol daftar */}
            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  Daftar sekarang
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm leading-6 text-stone-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold text-emerald-800 hover:underline">
              Masuk
            </Link>
          </p>

          <p className="mt-5 text-center text-xs leading-5 text-stone-400">Pendaftaran ini khusus untuk warga. Akun petugas dibuat oleh administrator dan tidak tersedia melalui formulir publik.</p>
        </div>
      </div>
    </main>
  );
}
