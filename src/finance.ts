// Data penjualan 2027 (workbook), buku retur, dan perhitungan laporan keuangan.
// Sumber data ada di public/data/sales-2027.json; ganti loader & store dengan
// query Supabase (tabel `sales`, `returns`, `opex`) nanti.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Order } from "./orders";

export type TxStatus = "Diproses" | "Dalam Pengiriman" | "Siap Diambil" | "Selesai";
export type Delivery = "Kirim ke alamat" | "Ambil di toko";

export type Tx = {
  trx: string;
  serial: number;
  branch: string;
  sku: string;
  qty: number;
  price: number;
  disc: number;
  omzet: number;
  hpp: number;
  pay: string;
  segment: string;
};

export type OpexCats = {
  gaji: number;
  sewa: number;
  listrik: number;
  marketing: number;
  logistik: number;
  lain: number;
};

export type SalesDb = {
  rows: Tx[];
  skus: Record<string, [string, string, number]>; // sku -> [nama, kategori, harga beli]
  opex: Array<{ month: number; branch: string } & OpexCats>;
};

/** Tanggal acuan laporan = 31 Des 2027 (serial Excel). */
export const REF_SERIAL = 46752;
export const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const serialToDate = (serial: number) =>
  new Date(Date.UTC(1899, 11, 30) + serial * 86400000);

let cache: Promise<SalesDb> | null = null;
function loadDb(): Promise<SalesDb> {
  cache ||= fetch(`${import.meta.env.BASE_URL}data/sales-2027.json`)
    .then((r) => {
      if (!r.ok) throw new Error("gagal memuat data");
      return r.json();
    })
    .then((j) => ({
      rows: (j.rows as any[][]).map((a) => ({
        trx: a[0],
        serial: a[1],
        branch: a[2],
        sku: a[3],
        qty: a[4],
        price: a[5],
        disc: a[6],
        omzet: a[7],
        hpp: a[8],
        pay: a[9],
        segment: a[10],
      })),
      skus: j.skus,
      opex: (j.opex as any[][]).map((a) => ({
        month: a[0],
        branch: a[1],
        gaji: a[2],
        sewa: a[3],
        listrik: a[4],
        marketing: a[5],
        logistik: a[6],
        lain: a[7],
      })),
    }));
  cache.catch(() => (cache = null));
  return cache;
}

export function useSalesDb() {
  const [db, setDb] = useState<SalesDb | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let off = false;
    loadDb()
      .then((d) => !off && setDb(d))
      .catch(() => !off && setError(true));
    return () => {
      off = true;
    };
  }, []);
  return { db, error };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/**
 * Cara penerimaan & status pengiriman acak (deterministik per nomor transaksi)
 * yang mengikuti tanggal transaksi: transaksi lama sudah selesai, transaksi
 * terbaru tersebar di berbagai tahap.
 */
export function txMeta(t: Tx): { delivery: Delivery; status: TxStatus } {
  const ship = hash(t.trx + "d") < (t.segment === "Korporat" ? 0.9 : 0.5);
  const delivery: Delivery = ship ? "Kirim ke alamat" : "Ambil di toko";
  const progress: TxStatus = ship ? "Dalam Pengiriman" : "Siap Diambil";
  const r = hash(t.trx + "s");
  const age = REF_SERIAL - t.serial;
  let status: TxStatus;
  if (age >= 10) status = "Selesai";
  else if (age >= 3) status = r < 0.7 ? "Selesai" : progress;
  else status = r < 0.4 ? "Diproses" : r < 0.9 ? progress : "Selesai";
  return { delivery, status };
}

export type ReturnEntry = {
  id: string;
  ref: string; // nomor transaksi toko atau nomor pesanan online
  source: "toko" | "online";
  branch: string;
  sku: string;
  name: string;
  qty: number;
  omzet: number;
  hpp: number;
  date: string;
  reason: string;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Override status transaksi toko + buku retur (disimpan di localStorage). */
export function useLedgerStore() {
  const [overrides, setOverrides] = useState<Record<string, TxStatus>>(() =>
    readJson("hartini.txStatus", {}),
  );
  const [returns, setReturns] = useState<ReturnEntry[]>(() => readJson("hartini.returns", []));
  useEffect(() => localStorage.setItem("hartini.txStatus", JSON.stringify(overrides)), [overrides]);
  useEffect(() => localStorage.setItem("hartini.returns", JSON.stringify(returns)), [returns]);

  const setTxStatus = useCallback(
    (trx: string, status: TxStatus) => setOverrides((c) => ({ ...c, [trx]: status })),
    [],
  );
  const addReturn = useCallback(
    (entry: Omit<ReturnEntry, "id" | "date">) =>
      setReturns((c) => [
        {
          ...entry,
          id: `RTR-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toISOString(),
        },
        ...c,
      ]),
    [],
  );
  const removeReturn = useCallback(
    (id: string) => setReturns((c) => c.filter((r) => r.id !== id)),
    [],
  );
  const returnedQty = useMemo(() => {
    const m: Record<string, number> = {};
    returns.forEach((r) => (m[`${r.ref}|${r.sku}`] = (m[`${r.ref}|${r.sku}`] || 0) + r.qty));
    return m;
  }, [returns]);
  return { overrides, returns, setTxStatus, addReturn, removeReturn, returnedQty };
}

type Cell = { omzet: number; hpp: number; qty: number; trx: number };
type MonthAgg = { base: Cell; online: Cell; ret: Cell; opex: OpexCats };
const cell = (): Cell => ({ omzet: 0, hpp: 0, qty: 0, trx: 0 });
const opexZero = (): OpexCats => ({
  gaji: 0,
  sewa: 0,
  listrik: 0,
  marketing: 0,
  logistik: 0,
  lain: 0,
});
const agg = (): MonthAgg => ({ base: cell(), online: cell(), ret: cell(), opex: opexZero() });

export type Report = {
  branches: string[];
  months: Record<string, MonthAgg[]>;
  categories: Record<string, { omzet: number; qty: number }>;
};

/** Gabungkan penjualan toko 2027 + pesanan online (bertambah) − retur (berkurang). */
export function buildReport(db: SalesDb, orders: Order[], returns: ReturnEntry[]): Report {
  const months: Record<string, MonthAgg[]> = {};
  const ensure = (b: string) => (months[b] ||= Array.from({ length: 12 }, agg));
  const categories: Record<string, { omzet: number; qty: number }> = {};
  const addCat = (sku: string, omzet: number, qty: number) => {
    const c = (categories[db.skus[sku]?.[1] ?? "Lainnya"] ||= { omzet: 0, qty: 0 });
    c.omzet += omzet;
    c.qty += qty;
  };
  const monthOf = new Map<number, number>();
  for (const t of db.rows) {
    let m = monthOf.get(t.serial);
    if (m === undefined) monthOf.set(t.serial, (m = serialToDate(t.serial).getUTCMonth()));
    const a = ensure(t.branch)[m].base;
    a.omzet += t.omzet;
    a.hpp += t.hpp;
    a.qty += t.qty;
    a.trx += 1;
    addCat(t.sku, t.omzet, t.qty);
  }
  for (const o of db.opex) {
    const x = ensure(o.branch)[o.month - 1].opex;
    (Object.keys(x) as Array<keyof OpexCats>).forEach((k) => (x[k] += o[k]));
  }
  for (const o of orders) {
    const b = months[o.branch ?? ""] ? (o.branch as string) : "Jakarta";
    const a = ensure(b)[new Date(o.createdAt).getMonth()].online;
    a.trx += 1;
    for (const i of o.items) {
      const cost = db.skus[i.productId]?.[2] ?? i.price * 0.85;
      a.omzet += i.price * i.qty;
      a.hpp += cost * i.qty;
      a.qty += i.qty;
      addCat(i.productId, i.price * i.qty, i.qty);
    }
  }
  for (const r of returns) {
    const a = ensure(r.branch)[new Date(r.date).getMonth()].ret;
    a.omzet += r.omzet;
    a.hpp += r.hpp;
    a.qty += r.qty;
    a.trx += 1;
    addCat(r.sku, -r.omzet, -r.qty);
  }
  return { branches: Object.keys(months).sort(), months, categories };
}

export type Pnl = {
  baseGross: number;
  onlineGross: number;
  gross: number;
  returns: number;
  net: number;
  hpp: number;
  grossProfit: number;
  grossMargin: number;
  opex: OpexCats & { total: number };
  operatingProfit: number;
  operatingMargin: number;
  qty: number;
  trx: number;
};

export function pnl(report: Report, branches: string[], months: number[]): Pnl {
  let baseGross = 0,
    onlineGross = 0,
    returns = 0,
    hpp = 0,
    qty = 0,
    trx = 0;
  const opex = { ...opexZero(), total: 0 };
  for (const b of branches)
    for (const m of months) {
      const a = report.months[b]?.[m];
      if (!a) continue;
      baseGross += a.base.omzet;
      onlineGross += a.online.omzet;
      returns += a.ret.omzet;
      hpp += a.base.hpp + a.online.hpp - a.ret.hpp;
      qty += a.base.qty + a.online.qty - a.ret.qty;
      trx += a.base.trx + a.online.trx;
      (Object.keys(a.opex) as Array<keyof OpexCats>).forEach((k) => {
        opex[k] += a.opex[k];
        opex.total += a.opex[k];
      });
    }
  const gross = baseGross + onlineGross;
  const net = gross - returns;
  const grossProfit = net - hpp;
  const operatingProfit = grossProfit - opex.total;
  return {
    baseGross,
    onlineGross,
    gross,
    returns,
    net,
    hpp,
    grossProfit,
    grossMargin: net ? grossProfit / net : 0,
    opex,
    operatingProfit,
    operatingMargin: net ? operatingProfit / net : 0,
    qty,
    trx,
  };
}

export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
