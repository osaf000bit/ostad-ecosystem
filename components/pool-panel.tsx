"use client"

import { useMemo, useState } from "react"
import {
  Coins,
  LockKeyhole,
  Activity,
  Play,
  Pause,
  Plus,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, Card, CardHeader, Field, Input, StatusDot } from "@/components/ui/kit"
import { useLang, useWallet } from "@/components/providers"
import { cn } from "@/lib/utils"

type Pool = {
  id: string
  name: string
  apr: number
  tvl: number
  stakers: number
  rewardRate: number
  running: boolean
  yourStake: number
  pending: number
}

const INITIAL_POOLS: Pool[] = [
  { id: "ost-eth", name: "OST · ETH", apr: 18.4, tvl: 842000, stakers: 1284, rewardRate: 320, running: true, yourStake: 1200, pending: 8.42 },
  { id: "ost-usdc", name: "OST · USDC", apr: 12.1, tvl: 1560000, stakers: 2043, rewardRate: 210, running: true, yourStake: 0, pending: 0 },
  { id: "ost-solo", name: "OST Single", apr: 26.7, tvl: 318000, stakers: 512, rewardRate: 540, running: false, yourStake: 300, pending: 2.11 },
]

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
function usd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

export function PoolPanel() {
  const { t } = useLang()
  const { address } = useWallet()
  const [pools, setPools] = useState<Pool[]>(INITIAL_POOLS)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const totals = useMemo(() => {
    const tvl = pools.reduce((s, p) => s + p.tvl, 0)
    const stakers = pools.reduce((s, p) => s + p.stakers, 0)
    const avgApr = pools.length ? pools.reduce((s, p) => s + p.apr, 0) / pools.length : 0
    return { tvl, stakers, avgApr }
  }, [pools])

  function update(id: string, patch: Partial<Pool>) {
    setPools((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function stake(p: Pool) {
    const amt = Number(amounts[p.id] || 0)
    if (amt <= 0) return
    update(p.id, { yourStake: p.yourStake + amt, tvl: p.tvl + amt, stakers: p.yourStake === 0 ? p.stakers + 1 : p.stakers })
    setAmounts((a) => ({ ...a, [p.id]: "" }))
  }
  function unstake(p: Pool) {
    const amt = Math.min(Number(amounts[p.id] || 0), p.yourStake)
    if (amt <= 0) return
    update(p.id, { yourStake: p.yourStake - amt, tvl: Math.max(0, p.tvl - amt) })
    setAmounts((a) => ({ ...a, [p.id]: "" }))
  }
  function claim(p: Pool) {
    update(p.id, { pending: 0 })
  }

  function createPool() {
    if (!newName.trim()) return
    setPools((prev) => [
      {
        id: `pool-${Date.now()}`,
        name: newName.trim(),
        apr: 15,
        tvl: 0,
        stakers: 0,
        rewardRate: 250,
        running: true,
        yourStake: 0,
        pending: 0,
      },
      ...prev,
    ])
    setNewName("")
    setCreating(false)
  }

  const stats = [
    { label: t.tvl, value: usd(totals.tvl), icon: LockKeyhole, tone: "primary" as const },
    { label: t.apr, value: `${totals.avgApr.toFixed(1)}%`, icon: Zap, tone: "success" as const },
    { label: t.stakers, value: fmt(totals.stakers), icon: Activity, tone: "primary" as const },
  ]

  return (
    <div className="space-y-5">
      {/* Stat strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="flex items-center gap-4 p-5">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  s.tone === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary",
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="force-ltr text-xl font-semibold">{s.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader
          icon={<Coins className="size-5" />}
          title={t.poolTitle}
          subtitle={t.poolSubtitle}
          action={
            <Button size="sm" onClick={() => setCreating((v) => !v)}>
              <Plus className="size-3.5" />
              {t.createPool}
            </Button>
          }
        />

        {creating ? (
          <div className="flex flex-col gap-2 border-b border-border bg-muted/30 p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label={t.poolName}>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="OST · DAI"
                />
              </Field>
            </div>
            <Button onClick={createPool} disabled={!newName.trim()}>
              {t.createPool}
            </Button>
          </div>
        ) : null}

        <div className="divide-y divide-border">
          {pools.map((p) => (
            <div key={p.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent font-mono text-xs font-semibold">
                    {p.name.split(" ")[0].slice(0, 3)}
                  </span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="force-ltr text-success">{p.apr.toFixed(1)}% APR</span>
                      <span aria-hidden>·</span>
                      <span className="force-ltr">{usd(p.tvl)} {t.tvl}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.running ? (
                    <Badge tone="success">
                      <StatusDot tone="success" /> {t.running}
                    </Badge>
                  ) : (
                    <Badge tone="destructive">
                      <StatusDot tone="destructive" /> {t.paused2}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => update(p.id, { running: !p.running })}
                    aria-label={p.running ? t.pause : t.resume}
                    title={p.running ? t.pause : t.resume}
                  >
                    {p.running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  </Button>
                </div>
              </div>

              {/* metrics + your position */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.rewardRate}</p>
                    <p className="force-ltr text-sm font-medium">{fmt(p.rewardRate)} OST</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.stakers}</p>
                    <p className="force-ltr text-sm font-medium">{fmt(p.stakers)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.yourStake}</p>
                    <p className="force-ltr text-sm font-medium">{fmt(p.yourStake)} OST</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.pendingRewards}</p>
                    <p className="force-ltr text-sm font-medium text-success">{fmt(p.pending)} OST</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={amounts[p.id] ?? ""}
                      onChange={(e) => setAmounts((a) => ({ ...a, [p.id]: e.target.value }))}
                      placeholder={t.amount}
                      type="number"
                      min={0}
                      disabled={!address || !p.running}
                      className="force-ltr"
                    />
                    <Button
                      onClick={() => stake(p)}
                      disabled={!address || !p.running}
                      className="shrink-0"
                    >
                      {t.stake}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => unstake(p)}
                      disabled={!address || p.yourStake <= 0}
                    >
                      {t.unstake}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => claim(p)}
                      disabled={!address || p.pending <= 0}
                    >
                      <Zap className="size-3.5" />
                      {t.claim}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {!address ? (
        <p className="text-center text-xs text-muted-foreground">{t.connectFirst}</p>
      ) : null}
    </div>
  )
}
