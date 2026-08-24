// ======================================
// App-wide Constants
// ======================================

/** LocalStorage keys used for session persistence. */
export const STORAGE_KEYS = {
  ADMIN_TOKEN: "voting_admin_token",
  ADMIN_USER: "voting_admin_user",
  VOTER_SESSION: "voting_voter_session",
  WALLET_ADDRESS: "voting_wallet_address",
};

/** Supported election states. */
export const ELECTION_STATE = {
  REGISTRATION: 0,
  ACTIVE: 1,
  ENDED: 2,
};

/** Default IPFS gateway used for candidate CIDs. */
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
