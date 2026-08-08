import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  timestamp,
  index,
} from "drizzle-orm/pg-core"

/**
 * Wallet-scoped tables. This is a web3 DApp, so the connected wallet address
 * is the identity — every row is scoped by `walletAddress` (lowercased).
 */

// Recorded / broadcast network transactions
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("walletAddress").notNull(),
    hash: text("hash").notNull(),
    chainId: integer("chainId").notNull(),
    label: text("label"),
    kind: text("kind").notNull().default("record"), // record | broadcast | contract | deploy | stake | reward
    fromAddress: text("fromAddress"),
    toAddress: text("toAddress"),
    valueWei: text("valueWei"),
    status: text("status").notNull().default("pending"), // pending | confirmed | failed | dropped
    blockNumber: bigint("blockNumber", { mode: "number" }),
    gasUsed: text("gasUsed"),
    confirmations: integer("confirmations").notNull().default(0),
    latencyMs: integer("latencyMs"), // time from record to first confirmation
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    confirmedAt: timestamp("confirmedAt"),
  },
  (t) => ({
    byWallet: index("tx_wallet_idx").on(t.walletAddress),
    byHash: index("tx_hash_idx").on(t.hash),
  }),
)

// Referral / invite links (up to 100 per wallet)
export const referralLinks = pgTable(
  "referral_links",
  {
    id: serial("id").primaryKey(),
    walletAddress: text("walletAddress").notNull(),
    code: text("code").notNull(),
    label: text("label"),
    rewardAmount: text("rewardAmount").notNull().default("0"),
    clicks: integer("clicks").notNull().default(0),
    claims: integer("claims").notNull().default(0),
    active: integer("active").notNull().default(1),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    byWallet: index("rl_wallet_idx").on(t.walletAddress),
    byCode: index("rl_code_idx").on(t.code),
  }),
)

// On-chain reward claims tied to a referral link
export const rewardClaims = pgTable(
  "reward_claims",
  {
    id: serial("id").primaryKey(),
    linkCode: text("linkCode").notNull(),
    ownerWallet: text("ownerWallet").notNull(), // link owner
    claimerWallet: text("claimerWallet").notNull(), // who claimed
    chainId: integer("chainId").notNull(),
    amount: text("amount").notNull().default("0"),
    txHash: text("txHash"),
    status: text("status").notNull().default("pending"), // pending | confirmed | failed
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    byOwner: index("rc_owner_idx").on(t.ownerWallet),
    byCode: index("rc_code_idx").on(t.linkCode),
  }),
)
