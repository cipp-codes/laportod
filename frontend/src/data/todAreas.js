
/**
 * Data awal simpul TOD Kota Tangerang Selatan.
 *
 * CATATAN:
 * - Koordinat merupakan titik pusat perkiraan.
 * - Radius 800 meter bukan batas resmi kawasan TOD.
 * - Verifikasi batas poligon melalui data RTRW/RDTR resmi
 *   sebelum mengaktifkan validasi lokasi untuk pengguna.
 */

export const TOD_AREAS = [
  {
    id: "rawa-buntu",
    name: "TOD Rawa Buntu",
    station: "Stasiun Rawa Buntu",
    city: "Tangerang Selatan",
    district: "Serpong",
    center: {
      latitude: -6.3147,
      longitude: 106.6811,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
  {
    id: "pondok-cabe",
    name: "TOD Pondok Cabe",
    station: "Terminal Pondok Cabe",
    city: "Tangerang Selatan",
    district: "Pamulang",
    center: {
      latitude: -6.3425,
      longitude: 106.7615,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
  {
    id: "sudimara",
    name: "TOD Sudimara",
    station: "Stasiun Sudimara",
    city: "Tangerang Selatan",
    district: "Ciputat",
    center: {
      latitude: -6.2965,
      longitude: 106.7135,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
  {
    id: "pondok-ranji",
    name: "TOD Pondok Ranji",
    station: "Stasiun Pondok Ranji",
    city: "Tangerang Selatan",
    district: "Ciputat Timur",
    center: {
      latitude: -6.2768,
      longitude: 106.7435,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
  {
    id: "serpong",
    name: "TOD Serpong",
    station: "Stasiun Serpong",
    city: "Tangerang Selatan",
    district: "Serpong",
    center: {
      latitude: -6.3201,
      longitude: 106.6653,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
  {
    id: "jurangmangu",
    name: "TOD Jurangmangu",
    station: "Stasiun Jurangmangu",
    city: "Tangerang Selatan",
    district: "Pondok Aren",
    center: {
      latitude: -6.2891,
      longitude: 106.7159,
    },
    radiusMeters: 800,
    boundaryVerified: false,
  },
];

export default TOD_AREAS;