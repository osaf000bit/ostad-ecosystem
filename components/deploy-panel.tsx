"use client"

import { useMemo, useState } from "react"
import { hexlify, randomBytes } from "ethers"
import {
  Rocket,
  ChevronRight,
  ChevronLeft,
  CircleCheck,
  Layers,
  Settings2,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, Card, CardHeader, CopyText, DataRow, Field, Input } from "@/components/ui/kit"
import { useLang, useWallet } from "@/components/providers"
import { IMPL_VERSIONS, shortAddress } from "@/lib/web3-config"
import { cn } from "@/lib/utils"

type Step = 0 | 1 | 2

type DeployConfig = {
  version: (typeof IMPL_VERSIONS)[number]
  owner: string
  tokenName: string
  tokenSymbol: string
  initialSupply: string
}

type DeployResult = {
  proxy: string
  impl: string
  tx: string
}

function fakeAddress() {
  return hexlify(randomBytes(20))
}
function fakeHash() {
  return hexlify(randomBytes(32))
}

export function DeployPanel() {
  const { t } = useLang()
  const { address } = useWallet()

  const [step, setStep] = useState<Step>(0)
  const [cfg, setCfg] = useState<DeployConfig>({
    version: "OstadV2",
    owner: "",
    tokenName: "Ostad Token",
    tokenSymbol: "OST",
    initialSupply: "1000000",
  })
  const [deploying, setDeploying] = useState(false)
  const [result, setResult] = useState<DeployResult | null>(null)

  const estGas = useMemo(
    () => (cfg.version === "OstadV2" ? "0.0142" : "0.0119"),
    [cfg.version],
  )

  const steps = [
    { label: t.deployStepConfig, icon: Settings2 },
    { label: t.deployStepReview, icon: ClipboardCheck },
    { label: t.deployStepDeploy, icon: Rocket },
  ]

  const canProceed =
    cfg.owner.trim().length > 0 &&
    cfg.tokenName.trim().length > 0 &&
    cfg.tokenSymbol.trim().length > 0

  async function runDeploy() {
    setDeploying(true)
    // Simulated deployment sequence — swap for a real ContractFactory
    // deploy once you provide implementation bytecode.
    await new Promise((r) => setTimeout(r, 2200))
    setResult({ proxy: fakeAddress(), impl: fakeAddress(), tx: fakeHash() })
    setDeploying(false)
  }

  function reset() {
    setResult(null)
    setStep(0)
  }

  return (
    <Card>
      <CardHeader
        icon={<Rocket className="size-5" />}
        title={t.deployTitle}
        subtitle={t.deploySubtitle}
        action={<Badge tone="primary">UUPS</Badge>}
      />

      {/* Stepper */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        {steps.map((s, i) => {
          const active = i === step
          const done = i < step || (result && i <= 2)
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border text-sm transition-colors",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : done
                        ? "border-success/40 bg-success/15 text-success"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {done && !active ? <CircleCheck className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:inline",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 ? (
                <span className="h-px flex-1 bg-border" />
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="p-5">
        {/* Step 0 — Configure */}
        {step === 0 && !result ? (
          <div className="space-y-4">
            <Field label={t.implVersionSelect}>
              <div className="grid grid-cols-2 gap-2">
                {IMPL_VERSIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCfg((p) => ({ ...p, version: v }))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      cfg.version === v
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Layers className="size-4" />
                    {v}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t.initOwner}>
              <div className="flex gap-2">
                <Input
                  value={cfg.owner}
                  onChange={(e) => setCfg((p) => ({ ...p, owner: e.target.value }))}
                  placeholder="0x…"
                  className="force-ltr font-mono text-xs"
                  spellCheck={false}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  disabled={!address}
                  onClick={() => setCfg((p) => ({ ...p, owner: address ?? "" }))}
                >
                  {t.useCurrentAccount}
                </Button>
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.tokenName}>
                <Input
                  value={cfg.tokenName}
                  onChange={(e) => setCfg((p) => ({ ...p, tokenName: e.target.value }))}
                />
              </Field>
              <Field label={t.tokenSymbol}>
                <Input
                  value={cfg.tokenSymbol}
                  onChange={(e) =>
                    setCfg((p) => ({ ...p, tokenSymbol: e.target.value.toUpperCase() }))
                  }
                  className="force-ltr"
                />
              </Field>
            </div>

            <Field label={t.initialSupply}>
              <Input
                type="number"
                min={0}
                value={cfg.initialSupply}
                onChange={(e) => setCfg((p) => ({ ...p, initialSupply: e.target.value }))}
                className="force-ltr"
              />
            </Field>

            <div className="flex justify-end pt-1">
              <Button disabled={!canProceed} onClick={() => setStep(1)}>
                {t.next}
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* Step 1 — Review */}
        {step === 1 && !result ? (
          <div className="space-y-4">
            <div className="divide-y divide-border rounded-xl border border-border px-4">
              <DataRow label={t.implVersionSelect}>
                <Badge tone="primary">{cfg.version}</Badge>
              </DataRow>
              <DataRow label={t.initOwner}>
                <CopyText value={cfg.owner} display={shortAddress(cfg.owner)} copiedLabel={t.copied} />
              </DataRow>
              <DataRow label={t.tokenName}>{cfg.tokenName}</DataRow>
              <DataRow label={t.tokenSymbol}>
                <span className="force-ltr font-mono text-xs">{cfg.tokenSymbol}</span>
              </DataRow>
              <DataRow label={t.initialSupply}>
                <span className="force-ltr font-mono text-xs">
                  {Number(cfg.initialSupply).toLocaleString()}
                </span>
              </DataRow>
              <DataRow label={t.estGas}>
                <span className="force-ltr font-mono text-xs">≈ {estGas} ETH</span>
              </DataRow>
            </div>
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
              {t.reviewNote}
            </p>
            <div className="flex justify-between pt-1">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ChevronLeft className="size-3.5 rtl:rotate-180" />
                {t.back}
              </Button>
              <Button onClick={() => setStep(2)}>
                {t.next}
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* Step 2 — Deploy */}
        {step === 2 && !result ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <span
              className={cn(
                "glow-primary flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary",
                deploying && "animate-pulse",
              )}
            >
              <Rocket className="size-7" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">
                {cfg.tokenName}{" "}
                <span className="force-ltr font-mono text-xs text-muted-foreground">
                  ({cfg.tokenSymbol} · {cfg.version})
                </span>
              </p>
              <p className="text-sm text-muted-foreground">≈ {estGas} ETH · UUPS proxy</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={deploying}>
                <ChevronLeft className="size-3.5 rtl:rotate-180" />
                {t.back}
              </Button>
              <Button onClick={runDeploy} disabled={deploying} className="min-w-40">
                <Rocket className={cn("size-3.5", deploying && "animate-pulse")} />
                {deploying ? t.deploying : t.deployNow}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Result */}
        {result ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                <CircleCheck className="size-7" />
              </span>
              <p className="font-semibold">{t.deployed}</p>
            </div>
            <div className="divide-y divide-border rounded-xl border border-border px-4">
              <DataRow label={t.proxyAddress}>
                <CopyText value={result.proxy} display={shortAddress(result.proxy)} copiedLabel={t.copied} />
              </DataRow>
              <DataRow label={t.implAddress}>
                <CopyText value={result.impl} display={shortAddress(result.impl)} copiedLabel={t.copied} />
              </DataRow>
              <DataRow label={t.txHash}>
                <CopyText value={result.tx} display={shortAddress(result.tx)} copiedLabel={t.copied} />
              </DataRow>
            </div>
            <Button variant="outline" className="w-full" onClick={reset}>
              {t.deployAgain}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
