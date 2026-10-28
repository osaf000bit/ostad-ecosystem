"use client"

import { useState } from "react"
import { CheckCircle2, Coins, ExternalLink, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, Card, CardHeader, DataRow, Field, Input } from "@/components/ui/kit"

type TronWindow = Window & { tronWeb?: { defaultAddress?: { base58?: string }; transactionBuilder?: { createSmartContract: (options: unknown, address: string) => Promise<unknown> }; trx?: { sign: (tx: unknown) => Promise<unknown>; sendRawTransaction: (signed: unknown) => Promise<{ result?: boolean; txid?: string }> } }; tronLink?: { request: (args: { method: string }) => Promise<unknown> } }

const explorer = "https://tronscan.org/#/transaction/"

export function TronTokenPanel() {
  const [name, setName] = useState("Ostad TRC20")
  const [symbol, setSymbol] = useState("OST20")
  const [supply, setSupply] = useState("1000000")
  const [decimals, setDecimals] = useState("6")
  const [status, setStatus] = useState<string | null>(null)
  const [txid, setTxid] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function deploy() {
    const w = window as TronWindow
    const tronWeb = w.tronWeb
    if (!tronWeb?.defaultAddress?.base58) {
      setStatus("لطفاً ابتدا TronLink را نصب و به شبکه اصلی ترون متصل کنید.")
      return
    }
    const bytecode = process.env.NEXT_PUBLIC_TRC20_BYTECODE
    const abi = process.env.NEXT_PUBLIC_TRC20_ABI ? JSON.parse(process.env.NEXT_PUBLIC_TRC20_ABI) : []
    if (!bytecode || !abi.length || !tronWeb.transactionBuilder?.createSmartContract || !tronWeb.trx?.sign || !tronWeb.trx?.sendRawTransaction) {
      setStatus("برای استقرار واقعی، بایت‌کد و ABI قرارداد TRC20 باید در تنظیمات پروژه قرار گیرد.")
      return
    }
    setBusy(true)
    setStatus(null)
    try {
      const owner = tronWeb.defaultAddress.base58
      const tx = await tronWeb.transactionBuilder.createSmartContract({ abi, bytecode, feeLimit: 1_000_000, callValue: 0, parameters: [name, symbol, Number(decimals), String(BigInt(supply) * 10n ** BigInt(decimals)), owner] }, owner)
      const signed = await tronWeb.trx.sign(tx)
      const result = await tronWeb.trx.sendRawTransaction(signed)
      if (!result.result || !result.txid) throw new Error("transaction failed")
      setTxid(result.txid)
      setStatus("قرارداد با موفقیت ارسال شد.")
    } catch {
      setStatus("ارسال تراکنش ناموفق بود. موجودی TRX، شبکه و تأیید TronLink را بررسی کنید.")
    } finally { setBusy(false) }
  }

  return <Card id="tron-token">
    <CardHeader icon={<Coins className="size-5" />} title="ساخت توکن TRC20 روی ترون" subtitle="استقرار مستقیم با TronLink و سقف کارمزد ۱ TRX" action={<Badge tone="success">TRON Mainnet</Badge>} />
    <div className="space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="نام توکن"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="نماد"><Input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="force-ltr" maxLength={12} /></Field>
        <Field label="عرضه اولیه"><Input type="number" min={1} value={supply} onChange={(e) => setSupply(e.target.value)} className="force-ltr" /></Field>
        <Field label="اعشار"><Input type="number" min={0} max={18} value={decimals} onChange={(e) => setDecimals(e.target.value)} className="force-ltr" /></Field>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border px-4">
        <DataRow label="شبکه"><span className="force-ltr font-mono text-xs">TRON Mainnet</span></DataRow>
        <DataRow label="سقف کارمزد"><span className="force-ltr font-mono text-xs">1 TRX</span></DataRow>
        <DataRow label="روش امضا"><span className="inline-flex items-center gap-1 text-xs"><Wallet className="size-3.5" /> TronLink</span></DataRow>
      </div>
      {status ? <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs leading-6">{status}</div> : null}
      {txid ? <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-xs"><CheckCircle2 className="size-4 text-success" /> <a className="force-ltr underline" href={`${explorer}${txid}`} target="_blank" rel="noreferrer">مشاهده تراکنش در Tronscan <ExternalLink className="inline size-3" /></a></div> : null}
      <Button onClick={deploy} disabled={busy || !name.trim() || !symbol.trim() || !supply} className="w-full sm:w-auto"><>{busy ? <Loader2 className="size-4 animate-spin" /> : <Coins className="size-4" />}</> {busy ? "در حال ارسال…" : "ساخت و ارسال توکن"}</Button>
      <p className="text-[11px] leading-5 text-muted-foreground">سقف ۱ TRX به‌صورت feeLimit به تراکنش اعمال می‌شود؛ هزینه واقعی شبکه ممکن است کمتر یا بیشتر باشد و توسط TronLink تأیید نهایی می‌شود.</p>
    </div>
  </Card>
}
