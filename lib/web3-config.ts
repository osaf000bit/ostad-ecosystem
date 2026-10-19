const DEFAULT_OSTAD_ABI = [
  "function version() view returns (string)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function proxiableUUID() view returns (bytes32)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address newOwner)",
  "function upgradeToAndCall(address newImplementation, bytes data) payable",
  "function mint(address to, uint256 amount)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Upgraded(address indexed implementation)",
] as const

const parseAbi = (): string[] => {
  const raw =
    process.env.NEXT_PUBLIC_OSTAD_ABI ?? process.env.NEXT_PUBLIC_OSTAD_ABI_JSON ?? ""

  if (!raw.trim()) return [...DEFAULT_OSTAD_ABI]

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(String)
    if (typeof parsed === "string") return JSON.parse(parsed).map(String)
  } catch {
    // Ignore invalid ABI env and fall back to the safe default list.
  }

  return [...DEFAULT_OSTAD_ABI]
}

export type NetworkInfo = {
  chainId: number
  hexChainId: string
  name: string
  shortName: string
  currency: string
  rpcUrl: string
  explorer: string
}

export const SUPPORTED_NETWORKS: Record<number, NetworkInfo> = {
  1: {
    chainId: 1,
    hexChainId: "0x1",
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    currency: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
  },
  11155111: {
    chainId: 11155111,
    hexChainId: "0xaa36a7",
    name: "Sepolia Testnet",
    shortName: "Sepolia",
    currency: "SepoliaETH",
    rpcUrl: "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
  },
  137: {
    chainId: 137,
    hexChainId: "0x89",
    name: "Polygon",
    shortName: "Polygon",
    currency: "POL",
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
  56: {
    chainId: 56,
    hexChainId: "0x38",
    name: "BNB Smart Chain",
    shortName: "BSC",
    currency: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
  },
}

export const DEFAULT_CHAIN_ID = 11155111

export const OSTAD_PROXY_ADDRESS =
  process.env.NEXT_PUBLIC_OSTAD_PROXY_ADDRESS ??
  "0x0000000000000000000000000000000000000000"

export const OSTAD_ABI: string[] = parseAbi()

export const WRITE_METHODS = [
  { name: "pause", label: "pause()", args: [] as string[] },
  { name: "unpause", label: "unpause()", args: [] as string[] },
  { name: "mint", label: "mint(to, amount)", args: ["to", "amount"] },
  { name: "transferOwnership", label: "transferOwnership(newOwner)", args: ["newOwner"] },
] as const

export const IMPL_VERSIONS = ["OstadV1", "OstadV2"] as const

export function isSupportedChain(chainId?: number | null): boolean {
  return chainId != null && chainId in SUPPORTED_NETWORKS
}

export function shortAddress(addr?: string | null): string {
  if (!addr) return "—"
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
