"use client"

import { useState } from "react"
import { Contract, isAddress, parseUnits } from "ethers"
import { RefreshCw, Send, ShieldCheck, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Badge,
  Card,
  CardHeader,
  CopyText,
  DataRow,
  Field,
  Input,
  StatusDot,
} from "@/components/ui/kit"
import { useLang, useWallet } from "@/components/providers"
import {
  OSTAD_ABI,
  OSTAD_PROXY_ADDRESS,
  WRITE_METHODS,
  shortAddress,
} from "@/lib/web3-config"
import { cn } from "@/lib/utils"

type ContractState = {
  version: string
  owner: string
  paused: boolean
  name: string
  symbol: string
  totalSupply: string
  demo: boolean
}

const DEMO_STATE: ContractState = {
  version: "OstadV2",
  owner: "0x9C3aF7b12E4d5A6b8C1d0E2f3A4b5C6d7E8f9A0b",
  paused: false,
  name: "Ostad Token",
  symbol: "OST",
  totalSupply: "1000000.0",
  demo: true,
}

export function ContractPanel() {
  const { t } = useLang()
  const { address, getProvider } = useWallet()

  const [contractAddr, setContractAddr] = useState(OSTAD_PROXY_ADDRESS)
  const [state, setState] = useState<ContractState | null>(null)
  const [reading, setReading] = useState(false)

  const [method, setMethod] = useState<(typeof WRITE_METHODS)[number]>(WRITE_METHODS[0])
  const [methodOpen, setMethodOpen] = useState(false)
  const [args, setArgs] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [txResult, setTxResult] = useState<{ ok: boolean; msg: string } | null>(null)

  async function readState() {
    setReading(true)
    setTxResult(null)
    try {
      const provider = getProvider()
      if (!provider || !isAddress(contractAddr)) throw new Error("invalid")
      const c = new Contract(contractAddr, OSTAD_ABI, provider)
      const [version, owner, paused, name, symbol, supply] = await Promise.all([
        c.version(),
        c.owner(),
        c.paused(),
        c.name(),
        c.symbol(),
        c.totalSupply(),
      ])
      setState({
        version,
        owner,
        paused,
        name,
        symbol,
        totalSupply: supply.toString(),
        demo: false,
      })
    } catch {
      // Placeholder address / no deployment — show demo state.
      setState(DEMO_STATE)
    } finally {
      setReading(false)
    }
  }

  async function sendTx() {
    setSending(true)
    setTxResult(null)
    try {
      const provider = getProvider()
      if (!provider || !isAddress(contractAddr)) throw new Error(t.connectFirst)
      const signer = await provider.getSigner()
      const c = new Contract(contractAddr, OSTAD_ABI, signer)
      const callArgs = method.args.map((a) =>
        a === "amount" ? parseUnits(args[a] || "0", 18) : args[a] || "",
      )
      const tx = await (c as unknown as Record<string, (...a: unknown[]) => Promise<{ hash: string; wait: () => Promise<unknown> }>>)[
        method.name
      ](...callArgs)
      setTxResult({ ok: true, msg: `${shortAddress(tx.hash)}` })
      await tx.wait()
    } catch (err: unknown) {
      const message =
        (err as { shortMessage?: string })?.shortMessage ??
        (err as Error)?.message ??
        "Transaction failed"
      setTxResult({ ok: false, msg: message.slice(0, 120) })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Read side */}
      <Card>
        <CardHeader
          icon={<ShieldCheck className="size-5" />}
          title={t.contractTitle}
          subtitle={t.contractSubtitle}
          action={
            <Button variant="outline" size="sm" onClick={readState} disabled={reading}>
              <RefreshCw className={cn("size-3.5", reading && "animate-spin")} />
              {t.refresh}
            </Button>
          }
        />
        <div className="space-y-4 p-5">
          <Field label={t.contractAddress}>
            <Input
              value={contractAddr}
              onChange={(e) => setContractAddr(e.target.value)}
              className="force-ltr font-mono text-xs"
              spellCheck={false}
            />
          </Field>

          {state ? (
            <div className="divide-y divide-border rounded-xl border border-border px-4">
              <DataRow label={t.implVersion}>
                <Badge tone="primary">{state.version}</Badge>
              </DataRow>
              <DataRow label={t.proxyType}>
                <span className="font-mono text-xs">UUPS (ERC-1967)</span>
              </DataRow>
              <DataRow label={t.owner}>
                <CopyText value={state.owner} display={shortAddress(state.owner)} copiedLabel={t.copied} />
              </DataRow>
              <DataRow label={t.paused}>
                {state.paused ? (
                  <Badge tone="destructive">
                    <StatusDot tone="destructive" /> {t.paused2}
                  </Badge>
                ) : (
                  <Badge tone="success">
                    <StatusDot tone="success" /> {t.active}
                  </Badge>
                )}
              </DataRow>
              <DataRow label={`${state.name} (${state.symbol})`}>
                <span className="force-ltr font-mono text-xs">
                  {Number(state.totalSupply).toLocaleString()} {state.symbol}
                </span>
              </DataRow>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {t.read} → {t.refresh}
            </p>
          )}

          {state?.demo ? (
            <p className="text-xs text-muted-foreground/70">
              * demo state — placeholder ABI/address
            </p>
          ) : null}
        </div>
      </Card>

      {/* Write side */}
      <Card>
        <CardHeader
          icon={<Send className="size-5" />}
          title={t.write}
          subtitle={t.methodName}
        />
        <div className="space-y-4 p-5">
          {!address ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {t.connectFirst}
            </p>
          ) : (
            <>
              <Field label={t.methodName}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMethodOpen((v) => !v)}
                    aria-expanded={methodOpen}
                    className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 font-mono text-xs outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    {method.label}
                    <ChevronDown className="size-3.5 opacity-60" />
                  </button>
                  {methodOpen ? (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMethodOpen(false)} aria-hidden />
                      <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">
                        {WRITE_METHODS.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => {
                              setMethod(m)
                              setArgs({})
                              setMethodOpen(false)
                            }}
                            className={cn(
                              "block w-full rounded-lg px-2.5 py-2 text-start font-mono text-xs transition-colors hover:bg-muted",
                              method.name === m.name && "bg-muted",
                            )}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </Field>

              {method.args.map((a) => (
                <Field key={a} label={a}>
                  <Input
                    value={args[a] ?? ""}
                    onChange={(e) => setArgs((prev) => ({ ...prev, [a]: e.target.value }))}
                    placeholder={a === "amount" ? "0.0" : "0x…"}
                    className="force-ltr font-mono text-xs"
                    spellCheck={false}
                  />
                </Field>
              ))}

              <Button className="w-full" onClick={sendTx} disabled={sending}>
                <Send className="size-3.5" />
                {sending ? t.deploying : t.send}
              </Button>

              {txResult ? (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-xs",
                    txResult.ok
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="force-ltr break-all font-mono">{txResult.msg}</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
