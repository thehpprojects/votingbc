// ======================================
// Wallet Connect Button
// ======================================

import { FaWallet, FaLink, FaUnlink } from "react-icons/fa";
import Button from "./Button";
import { shortenAddress } from "../../utils/format";

/**
 * Button that connects/disconnects the MetaMask wallet.
 */
export default function WalletConnectButton({ wallet, size = "md", className = "" }) {
  const { installed, account, connecting, connect, disconnect } = wallet;

  if (!installed) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-orange-400 hover:to-amber-400 ${className}`}
      >
        <FaWallet /> Install MetaMask
      </a>
    );
  }

  if (account) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {shortenAddress(account)}
        </span>
        <Button variant="secondary" size="sm" onClick={disconnect} title="Disconnect wallet">
          <FaUnlink className="h-3.5 w-3.5" /> Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      onClick={connect}
      loading={connecting}
      className={className}
      title="Connect MetaMask wallet"
    >
      <FaLink className="h-4 w-4" /> {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
