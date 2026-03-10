# 🛡 CYBER SHIELD — Algoritma & Kompleksitas

**Universitas Binaniaga Indonesia (UNBIN)**  
Mata Kuliah: Algoritma & Kompleksitas · 3 SKS  
Dosen: **Lis Utari**  
Tema: Cyber Security Defense System

---

## 🌐 Live Demo (GitHub Pages)

> **[https://\<username\>.github.io/cyber-shield](https://github.com)**

---

## 📋 Isi Tugas

| Contoh | Algoritma | Tema Cyber | Kompleksitas |
|--------|-----------|-----------|--------------|
| C-3 | Sequential Search | Threat Detection | O(n) |
| C-4 | Selection Sort | Threat Prioritization | O(n²) |
| C-5 | Bubble Sort | Risk Ranking | O(n²) |

- ✅ Flowchart interaktif
- ✅ Program Python (backend)
- ✅ Output terminal
- ✅ Animasi visualisasi sorting
- ✅ Pengukuran waktu (`perf_counter`) dan memori (`tracemalloc`)
- ✅ Tabel kompleksitas T_min / T_max / T_avg / Big-O

---

## 🗂 Struktur Folder

```
cyber-shield/
├── backend/
│   └── algorithms.py          ← Engine Python (Contoh 3, 4, 5)
│
└── docs/                      ← GitHub Pages root
    ├── index.html             ← Halaman utama
    ├── css/
    │   └── style.css          ← Styling cyber dark theme
    ├── js/
    │   └── app.js             ← Logic frontend interaktif
    └── assets/
        └── data.json          ← Data hasil backend (auto-generated)
```


```bash
cd backend
python3 algorithms.py
```

Output akan tercetak di terminal dan `docs/assets/data.json` otomatis diperbarui.

---

## 📊 Dataset — 8 Ancaman Siber

| ID | Ancaman | Skor | Level |
|----|---------|------|-------|
| 0 | SQL Injection | 72 | TINGGI |
| 1 | DDoS Attack | 95 | KRITIS |
| 2 | Phishing | 48 | SEDANG |
| 3 | Ransomware | 88 | KRITIS |
| 4 | Zero-Day Exploit | 99 | KRITIS |
| 5 | Man-in-Middle | 61 | SEDANG |
| 6 | Brute Force | 35 | RENDAH |
| 7 | Malware | 83 | TINGGI |

---

## 📐 Hasil Kompleksitas

| Algoritma | Perbandingan | Pertukaran | Time | Mem Peak | Big-O |
|-----------|-------------|------------|------|----------|-------|
| Sequential Search | 4 (T_avg=4.5) | — | 0.019 ms | 0.078 KB | O(n) |
| Selection Sort | 28 = n(n-1)/2 | 6 ≤ n-1=7 | 0.035 ms | 0.688 KB | O(n²) |
| Bubble Sort | 28 = n(n-1)/2 | 16 (2.7× boros!) | 0.023 ms | 0.688 KB | O(n²) |

**Kesimpulan:** Selection Sort lebih efisien dalam pertukaran. Bubble Sort lebih boros swap.

---

*Made with 🛡 Python + Vanilla JS — No frameworks needed*
