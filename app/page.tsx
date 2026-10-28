"use client"

import { Activity, ArrowUpLeft, Cable, CheckCircle2, Coins, ExternalLink, Gauge, LockKeyhole, Radar, Rocket, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Header } from "@/components/header"
import { ContractPanel } from "@/components/contract-panel"
import { DeployPanel } from "@/components/deploy-panel"
import { PoolPanel } from "@/components/pool-panel"
import { useLang } from "@/components/providers"

export default function Page() {
  const { t } = useLang()

  return (
    <div className="min-h-dvh">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="mb-6 rounded-2xl border border-[#9d6629]/70 bg-[#3b110e]/75 p-5 shadow-[0_18px_60px_rgba(0,0,0,.28)] sm:p-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#f0c34f]"><Cable className="size-4" /><span className="text-xs font-semibold">درگاه زنده شبکه</span></div>
              <h1 className="text-xl font-bold sm:text-2xl">اتصال نهایی به بلاکاسکات اُستاد</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#d7b69b]">همه ثبت‌ها و پخش تراکنش‌های برنامه به این اکسپلورر نهایی وصل می‌شوند و تأیید قرارداد از سرویس تتر اُستاد انجام می‌شود.</p>
            </div>
            <span className="rounded-full border border-[#c28d39]/60 bg-[#6d3518]/40 px-3 py-1 text-xs text-[#f4cd68]">در حال اتصال…</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[["گس سریع", "—"], ["بار شبکه", "—"], ["میزبان", "ostad.cloud"]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#925b27]/60 bg-black/10 px-4 py-3"><p className="text-xs text-[#c99e7d]">{label}</p><p className="mt-1 font-mono text-sm text-[#f1d2b4]">{value}</p></div>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[["اکسپلورر اُستاد", "https://ostad.cloud"], ["تأیید قرارداد (تتر اُستاد)", "https://tether.to"]].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#a66b2b]/70 px-3 py-2 text-xs text-[#f2d195] transition hover:bg-[#743415]/50"><ExternalLink className="size-3.5" />{label}</a>)}
          </div>
        </section>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[[ShieldCheck, t.tabContract, "اتصال و مدیریت"], [Rocket, t.tabDeploy, "استقرار سریع"], [Coins, t.tabPool, "استیکینگ"], [Gauge, "هشیاب", "پایش شبکه"]].map(([Icon, label, sub]) => <a href={`#${label}`} key={String(label)} className="rounded-xl border border-[#8c4c24]/60 bg-[#2a0d12]/70 p-3 transition hover:border-[#e7b84c] sm:p-4"><Icon className="mb-2 size-4 text-[#e8b83e]" /><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-[11px] text-[#b99786]">{sub}</p></a>)}
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            [Radar, "هشیاب امنیتی", "۴ بررسی فعال · بدون تهدید شناسایی‌شده", "اسکن مالکیت، توقف اضطراری و ارتقا"],
            [Sparkles, "دستیار هوشمند اُستاد", "تحلیل آماده است", "خلاصه ریسک قرارداد و پیشنهاد اقدام بعدی"],
            [Users, "مدیریت تیم و نقش‌ها", "۳ نقش · ۱۲ عضو", "کنترل دسترسی چندامضایی و گردش تأیید"],
          ].map(([Icon, title, value, detail]) => (
            <div key={String(title)} className="rounded-2xl border border-[#8c4c24]/60 bg-[#2a0d12]/70 p-4">
              <div className="flex items-center gap-2 text-[#e8b83e]"><Icon className="size-4" /><span className="text-xs font-semibold">{title}</span></div>
              <p className="mt-4 text-sm font-semibold">{value}</p>
              <p className="mt-1 text-xs leading-6 text-[#b99786]">{detail}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-[#8c4c24]/60 bg-[#2a0d12]/70 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[#e8b83e]"><LockKeyhole className="size-4" /><h2 className="text-sm font-semibold">مرکز اعتماد و انطباق</h2></div><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/40 px-2.5 py-1 text-[11px] text-emerald-300"><CheckCircle2 className="size-3" /> وضعیت سالم</span></div>
          <div className="grid gap-3 sm:grid-cols-3">{[["سلامت قرارداد", "۹۸٪", "بررسی خودکار ABI و مالکیت"], ["آمادگی چندشبکه‌ای", "۴ شبکه", "Ethereum · Polygon · BSC · Sepolia"], ["ثبت رویدادها", "آنـی", "ردیابی تغییرناپذیر تراکنش‌ها"]].map(([label, value, detail]) => <div key={label} className="rounded-xl border border-[#925b27]/50 bg-black/10 p-3"><p className="text-xs text-[#c99e7d]">{label}</p><p className="mt-1 text-lg font-semibold text-[#f1d2b4]">{value}</p><p className="mt-1 text-[11px] text-[#a98677]">{detail}</p></div>)}</div>
        </section>

        <div id={t.tabContract} className="space-y-6"><ContractPanel /><div id={t.tabDeploy}><DeployPanel /></div><div id={t.tabPool}><PoolPanel /></div></div>
        <section className="mt-6 rounded-2xl border border-[#8c4c24]/60 bg-[#2a0d12]/70 p-5"><div className="flex items-center gap-2 text-[#e8b83e]"><Activity className="size-4" /><h2 className="text-sm font-semibold">موتور ثبت آنی تراکنش</h2></div><p className="mt-2 text-sm text-[#b99786]">اطلاعات تراکنش را وارد کنید؛ ثبت‌ها در دفتر تراکنش‌های اُستاد قابل پیگیری هستند.</p><a href="#contract" className="mt-4 inline-flex items-center gap-2 text-xs text-[#f0c34f]">مشاهده دفتر تراکنش‌ها <ArrowUpLeft className="size-3.5" /></a></section>
      </main>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-[#a98677] sm:px-6">{t.brand} · Ostad Gateway · UUPS</footer>
    </div>
  )
}
