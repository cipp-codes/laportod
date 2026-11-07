import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import CreateReport from "./pages/CreateReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReports from "./pages/MyReports";
import ManageReports from "./pages/ManageReports";

function Placeholder({ title }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-20 md:px-8">
      <h1 className="text-3xl font-semibold text-stone-900">{title}</h1>
      <p className="mt-3 text-stone-600">Halaman ini belum tersedia.</p>
    </main>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#fafbf8]">
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/peta" element={<MapPage />} />
              <Route path="/buat-laporan" element={<CreateReport />} />
              <Route path="/login" element={<Login />} />
              <Route path="/daftar" element={<Register />} />
              <Route path="/laporan-saya" element={<MyReports />} />
              <Route path="/kelola-laporan" element={<ManageReports />} />

              <Route path="*" element={<Placeholder title="Halaman tidak ditemukan" />} />
            </Routes>

            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
