"""
================================================================
  CYBER SHIELD — Backend Algorithm Engine
  Mata Kuliah : Algoritma & Kompleksitas (3 SKS)
  Dosen       : Lis Utari
  Universitas : Universitas Binaniaga Indonesia (UNBIN)

  Contoh 3  : Sequential Search  → O(n)
  Contoh 4  : Selection Sort     → O(n²)
  Contoh 5  : Bubble Sort        → O(n²)
================================================================
  Cara pakai:
      python algorithms.py          → run + cetak hasil terminal
      python algorithms.py --export → run + export docs/assets/data.json
================================================================
"""

import time
import tracemalloc
import json
import sys
import os


# ════════════════════════════════════════════════════════════════
#  DATASET — 8 Jenis Ancaman Siber
# ════════════════════════════════════════════════════════════════
THREATS = [
    {"id": 0, "name": "SQL Injection",     "score": 72, "type": "Web Attack",     "origin": "External",  "impact": "Data breach"},
    {"id": 1, "name": "DDoS Attack",       "score": 95, "type": "Network Attack", "origin": "Botnet",    "impact": "Service down"},
    {"id": 2, "name": "Phishing",          "score": 48, "type": "Social Eng.",    "origin": "Email",     "impact": "Credential theft"},
    {"id": 3, "name": "Ransomware",        "score": 88, "type": "Malware",        "origin": "Download",  "impact": "Data encrypted"},
    {"id": 4, "name": "Zero-Day Exploit",  "score": 99, "type": "Exploit",        "origin": "Unknown",   "impact": "Full compromise"},
    {"id": 5, "name": "Man-in-Middle",     "score": 61, "type": "Network Attack", "origin": "LAN",       "impact": "Data intercept"},
    {"id": 6, "name": "Brute Force",       "score": 35, "type": "Auth Attack",    "origin": "External",  "impact": "Unauthorized access"},
    {"id": 7, "name": "Malware",           "score": 83, "type": "Malware",        "origin": "USB/Web",   "impact": "System damage"},
]


# ════════════════════════════════════════════════════════════════
#  HELPERS
# ════════════════════════════════════════════════════════════════
def get_level(score: int) -> str:
    if score >= 90: return "KRITIS"
    if score >= 70: return "TINGGI"
    if score >= 50: return "SEDANG"
    return "RENDAH"


def get_response(rank: int) -> str:
    """Prioritas respons berdasarkan posisi setelah diurutkan (0=terendah)."""
    resp = [
        "Monitor pasif",
        "Catat & awasi",
        "Patch segera",
        "Isolasi subnet",
        "Incident response",
        "Tim CSIRT aktif",
        "Shutdown layanan",
        "LOCKDOWN ABSOLUT",
    ]
    return resp[rank] if rank < len(resp) else "—"


# ════════════════════════════════════════════════════════════════
#  CONTOH 3 — SEQUENTIAL SEARCH
# ════════════════════════════════════════════════════════════════
def sequential_search(data: list, target: int) -> dict:
    """
    Mencari elemen secara sekuensial (satu per satu) dari indeks 0.

    Pseudocode (sesuai slide Lis Utari):
    ─────────────────────────────────────
        i      ← 0
        ketemu ← false
        while (not ketemu) and (i < N) do
            if data[i] == target then
                ketemu ← true
            else
                i ← i + 1
        if ketemu then return i
        else           return -1
    ─────────────────────────────────────
    Kompleksitas:
        T_min(n) = 1            (elemen pertama = target)
        T_max(n) = n            (elemen terakhir / tidak ada)
        T_avg(n) = (n+1) / 2   (rata-rata n lokasi)
        Big-O    = O(n)
    """
    n      = len(data)
    steps  = []  # rekam tiap langkah untuk animasi frontend

    tracemalloc.start()
    t_start = time.perf_counter()

    i      = 0
    ketemu = False

    while (not ketemu) and (i < n):
        matched = (data[i] == target)
        steps.append({
            "step_no":  len(steps) + 1,
            "index":    i,
            "value":    data[i],
            "target":   target,
            "matched":  matched,
        })
        if matched:
            ketemu = True
        else:
            i += 1

    t_end              = time.perf_counter()
    cur_mem, peak_mem  = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    idx_result  = i if ketemu else -1
    elapsed_ms  = (t_end - t_start) * 1_000

    # Kompleksitas teoritis
    t_min = 1
    t_max = n
    t_avg = round((n + 1) / 2, 2)

    return {
        "algorithm":    "Sequential Search",
        "contoh":       3,
        "n":            n,
        "input":        data,
        "target":       target,
        "found":        ketemu,
        "result_index": idx_result,
        "result_name":  THREATS[idx_result]["name"] if (ketemu and idx_result < len(THREATS)) else None,
        "steps":        steps,
        "comparisons":  len(steps),
        "complexity": {
            "t_min":    t_min,
            "t_max":    t_max,
            "t_avg":    t_avg,
            "big_o":    "O(n)",
            "note":     "Berlaku untuk data tidak terurut maupun terurut",
        },
        "performance": {
            "time_ms":           round(elapsed_ms, 6),
            "memory_current_kb": round(cur_mem  / 1024, 4),
            "memory_peak_kb":    round(peak_mem / 1024, 4),
        },
    }


# ════════════════════════════════════════════════════════════════
#  CONTOH 4 — SELECTION SORT
# ════════════════════════════════════════════════════════════════
def selection_sort(data_in: list) -> dict:
    """
    Mengurutkan array secara ascending dengan mencari minimum tiap pass.

    Pseudocode (sesuai slide Lis Utari):
    ─────────────────────────────────────
        for i ← 1 to n-1 do
            imin ← i
            for j ← i+1 to n do
                if a[j] < a[imin] then
                    imin ← j
            swap(a[i], a[imin])
    ─────────────────────────────────────
    Kompleksitas:
        Perbandingan : T(n) = n(n-1)/2   ← SAMA untuk best & worst case
        Pertukaran   : T(n) ≤ n-1
        Big-O        : O(n²)
    """
    data  = data_in[:]
    n     = len(data)
    passes      = []
    cmp_count   = 0
    swap_count  = 0

    tracemalloc.start()
    t_start = time.perf_counter()

    for i in range(n - 1):                 # i = 0 to n-2 (pass ke-1 s/d n-1)
        imin = i
        for j in range(i + 1, n):          # j = i+1 to n-1
            cmp_count += 1
            if data[j] < data[imin]:
                imin = j

        swapped = (imin != i)
        if swapped:
            data[i], data[imin] = data[imin], data[i]
            swap_count += 1

        passes.append({
            "pass":               i + 1,
            "min_found_at":       imin,
            "min_value":          data[i],       # nilai setelah swap
            "swapped":            swapped,
            "snapshot":           data[:],
            "cmp_this_pass":      n - 1 - i,
        })

    t_end             = time.perf_counter()
    cur_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    elapsed_ms = (t_end - t_start) * 1_000
    formula    = n * (n - 1) // 2

    # Hasil terurut dengan info ancaman
    sorted_threats = []
    for rank, score in enumerate(data):
        t = next((x for x in THREATS if x["score"] == score), None)
        sorted_threats.append({
            "rank":     rank + 1,
            "score":    score,
            "name":     t["name"]   if t else "—",
            "type":     t["type"]   if t else "—",
            "level":    get_level(score),
            "response": get_response(rank),
        })

    return {
        "algorithm":      "Selection Sort",
        "contoh":         4,
        "n":              n,
        "input":          data_in,
        "output":         data,
        "sorted_threats": sorted_threats,
        "passes":         passes,
        "comparisons":    cmp_count,
        "swaps":          swap_count,
        "complexity": {
            "cmp_formula":  f"n(n-1)/2 = {n}×{n-1}/2 = {formula}",
            "swap_formula": f"≤ n-1 = {n-1}",
            "big_o":        "O(n²)",
            "note":         "Jumlah perbandingan SAMA untuk best & worst case",
        },
        "performance": {
            "time_ms":           round(elapsed_ms, 6),
            "memory_current_kb": round(cur_mem  / 1024, 4),
            "memory_peak_kb":    round(peak_mem / 1024, 4),
        },
    }


# ════════════════════════════════════════════════════════════════
#  CONTOH 5 — BUBBLE SORT
# ════════════════════════════════════════════════════════════════
def bubble_sort(data_in: list) -> dict:
    """
    Mengurutkan array secara ascending dengan menukar elemen berdekatan.

    Pseudocode (sesuai slide Lis Utari):
    ─────────────────────────────────────
        for i ← n-1 downto 1 do
            for j ← 1 to i do
                if a[j+1] < a[j] then
                    swap(a[j], a[j+1])
    ─────────────────────────────────────
    Kompleksitas:
        Perbandingan : T(n) = n(n-1)/2      ← SAMA untuk best & worst case
        Pertukaran   : T_min(n) = 0          (data sudah terurut)
                       T_max(n) = n(n-1)/2   (data terbalik)
        Big-O        : O(n²)
        ⚠ Bubble LEBIH BOROS swap vs Selection Sort!
    """
    data  = data_in[:]
    n     = len(data)
    passes     = []
    cmp_count  = 0
    swap_count = 0

    tracemalloc.start()
    t_start = time.perf_counter()

    for i in range(n - 1, 0, -1):         # i = n-1 downto 1
        swaps_this = 0
        for j in range(1, i + 1):         # j = 1 to i
            cmp_count += 1
            if data[j] < data[j - 1]:
                data[j], data[j - 1] = data[j - 1], data[j]
                swap_count  += 1
                swaps_this  += 1

        passes.append({
            "pass":            n - i,
            "i_value":         i,
            "swaps_this_pass": swaps_this,
            "cmp_this_pass":   i,
            "snapshot":        data[:],
        })

    t_end             = time.perf_counter()
    cur_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    elapsed_ms = (t_end - t_start) * 1_000
    formula    = n * (n - 1) // 2

    return {
        "algorithm":   "Bubble Sort",
        "contoh":      5,
        "n":           n,
        "input":       data_in,
        "output":      data,
        "passes":      passes,
        "comparisons": cmp_count,
        "swaps":       swap_count,
        "complexity": {
            "cmp_formula":  f"n(n-1)/2 = {n}×{n-1}/2 = {formula}",
            "swap_min":     "T_min(n) = 0  (data sudah terurut)",
            "swap_max":     f"T_max(n) = n(n-1)/2 = {formula}",
            "big_o":        "O(n²)",
            "note":         f"Data ini: {swap_count} swap — Selection Sort hanya {n-2} swap (lebih boros!)",
        },
        "performance": {
            "time_ms":           round(elapsed_ms, 6),
            "memory_current_kb": round(cur_mem  / 1024, 4),
            "memory_peak_kb":    round(peak_mem / 1024, 4),
        },
    }


# ════════════════════════════════════════════════════════════════
#  RUNNER — jalankan semua contoh
# ════════════════════════════════════════════════════════════════
def run_all() -> dict:
    scores = [t["score"] for t in THREATS]

    seq = sequential_search(scores, target=88)
    sel = selection_sort(scores)
    bub = bubble_sort(scores)

    return {
        "threats":           THREATS,
        "sequential_search": seq,
        "selection_sort":    sel,
        "bubble_sort":       bub,
        "comparison": {
            "fastest_time_ms":   min(seq["performance"]["time_ms"],
                                     sel["performance"]["time_ms"],
                                     bub["performance"]["time_ms"]),
            "swap_sel_vs_bub":  f"Selection={sel['swaps']} vs Bubble={bub['swaps']} — Bubble {round(bub['swaps']/max(sel['swaps'],1),1)}× lebih boros",
        },
    }


# ════════════════════════════════════════════════════════════════
#  PRETTY PRINT — output terminal
# ════════════════════════════════════════════════════════════════
def pretty_print(result: dict):
    sep  = "=" * 66
    sep2 = "-" * 66

    print(f"\n{sep}")
    print("  CYBER SHIELD · Algoritma & Kompleksitas · UNBIN")
    print("  Dosen: Lis Utari  |  Tema: Cyber Security Defense")
    print(sep)

    # ── Contoh 3 ──
    s = result["sequential_search"]
    p = s["performance"]
    print(f"\n{sep2}")
    print(f"  CONTOH 3 — {s['algorithm']}")
    print(sep2)
    print(f"  Data input  : {s['input']}")
    print(f"  Target cari : skor {s['target']}")
    print()
    for step in s["steps"]:
        mark = "✓ KETEMU!" if step["matched"] else "≠"
        print(f"    Langkah {step['step_no']}: data[{step['index']}] = {step['value']} {mark}")
    print()
    if s["found"]:
        print(f"  ✔  Ditemukan: {s['result_name']} (skor {s['target']}) pada indeks [{s['result_index']}]")
    else:
        print(f"  ✘  Tidak ditemukan. return = -1")
    print(f"  Perbandingan   : {s['comparisons']}")
    print(f"  T_min(n) = {s['complexity']['t_min']}  |  T_max(n) = {s['complexity']['t_max']}  |  T_avg(n) = {s['complexity']['t_avg']}")
    print(f"  Big-O          : {s['complexity']['big_o']}")
    print(f"  ⏱  Waktu       : {p['time_ms']} ms")
    print(f"  💾 Mem current : {p['memory_current_kb']} KB  |  Peak: {p['memory_peak_kb']} KB")

    # ── Contoh 4 ──
    s = result["selection_sort"]
    p = s["performance"]
    print(f"\n{sep2}")
    print(f"  CONTOH 4 — {s['algorithm']}")
    print(sep2)
    print(f"  Input  : {s['input']}")
    for ps in s["passes"]:
        sw = f"swap idx[{ps['pass']-1}] ↔ [{ps['min_found_at']}]" if ps["swapped"] else "no swap"
        print(f"    Pass {ps['pass']:2d}: [{ps['cmp_this_pass']} cmp | {sw}] → {ps['snapshot']}")
    print()
    print(f"  Output : {s['output']}")
    print(f"  Perbandingan   : {s['comparisons']}  ({s['complexity']['cmp_formula']})")
    print(f"  Pertukaran     : {s['swaps']}  ({s['complexity']['swap_formula']})")
    print(f"  Big-O          : {s['complexity']['big_o']}  — {s['complexity']['note']}")
    print(f"  ⏱  Waktu       : {p['time_ms']} ms")
    print(f"  💾 Mem current : {p['memory_current_kb']} KB  |  Peak: {p['memory_peak_kb']} KB")

    # ── Contoh 5 ──
    s = result["bubble_sort"]
    p = s["performance"]
    print(f"\n{sep2}")
    print(f"  CONTOH 5 — {s['algorithm']}")
    print(sep2)
    print(f"  Input  : {s['input']}")
    for ps in s["passes"]:
        print(f"    Pass {ps['pass']:2d}: [{ps['cmp_this_pass']} cmp | {ps['swaps_this_pass']} swap] → {ps['snapshot']}")
    print()
    print(f"  Output : {s['output']}")
    print(f"  Perbandingan   : {s['comparisons']}  ({s['complexity']['cmp_formula']})")
    print(f"  Pertukaran     : {s['swaps']}")
    print(f"  {s['complexity']['swap_min']}")
    print(f"  {s['complexity']['swap_max']}")
    print(f"  ⚠  {s['complexity']['note']}")
    print(f"  Big-O          : {s['complexity']['big_o']}")
    print(f"  ⏱  Waktu       : {p['time_ms']} ms")
    print(f"  💾 Mem current : {p['memory_current_kb']} KB  |  Peak: {p['memory_peak_kb']} KB")

    # ── Summary ──
    print(f"\n{sep}")
    print("  SUMMARY — PERBANDINGAN KETIGA ALGORITMA")
    print(sep)
    fmt = "  {:<22} {:>10}  {:>12}  {:>10}  {:>10}"
    print(fmt.format("ALGORITMA", "TIME (ms)", "MEM PEAK(KB)", "CMP", "SWAP"))
    print("  " + "-" * 64)
    for key, label in [("sequential_search","Sequential Search"),
                       ("selection_sort","Selection Sort"),
                       ("bubble_sort","Bubble Sort")]:
        r = result[key]
        p = r["performance"]
        print(fmt.format(
            label,
            p["time_ms"],
            p["memory_peak_kb"],
            r["comparisons"],
            r.get("swaps", "—"),
        ))
    print()
    print(f"  {result['comparison']['swap_sel_vs_bub']}")
    print(f"\n{sep}\n")


# ════════════════════════════════════════════════════════════════
#  MAIN
# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    all_results = run_all()
    pretty_print(all_results)

    # Export ke JSON jika flag --export diberikan
    do_export = "--export" in sys.argv or True   # default selalu export
    if do_export:
        # cari folder docs/assets relatif dari posisi script
        script_dir  = os.path.dirname(os.path.abspath(__file__))
        output_dir  = os.path.join(script_dir, "..", "docs", "assets")
        output_dir  = os.path.normpath(output_dir)
        output_path = os.path.join(output_dir, "data.json")

        os.makedirs(output_dir, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        print(f"  ✅  data.json berhasil diekspor → {output_path}")
