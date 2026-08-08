"use client"

import { useState } from "react"
import { ShieldCheck, Rocket, Coins } from "lucide-react"
import { Header } from "@/components/header"
import { ContractPanel } from "@/components/contract-panel"
import { DeployPanel } from "@/components/deploy-panel"
import { PoolPanel } from "@/components/pool-panel"
import { useLang } from "@/components/providers"
import { cn } from "@/lib/utils"

type Tab = "contract" | "deploy" | "pool"

export default function Page() {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>("contract")

  const tabs: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
    { id: "contract", label: t.tabContract, icon: ShieldCheck },
    { id: "deploy", label: t.tabDeploy, icon: Rocket },
    { id: "pool", label: t.tabPool, icon: Coins },
  ]

  return (
    <div className="min-h-dvh">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Tabs */}
        <nav className="mb-6 inline-flex rounded-xl border border-border bg-card p-1" role="tablist">
          {tabs.map((tb) => {
            const Icon = tb.icon
            const active = tab === tb.id
            return (
              <button
                key={tb.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tb.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tb.label}</span>
              </button>
            )
          })}
        </nav>

        <div>
          {tab === "contract" ? <ContractPanel /> : null}
          {tab === "deploy" ? <DeployPanel /> : null}
          {tab === "pool" ? <PoolPanel /> : null}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-center text-xs text-muted-foreground">
          {t.brand} · UUPS · placeholder ABI
        </p>
      </footer>
    </div>
  )
}
