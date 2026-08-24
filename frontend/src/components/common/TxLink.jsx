// ======================================
// Transaction Link
// ======================================

import { FaExternalLinkAlt } from "react-icons/fa";
import { getExplorerTxUrl } from "../../services/contract";
import { shortenAddress } from "../../utils/format";

/**
 * Links to the transaction on PolygonScan (Amoy).
 */
export default function TxLink({ hash, label, className = "" }) {
  if (!hash) return <span className="text-slate-400 dark:text-slate-500">—</span>;
  return (
    <a
      href={getExplorerTxUrl(hash)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-medium text-brand-600 hover:underline dark:text-brand-400 ${className}`}
      title={`View transaction ${hash}`}
    >
      {label || shortenAddress(hash, 6)}
      <FaExternalLinkAlt className="h-3 w-3" />
    </a>
  );
}
