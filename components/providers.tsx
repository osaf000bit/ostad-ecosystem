"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { BrowserProvider, formatEther } from "ethers"
import { dictionary, type Dict, type Lang } from "@/lib/i18n"
import {
  DEFAULT_CHAIN_ID,
  SUPPORTED_NETWORKS,
  isSupportedChain,
} from "@/lib/web3-config"

/* ------------------------------ Language ------------------------------ */

type LanguageCtx = {
  lang: Lang
  t: Dict
  dir: "rtl" | "ltr"
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageCtx | null>(null)

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLang must be used within Providers")
  return ctx
}

/* ------------------------------- Wallet ------------------------------- */

type WalletCtx = {
  address: string | null
  chainId: number | null
  balance: string | null
  connecting: boolean
  hasWallet: boolean
  supported: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  getProvider: () => BrowserProvider | null
}

const WalletContext = createContext<WalletCtx | null>(null)

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within Providers")
  return ctx
}

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
}

function getEthereum(): Eip1193 | null {
  if (typeof window === "undefined") return null
  return (window as unknown as { ethereum?: Eip1193 }).ethereum ?? null
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fa")

  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)

  // Sync <html dir/lang> with language
  useEffect(() => {
    const el = document.documentElement
    el.lang = lang
    el.dir = dictionary[lang].dir
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "fa" ? "en" : "fa"))
  }, [])

  const refreshBalance = useCallback(async (addr: string) => {
    const eth = getEthereum()
    if (!eth) return
    try {
      const provider = new BrowserProvider(eth as never)
      const bal = await provider.getBalance(addr)
      setBalance(formatEther(bal))
    } catch {
      setBalance(null)
    }
  }, [])

  const applyAccounts = useCallback(
    (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null)
        setBalance(null)
        return
      }
      setAddress(accounts[0])
      void refreshBalance(accounts[0])
    },
    [refreshBalance],
  )

  useEffect(() => {
    const eth = getEthereum()
    setHasWallet(!!eth)
    if (!eth) return

    // Restore existing connection silently
    void (async () => {
      try {
        const accounts = (await eth.request({ method: "eth_accounts" })) as string[]
        applyAccounts(accounts)
        const cid = (await eth.request({ method: "eth_chainId" })) as string
        setChainId(Number.parseInt(cid, 16))
      } catch {
        /* ignore */
      }
    })()

    const onAccounts = (accounts: string[]) => applyAccounts(accounts)
    const onChain = (cid: string) => setChainId(Number.parseInt(cid, 16))

    eth.on("accountsChanged", onAccounts)
    eth.on("chainChanged", onChain)
    return () => {
      eth.removeListener("accountsChanged", onAccounts)
      eth.removeListener("chainChanged", onChain)
    }
  }, [applyAccounts])

  const connect = useCallback(async () => {
    const eth = getEthereum()
    if (!eth) {
      setHasWallet(false)
      return
    }
    setConnecting(true)
    try {
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[]
      applyAccounts(accounts)
      const cid = (await eth.request({ method: "eth_chainId" })) as string
      setChainId(Number.parseInt(cid, 16))
    } catch {
      /* user rejected */
    } finally {
      setConnecting(false)
    }
  }, [applyAccounts])

  const disconnect = useCallback(() => {
    setAddress(null)
    setBalance(null)
  }, [])

  const switchNetwork = useCallback(async (targetChainId: number) => {
    const eth = getEthereum()
    if (!eth) return
    const net = SUPPORTED_NETWORKS[targetChainId] ?? SUPPORTED_NETWORKS[DEFAULT_CHAIN_ID]
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: net.hexChainId }],
      })
    } catch (err: unknown) {
      // 4902 = chain not added
      if ((err as { code?: number })?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: net.hexChainId,
              chainName: net.name,
              nativeCurrency: { name: net.currency, symbol: net.currency, decimals: 18 },
              rpcUrls: [net.rpcUrl],
              blockExplorerUrls: [net.explorer],
            },
          ],
        })
      }
    }
  }, [])

  const getProvider = useCallback(() => {
    const eth = getEthereum()
    if (!eth) return null
    return new BrowserProvider(eth as never)
  }, [])

  const langValue = useMemo<LanguageCtx>(
    () => ({ lang, t: dictionary[lang], dir: dictionary[lang].dir, toggleLang }),
    [lang, toggleLang],
  )

  const walletValue = useMemo<WalletCtx>(
    () => ({
      address,
      chainId,
      balance,
      connecting,
      hasWallet,
      supported: isSupportedChain(chainId),
      connect,
      disconnect,
      switchNetwork,
      getProvider,
    }),
    [address, chainId, balance, connecting, hasWallet, connect, disconnect, switchNetwork, getProvider],
  )

  return (
    <LanguageContext.Provider value={langValue}>
      <WalletContext.Provider value={walletValue}>{children}</WalletContext.Provider>
    </LanguageContext.Provider>
  )
}
