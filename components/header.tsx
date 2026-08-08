"use client"

import { useState } from "react"
import { Languages, Power, Wallet, ChevronDown, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, StatusDot } from "@/components/ui/kit"
import { useLang, useWallet } from "@/components/providers"
import {
  SUPPORTED_NETWORKS,
  isSupportedChain,
  shortAddress,
} from "@/lib/web3-config"
import { cn } from "@/lib/utils"

export function Header() {
  const { t, lang, toggleLang } = useLang()
  const {
    address,
    chainId,
    balance,
    connecting,
    hasWallet,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet()
  const [netOpen, setNetOpen] = useState(false)

  const net = chainId ? SUPPORTED_NETWORKS[chainId] : undefined
  const supported = isSupportedChain(chainId)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="glow-primary flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground">
            O
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{t.brand}</p>
            <p className="text-xs text-muted-foreground">{t.tagline}</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            aria-label="Toggle language"
          >
            <Languages className="size-3.5" />
            {t.langLabel}
          </Button>

          {/* Network selector — only when connected */}
          {address ? (
            <div className="relative">
              <Button
                variant={supported ? "outline" : "destructive"}
                size="sm"
                onClick={() => setNetOpen((v) => !v)}
                aria-expanded={netOpen}
              >
                {supported ? (
                  <StatusDot tone="success" />
                ) : (
                  <TriangleAlert className="size-3.5" />
                )}
                <span className="hidden sm:inline">
                  {supported ? net?.shortName : t.wrongNetwork}
                </span>
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
              {netOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setNetOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute z-20 mt-1.5 min-w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl end-0">
                    {Object.values(SUPPORTED_NETWORKS).map((n) => (
                      <button
                        key={n.chainId}
                        type="button"
                        onClick={() => {
                          void switchNetwork(n.chainId)
                          setNetOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
                          chainId === n.chainId && "bg-muted",
                        )}
                      >
                        <span>{n.name}</span>
                        {chainId === n.chainId ? <StatusDot tone="success" /> : null}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {/* Wallet */}
          {address ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card py-1 pe-1 ps-2.5">
              <div className="hidden text-end leading-tight sm:block">
                <p className="force-ltr font-mono text-xs">{shortAddress(address)}</p>
                {balance ? (
                  <p className="force-ltr text-[10px] text-muted-foreground">
                    {Number(balance).toFixed(4)} {net?.currency ?? "ETH"}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={disconnect}
                aria-label={t.disconnect}
                title={t.disconnect}
              >
                <Power className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connect} disabled={connecting || !hasWallet}>
              <Wallet className="size-3.5" />
              {connecting ? t.connecting : t.connect}
            </Button>
          )}
        </div>
      </div>

      {!hasWallet ? (
        <div className="border-t border-destructive/30 bg-destructive/10">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <p className="flex items-center gap-2 text-xs text-destructive">
              <TriangleAlert className="size-3.5" />
              {t.noWallet}
            </p>
          </div>
        </div>
      ) : null}
    </header>
  )
}
