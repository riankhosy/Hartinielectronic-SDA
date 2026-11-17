import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AirVent,
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Banknote,
  BatteryCharging,
  Bolt,
  Box,
  BriefcaseBusiness,
  Camera,
  Check,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Drill,
  Globe2,
  Heart,
  Headphones,
  Share2,
  Laptop,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Monitor,
  Moon,
  PackageCheck,
  Phone,
  Plus,
  Printer,
  Refrigerator,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Sun,
  Truck,
  Tv,
  UserRound,
  WashingMachine,
  Wrench,
  X,
  Play,
  Zap,
} from "lucide-react";
import { branches, categories, formatPrice, products, type Product } from "./data";
import {
  MONTHS,
  buildReport,
  downloadCsv,
  pnl,
  serialToDate,
  txMeta,
  useLedgerStore,
  useSalesDb,
  type Report,
  type SalesDb,
  type Tx,
  type TxStatus,
} from "./finance";
import {
  loadOrders,
  loadReviews,
  newOrderId,
  nextStatus,
  saveOrders,
  saveReviews,
  type Order,
  type Review,
} from "./orders";

type Page =
  | "home"
  | "catalog"
  | "detail"
  | "installment"
  | "cart"
  | "checkout"
  | "branches"
  | "member"
  | "promo"
  | "about"
  | "career"
  | "contact"
  | "faq"
  | "orders"
  | "admin";

type CartItem = { product: Product; qty: number };

const categoryIcons = [
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Refrigerator,
  WashingMachine,
  AirVent,
  Sparkles,
  Bolt,
  Heart,
  Printer,
  Camera,
  BatteryCharging,
  Drill,
];

const navItems: Array<[string, Page]> = [
  ["Produk", "catalog"],
  ["Promo", "promo"],
  ["Cabang", "branches"],
  ["Member", "member"],
  ["Tentang", "about"],
  ["Kontak", "contact"],
];

const promoSlides = [
  {
    eyebrow: "PROMO KELUARGA HARTINI",
    title: "Rumah makin lengkap, hati makin tenang.",
    text: "Diskon hingga 30% untuk elektronik rumah tangga pilihan dan gratis pengiriman hingga 20 km.",
    label: "Promo Lebaran",
    gradient: "from-[#12285C] via-[#173875] to-[#2258A6]",
  },
  {
    eyebrow: "HARBOLNAS 12.12",
    title: "Harga spesial, waktunya upgrade.",
    text: "Flash sale smartphone, laptop, dan smart TV dengan stok terbatas di seluruh cabang.",
    label: "Diskon s.d. 35%",
    gradient: "from-[#7A2B13] via-[#C14D18] to-[#FF7A1A]",
  },
  {
    eyebrow: "CICILAN 0%",
    title: "Bawa pulang sekarang, bayar lebih ringan.",
    text: "Tenor 3, 6, atau 12 bulan untuk produk pilihan dengan kartu bank partner.",
    label: "Mulai Rp 200 ribuan",
    gradient: "from-[#0A4F4A] via-[#087C72] to-[#14A897]",
  },
];

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <button
      onClick={() => go("home")}
      className={`group flex items-center rounded-xl bg-white transition-transform hover:scale-[1.02] ${
        inverse ? "px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,.14)]" : "px-2 py-1"
      }`}
      aria-label="Ke beranda HARTINI ELECTRONIC"
    >
      <img
        src="/hartini-logo.png"
        alt="HARTINI ELECTRONIC"
        className={`${inverse ? "h-10 sm:h-11" : "h-8 sm:h-9"} w-auto object-contain`}
      />
    </button>
  );
}

let globalNavigate: ((page: Page, data?: string) => void) | null = null;
function go(page: Page, data?: string) {
  globalNavigate?.(page, data);
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[#FF7A1A] text-white hover:bg-[#e9650c] shadow-[0_8px_22px_rgba(255,122,26,.2)]",
    secondary: "bg-[#12285C] text-white hover:bg-[#0d1e49]",
    outline:
      "border border-slate-200 bg-white text-[#12285C] hover:border-[#12285C] dark:border-slate-700 dark:bg-slate-900 dark:text-white",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Header({
  cartCount,
  dark,
  setDark,
}: {
  cartCount: number;
  dark: boolean;
  setDark: (value: boolean) => void;
}) {
  const [mobile, setMobile] = useState(false);
  return (
    <>
      <div className="hidden bg-[#0B1C42] py-2 text-xs text-white/75 md:block">
        <div className="container flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Store size={13} /> 20 cabang di 15 provinsi Indonesia
          </span>
          <span className="flex items-center gap-5">
            <span>Gratis konsultasi produk</span>
            <span className="text-white/30">|</span>
            <span>Garansi resmi</span>
            <span className="text-white/30">|</span>
            <span className="flex items-center gap-1.5">
              <Phone size={12} /> 0800-1-HARTINI
            </span>
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
        <div className="container flex h-[72px] items-center justify-between gap-5">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {navItems.map(([label, page]) => (
              <button
                key={page}
                onClick={() => go(page)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#12285C] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDark(!dark)}
              className="icon-button"
              aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button onClick={() => go("orders")} className="icon-button" aria-label="Pesanan saya">
              <ClipboardList size={20} />
            </button>
            <button
              onClick={() => go("cart")}
              className="icon-button relative"
              aria-label={`Keranjang, ${cartCount} barang`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-[#FF7A1A] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobile(!mobile)}
              className="icon-button lg:hidden"
              aria-label="Buka menu"
            >
              {mobile ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobile && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            <nav className="grid gap-1">
              {navItems.map(([label, page]) => (
                <button
                  key={page}
                  onClick={() => {
                    go(page);
                    setMobile(false);
                  }}
                  className="flex min-h-12 items-center justify-between rounded-xl px-4 text-left font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {label}
                  <ChevronRight size={18} />
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-extrabold tracking-[.16em] text-[#FF7A1A]">{eyebrow}</p>
        )}
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[#12285C] dark:text-white sm:text-3xl">
          {title}
        </h2>
        {text && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {text}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function ProductVisual({ product, className = "" }: { product: Product; className?: string }) {
  const index = categories.indexOf(product.category);
  const Icon = categoryIcons[index] || Box;
  const palettes = [
    "from-blue-50 to-blue-100 text-blue-700 dark:from-blue-950 dark:to-slate-900 dark:text-blue-300",
    "from-orange-50 to-amber-100 text-orange-600 dark:from-orange-950 dark:to-slate-900 dark:text-orange-300",
    "from-emerald-50 to-teal-100 text-emerald-700 dark:from-emerald-950 dark:to-slate-900 dark:text-emerald-300",
    "from-violet-50 to-indigo-100 text-violet-700 dark:from-violet-950 dark:to-slate-900 dark:text-violet-300",
  ];
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${palettes[index % palettes.length]} ${className}`}
      role="img"
      aria-label={`Ilustrasi ${product.name}`}
    >
      <div className="absolute -right-8 -top-10 size-28 rounded-full border-[18px] border-current opacity-[.05]" />
      <div className="absolute -bottom-9 -left-5 size-24 rounded-full bg-current opacity-[.05]" />
      <Icon
        className="relative drop-shadow-sm"
        size={className.includes("h-") ? 72 : 55}
        strokeWidth={1.35}
      />
      <span className="absolute bottom-3 rounded-full bg-white/75 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-500 backdrop-blur dark:bg-slate-950/65 dark:text-slate-300">
        {product.brand}
      </span>
    </div>
  );
}

function ProductCard({
  product,
  addToCart,
}: {
  product: Product;
  addToCart: (product: Product) => void;
}) {
  return (
    <article className="product-card group">
      <div className="relative">
        <ProductVisual product={product} className="aspect-[4/3] w-full" />
        <span className="absolute left-3 top-3 rounded-lg bg-[#FF7A1A] px-2.5 py-1 text-[11px] font-extrabold text-white">
          -{product.discount}%
        </span>
        <button
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm transition group-hover:opacity-100 dark:bg-slate-900"
          aria-label="Simpan produk"
        >
          <Heart size={17} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-bold uppercase tracking-wide text-slate-400">{product.brand}</span>
          <span
            className={`font-semibold ${product.stock <= 5 ? "text-orange-600" : "text-emerald-600"}`}
          >
            {product.stock <= 5 ? `Sisa ${product.stock}` : "Stok tersedia"}
          </span>
        </div>
        <button
          onClick={() => go("detail", product.id)}
          className="min-h-12 text-left font-heading text-sm font-semibold leading-5 text-[#12285C] transition hover:text-[#FF7A1A] dark:text-white"
        >
          {product.name}
        </button>
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <Star size={13} className="fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}{" "}
          <span className="text-slate-300">•</span> {product.sold.toLocaleString("id-ID")} terjual
        </div>
        <div className="mt-3">
          <p className="font-heading text-base font-extrabold text-[#12285C] dark:text-white">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-slate-400 line-through">
            {formatPrice(product.originalPrice)}
          </p>
        </div>
        <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <CreditCard size={11} /> Cicilan 0%
        </div>
        <div className="mt-4 grid grid-cols-[1fr_44px] gap-2">
          <Button onClick={() => addToCart(product)} className="px-2 text-xs">
            <ShoppingCart size={15} /> Tambah
          </Button>
          <a
            href={`https://wa.me/628111234567?text=${encodeURIComponent(`Halo HARTINI, saya tertarik dengan ${product.name}`)}`}
            target="_blank"
            rel="noreferrer"
            className="grid min-h-11 place-items-center rounded-xl border border-emerald-200 text-emerald-600 transition hover:bg-emerald-50"
            aria-label={`Tanya ${product.name} via WhatsApp`}
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}

function HomePage({ addToCart }: { addToCart: (product: Product) => void }) {
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((value) => (value + 1) % promoSlides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    go("catalog", search);
  };
  return (
    <>
      <section className="bg-[#F4F6FA] pb-8 pt-5 dark:bg-slate-950 sm:pt-8">
        <div className="container">
          <form onSubmit={submitSearch} className="relative z-10 mx-auto mb-5 max-w-4xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white bg-white pl-14 pr-28 text-sm shadow-[0_10px_35px_rgba(18,40,92,.1)] outline-none transition focus:ring-2 focus:ring-[#FF7A1A] dark:border-slate-700 dark:bg-slate-900 sm:h-16"
              placeholder="Cari TV, kulkas, laptop, merek, atau kategori..."
              aria-label="Cari produk"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 min-h-11 -translate-y-1/2 px-5"
            >
              Cari
            </Button>
          </form>
          <div
            className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${promoSlides[slide].gradient} min-h-[410px] text-white shadow-[0_24px_55px_rgba(18,40,92,.18)] sm:min-h-[390px]`}
          >
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_75%_30%,white_0,transparent_35%),linear-gradient(120deg,transparent_45%,white_45%,transparent_46%)]" />
            <div className="absolute -bottom-24 -right-20 size-[340px] rounded-full border-[70px] border-white/10 sm:size-[460px]" />
            <div className="relative flex min-h-[410px] max-w-2xl flex-col justify-center px-6 py-16 sm:min-h-[390px] sm:px-12 lg:px-16">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <Sparkles size={14} /> {promoSlides[slide].eyebrow}
              </div>
              <h1 className="font-heading text-3xl font-extrabold leading-[1.13] tracking-tight sm:text-5xl">
                {promoSlides[slide].title}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                {promoSlides[slide].text}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button onClick={() => go("promo")}>
                  Lihat Promo <ArrowRight size={17} />
                </Button>
                <Button
                  onClick={() => go("catalog")}
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                  variant="outline"
                >
                  Belanja Sekarang
                </Button>
              </div>
            </div>
            <div className="absolute bottom-5 left-6 flex items-center gap-2 sm:left-12 lg:left-16">
              {promoSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSlide(index)}
                  className={`h-2 rounded-full transition-all ${index === slide ? "w-8 bg-white" : "w-2 bg-white/45"}`}
                  aria-label={`Tampilkan banner ${index + 1}`}
                />
              ))}
            </div>
            <div className="absolute bottom-5 right-5 hidden gap-2 sm:flex">
              <button
                onClick={() => setSlide((slide - 1 + promoSlides.length) % promoSlides.length)}
                className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20"
                aria-label="Banner sebelumnya"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => setSlide((slide + 1) % promoSlides.length)}
                className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20"
                aria-label="Banner berikutnya"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="JELAJAHI PRODUK"
            title="Semua kebutuhan, satu tempat"
            text="Dari elektronik personal hingga perlengkapan rumah tangga dan solusi energi."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.map((category, index) => {
              const Icon = categoryIcons[index];
              return (
                <button
                  key={category}
                  onClick={() => go("catalog", category)}
                  className="category-card group"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#12285C] transition group-hover:bg-[#12285C] group-hover:text-white dark:bg-slate-800 dark:text-blue-300">
                    <Icon size={23} strokeWidth={1.7} />
                  </span>
                  <span className="mt-3 text-xs font-bold leading-4 text-slate-700 dark:text-slate-200">
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-[#F4F6FA] dark:bg-slate-900/45">
        <div className="container">
          <SectionTitle
            eyebrow="PILIHAN PELANGGAN"
            title="Produk Terlaris"
            action={
              <button
                onClick={() => go("catalog")}
                className="hidden items-center gap-1 text-sm font-bold text-[#12285C] sm:flex dark:text-blue-300"
              >
                Lihat semua <ChevronRight size={17} />
              </button>
            }
          />
          <div className="product-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="HEMAT LEBIH BANYAK"
            title="Promo Minggu Ini"
            text="Pilihan promo terbatas yang diperbarui setiap minggu."
            action={
              <button
                onClick={() => go("promo")}
                className="hidden items-center gap-1 text-sm font-bold text-[#12285C] sm:flex dark:text-blue-300"
              >
                Semua promo <ChevronRight size={17} />
              </button>
            }
          />
          <div className="product-grid">
            {products.slice(12, 16).map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="CARA BAYAR FLEKSIBEL"
            title="Cicilan 0% & Metode Bayar"
            text="Transaksi aman dengan pilihan pembayaran yang sesuai kebutuhan Anda."
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              [Banknote, "Tunai", "Di semua kasir"],
              [CreditCard, "Kartu Debit", "EDC bank partner"],
              [BadgePercent, "QRIS", "Cepat & praktis"],
              [Sparkles, "Cicilan 0%", "3, 6, 12 bulan"],
              [CreditCard, "Kartu Kredit", "Bank pilihan"],
              [Banknote, "Transfer Bank", "Konfirmasi otomatis"],
            ].map(([Icon, label, text]) => (
              <div
                key={label as string}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <Icon className="text-[#FF7A1A]" size={26} />
                <h3 className="mt-4 font-heading text-sm font-bold text-[#12285C] dark:text-white">
                  {label as string}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{text as string}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => go("installment")}
            className="mt-5 flex w-full items-center justify-between rounded-2xl bg-blue-50 p-5 text-left text-[#12285C] transition hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200"
          >
            <span>
              <strong className="block font-heading">Hitung cicilan produk impian Anda</strong>
              <span className="mt-1 block text-xs opacity-70">
                Coba simulator cicilan dalam hitungan detik
              </span>
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-white dark:bg-slate-900">
              <ArrowRight size={18} />
            </span>
          </button>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="overflow-hidden rounded-[28px] bg-[#0C2952] text-white">
            <div className="grid lg:grid-cols-[.9fr_1.1fr]">
              <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
                <div className="absolute -right-20 -top-20 size-64 rounded-full border-[50px] border-white/5" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-300">
                    <Bolt size={14} /> SOLUSI ENERGI
                  </span>
                  <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
                    Siaga saat listrik padam.
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    Solusi energi untuk rumah, usaha, dan wilayah dengan pasokan listrik terbatas.
                    Konsultasikan kebutuhan daya Anda bersama tim kami.
                  </p>
                  <Button
                    onClick={() => go("catalog", "Recording Media & Energy")}
                    className="mt-7"
                  >
                    Jelajahi Solusi Energi
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">
                {["Genset", "Power Station", "Solar Panel", "Inverter", "UPS", "Power Bank"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="grid min-h-32 place-items-center bg-[#102F5D] p-5 text-center"
                    >
                      {index % 2 ? (
                        <BatteryCharging className="mb-3 text-orange-400" />
                      ) : (
                        <Zap className="mb-3 text-orange-400" />
                      )}
                      <span className="font-heading text-sm font-bold">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[#F4F6FA] dark:bg-slate-900/45">
        <div className="container">
          <SectionTitle
            eyebrow="DEKAT DENGAN ANDA"
            title="Temukan cabang terdekat"
            text="20 cabang dengan layanan pengiriman, instalasi, dan purna jual."
            action={
              <Button onClick={() => go("branches")} variant="outline" className="hidden sm:flex">
                Lihat Semua Cabang
              </Button>
            }
          />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="map-pattern relative min-h-72 overflow-hidden rounded-[24px] bg-blue-100 dark:bg-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D9E8F6]/80 to-[#EDF4FA]/70 dark:from-slate-800 dark:to-slate-900" />
              {[
                [22, 38],
                [35, 55],
                [55, 49],
                [66, 65],
                [76, 41],
                [83, 72],
              ].map(([left, top], i) => (
                <span
                  key={i}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#FF7A1A] text-white shadow-lg"
                >
                  <MapPin size={15} fill="currentColor" />
                </span>
              ))}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 text-sm text-slate-600 shadow-lg backdrop-blur dark:bg-slate-950/85 dark:text-slate-300">
                <strong className="block font-heading text-[#12285C] dark:text-white">
                  Jaringan HARTINI ELECTRONIC
                </strong>{" "}
                Sumatera, Jawa, Bali, Kalimantan, Sulawesi, Nusa Tenggara, Maluku, dan Papua.
              </div>
            </div>
            <div className="grid gap-3">
              {branches.slice(0, 3).map((branch) => (
                <BranchMini key={branch.code} branch={branch} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="CERITA PELANGGAN" title="Dipercaya keluarga Indonesia" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "Dewi Larasati",
                "Bandung",
                "Beli kulkas sekaligus dibantu pilih ukuran yang pas. Pengiriman cepat dan tim instalasinya rapi.",
              ],
              [
                "Andi Pratama",
                "Makassar",
                "Simulasi cicilan sangat jelas, tidak ada biaya yang membingungkan. Pelayanannya ramah.",
              ],
              [
                "Maria Tamelan",
                "Kupang",
                "Tim Hartini membantu hitung kebutuhan power station untuk rumah. Sekarang lebih tenang saat padam.",
              ],
            ].map(([name, city, quote]) => (
              <figure
                key={name}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-blue-100 font-bold text-[#12285C]">
                    {name[0]}
                  </span>
                  <span>
                    <strong className="block text-sm text-[#12285C] dark:text-white">{name}</strong>
                    <span className="text-xs text-slate-400">{city}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}

function BranchMini({ branch }: { branch: (typeof branches)[number] }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#12285C] dark:bg-blue-950 dark:text-blue-200">
        <Store size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold text-[#12285C] dark:text-white">
          {branch.name}
        </h3>
        <p className="mt-1 truncate text-xs text-slate-500">{branch.address}</p>
        <p className="mt-2 text-[11px] font-bold text-emerald-600">Buka hari ini • 09.00–21.00</p>
      </div>
      <ChevronRight className="mt-2 text-slate-300" size={18} />
    </div>
  );
}

function CatalogPage({
  initial,
  addToCart,
}: {
  initial: string;
  addToCart: (product: Product) => void;
}) {
  const initialCategory = categories.includes(initial) ? initial : "Semua";
  const [query, setQuery] = useState(categories.includes(initial) ? "" : initial);
  const [category, setCategory] = useState(initialCategory);
  const [brand, setBrand] = useState("Semua");
  const [sort, setSort] = useState("Terlaris");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const filtered = useMemo(() => {
    let result = products.filter(
      (p) =>
        (!query ||
          `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())) &&
        (category === "Semua" || p.category === category) &&
        (brand === "Semua" || p.brand === brand) &&
        (!discountOnly || p.discount >= 15) &&
        (!inStock || p.stock > 5),
    );
    if (sort === "Termurah") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "Termahal") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "Terbaru") result = [...result].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === "Terlaris") result = [...result].sort((a, b) => b.sold - a.sold);
    return result;
  }, [query, category, brand, sort, discountOnly, inStock]);
  const filters = (
    <div className="space-y-6">
      <FilterBlock label="Kategori">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field">
          <option>Semua</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </FilterBlock>
      <FilterBlock label="Merek">
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="field">
          <option>Semua</option>
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </FilterBlock>
      <FilterBlock label="Rentang Harga">
        <div className="grid grid-cols-2 gap-2">
          <input className="field px-3 text-xs" placeholder="Minimum" />
          <input className="field px-3 text-xs" placeholder="Maksimum" />
        </div>
      </FilterBlock>
      <label className="filter-check">
        <input
          type="checkbox"
          checked={discountOnly}
          onChange={(e) => setDiscountOnly(e.target.checked)}
        />{" "}
        Diskon 15% ke atas
      </label>
      <label className="filter-check">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />{" "}
        Stok tersedia
      </label>
    </div>
  );
  return (
    <main>
      <PageHero
        title="Katalog Produk"
        text="Temukan elektronik dan perlengkapan rumah yang tepat dari 14 kategori pilihan."
      />
      <div className="container section">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-11"
              placeholder="Cari nama produk atau merek..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMobileFilter(true)}
              className="flex-1 lg:hidden"
            >
              <Wrench size={16} /> Filter
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field min-w-44"
            >
              <option>Terlaris</option>
              <option>Termurah</option>
              <option>Termahal</option>
              <option>Terbaru</option>
            </select>
          </div>
        </div>
        <div className="grid gap-7 lg:grid-cols-[250px_1fr]">
          <aside className="hidden rounded-2xl border border-slate-200 p-5 dark:border-slate-800 lg:block">
            <h2 className="mb-6 font-heading text-lg font-bold text-[#12285C] dark:text-white">
              Filter Produk
            </h2>
            {filters}
          </aside>
          <div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <p className="text-slate-500">
                <strong className="text-[#12285C] dark:text-white">{filtered.length}</strong> produk
                ditemukan
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("Semua");
                  setBrand("Semua");
                  setDiscountOnly(false);
                  setInStock(false);
                }}
                className="text-xs font-bold text-[#FF7A1A]"
              >
                Reset filter
              </button>
            </div>
            {filtered.length > 0 ? (
              <div className="product-grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} addToCart={addToCart} />
                ))}
              </div>
            ) : (
              <EmptyState title="Produk tidak ditemukan" text="Coba kata kunci atau filter lain." />
            )}
          </div>
        </div>
      </div>
      {mobileFilter && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/40 lg:hidden"
          onClick={() => setMobileFilter(false)}
        >
          <div
            className="absolute bottom-0 w-full rounded-t-[28px] bg-white p-6 dark:bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Filter Produk</h2>
              <button onClick={() => setMobileFilter(false)}>
                <X />
              </button>
            </div>
            {filters}
            <Button onClick={() => setMobileFilter(false)} className="mt-7 w-full">
              Terapkan Filter
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ProductDetailPage({
  id,
  addToCart,
  reviews,
}: {
  id: string;
  addToCart: (product: Product) => void;
  reviews: Review[];
}) {
  const product = products.find((item) => item.id === id) || products[0];
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("Spesifikasi");
  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  return (
    <main>
      <div className="container py-5 text-xs text-slate-500">
        <button onClick={() => go("home")}>Beranda</button>{" "}
        <ChevronRight className="inline" size={12} />{" "}
        <button onClick={() => go("catalog", product.category)}>{product.category}</button>{" "}
        <ChevronRight className="inline" size={12} />{" "}
        <span className="text-slate-700 dark:text-slate-300">{product.name}</span>
      </div>
      <section className="container pb-14 pt-2">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <ProductVisual
              product={product}
              className="h-[360px] w-full rounded-[28px] sm:h-[500px]"
            />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={`overflow-hidden rounded-xl border-2 ${i === 1 ? "border-[#FF7A1A]" : "border-transparent"}`}
                >
                  <ProductVisual product={product} className="aspect-square w-full" />
                </button>
              ))}
            </div>
          </div>
          <div className="lg:pl-5">
            <span className="text-xs font-extrabold uppercase tracking-[.15em] text-[#FF7A1A]">
              {product.brand}
            </span>
            <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-[#12285C] dark:text-white sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="fill-amber-400 text-amber-400" size={16} />{" "}
                {product.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{product.sold.toLocaleString("id-ID")} terjual</span>
              <span>•</span>
              <span>SKU {product.id}</span>
            </div>
            <div className="mt-7 rounded-2xl bg-[#F4F6FA] p-5 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-[#FF7A1A] px-2.5 py-1 text-xs font-bold text-white">
                  -{product.discount}%
                </span>
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
              <p className="mt-2 font-heading text-3xl font-extrabold text-[#12285C] dark:text-white">
                {formatPrice(product.price)}
              </p>
              <button
                onClick={() => go("installment", product.id)}
                className="mt-3 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300"
              >
                <CreditCard size={17} /> Cicilan mulai {formatPrice(Math.ceil(product.price / 24))}
                /bulan <ChevronRight size={15} />
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {[
                [ShieldCheck, `Garansi resmi ${product.warranty} bulan`],
                [PackageCheck, "Stok tersedia di 14 cabang"],
                [Truck, "Gratis kirim hingga 20 km"],
              ].map(([Icon, text]) => (
                <div
                  key={text as string}
                  className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                    <Icon size={17} />
                  </span>
                  {text as string}
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-3">
              <div className="flex h-12 items-center rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid h-full w-10 place-items-center"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="grid h-full w-10 place-items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Button
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(product);
                }}
                className="flex-1"
              >
                <ShoppingCart size={18} /> Tambah ke Keranjang
              </Button>
            </div>
            <a
              href={`https://wa.me/628111234567?text=${encodeURIComponent(`Halo HARTINI, saya ingin konsultasi ${product.name}`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50"
            >
              <MessageCircle size={18} /> Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-[#F8F9FB] py-12 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto">
            {["Spesifikasi", "Pilihan Cicilan", "Stok per Cabang"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${activeTab === tab ? "bg-[#12285C] text-white" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-white p-6 dark:bg-slate-900">
            {activeTab === "Spesifikasi" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Spec label="Spesifikasi utama" value={product.spec} />
                <Spec label="Merek" value={product.brand} />
                <Spec label="Kategori" value={product.category} />
                <Spec label="Garansi" value={`${product.warranty} bulan`} />
              </div>
            )}
            {activeTab === "Pilihan Cicilan" && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[3, 6, 12].map((tenor) => (
                  <div
                    key={tenor}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <span className="text-xs text-slate-500">{tenor} bulan</span>
                    <strong className="mt-1 block text-[#12285C] dark:text-white">
                      {formatPrice(Math.ceil(product.price / tenor))}/bulan
                    </strong>
                    <span className="mt-2 block text-xs font-bold text-emerald-600">Bunga 0%</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Stok per Cabang" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {branches.slice(0, 8).map((branch, i) => (
                  <div
                    key={branch.code}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-4 text-sm dark:border-slate-800"
                  >
                    <span>{branch.name}</span>
                    <strong className={i % 4 === 0 ? "text-orange-600" : "text-emerald-600"}>
                      {i % 4 === 0 ? "Sisa 2" : "Tersedia"}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <ProductReviews reviews={reviews.filter((r) => r.productId === product.id && !r.hidden)} />
      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle title="Produk Terkait" />
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} addToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
      <span className="block text-xs text-slate-400">{label}</span>
      <strong className="mt-1 block text-sm text-slate-700 dark:text-slate-200">{value}</strong>
    </div>
  );
}

function InstallmentPage({ initialId }: { initialId: string }) {
  const initialProduct = products.find((p) => p.id === initialId) || products[0];
  const [productId, setProductId] = useState(initialProduct.id);
  const [price, setPrice] = useState(initialProduct.price);
  const [tenor, setTenor] = useState(12);
  const [method, setMethod] = useState("Cicilan 0%");
  const fee = method === "Cicilan 0%" ? 0 : 0.015;
  const monthly = Math.ceil((price * (1 + fee * tenor)) / tenor);
  const selectProduct = (id: string) => {
    const selected = products.find((p) => p.id === id);
    if (selected) {
      setProductId(id);
      setPrice(selected.price);
    }
  };
  return (
    <main>
      <PageHero
        title="Simulator Cicilan"
        text="Rencanakan belanja lebih nyaman dengan estimasi cicilan yang transparan."
      />
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-[#12285C] dark:text-white">
              Atur simulasi
            </h2>
            <div className="mt-6 space-y-5">
              <FilterBlock label="Pilih Produk">
                <select
                  value={productId}
                  onChange={(e) => selectProduct(e.target.value)}
                  className="field"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FilterBlock>
              <FilterBlock label="Harga Produk">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="field"
                />
              </FilterBlock>
              <FilterBlock label="Tenor">
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 24].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTenor(t)}
                      className={`rounded-xl border py-3 text-sm font-bold ${tenor === t ? "border-[#12285C] bg-[#12285C] text-white" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      {t} bln
                    </button>
                  ))}
                </div>
              </FilterBlock>
              <FilterBlock label="Metode">
                <div className="grid gap-2 sm:grid-cols-2">
                  {["Cicilan 0%", "Kartu Kredit"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold ${method === m ? "border-[#FF7A1A] bg-orange-50 text-[#12285C] dark:bg-orange-950/30 dark:text-white" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      <span
                        className={`grid size-5 place-items-center rounded-full border ${method === m ? "border-[#FF7A1A] bg-[#FF7A1A] text-white" : "border-slate-300"}`}
                      >
                        {method === m && <Check size={12} />}
                      </span>
                      {m}
                    </button>
                  ))}
                </div>
              </FilterBlock>
            </div>
          </div>
          <div className="rounded-[24px] bg-[#12285C] p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-white/55">
              Estimasi cicilan Anda
            </p>
            <p className="mt-5 font-heading text-4xl font-extrabold sm:text-5xl">
              {formatPrice(monthly)}
            </p>
            <p className="mt-2 text-sm text-white/60">per bulan selama {tenor} bulan</p>
            <div className="my-7 h-px bg-white/15" />
            <div className="space-y-3 text-sm">
              {[
                ["Harga produk", formatPrice(price)],
                ["Metode", method],
                ["Bunga", method === "Cicilan 0%" ? "0%" : "1,5% / bulan"],
                ["Total pembayaran", formatPrice(monthly * tenor)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-white/55">{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <Button onClick={() => go("detail", productId)} className="mt-8 w-full">
              Lihat Produk <ArrowRight size={17} />
            </Button>
            <p className="mt-4 text-[11px] leading-5 text-white/45">
              Simulasi bersifat estimasi. Persetujuan cicilan mengikuti syarat dan ketentuan bank
              atau mitra pembiayaan.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function CartPage({
  cart,
  changeQty,
  remove,
}: {
  cart: CartItem[];
  changeQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  return (
    <main>
      <PageHero
        title="Keranjang Belanja"
        text={`${cart.reduce((s, i) => s + i.qty, 0)} barang menunggu untuk dibawa pulang.`}
      />
      <section className="section">
        <div className="container">
          {cart.length === 0 ? (
            <EmptyState
              title="Keranjang masih kosong"
              text="Jelajahi katalog dan temukan produk yang Anda butuhkan."
              action={<Button onClick={() => go("catalog")}>Mulai Belanja</Button>}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-3">
                {cart.map(({ product, qty }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <ProductVisual
                      product={product}
                      className="size-24 shrink-0 rounded-xl sm:size-28"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-400">{product.brand}</p>
                      <button
                        onClick={() => go("detail", product.id)}
                        className="mt-1 text-left font-heading text-sm font-bold text-[#12285C] dark:text-white"
                      >
                        {product.name}
                      </button>
                      <p className="mt-2 font-bold text-[#12285C] dark:text-white">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => changeQty(product.id, Math.max(1, qty - 1))}
                            className="p-2"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">{qty}</span>
                          <button onClick={() => changeQty(product.id, qty + 1)} className="p-2">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(product.id)}
                          className="text-xs font-bold text-red-500"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <OrderSummary subtotal={subtotal} onCheckout={() => go("checkout")} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function OrderSummary({
  subtotal,
  onCheckout,
  buttonLabel = "Lanjut Checkout",
  buttonType = "button",
}: {
  subtotal: number;
  onCheckout: () => void;
  buttonLabel?: string;
  buttonType?: "button" | "submit";
}) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">
        Ringkasan Pesanan
      </h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Pengiriman</span>
          <span className="font-bold text-emerald-600">Gratis</span>
        </div>
        <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex justify-between font-bold text-[#12285C] dark:text-white">
          <span>Total</span>
          <span className="font-heading text-xl">{formatPrice(subtotal)}</span>
        </div>
      </div>
      <Button
        type={buttonType}
        onClick={onCheckout}
        className="mt-6 w-full"
        disabled={subtotal === 0}
      >
        {buttonLabel} <ArrowRight size={17} />
      </Button>
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck size={14} /> Transaksi aman & terlindungi
      </div>
    </aside>
  );
}

function CheckoutPage({
  cart,
  placeOrder,
}: {
  cart: CartItem[];
  placeOrder: (data: {
    customer: string;
    branch: string;
    delivery: Order["delivery"];
    payment: string;
  }) => void;
}) {
  const [customer, setCustomer] = useState("");
  const [branch, setBranch] = useState("Jakarta");
  const [delivery, setDelivery] = useState<Order["delivery"]>("Kirim ke alamat");
  const [payment, setPayment] = useState("Transfer Bank");
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    placeOrder({ customer: customer.trim(), branch, delivery, payment });
  };
  if (!cart.length)
    return (
      <main>
        <PageHero title="Checkout" text="Selesaikan pesanan Anda." />
        <div className="container section">
          <EmptyState
            title="Tidak ada pesanan"
            text="Keranjang Anda sudah kosong."
            action={<Button onClick={() => go("catalog")}>Ke Katalog</Button>}
          />
        </div>
      </main>
    );
  return (
    <main>
      <PageHero title="Checkout" text="Pilih cara menerima barang dan metode pembayaran." />
      <form onSubmit={submit} className="container section grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <CheckoutBlock title="1. Data Pemesan">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="field"
                placeholder="Nama lengkap"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
              />
              <input className="field" placeholder="Nomor WhatsApp" required />
              <textarea
                className="field min-h-24 sm:col-span-2"
                placeholder="Alamat lengkap"
                required
              />
            </div>
          </CheckoutBlock>
          <CheckoutBlock title="2. Cara Menerima Barang">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Kirim ke alamat", "Ambil di toko"].map((item) => (
                <Choice
                  key={item}
                  active={delivery === item}
                  onClick={() => setDelivery(item as Order["delivery"])}
                  icon={item.startsWith("Kirim") ? <Truck /> : <Store />}
                  label={item}
                  text={item.startsWith("Kirim") ? "Gratis hingga 20 km" : "Pilih dari 20 cabang"}
                />
              ))}
            </div>
            <label className="mt-4 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {delivery === "Ambil di toko" ? "Cabang pengambilan" : "Cabang pengirim"}
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="field mt-2 font-normal normal-case tracking-normal"
              >
                {branches.map((b) => (
                  <option key={b.code} value={b.name.replace("Hartini ", "")}>
                    {b.city}, {b.province}
                  </option>
                ))}
              </select>
            </label>
          </CheckoutBlock>
          <CheckoutBlock title="3. Metode Pembayaran">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Transfer Bank", "QRIS", "Kartu Kredit", "Cicilan 0%"].map((item) => (
                <Choice
                  key={item}
                  active={payment === item}
                  onClick={() => setPayment(item)}
                  icon={<CreditCard />}
                  label={item}
                  text={item === "Cicilan 0%" ? "Tenor hingga 12 bulan" : "Pembayaran mock"}
                />
              ))}
            </div>
          </CheckoutBlock>
        </div>
        <OrderSummary
          subtotal={subtotal}
          onCheckout={() => {}}
          buttonLabel="Buat Pesanan"
          buttonType="submit"
        />
      </form>
    </main>
  );
}

function CheckoutBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-5 font-heading text-lg font-bold text-[#12285C] dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Choice({
  active,
  onClick,
  icon,
  label,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left ${active ? "border-[#FF7A1A] bg-orange-50 dark:bg-orange-950/20" : "border-slate-200 dark:border-slate-700"}`}
    >
      <span className="text-[#FF7A1A]">{icon}</span>
      <span>
        <strong className="block text-sm text-[#12285C] dark:text-white">{label}</strong>
        <span className="text-xs text-slate-500">{text}</span>
      </span>
    </button>
  );
}

function BranchesPage() {
  const provinces = ["Semua", ...new Set(branches.map((b) => b.province))];
  const [province, setProvince] = useState("Semua");
  const shown = branches.filter((b) => province === "Semua" || b.province === province);
  return (
    <main>
      <PageHero
        title="Lokasi Cabang"
        text="Datang, konsultasi, dan coba produk langsung di cabang HARTINI terdekat."
      />
      <section className="section">
        <div className="container">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              <strong className="text-[#12285C] dark:text-white">{shown.length}</strong> cabang
              ditemukan
            </p>
            <select
              className="field max-w-xs"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              {provinces.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
            <div className="max-h-[660px] space-y-3 overflow-auto pr-1">
              {shown.map((branch) => (
                <article
                  key={branch.code}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold tracking-wider text-[#FF7A1A]">
                        {branch.code} • {branch.province}
                      </p>
                      <h2 className="mt-1 font-heading font-bold text-[#12285C] dark:text-white">
                        {branch.name}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${branch.zone === "A-Stabil" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {branch.zone}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-500">{branch.address}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {branch.service}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-slate-800">
                      09.00–21.00
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#12285C] text-xs font-bold text-white"
                    >
                      <MapPin size={15} /> Petunjuk Arah
                    </a>
                    <a
                      href={`tel:${branch.phone}`}
                      className="grid min-h-10 w-10 place-items-center rounded-lg border border-slate-200 text-[#12285C] dark:border-slate-700 dark:text-white"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="sticky top-28 hidden h-[660px] overflow-hidden rounded-[28px] border border-slate-200 bg-blue-50 lg:block dark:border-slate-800">
              <iframe
                title="Peta jaringan cabang HARTINI ELECTRONIC di Indonesia"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  province === "Semua" ? "Indonesia" : province,
                )}&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 text-xs text-slate-600 shadow-lg backdrop-blur dark:bg-slate-950/90 dark:text-slate-300">
                <strong className="block text-[#12285C] dark:text-white">
                  Area pencarian: {province}
                </strong>
                Pilih cabang pada daftar untuk membuka petunjuk arah.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MemberPage({ notify }: { notify: (message: string) => void }) {
  const tiers = [
    ["Bronze", "Mulai bergabung", "1x poin", "Promo member"],
    ["Silver", "Belanja Rp5 juta", "1,25x poin", "Voucher ulang tahun"],
    ["Gold", "Belanja Rp25 juta", "1,5x poin", "Prioritas layanan"],
    ["Platinum", "Belanja Rp75 juta", "2x poin", "Gratis kirim premium"],
  ];
  return (
    <main>
      <PageHero
        title="Program Member HARTINI"
        text="Makin sering berbelanja, makin banyak manfaat untuk keluarga Anda."
      />
      <section className="section">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map(([tier, min, point, benefit], i) => (
              <div
                key={tier}
                className={`rounded-[22px] p-6 ${i === 3 ? "bg-[#12285C] text-white shadow-xl" : "border border-slate-200 dark:border-slate-800 dark:bg-slate-900"}`}
              >
                <span
                  className={`grid size-11 place-items-center rounded-full ${["bg-amber-100 text-amber-800", "bg-slate-200 text-slate-600", "bg-yellow-100 text-yellow-700", "bg-white/10 text-orange-300"][i]}`}
                >
                  <Star size={20} fill="currentColor" />
                </span>
                <h2
                  className={`mt-5 font-heading text-xl font-bold ${i === 3 ? "text-white" : "text-[#12285C] dark:text-white"}`}
                >
                  {tier}
                </h2>
                <p className={`mt-1 text-xs ${i === 3 ? "text-white/55" : "text-slate-500"}`}>
                  {min}
                </p>
                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex gap-2">
                    <Check size={16} className="text-emerald-500" /> {point}
                  </p>
                  <p className="flex gap-2">
                    <Check size={16} className="text-emerald-500" /> {benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_.75fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#12285C] text-white">
                  <tr>
                    <th className="p-4">Manfaat</th>
                    {tiers.map((t) => (
                      <th key={t[0]} className="p-4">
                        {t[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Poin belanja", "1x", "1,25x", "1,5x", "2x"],
                    ["Voucher ulang tahun", "—", "✓", "✓", "✓"],
                    ["Prioritas servis", "—", "—", "✓", "✓"],
                    ["Gratis pengiriman", "—", "—", "—", "✓"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-4 font-semibold">{row[0]}</td>
                      {row.slice(1).map((v, i) => (
                        <td key={i} className="p-4 text-center text-slate-500">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                notify("Pendaftaran member berhasil dikirim.");
              }}
              className="rounded-2xl bg-[#F4F6FA] p-6 dark:bg-slate-900"
            >
              <h2 className="font-heading text-xl font-bold text-[#12285C] dark:text-white">
                Daftar Member Gratis
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Isi data singkat untuk mulai mengumpulkan poin.
              </p>
              <div className="mt-5 space-y-3">
                <input className="field" placeholder="Nama lengkap" required />
                <input className="field" placeholder="Nomor WhatsApp" required />
                <input className="field" type="email" placeholder="Email" required />
                <select className="field">
                  <option>Cabang favorit</option>
                  {branches.map((b) => (
                    <option key={b.code}>{b.city}</option>
                  ))}
                </select>
                <Button type="submit" className="w-full">
                  Daftar Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function PromoPage() {
  const [seconds, setSeconds] = useState(3 * 24 * 60 * 60 + 8 * 60 * 60 + 42 * 60);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  const time = [
    Math.floor(seconds / 86400),
    Math.floor((seconds % 86400) / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];
  return (
    <main>
      <PageHero
        title="Promo & Katalog Bulanan"
        text="Penawaran terpilih untuk kebutuhan elektronik keluarga Anda."
      />
      <section className="section">
        <div className="container">
          <div className="rounded-[28px] bg-gradient-to-br from-[#12285C] to-[#2456A4] p-7 text-white sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="rounded-full bg-[#FF7A1A] px-3 py-1.5 text-xs font-bold">
                  PROMO TERBATAS
                </span>
                <h2 className="mt-5 font-heading text-3xl font-bold">Pekan Elektronik Keluarga</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
                  Hemat hingga 30% untuk TV, kulkas, mesin cuci, AC, dan peralatan dapur pilihan.
                </p>
              </div>
              <div>
                <p className="mb-3 text-center text-xs font-bold text-white/50">Berakhir dalam</p>
                <div className="flex gap-2">
                  {time.map((v, i) => (
                    <div
                      key={i}
                      className="min-w-16 rounded-xl bg-white/10 p-3 text-center backdrop-blur"
                    >
                      <strong className="block font-heading text-2xl">
                        {String(v).padStart(2, "0")}
                      </strong>
                      <span className="text-[9px] text-white/50">
                        {["HARI", "JAM", "MENIT", "DETIK"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <SectionTitle
            title="Promo aktif"
            text="Syarat dan ketentuan berlaku untuk setiap program."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {promoSlides
              .concat([
                { ...promoSlides[0], label: "Gratis Ongkir" },
                { ...promoSlides[1], label: "Trade-in" },
              ])
              .map((promo, i) => (
                <article
                  key={i}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className={`h-36 bg-gradient-to-br ${promo.gradient} p-5 text-white`}>
                    <span className="text-xs font-bold text-white/60">{promo.eyebrow}</span>
                    <h2 className="mt-2 font-heading text-xl font-bold">{promo.label}</h2>
                  </div>
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-[#12285C] dark:text-white">
                      {promo.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{promo.text}</p>
                    <button
                      onClick={() => go("catalog")}
                      className="mt-4 flex items-center gap-1 text-sm font-bold text-[#FF7A1A]"
                    >
                      Lihat produk <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main>
      <PageHero
        title="Tentang HARTINI"
        text="Tumbuh dekat bersama keluarga Indonesia sejak 1998."
      />
      <section className="section">
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">CERITA KAMI</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-[#12285C] dark:text-white">
                Elektronik berkualitas harus mudah dijangkau siapa saja.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                HARTINI ELECTRONIC bermula dari sebuah toko keluarga dengan keyakinan sederhana:
                pelanggan berhak mendapat penjelasan yang jujur, pilihan yang lengkap, dan layanan
                yang tetap hadir setelah transaksi selesai.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Kini kami melayani pelanggan melalui 20 cabang di 15 provinsi, didukung 440 karyawan
                dan jaringan layanan purna jual yang terus berkembang.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["20", "Cabang"],
                ["15", "Provinsi"],
                ["440", "Karyawan"],
                ["173+", "Pilihan SKU"],
              ].map(([num, label]) => (
                <div key={label} className="rounded-2xl bg-[#F4F6FA] p-6 dark:bg-slate-900">
                  <strong className="font-heading text-4xl text-[#FF7A1A]">{num}</strong>
                  <span className="mt-2 block text-sm font-semibold text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              [
                Heart,
                "Ramah Keluarga",
                "Kami mendengarkan dan menjelaskan tanpa bahasa yang rumit.",
              ],
              [
                ShieldCheck,
                "Dapat Dipercaya",
                "Harga transparan, garansi resmi, dan dukungan purna jual.",
              ],
              [
                MapPin,
                "Dekat & Relevan",
                "Pilihan produk disesuaikan dengan kebutuhan setiap daerah.",
              ],
            ].map(([Icon, title, text]) => (
              <div
                key={title as string}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <Icon className="text-[#FF7A1A]" />
                <h3 className="mt-4 font-heading font-bold text-[#12285C] dark:text-white">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CareerPage({ notify }: { notify: (m: string) => void }) {
  const jobs = [
    ["Kasir", "Jakarta, Bandung, Makassar", "Penuh waktu"],
    ["Sales Consultant", "Surabaya, Medan, Denpasar", "Penuh waktu"],
    ["Admin Gudang", "Kupang, Pontianak", "Penuh waktu"],
  ];
  return (
    <main>
      <PageHero
        title="Karir di HARTINI"
        text="Tumbuh bersama tim yang ramah, tangguh, dan dekat dengan pelanggan."
      />
      <section className="section">
        <div className="container max-w-4xl">
          <SectionTitle
            title="Posisi yang tersedia"
            text="Kami mencari talenta yang senang membantu dan mau terus belajar."
          />
          <div className="space-y-3">
            {jobs.map(([role, location, type]) => (
              <article
                key={role}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-[#12285C] dark:bg-blue-950 dark:text-blue-200">
                  <BriefcaseBusiness />
                </span>
                <div className="flex-1">
                  <h2 className="font-heading font-bold text-[#12285C] dark:text-white">{role}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {location} • {type}
                  </p>
                </div>
                <Button
                  onClick={() => notify(`Formulir lamaran ${role} dibuka.`)}
                  variant="outline"
                >
                  Lamar Posisi
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactPage({ notify }: { notify: (m: string) => void }) {
  return (
    <main>
      <PageHero
        title="Hubungi Kami"
        text="Tim HARTINI siap membantu kebutuhan produk, pesanan, dan layanan Anda."
      />
      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <div className="space-y-3">
            {[
              [MessageCircle, "WhatsApp", "0811-1234-567"],
              [Phone, "Layanan Pelanggan", "0800-1-HARTINI"],
              [Store, "Email", "halo@hartini.example"],
            ].map(([Icon, label, value]) => (
              <div
                key={label as string}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-[#12285C] dark:bg-blue-950 dark:text-blue-200">
                  <Icon />
                </span>
                <div>
                  <p className="text-xs text-slate-400">{label as string}</p>
                  <strong className="text-sm text-[#12285C] dark:text-white">
                    {value as string}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify("Pesan Anda berhasil dikirim.");
            }}
            className="rounded-[24px] bg-[#F4F6FA] p-6 dark:bg-slate-900 sm:p-8"
          >
            <h2 className="font-heading text-xl font-bold text-[#12285C] dark:text-white">
              Kirim Pesan
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Nama lengkap" required />
              <input className="field" type="email" placeholder="Email" required />
              <select className="field sm:col-span-2">
                <option>Topik: Informasi produk</option>
                <option>Status pesanan</option>
                <option>Garansi & servis</option>
                <option>Kerja sama</option>
              </select>
              <textarea
                className="field min-h-32 sm:col-span-2"
                placeholder="Ceritakan yang dapat kami bantu..."
                required
              />
              <Button type="submit" className="sm:col-span-2 sm:w-fit">
                Kirim Pesan
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function FaqPage() {
  const faqs = [
    [
      "Apakah semua produk bergaransi resmi?",
      "Ya. Setiap produk dilengkapi garansi resmi sesuai ketentuan merek, mulai dari 12 hingga 60 bulan.",
    ],
    [
      "Bagaimana kebijakan retur?",
      "Pengajuan retur dapat dilakukan maksimal 7 hari setelah barang diterima untuk produk yang tidak sesuai pesanan atau cacat saat diterima.",
    ],
    [
      "Bagaimana cara mengajukan cicilan 0%?",
      "Pilih produk bertanda Cicilan 0%, lalu gunakan kartu kredit bank partner atau ajukan melalui staf cabang.",
    ],
    [
      "Berapa lama waktu pengiriman?",
      "Dalam kota maksimal 2 hari kerja. Luar kota 2–4 hari kerja dan antar pulau 5–10 hari kerja.",
    ],
    [
      "Apakah ada layanan instalasi?",
      "Tersedia instalasi AC, TV, mesin cuci, kulkas, komputer, CCTV, solar panel, dan produk pilihan lainnya.",
    ],
  ];
  const [open, setOpen] = useState(0);
  return (
    <main>
      <PageHero
        title="Pertanyaan Umum"
        text="Jawaban cepat seputar belanja, garansi, cicilan, dan pengiriman."
      />
      <section className="section">
        <div className="container max-w-3xl space-y-3">
          {faqs.map(([q, a], i) => (
            <article
              key={q}
              className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 text-left font-heading text-sm font-bold text-[#12285C] dark:text-white"
              >
                {q}
                <ChevronDown
                  className={`shrink-0 transition ${open === i ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>
              {open === i && (
                <p className="border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-500 dark:border-slate-800">
                  {a}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function PageHero({ title, text }: { title: string; text: string }) {
  return (
    <section className="relative overflow-hidden bg-[#12285C] py-12 text-white sm:py-16">
      <div className="absolute -right-20 -top-32 size-96 rounded-full border-[70px] border-white/[.04]" />
      <div className="container relative">
        <p className="mb-3 text-xs font-extrabold tracking-[.16em] text-orange-400">
          HARTINI ELECTRONIC
        </p>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">{text}</p>
      </div>
    </section>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <ShoppingBag size={28} />
        </span>
        <h2 className="mt-5 font-heading text-xl font-bold text-[#12285C] dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="bg-[#FF7A1A] py-9 text-white">
      <div className="container flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Promo pilihan, langsung ke inbox.</h2>
          <p className="mt-1 text-sm text-white/75">
            Dapatkan info katalog bulanan dan penawaran member.
          </p>
        </div>
        {done ? (
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 font-bold">
            <Check size={18} /> Terima kasih telah berlangganan
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="flex w-full max-w-lg gap-2"
          >
            <input
              required
              type="email"
              className="min-w-0 flex-1 rounded-xl bg-white px-4 text-sm text-slate-800 outline-none"
              placeholder="Alamat email Anda"
            />
            <button className="min-h-12 rounded-xl bg-[#12285C] px-5 text-sm font-bold">
              Berlangganan
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#091A3D] text-white">
      <div className="container grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2">
          <Logo inverse />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
            Belanja Elektronik Lengkap, Dekat di Rumah Anda. Produk resmi, pembayaran fleksibel, dan
            layanan yang dapat diandalkan.
          </p>
          <div className="mt-5 flex gap-2">
            {[Share2, Globe2, Play].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid size-10 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Media sosial"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        <FooterCol
          title="Belanja"
          items={[
            ["Semua Produk", "catalog"],
            ["Promo Aktif", "promo"],
            ["Simulator Cicilan", "installment"],
            ["Lokasi Cabang", "branches"],
          ]}
        />
        <FooterCol
          title="Tentang"
          items={[
            ["Tentang Kami", "about"],
            ["Program Member", "member"],
            ["Karir", "career"],
            ["Kontak", "contact"],
          ]}
        />
        <FooterCol
          title="Bantuan"
          items={[
            ["Pesanan Saya", "orders"],
            ["Admin", "admin"],
            ["FAQ", "faq"],
            ["Garansi & Retur", "faq"],
            ["Pengiriman", "faq"],
            ["WhatsApp", "contact"],
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-5 text-[11px] text-white/35 sm:flex-row sm:justify-between">
          <span>© 2027 HARTINI ELECTRONIC. Data dan kontak pada situs ini bersifat fiktif.</span>
          <span>Kebijakan Privasi • Syarat & Ketentuan</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: Array<[string, Page]> }) {
  return (
    <div>
      <h3 className="font-heading text-sm font-bold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map(([label, page]) => (
          <button
            key={label}
            onClick={() => go(page)}
            className="block text-sm text-white/50 hover:text-white"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}) {
  return (
    <div
      className="flex gap-0.5"
      role={onChange ? "radiogroup" : "img"}
      aria-label={`Rating ${value} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star
            size={size}
            className={n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} bintang`}
            onClick={() => onChange(n)}
            className="grid size-10 place-items-center rounded-lg transition hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}

const ratingLabels = ["", "Sangat buruk", "Kurang puas", "Cukup", "Puas", "Sangat puas"];

function ReviewForm({ onSubmit }: { onSubmit: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating) onSubmit(rating, comment.trim());
      }}
      className="mt-3 rounded-xl bg-[#F4F6FA] p-4 dark:bg-slate-800"
    >
      <p className="text-xs font-bold text-slate-500">Bagaimana produk ini?</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <StarRating value={rating} onChange={setRating} size={24} />
        {rating > 0 && (
          <span className="text-xs font-bold text-[#FF7A1A]">{ratingLabels[rating]}</span>
        )}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        className="field mt-2 min-h-20 py-3"
        placeholder="Ceritakan pengalaman Anda (opsional)"
        aria-label="Ulasan"
      />
      <Button type="submit" disabled={!rating} className="mt-3 w-full sm:w-auto">
        Kirim Ulasan
      </Button>
    </form>
  );
}

function ProductReviews({ reviews }: { reviews: Review[] }) {
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return (
    <section className="section pb-0">
      <div className="container">
        <SectionTitle
          eyebrow="ULASAN PEMBELI"
          title="Ulasan Pelanggan"
          text="Ulasan hanya dari pembeli yang pesanannya sudah diterima."
        />
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">
            Belum ada ulasan untuk produk ini.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="rounded-2xl bg-[#F4F6FA] p-6 text-center dark:bg-slate-900">
              <strong className="font-heading text-4xl text-[#12285C] dark:text-white">
                {avg.toFixed(1)}
              </strong>
              <div className="mt-2 flex justify-center">
                <StarRating value={Math.round(avg)} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{reviews.length} ulasan</p>
            </div>
            <div className="space-y-3">
              {[...reviews].reverse().map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-[#12285C] dark:text-white">
                      {r.customer || "Pembeli HARTINI"}
                    </strong>
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-1">
                    <StarRating value={r.rating} size={14} />
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {r.comment}
                    </p>
                  )}
                  {r.adminReply && (
                    <p className="mt-3 rounded-lg bg-[#F4F6FA] p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <strong className="text-[#12285C] dark:text-white">Balasan HARTINI: </strong>
                      {r.adminReply}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function OrdersPage({
  orders,
  reviews,
  advance,
  submitReview,
}: {
  orders: Order[];
  reviews: Review[];
  advance: (orderId: string) => void;
  submitReview: (order: Order, productId: string, rating: number, comment: string) => void;
}) {
  const steps = (o: Order) => [
    "Diproses",
    o.delivery === "Kirim ke alamat" ? "Dalam Pengiriman" : "Siap Diambil",
    "Selesai",
  ];
  return (
    <main>
      <PageHero
        title="Pesanan Saya"
        text="Pantau status pesanan dan beri rating setelah barang terkirim atau diambil."
      />
      <section className="section">
        <div className="container max-w-4xl space-y-5">
          {orders.length === 0 && (
            <EmptyState
              title="Belum ada pesanan"
              text="Pesanan Anda akan muncul di sini setelah checkout."
              action={<Button onClick={() => go("catalog")}>Mulai Belanja</Button>}
            />
          )}
          {orders.map((order) => {
            const flow = steps(order);
            const current = flow.indexOf(order.status);
            const next = nextStatus(order);
            const done = order.status === "Selesai";
            const doneLabel =
              order.delivery === "Kirim ke alamat"
                ? "Barang telah diterima"
                : "Barang telah diambil";
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold tracking-wider text-[#FF7A1A]">
                      {order.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      • {order.delivery} • {order.payment}
                    </p>
                  </div>
                  <strong className="font-heading text-lg text-[#12285C] dark:text-white">
                    {formatPrice(order.total)}
                  </strong>
                </div>

                <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Status pesanan">
                  {flow.map((label, i) => (
                    <li key={label} className="text-center">
                      <div
                        className={`h-1.5 rounded-full ${i <= current ? "bg-[#FF7A1A]" : "bg-slate-200 dark:bg-slate-700"}`}
                      />
                      <span
                        className={`mt-2 block text-[11px] font-bold ${i <= current ? "text-[#12285C] dark:text-white" : "text-slate-400"}`}
                      >
                        {i === 2
                          ? order.delivery === "Kirim ke alamat"
                            ? "Terkirim"
                            : "Sudah Diambil"
                          : label}
                      </span>
                    </li>
                  ))}
                </ol>

                {order.trackingNumber && (
                  <p className="mt-4 flex items-center gap-2 rounded-lg bg-[#F4F6FA] px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Truck size={14} /> Kurir {order.courier} • No. resi{" "}
                    <strong>{order.trackingNumber}</strong>
                  </p>
                )}
                <div className="mt-5 space-y-3">
                  {order.items.map((item) => {
                    const review = reviews.find(
                      (r) => r.orderId === order.id && r.productId === item.productId,
                    );
                    return (
                      <div
                        key={item.productId}
                        className="rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              onClick={() => go("detail", item.productId)}
                              className="text-left text-sm font-bold text-[#12285C] hover:text-[#FF7A1A] dark:text-white"
                            >
                              {item.name}
                            </button>
                            <p className="mt-1 text-xs text-slate-500">
                              {item.qty} x {formatPrice(item.price)}
                            </p>
                          </div>
                          {review && (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                              Sudah dinilai
                            </span>
                          )}
                        </div>
                        {review && (
                          <div className="mt-2">
                            <StarRating value={review.rating} size={16} />
                            {review.comment && (
                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                “{review.comment}”
                              </p>
                            )}
                          </div>
                        )}
                        {done && !review && (
                          <ReviewForm
                            onSubmit={(rating, comment) =>
                              submitReview(order, item.productId, rating, comment)
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {done ? (
                  <p className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <Check size={15} /> {doneLabel}. Terima kasih sudah berbelanja!
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button onClick={() => advance(order.id)} variant="outline">
                      {next === "Selesai"
                        ? order.delivery === "Kirim ke alamat"
                          ? "Konfirmasi Barang Diterima"
                          : "Konfirmasi Sudah Diambil"
                        : `Demo: ubah status ke ${next}`}
                    </Button>
                    <span className="text-xs text-slate-400">
                      Rating dapat diberikan setelah barang{" "}
                      {order.delivery === "Kirim ke alamat" ? "diterima" : "diambil"}.
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

const rpShort = (n: number) =>
  n >= 1e12
    ? `Rp ${(n / 1e12).toFixed(2).replace(".", ",")} T`
    : n >= 1e9
      ? `Rp ${(n / 1e9).toFixed(2).replace(".", ",")} M`
      : n >= 1e6
        ? `Rp ${(n / 1e6).toFixed(1).replace(".", ",")} jt`
        : formatPrice(n);

const couriers = ["Kurir HARTINI", "JNE", "J&T Express", "SiCepat", "AnterAja"];
const ADMIN_PIN = "admin123"; // demo saja; ganti dengan Supabase Auth + role admin.

function AdminStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold text-[#12285C] dark:text-white">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  text,
}: {
  label: string;
  value: number;
  max: number;
  text: string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-slate-500">{text}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-2 rounded-full bg-[#FF7A1A]"
          style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function LoadingBlock({ error }: { error?: boolean }) {
  return error ? (
    <p role="alert" className="rounded-2xl border border-red-200 p-6 text-sm text-red-600">
      Data penjualan gagal dimuat. Muat ulang halaman.
    </p>
  ) : (
    <div className="space-y-3" aria-busy="true">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

function AdminSales({
  report,
  orders,
  onDemo,
}: {
  report: Report | null;
  orders: Order[];
  onDemo: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("Semua");
  const allMonths = MONTHS.map((_, i) => i);
  const all = useMemo(() => (report ? pnl(report, report.branches, allMonths) : null), [report]);
  const monthly = useMemo(
    () => (report ? allMonths.map((m) => pnl(report, report.branches, [m])) : []),
    [report],
  );
  const perBranch = useMemo(
    () =>
      report
        ? report.branches
            .map((b) => ({ name: b, ...pnl(report, [b], allMonths) }))
            .sort((x, y) => y.net - x.net)
        : [],
    [report],
  );
  const onlineRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const sold: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      const e = (sold[i.productId] ||= { name: i.name, qty: 0, revenue: 0 });
      e.qty += i.qty;
      e.revenue += i.qty * i.price;
    }),
  );
  const best = Object.values(sold)
    .sort((x, y) => y.qty - x.qty)
    .slice(0, 5);
  const shown = orders.filter((o) => statusFilter === "Semua" || o.status === statusFilter);
  const cats = report
    ? Object.entries(report.categories)
        .sort((x, y) => y[1].omzet - x[1].omzet)
        .slice(0, 8)
    : [];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">
          Ringkasan Penjualan 2027
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Seluruh cabang • data workbook + pesanan online (menambah) − retur (mengurangi)
        </p>
        {!all ? (
          <div className="mt-4">
            <LoadingBlock />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <AdminStat
              label="Omzet bersih"
              value={rpShort(all.net)}
              hint="Penjualan toko + online − retur"
            />
            <AdminStat
              label="Penjualan online (+)"
              value={rpShort(all.onlineGross)}
              hint={`${orders.length} pesanan masuk`}
            />
            <AdminStat label="Retur (−)" value={rpShort(all.returns)} hint="Mengurangi omzet" />
            <AdminStat
              label="Laba kotor"
              value={rpShort(all.grossProfit)}
              hint={`Margin ${(all.grossMargin * 100).toFixed(1).replace(".", ",")}%`}
            />
            <AdminStat label="Transaksi" value={all.trx.toLocaleString("id-ID")} />
            <AdminStat label="Unit terjual (neto)" value={all.qty.toLocaleString("id-ID")} />
          </div>
        )}
      </div>

      {report && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-heading font-bold text-[#12285C] dark:text-white">
                Omzet bersih per bulan
              </h3>
              <div
                className="mt-5 flex h-48 items-end gap-1.5"
                role="img"
                aria-label="Grafik omzet bersih per bulan"
              >
                {monthly.map((m, i) => (
                  <div
                    key={i}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                    title={`${MONTHS[i]}: ${rpShort(m.net)}`}
                  >
                    <div
                      className="w-full rounded-t-md bg-[#12285C] transition group-hover:bg-[#FF7A1A] dark:bg-blue-400"
                      style={{
                        height: `${Math.max(2, (m.net / Math.max(...monthly.map((x) => x.net), 1)) * 88)}%`,
                      }}
                    />
                    <span className="text-[9px] font-bold text-slate-400">
                      {MONTHS[i].slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-heading font-bold text-[#12285C] dark:text-white">
                Omzet bersih per kategori
              </h3>
              <div className="mt-4 space-y-3">
                {cats.map(([name, c]) => (
                  <BarRow
                    key={name}
                    label={name}
                    value={c.omzet}
                    max={cats[0][1].omzet}
                    text={rpShort(c.omzet)}
                  />
                ))}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="p-5 font-heading font-bold text-[#12285C] dark:text-white">
              Cabang dengan omzet bersih tertinggi
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="p-3">Cabang</th>
                    <th className="p-3 text-right">Transaksi</th>
                    <th className="p-3 text-right">Retur</th>
                    <th className="p-3 text-right">Omzet bersih</th>
                  </tr>
                </thead>
                <tbody>
                  {perBranch.slice(0, 8).map((b) => (
                    <tr key={b.name} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-3 font-semibold">{b.name}</td>
                      <td className="p-3 text-right">{b.trx.toLocaleString("id-ID")}</td>
                      <td className="p-3 text-right text-slate-500">{rpShort(b.returns)}</td>
                      <td className="p-3 text-right font-bold">{rpShort(b.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">
              Pesanan Toko Online
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {orders.length} pesanan • {formatPrice(onlineRevenue)} — setiap pesanan baru otomatis
              menambah omzet cabangnya
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field min-h-11 w-auto text-xs"
              aria-label="Filter status"
            >
              {["Semua", "Diproses", "Dalam Pengiriman", "Siap Diambil", "Selesai"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <Button variant="outline" onClick={onDemo} className="text-xs">
              Tambah data contoh
            </Button>
          </div>
        </div>
        {best.length > 0 && (
          <div className="mt-4 rounded-2xl bg-[#F4F6FA] p-5 dark:bg-slate-900">
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Produk terlaris online
            </h3>
            <div className="space-y-3">
              {best.map((x) => (
                <BarRow
                  key={x.name}
                  label={x.name}
                  value={x.qty}
                  max={best[0].qty}
                  text={`${x.qty} unit • ${rpShort(x.revenue)}`}
                />
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {shown.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Belum ada pesanan. Gunakan checkout atau “Tambah data contoh”.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
                  <tr>
                    <th className="p-3">No. pesanan</th>
                    <th className="p-3">Pembeli</th>
                    <th className="p-3">Cabang</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="p-3 font-bold text-[#12285C] dark:text-white">{o.id}</td>
                      <td className="p-3">{o.customer || "-"}</td>
                      <td className="p-3 text-slate-500">{o.branch || "Jakarta"}</td>
                      <td className="p-3 text-slate-500">
                        {o.items.reduce((sum, i) => sum + i.qty, 0)} unit
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold dark:bg-slate-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminReviews({
  reviews,
  update,
}: {
  reviews: Review[];
  update: (id: string, patch: Partial<Review>) => void;
}) {
  const [rating, setRating] = useState("Semua");
  const [q, setQ] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const nameOf = (id: string) => products.find((p) => p.id === id)?.name || id;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const perProduct = Object.entries(
    reviews.reduce<Record<string, number[]>>(
      (acc, r) => ((acc[r.productId] ||= []).push(r.rating), acc),
      {},
    ),
  ).map(([id, list]) => ({
    id,
    avg: list.reduce((a, b) => a + b, 0) / list.length,
    n: list.length,
  }));
  const shown = reviews
    .filter(
      (r) =>
        (rating === "Semua" || r.rating === Number(rating)) &&
        (!q || nameOf(r.productId).toLowerCase().includes(q.toLowerCase())),
    )
    .reverse();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat label="Total ulasan" value={String(reviews.length)} />
        <AdminStat
          label="Rata-rata rating"
          value={reviews.length ? avg.toFixed(1).replace(".", ",") : "-"}
        />
        <AdminStat
          label="Rating 1–2 bintang"
          value={String(reviews.filter((r) => r.rating <= 2).length)}
          hint="Perlu ditindaklanjuti"
        />
        <AdminStat label="Disembunyikan" value={String(reviews.filter((r) => r.hidden).length)} />
      </div>
      {perProduct.length > 0 && (
        <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-heading font-bold text-[#12285C] dark:text-white">
            Rating per produk
          </h3>
          <div className="mt-4 space-y-3">
            {perProduct
              .sort((a, b) => b.avg - a.avg)
              .map((p) => (
                <BarRow
                  key={p.id}
                  label={nameOf(p.id)}
                  value={p.avg}
                  max={5}
                  text={`${p.avg.toFixed(1)} • ${p.n} ulasan`}
                />
              ))}
          </div>
        </section>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field"
          placeholder="Cari nama produk..."
          aria-label="Cari produk"
        />
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="field sm:w-48"
          aria-label="Filter rating"
        >
          {["Semua", "5", "4", "3", "2", "1"].map((x) => (
            <option key={x} value={x}>
              {x === "Semua" ? "Semua rating" : `${x} bintang`}
            </option>
          ))}
        </select>
      </div>
      {shown.length === 0 ? (
        <EmptyState
          title="Belum ada ulasan"
          text="Ulasan muncul setelah pembeli menilai pesanan yang sudah selesai."
        />
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <article
              key={r.id}
              className={`rounded-2xl border p-5 dark:bg-slate-900 ${r.hidden ? "border-dashed border-slate-300 opacity-70 dark:border-slate-700" : "border-slate-200 dark:border-slate-800"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#12285C] dark:text-white">
                    {nameOf(r.productId)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.customer || "Pembeli"} • {r.orderId} •{" "}
                    {new Date(r.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <StarRating value={r.rating} size={16} />
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">“{r.comment}”</p>
              )}
              {r.adminReply && replying !== r.id && (
                <p className="mt-3 rounded-lg bg-[#F4F6FA] p-3 text-xs dark:bg-slate-800">
                  <strong>Balasan: </strong>
                  {r.adminReply}
                </p>
              )}
              {replying === r.id ? (
                <div className="mt-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="field min-h-20 py-3"
                    placeholder="Tulis balasan untuk pembeli"
                    aria-label="Balasan"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      className="text-xs"
                      onClick={() => {
                        update(r.id, { adminReply: draft.trim() || undefined });
                        setReplying(null);
                      }}
                    >
                      Simpan Balasan
                    </Button>
                    <Button variant="ghost" className="text-xs" onClick={() => setReplying(null)}>
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-h-10 text-xs"
                    onClick={() => {
                      setReplying(r.id);
                      setDraft(r.adminReply || "");
                    }}
                  >
                    {r.adminReply ? "Ubah Balasan" : "Balas"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-10 text-xs"
                    onClick={() => update(r.id, { hidden: !r.hidden })}
                  >
                    {r.hidden ? "Tampilkan di Situs" : "Sembunyikan"}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

type Ledger = ReturnType<typeof useLedgerStore>;
const returnReasons = [
  "Barang rusak / cacat",
  "Tidak sesuai pesanan",
  "Salah tipe / ukuran",
  "Pembeli berubah pikiran",
  "Garansi tukar unit",
];

function ReturnDialog({
  title,
  maxQty,
  unit,
  onClose,
  onConfirm,
}: {
  title: string;
  maxQty: number;
  unit: number;
  onClose: () => void;
  onConfirm: (qty: number, reason: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState(returnReasons[0]);
  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Proses retur"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(qty, reason);
        }}
        className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900"
      >
        <h3 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">
          Proses Retur
        </h3>
        <p className="mt-1 text-xs text-slate-500">{title}</p>
        <label className="mt-4 block text-xs font-bold text-slate-500">
          Jumlah unit diretur (maks. {maxQty})
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Number(e.target.value) || 1)))}
            className="field mt-1"
          />
        </label>
        <label className="mt-3 block text-xs font-bold text-slate-500">
          Alasan
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="field mt-1">
            {returnReasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <p className="mt-4 rounded-lg bg-[#F4F6FA] p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Pengembalian dana <strong>{formatPrice(Math.round(unit * qty))}</strong> akan mengurangi
          omzet cabang dan laporan keuangan.
        </p>
        <div className="mt-5 flex gap-2">
          <Button type="submit">Proses Retur</Button>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}

const statusBadge: Record<string, string> = {
  Diproses: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "Dalam Pengiriman": "bg-blue-50 text-blue-700",
  "Siap Diambil": "bg-amber-50 text-amber-700",
  Selesai: "bg-emerald-50 text-emerald-700",
};

function ShipmentCard({
  order,
  update,
  ledger,
  db,
  say,
}: {
  order: Order;
  update: (id: string, patch: Partial<Order>) => void;
  ledger: Ledger;
  db: SalesDb | null;
  say: (msg: string) => void;
}) {
  const [courier, setCourier] = useState(order.courier || couriers[0]);
  const [resi, setResi] = useState(order.trackingNumber || "");
  const [dlg, setDlg] = useState<Order["items"][number] | null>(null);
  const ship = order.delivery === "Kirim ke alamat";
  const now = () => new Date().toISOString();
  return (
    <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold tracking-wider text-[#FF7A1A]">{order.id}</p>
          <p className="mt-1 text-sm font-bold text-[#12285C] dark:text-white">
            {order.customer || "Pembeli"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {order.branch || "Jakarta"} • {order.delivery} • {order.payment} •{" "}
            {new Date(order.createdAt).toLocaleDateString("id-ID")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge[order.status]}`}
        >
          {order.status}
        </span>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {order.items.map((i) => {
          const done = ledger.returnedQty[`${order.id}|${i.productId}`] || 0;
          const left = i.qty - done;
          return (
            <li key={i.productId} className="flex items-center justify-between gap-2">
              <span>
                {i.qty} x {i.name}
                {done > 0 && <em className="ml-1 text-[#FF7A1A]">(diretur {done})</em>}
              </span>
              {order.status === "Selesai" && left > 0 && (
                <button
                  onClick={() => setDlg(i)}
                  className="min-h-9 shrink-0 px-2 text-[11px] font-bold text-[#FF7A1A]"
                >
                  Retur
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {order.trackingNumber && (
        <p className="mt-3 text-xs text-slate-500">
          Kurir {order.courier} • resi <strong>{order.trackingNumber}</strong>
        </p>
      )}

      {order.status === "Diproses" && ship && (
        <form
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            update(order.id, {
              status: "Dalam Pengiriman",
              courier,
              trackingNumber: resi.trim(),
              shippedAt: now(),
            });
          }}
        >
          <select
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            className="field"
            aria-label="Kurir"
          >
            {couriers.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            value={resi}
            onChange={(e) => setResi(e.target.value)}
            className="field"
            placeholder="Nomor resi"
            required
            aria-label="Nomor resi"
          />
          <Button type="submit">
            <Truck size={16} /> Kirim
          </Button>
        </form>
      )}
      {order.status === "Diproses" && !ship && (
        <Button className="mt-4" onClick={() => update(order.id, { status: "Siap Diambil" })}>
          Tandai Siap Diambil
        </Button>
      )}
      {order.status === "Dalam Pengiriman" && (
        <Button
          className="mt-4"
          onClick={() => update(order.id, { status: "Selesai", completedAt: now() })}
        >
          Tandai Terkirim
        </Button>
      )}
      {order.status === "Siap Diambil" && (
        <Button
          className="mt-4"
          onClick={() => update(order.id, { status: "Selesai", completedAt: now() })}
        >
          Tandai Sudah Diambil
        </Button>
      )}
      {order.status === "Selesai" && (
        <p className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
          <Check size={14} /> Selesai — pembeli kini dapat memberi rating
        </p>
      )}
      {dlg && (
        <ReturnDialog
          title={`${order.id} • ${dlg.name}`}
          maxQty={dlg.qty - (ledger.returnedQty[`${order.id}|${dlg.productId}`] || 0)}
          unit={dlg.price}
          onClose={() => setDlg(null)}
          onConfirm={(qty, reason) => {
            const cost = db?.skus[dlg.productId]?.[2] ?? dlg.price * 0.85;
            ledger.addReturn({
              ref: order.id,
              source: "online",
              branch: order.branch || "Jakarta",
              sku: dlg.productId,
              name: dlg.name,
              qty,
              omzet: dlg.price * qty,
              hpp: Math.round(cost * qty),
              reason,
            });
            say(
              `Retur ${qty} unit diproses: omzet ${order.branch || "Jakarta"} berkurang ${formatPrice(dlg.price * qty)}.`,
            );
            setDlg(null);
          }}
        />
      )}
    </article>
  );
}

function TxShipping({
  db,
  ledger,
  say,
}: {
  db: SalesDb;
  ledger: Ledger;
  say: (msg: string) => void;
}) {
  const [branch, setBranch] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [month, setMonth] = useState("Semua");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [dlg, setDlg] = useState<Tx | null>(null);
  const PAGE = 25;
  useEffect(() => setPage(0), [branch, status, month, q]);
  const meta = useMemo(() => db.rows.map((t) => ({ t, ...txMeta(t) })).reverse(), [db]);
  const eff = (m: (typeof meta)[number]): TxStatus => ledger.overrides[m.t.trx] ?? m.status;
  const scoped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return meta.filter(
      (m) =>
        (branch === "Semua" || m.t.branch === branch) &&
        (month === "Semua" || serialToDate(m.t.serial).getUTCMonth() === Number(month)) &&
        (!needle ||
          m.t.trx.toLowerCase().includes(needle) ||
          (db.skus[m.t.sku]?.[0] || "").toLowerCase().includes(needle)),
    );
  }, [meta, branch, month, q, db]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    scoped.forEach((m) => (c[eff(m)] = (c[eff(m)] || 0) + 1));
    return c;
  }, [scoped, ledger.overrides]);
  const filtered = scoped.filter((m) => status === "Semua" || eff(m) === status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const branchNames = [...new Set(db.rows.map((r) => r.branch))].sort();
  const fmtDate = (serial: number) =>
    serialToDate(serial).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">
        Status pengiriman dibuat acak namun mengikuti tanggal tiap transaksi pada sheet “Data
        Penjualan 2027” (transaksi lama sudah selesai, transaksi akhir Desember masih berjalan).
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["Diproses", "Dalam Pengiriman", "Siap Diambil", "Selesai"] as const).map((s) => (
          <AdminStat key={s} label={s} value={(counts[s] || 0).toLocaleString("id-ID")} />
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="field"
          placeholder="Cari no. transaksi / produk"
          aria-label="Cari transaksi"
        />
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="field"
          aria-label="Cabang"
        >
          <option value="Semua">Semua cabang</option>
          {branchNames.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="field"
          aria-label="Bulan"
        >
          <option value="Semua">Semua bulan</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="field"
          aria-label="Status"
        >
          {["Semua", "Diproses", "Dalam Pengiriman", "Siap Diambil", "Selesai"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="p-3">Transaksi</th>
                <th className="p-3">Produk</th>
                <th className="p-3">Cabang</th>
                <th className="p-3">Penerimaan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {view.map((m) => {
                const st = eff(m);
                const ship = m.delivery === "Kirim ke alamat";
                const returned = ledger.returnedQty[`${m.t.trx}|${m.t.sku}`] || 0;
                const left = m.t.qty - returned;
                return (
                  <tr key={m.t.trx} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <strong className="block text-[#12285C] dark:text-white">{m.t.trx}</strong>
                      <span className="text-xs text-slate-400">{fmtDate(m.t.serial)}</span>
                    </td>
                    <td className="max-w-[240px] p-3">
                      <span className="block truncate">{db.skus[m.t.sku]?.[0] || m.t.sku}</span>
                      <span className="text-xs text-slate-400">
                        {m.t.qty} unit
                        {returned > 0 && (
                          <em className="ml-1 text-[#FF7A1A]">• diretur {returned}</em>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{m.t.branch}</td>
                    <td className="p-3 text-xs text-slate-500">{m.delivery}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge[st]}`}
                      >
                        {st}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">{formatPrice(m.t.omzet)}</td>
                    <td className="p-3 text-right">
                      {st === "Diproses" && (
                        <Button
                          variant="outline"
                          className="min-h-9 px-3 text-xs"
                          onClick={() =>
                            ledger.setTxStatus(m.t.trx, ship ? "Dalam Pengiriman" : "Siap Diambil")
                          }
                        >
                          {ship ? "Kirim" : "Siap diambil"}
                        </Button>
                      )}
                      {(st === "Dalam Pengiriman" || st === "Siap Diambil") && (
                        <Button
                          variant="outline"
                          className="min-h-9 px-3 text-xs"
                          onClick={() => ledger.setTxStatus(m.t.trx, "Selesai")}
                        >
                          {ship ? "Terkirim" : "Sudah diambil"}
                        </Button>
                      )}
                      {st === "Selesai" &&
                        (left > 0 ? (
                          <Button
                            variant="ghost"
                            className="min-h-9 px-3 text-xs text-[#FF7A1A]"
                            onClick={() => setDlg(m.t)}
                          >
                            Retur
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Diretur</span>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {view.length === 0 && <p className="p-6 text-sm text-slate-500">Tidak ada transaksi.</p>}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {filtered.length.toLocaleString("id-ID")} transaksi • halaman {page + 1} dari {pages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-h-10 px-4 text-xs"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            className="min-h-10 px-4 text-xs"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
      {dlg && (
        <ReturnDialog
          title={`${dlg.trx} • ${db.skus[dlg.sku]?.[0] || dlg.sku}`}
          maxQty={dlg.qty - (ledger.returnedQty[`${dlg.trx}|${dlg.sku}`] || 0)}
          unit={dlg.omzet / dlg.qty}
          onClose={() => setDlg(null)}
          onConfirm={(qty, reason) => {
            ledger.addReturn({
              ref: dlg.trx,
              source: "toko",
              branch: dlg.branch,
              sku: dlg.sku,
              name: db.skus[dlg.sku]?.[0] || dlg.sku,
              qty,
              omzet: Math.round((dlg.omzet / dlg.qty) * qty),
              hpp: Math.round((dlg.hpp / dlg.qty) * qty),
              reason,
            });
            say(`Retur ${qty} unit dari ${dlg.trx} diproses: omzet ${dlg.branch} berkurang.`);
            setDlg(null);
          }}
        />
      )}
    </div>
  );
}

function AdminShipping({
  orders,
  update,
  db,
  dbError,
  ledger,
  say,
}: {
  orders: Order[];
  update: (id: string, patch: Partial<Order>) => void;
  db: SalesDb | null;
  dbError: boolean;
  ledger: Ledger;
  say: (msg: string) => void;
}) {
  const [source, setSource] = useState("Transaksi Toko 2027");
  const [type, setType] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const shown = orders.filter(
    (o) => (type === "Semua" || o.delivery === type) && (status === "Semua" || o.status === status),
  );
  return (
    <div className="space-y-6">
      <div className="flex gap-2" role="tablist">
        {["Transaksi Toko 2027", "Pesanan Online"].map((x) => (
          <button
            key={x}
            role="tab"
            aria-selected={source === x}
            onClick={() => setSource(x)}
            className={`rounded-lg px-4 py-2 text-xs font-bold ${source === x ? "bg-[#FF7A1A] text-white" : "bg-[#F4F6FA] text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            {x}
            {x === "Pesanan Online" && ` (${orders.length})`}
          </button>
        ))}
      </div>
      {source === "Transaksi Toko 2027" ? (
        db ? (
          <TxShipping db={db} ledger={ledger} say={say} />
        ) : (
          <LoadingBlock error={dbError} />
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <AdminStat label="Perlu diproses" value={String(count("Diproses"))} />
            <AdminStat label="Dalam pengiriman" value={String(count("Dalam Pengiriman"))} />
            <AdminStat label="Siap diambil" value={String(count("Siap Diambil"))} />
            <AdminStat label="Selesai" value={String(count("Selesai"))} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="field sm:w-56"
              aria-label="Jenis penerimaan"
            >
              {["Semua", "Kirim ke alamat", "Ambil di toko"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="field sm:w-56"
              aria-label="Status"
            >
              {["Semua", "Diproses", "Dalam Pengiriman", "Siap Diambil", "Selesai"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          {shown.length === 0 ? (
            <EmptyState
              title="Tidak ada pengiriman"
              text="Pesanan baru dari checkout akan muncul di sini."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {shown.map((o) => (
                <ShipmentCard
                  key={o.id}
                  order={o}
                  update={update}
                  ledger={ledger}
                  db={db}
                  say={say}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminReturns({ ledger }: { ledger: Ledger }) {
  const total = ledger.returns.reduce((sum, r) => sum + r.omzet, 0);
  const units = ledger.returns.reduce((sum, r) => sum + r.qty, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <AdminStat label="Jumlah retur" value={String(ledger.returns.length)} />
        <AdminStat label="Unit diretur" value={String(units)} />
        <AdminStat label="Nilai retur (omzet berkurang)" value={formatPrice(total)} />
      </div>
      {ledger.returns.length === 0 ? (
        <EmptyState
          title="Belum ada retur"
          text="Proses retur dari tab Pengiriman pada transaksi berstatus Selesai."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Referensi</th>
                  <th className="p-3">Cabang</th>
                  <th className="p-3">Produk</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Nilai</th>
                  <th className="p-3">Alasan</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ledger.returns.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3 text-xs text-slate-500">
                      {new Date(r.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">
                      <strong className="block text-[#12285C] dark:text-white">{r.ref}</strong>
                      <span className="text-xs text-slate-400">
                        {r.source === "toko" ? "Toko" : "Online"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{r.branch}</td>
                    <td className="max-w-[220px] truncate p-3">{r.name}</td>
                    <td className="p-3 text-right">{r.qty}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(r.omzet)}</td>
                    <td className="p-3 text-xs text-slate-500">{r.reason}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => ledger.removeReturn(r.id)}
                        className="min-h-9 px-2 text-xs font-bold text-[#FF7A1A]"
                      >
                        Batalkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminFinance({ report }: { report: Report | null }) {
  const [scope, setScope] = useState("Semua");
  const [period, setPeriod] = useState("Setahun");
  if (!report) return <LoadingBlock />;
  const monthsSel = period === "Setahun" ? MONTHS.map((_, i) => i) : [Number(period)];
  const branchesSel = scope === "Semua" ? report.branches : [scope];
  const p = pnl(report, branchesSel, monthsSel);
  const title = scope === "Semua" ? "Rekapitulasi Seluruh Cabang" : `Cabang ${scope}`;
  const periodLabel = period === "Setahun" ? "Tahun 2027" : `${MONTHS[Number(period)]}`;
  const pct = (v: number) => `${(v * 100).toFixed(1).replace(".", ",")}%`;
  const neg = (v: number) => (v < 0 ? "text-red-600" : "");
  const statement: Array<[string, number, boolean?]> = [
    ["Penjualan toko", p.baseGross],
    ["Penjualan online", p.onlineGross],
    ["Total omzet kotor", p.gross, true],
    ["Retur penjualan", -p.returns],
    ["Omzet bersih", p.net, true],
    ["Harga pokok penjualan (HPP)", -p.hpp],
    ["Laba kotor", p.grossProfit, true],
    ["Gaji & tunjangan", -p.opex.gaji],
    ["Sewa", -p.opex.sewa],
    ["Listrik & air", -p.opex.listrik],
    ["Marketing & promosi", -p.opex.marketing],
    ["Logistik & pengiriman", -p.opex.logistik],
    ["Lain-lain", -p.opex.lain],
    ["Total biaya operasional", -p.opex.total, true],
    ["Laba operasional", p.operatingProfit, true],
  ];
  const monthRows = MONTHS.map((m, i) => ({ m, ...pnl(report, branchesSel, [i]) }));
  const branchRows =
    scope === "Semua"
      ? report.branches
          .map((b) => ({ b, ...pnl(report, [b], monthsSel) }))
          .sort((x, y) => y.net - x.net)
      : [];
  const exportCsv = () =>
    downloadCsv(`laporan-keuangan-${scope === "Semua" ? "rekap" : scope}-${periodLabel}.csv`, [
      [title, periodLabel],
      ["Pos", "Nilai (Rp)"],
      ...statement.map(([l, v]) => [l, Math.round(v)]),
      [],
      ["Bulan", "Omzet bersih", "HPP", "Laba kotor", "Biaya operasional", "Laba operasional"],
      ...monthRows.map((r) =>
        [
          r.m,
          r.net,
          Math.round(r.hpp),
          Math.round(r.grossProfit),
          r.opex.total,
          Math.round(r.operatingProfit),
        ].map((c) => (typeof c === "number" ? Math.round(c) : c)),
      ),
      ...(branchRows.length
        ? [
            [],
            [
              "Cabang",
              "Omzet bersih",
              "Retur",
              "Laba kotor",
              "Biaya operasional",
              "Laba operasional",
            ],
            ...branchRows.map((r) => [
              r.b,
              r.net,
              r.returns,
              Math.round(r.grossProfit),
              r.opex.total,
              Math.round(r.operatingProfit),
            ]),
          ]
        : []),
    ]);
  const th = "p-3 text-right";
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Laporan laba rugi • {periodLabel} • termasuk pesanan online & retur
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="field min-h-11 w-auto text-xs"
            aria-label="Cabang"
          >
            <option value="Semua">Rekap semua cabang</option>
            {report.branches.map((b) => (
              <option key={b} value={b}>
                Cabang {b}
              </option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="field min-h-11 w-auto text-xs"
            aria-label="Periode"
          >
            <option value="Setahun">Setahun 2027</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={exportCsv} className="text-xs">
            Unduh CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStat
          label="Omzet bersih"
          value={rpShort(p.net)}
          hint={`Retur ${rpShort(p.returns)}`}
        />
        <AdminStat
          label="Laba kotor"
          value={rpShort(p.grossProfit)}
          hint={`Margin ${pct(p.grossMargin)}`}
        />
        <AdminStat label="Biaya operasional" value={rpShort(p.opex.total)} />
        <AdminStat
          label="Laba operasional"
          value={rpShort(p.operatingProfit)}
          hint={`Margin ${pct(p.operatingMargin)}`}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="p-5 font-heading font-bold text-[#12285C] dark:text-white">
          Laporan Laba Rugi
        </h3>
        <table className="w-full text-sm">
          <tbody>
            {statement.map(([label, value, bold]) => (
              <tr
                key={label}
                className={`border-t border-slate-100 dark:border-slate-800 ${bold ? "bg-[#F4F6FA] font-bold dark:bg-slate-900" : ""}`}
              >
                <td className={`p-3 ${bold ? "" : "pl-6 text-slate-600 dark:text-slate-300"}`}>
                  {label}
                </td>
                <td className={`p-3 text-right tabular-nums ${neg(value)}`}>
                  {formatPrice(Math.round(value))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="p-5 font-heading font-bold text-[#12285C] dark:text-white">Rekap Bulanan</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="p-3">Bulan</th>
                <th className={th}>Omzet bersih</th>
                <th className={th}>HPP</th>
                <th className={th}>Laba kotor</th>
                <th className={th}>Biaya ops.</th>
                <th className={th}>Laba operasional</th>
              </tr>
            </thead>
            <tbody>
              {monthRows.map((r) => (
                <tr
                  key={r.m}
                  className={`border-t border-slate-100 dark:border-slate-800 ${period !== "Setahun" && MONTHS[Number(period)] !== r.m ? "opacity-40" : ""}`}
                >
                  <td className="p-3 font-semibold">{r.m}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(r.net)}</td>
                  <td className="p-3 text-right tabular-nums text-slate-500">
                    {formatPrice(Math.round(r.hpp))}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatPrice(Math.round(r.grossProfit))}
                  </td>
                  <td className="p-3 text-right tabular-nums text-slate-500">
                    {formatPrice(r.opex.total)}
                  </td>
                  <td className={`p-3 text-right font-bold tabular-nums ${neg(r.operatingProfit)}`}>
                    {formatPrice(Math.round(r.operatingProfit))}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 bg-[#F4F6FA] font-bold dark:border-slate-700 dark:bg-slate-900">
                <td className="p-3">Total {period === "Setahun" ? "tahun" : periodLabel}</td>
                <td className="p-3 text-right tabular-nums">{formatPrice(p.net)}</td>
                <td className="p-3 text-right tabular-nums">{formatPrice(Math.round(p.hpp))}</td>
                <td className="p-3 text-right tabular-nums">
                  {formatPrice(Math.round(p.grossProfit))}
                </td>
                <td className="p-3 text-right tabular-nums">{formatPrice(p.opex.total)}</td>
                <td className={`p-3 text-right tabular-nums ${neg(p.operatingProfit)}`}>
                  {formatPrice(Math.round(p.operatingProfit))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {scope === "Semua" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="p-5 font-heading font-bold text-[#12285C] dark:text-white">
            Perbandingan Tiap Cabang{" "}
            <span className="text-xs font-normal text-slate-400">
              (klik nama untuk membuka laporan cabang)
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#F4F6FA] text-xs text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="p-3">Cabang</th>
                  <th className={th}>Omzet bersih</th>
                  <th className={th}>Retur</th>
                  <th className={th}>Laba kotor</th>
                  <th className={th}>Biaya ops.</th>
                  <th className={th}>Laba operasional</th>
                  <th className={th}>Margin</th>
                </tr>
              </thead>
              <tbody>
                {branchRows.map((r) => (
                  <tr key={r.b} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <button
                        onClick={() => setScope(r.b)}
                        className="min-h-9 font-bold text-[#12285C] hover:text-[#FF7A1A] dark:text-white"
                      >
                        {r.b}
                      </button>
                    </td>
                    <td className="p-3 text-right tabular-nums">{formatPrice(r.net)}</td>
                    <td className="p-3 text-right tabular-nums text-slate-500">
                      {formatPrice(r.returns)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {formatPrice(Math.round(r.grossProfit))}
                    </td>
                    <td className="p-3 text-right tabular-nums text-slate-500">
                      {formatPrice(r.opex.total)}
                    </td>
                    <td
                      className={`p-3 text-right font-bold tabular-nums ${neg(r.operatingProfit)}`}
                    >
                      {formatPrice(Math.round(r.operatingProfit))}
                    </td>
                    <td className={`p-3 text-right tabular-nums ${neg(r.operatingMargin)}`}>
                      {pct(r.operatingMargin)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-200 bg-[#F4F6FA] font-bold dark:border-slate-700 dark:bg-slate-900">
                  <td className="p-3">Total seluruh cabang</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(p.net)}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(p.returns)}</td>
                  <td className="p-3 text-right tabular-nums">
                    {formatPrice(Math.round(p.grossProfit))}
                  </td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(p.opex.total)}</td>
                  <td className={`p-3 text-right tabular-nums ${neg(p.operatingProfit)}`}>
                    {formatPrice(Math.round(p.operatingProfit))}
                  </td>
                  <td className="p-3 text-right tabular-nums">{pct(p.operatingMargin)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function AdminPage({
  orders,
  reviews,
  updateOrder,
  updateReview,
  addDemo,
}: {
  orders: Order[];
  reviews: Review[];
  updateOrder: (id: string, patch: Partial<Order>) => void;
  updateReview: (id: string, patch: Partial<Review>) => void;
  addDemo: () => void;
}) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("hartini.admin") === "1");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("Data Penjualan");
  const [notice, setNotice] = useState("");
  const { db, error: dbError } = useSalesDb();
  const ledger = useLedgerStore();
  const report = useMemo(
    () => (db ? buildReport(db, orders, ledger.returns) : null),
    [db, orders, ledger.returns],
  );
  const say = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 4000);
  };
  if (!authed)
    return (
      <main>
        <PageHero title="Dasbor Admin" text="Khusus staf HARTINI ELECTRONIC." />
        <section className="section">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pin === ADMIN_PIN) {
                sessionStorage.setItem("hartini.admin", "1");
                setAuthed(true);
              } else setError(true);
            }}
            className="container max-w-sm rounded-2xl border border-slate-200 p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="font-heading text-lg font-bold text-[#12285C] dark:text-white">
              Masuk Admin
            </h2>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              className="field mt-4"
              placeholder="Kode akses"
              aria-label="Kode akses"
              autoFocus
            />
            {error && (
              <p role="alert" className="mt-2 text-xs font-bold text-red-500">
                Kode akses salah.
              </p>
            )}
            <Button type="submit" className="mt-4 w-full">
              Masuk
            </Button>
            <p className="mt-3 text-[11px] text-slate-400">
              Demo: kode akses “{ADMIN_PIN}”. Gate ini hanya contoh dan belum aman untuk produksi.
            </p>
          </form>
        </section>
      </main>
    );
  const tabs = ["Data Penjualan", "Review Barang", "Pengiriman", "Retur", "Laporan Keuangan"];
  return (
    <main>
      <PageHero
        title="Dasbor Admin"
        text="Pantau penjualan, kelola ulasan, pengiriman, retur, dan laporan keuangan tiap cabang."
      />
      <section className="section">
        <div className="container">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`shrink-0 rounded-xl px-5 py-3 text-sm font-bold ${tab === t ? "bg-[#12285C] text-white" : "bg-[#F4F6FA] text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => {
                sessionStorage.removeItem("hartini.admin");
                setAuthed(false);
                setPin("");
              }}
            >
              Keluar
            </Button>
          </div>
          {notice && (
            <p
              role="status"
              className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700"
            >
              <Check size={14} /> {notice}
            </p>
          )}
          {tab === "Data Penjualan" && (
            <AdminSales report={dbError ? null : report} orders={orders} onDemo={addDemo} />
          )}
          {tab === "Review Barang" && <AdminReviews reviews={reviews} update={updateReview} />}
          {tab === "Pengiriman" && (
            <AdminShipping
              orders={orders}
              update={updateOrder}
              db={db}
              dbError={dbError}
              ledger={ledger}
              say={say}
            />
          )}
          {tab === "Retur" && <AdminReturns ledger={ledger} />}
          {tab === "Laporan Keuangan" &&
            (dbError ? <LoadingBlock error /> : <AdminFinance report={report} />)}
        </div>
      </section>
    </main>
  );
}

function SkeletonPage() {
  return (
    <div className="container py-10">
      <div className="skeleton h-14 rounded-2xl" />
      <div className="skeleton mt-5 h-[380px] rounded-[28px]" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [pageData, setPageData] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews());
  useEffect(() => saveOrders(orders), [orders]);
  useEffect(() => saveReviews(reviews), [reviews]);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    globalNavigate = (next, data = "") => {
      setPage(next);
      setPageData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.title = `${({ home: "Beranda", catalog: "Katalog Produk", detail: "Detail Produk", installment: "Simulator Cicilan", cart: "Keranjang", checkout: "Checkout", branches: "Lokasi Cabang", member: "Program Member", promo: "Promo", about: "Tentang Kami", career: "Karir", contact: "Kontak", faq: "FAQ", orders: "Pesanan Saya", admin: "Dasbor Admin" } as Record<Page, string>)[next]} | HARTINI ELECTRONIC`;
    };
    return () => {
      globalNavigate = null;
    };
  }, []);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };
  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing
        ? current.map((item) =>
            item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item,
          )
        : [...current, { product, qty: 1 }];
    });
    notify(`${product.name} ditambahkan ke keranjang.`);
  };
  const placeOrder = (data: {
    customer: string;
    branch: string;
    delivery: Order["delivery"];
    payment: string;
  }) => {
    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      ...data,
      items: cart.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        qty,
      })),
      total: cart.reduce((sum, i) => sum + i.product.price * i.qty, 0),
      status: "Diproses",
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    notify("Pesanan berhasil dibuat (mock). Pantau statusnya di Pesanan Saya.");
    go("orders");
  };
  const advanceOrder = (orderId: string) =>
    setOrders((current) =>
      current.map((o) => {
        const next = nextStatus(o);
        return o.id === orderId && next
          ? {
              ...o,
              status: next,
              completedAt: next === "Selesai" ? new Date().toISOString() : o.completedAt,
            }
          : o;
      }),
    );
  const submitReview = (order: Order, productId: string, rating: number, comment: string) => {
    if (order.status !== "Selesai") return;
    setReviews((current) =>
      current.some((r) => r.orderId === order.id && r.productId === productId)
        ? current
        : [
            ...current,
            {
              id: `${order.id}-${productId}`,
              orderId: order.id,
              productId,
              customer: order.customer,
              rating,
              comment,
              createdAt: new Date().toISOString(),
            },
          ],
    );
    notify("Terima kasih! Ulasan Anda sudah dikirim.");
  };
  const updateOrder = (id: string, patch: Partial<Order>) =>
    setOrders((current) => current.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const updateReview = (id: string, patch: Partial<Review>) =>
    setReviews((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addDemo = () => {
    const names = ["Siti Rahma", "Budi Santoso", "Wayan Adi", "Maria Tamelan"];
    const statuses: Order["status"][] = ["Diproses", "Dalam Pengiriman", "Siap Diambil", "Selesai"];
    const demo: Order[] = statuses.map((status, i) => {
      const items = [
        products[(i * 5 + 1) % products.length],
        products[(i * 7 + 3) % products.length],
      ];
      const delivery: Order["delivery"] =
        status === "Siap Diambil" || i === 2 ? "Ambil di toko" : "Kirim ke alamat";
      return {
        id: `HTN-DEMO${Date.now().toString(36).toUpperCase()}${i}`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        customer: names[i],
        branch: ["Jakarta", "Bandung", "Surabaya", "Medan"][i],
        delivery,
        payment: ["Transfer Bank", "QRIS", "Kartu Kredit", "Cicilan 0%"][i],
        items: items.map((p) => ({
          productId: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          qty: 1 + (i % 2),
        })),
        total: items.reduce((s, p) => s + p.price * (1 + (i % 2)), 0),
        status,
        ...(status === "Dalam Pengiriman"
          ? { courier: "JNE", trackingNumber: `JNE${100000 + i * 7919}` }
          : {}),
      };
    });
    setOrders((current) => [...demo, ...current]);
    notify("Data pesanan contoh ditambahkan.");
  };
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const pages: Record<Page, ReactNode> = {
    home: <HomePage addToCart={addToCart} />,
    catalog: <CatalogPage key={pageData} initial={pageData} addToCart={addToCart} />,
    detail: (
      <ProductDetailPage key={pageData} id={pageData} addToCart={addToCart} reviews={reviews} />
    ),
    installment: <InstallmentPage key={pageData} initialId={pageData} />,
    cart: (
      <CartPage
        cart={cart}
        changeQty={(id, qty) =>
          setCart((items) =>
            items.map((item) => (item.product.id === id ? { ...item, qty } : item)),
          )
        }
        remove={(id) => setCart((items) => items.filter((item) => item.product.id !== id))}
      />
    ),
    checkout: <CheckoutPage cart={cart} placeOrder={placeOrder} />,
    branches: <BranchesPage />,
    member: <MemberPage notify={notify} />,
    promo: <PromoPage />,
    about: <AboutPage />,
    career: <CareerPage notify={notify} />,
    contact: <ContactPage notify={notify} />,
    faq: <FaqPage />,
    admin: (
      <AdminPage
        orders={orders}
        reviews={reviews}
        updateOrder={updateOrder}
        updateReview={updateReview}
        addDemo={addDemo}
      />
    ),
    orders: (
      <OrdersPage
        orders={orders}
        reviews={reviews}
        advance={advanceOrder}
        submitReview={submitReview}
      />
    ),
  };
  return (
    <div className="min-h-screen bg-white text-slate-700 transition-colors dark:bg-slate-950 dark:text-slate-200">
      <Header cartCount={cartCount} dark={dark} setDark={setDark} />
      {loading ? <SkeletonPage /> : pages[page]}
      {!loading && <Footer />}
      <a
        href="https://wa.me/628111234567?text=Halo%20HARTINI%20ELECTRONIC"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#12A564] text-white shadow-[0_10px_30px_rgba(18,165,100,.35)] transition hover:scale-105"
        aria-label="Hubungi via WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[80] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-2xl"
        >
          <span className="grid size-6 place-items-center rounded-full bg-emerald-500">
            <Check size={14} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
