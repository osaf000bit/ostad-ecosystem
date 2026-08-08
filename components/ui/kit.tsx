"use client"

import { useState, type ReactNode, type InputHTMLAttributes } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------- Card -------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border p-5">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold leading-none text-pretty">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ------------------------------- Field ------------------------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground/70">{hint}</span> : null}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

/* --------------------------- Data row / KV --------------------------- */

export function DataRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

/* ------------------------------ Badge -------------------------------- */

export function Badge({
  tone = "muted",
  children,
  className,
}: {
  tone?: "muted" | "primary" | "success" | "destructive"
  children: ReactNode
  className?: string
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ tone = "muted" }: { tone?: "success" | "destructive" | "muted" }) {
  const tones: Record<string, string> = {
    success: "bg-success",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground",
  }
  return (
    <span className="relative flex size-2">
      {tone === "success" ? (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60" />
      ) : null}
      <span className={cn("relative inline-flex size-2 rounded-full", tones[tone])} />
    </span>
  )
}

/* --------------------------- Copyable text --------------------------- */

export function CopyText({
  value,
  display,
  label = "Copy",
  copiedLabel = "Copied",
}: {
  value: string
  display?: string
  label?: string
  copiedLabel?: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      title={copied ? copiedLabel : label}
      className="force-ltr inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs transition-colors hover:bg-muted"
    >
      <span>{display ?? value}</span>
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
