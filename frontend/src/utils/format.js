// ======================================
// Formatting Helpers
// ======================================

/** Format a unix timestamp into a readable date string. */
export const formatTimestamp = (ts) => {
  if (!ts || ts === 0) return "Not started";
  return new Date(ts * 1000).toLocaleString();
};

/** Format numbers with thousand separators. */
export const formatNumber = (n) => Number(n || 0).toLocaleString();

/** Shorten a wallet address for display. */
export const shortenAddress = (address, chars = 4) => {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/** Capitalize the first letter of a string. */
export const capitalize = (str) =>
  typeof str === "string" && str
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : "";

/** Return the Tailwind badge classes for an election state. */
export const stateBadgeClasses = (state) => {
  const map = {
    Registration: "bg-sky-100 text-sky-700 ring-sky-200",
    Active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    Ended: "bg-slate-200 text-slate-700 ring-slate-300",
  };
  return map[state] || "bg-slate-100 text-slate-700 ring-slate-200";
};

/** Format a candidate's vote count with vote-suffix. */
export const formatVotes = (count) =>
  `${formatNumber(count)} vote${count === 1 ? "" : "s"}`;
