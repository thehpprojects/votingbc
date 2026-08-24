# Decentralized Voting System — Smart Contract Module

> **Scope:** This folder contains **only the smart-contract module** (Solidity
> contract, Hardhat project, deployment script, tests). The frontend and other
> team modules are intentionally **not** included. Integration points for them
> are documented below.

## 1. Features & requirement traceability

| #   | Requirement                               | Where it's implemented                                                     |
| --- | ----------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Deployer is the admin                     | `constructor() Ownable(msg.sender)` (OpenZeppelin `Ownable`)               |
| 2   | Only admin adds candidates                | `addCandidate()` + `onlyOwner`                                             |
| 3   | Candidate: ID, name, IPFS CID, vote count | `struct Candidate`                                                         |
| 4   | Only admin starts/ends election           | `startElection()` / `endElection()` + `onlyOwner`                          |
| 5   | Voting only while election is active      | `onlyWhenElectionIsActive` modifier                                        |
| 6   | One vote per wallet                       | `hasVoted` mapping keyed by `msg.sender`                                   |
| 7   | Invalid candidate IDs rejected            | `require(candidateId < candidates.length)`                                 |
| 8   | Valid vote increments count               | `candidates[candidateId].voteCount += 1`                                   |
| 9   | Admin cannot change/delete votes          | **No mutator function exists** (verified by test inspecting the ABI)       |
| 10  | View functions                            | `getCandidate`, `getAllCandidates`, `getElectionStatus`, `getResults`, ... |
| 11  | Events                                    | `CandidateAdded`, `ElectionStarted`, `VoteCast`, `ElectionEnded`           |

**Election lifecycle:** `Registration → Active → Ended` (one-way; deploy a new
contract for a new election).

## 2. Tech stack

- Solidity `^0.8.24` (compiled with solc 0.8.26)
- Hardhat **v2** + `@nomicfoundation/hardhat-toolbox` v5 (ethers v6, chai matchers, verify)
- OpenZeppelin Contracts v5 (`access/Ownable`)
- Target network: **Polygon Amoy** testnet (chainId `80002`)

## 3. Prerequisites

- Node.js **20 LTS** (or ≥ 18) and npm
- A dedicated wallet for testing (e.g. a fresh MetaMask account)
- Free test POL from the faucet: <https://faucet.polygon.technology/> (select **Amoy**)
- Optional: PolygonScan API key (<https://polygonscan.com>) for source verification

## 4. Installation

```bash
mkdir voting-system && cd voting-system
npm init -y
npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0
npm install @openzeppelin/contracts@^5.2.0 dotenv
```

Create the files shown in the project structure, then configure your environment:

```bash
cp .env.example .env     # Windows: copy .env.example .env
# edit .env and set PRIVATE_KEY (testnet-only wallet!) and optionally AMOY_RPC_URL
```

Optional `package.json` scripts:

```json
"scripts": {
  "compile": "hardhat compile",
  "test": "hardhat test",
  "deploy:amoy": "hardhat run scripts/deploy.js --network amoy"
}
```

## 5. Compile & test

```bash
npx hardhat compile
npx hardhat test            # runs the full 32-test suite on a local network
```

## 6. Deploy to Polygon Amoy

```bash
npx hardhat run scripts/deploy.js --network amoy
```

The script prints the contract address and saves it to `deployments/amoy.json`
for the other modules. If you get an insufficient-funds error, request test POL
from the faucet first.

## 7. Verify on PolygonScan (optional)

```bash
npx hardhat verify --network amoy <DEPLOYED_CONTRACT_ADDRESS>
```

## 8. Post-deployment: admin workflow

Run an interactive console against Amoy:

```bash
npx hardhat console --network amoy
```

```js
// Attach to the deployed contract (use the address printed by deploy.js)
const voting = await ethers.getContractAt(
  "VotingSystem",
  "0xYourDeployedAddress",
);

// 1) Register candidates (admin wallet only; use real IPFS CIDs)
await (await voting.addCandidate("Alice Johnson", "QmYourRealCid1")).wait();
await (await voting.addCandidate("Bob Smith", "QmYourRealCid2")).wait();

// 2) Start the election
await (await voting.startElection()).wait();

// 3) Anyone can now vote exactly once:
await (await voting.connect(someVoterSigner).vote(0)).wait();

// 4) Read live status / results (free calls)
await voting.getElectionStatus();
await voting.getResults();

// 5) End the election (results become final)
await (await voting.endElection()).wait();
```

## 9. Contract API reference

**State-changing functions**

| Function                      | Access           | Description                                           |
| ----------------------------- | ---------------- | ----------------------------------------------------- |
| `addCandidate(name, ipfsCid)` | admin only       | Register candidate (Registration phase only)          |
| `startElection()`             | admin only       | Start voting (requires ≥ 1 candidate)                 |
| `vote(candidateId)`           | any wallet, once | Cast a vote while election is Active                  |
| `endElection()`               | admin only       | End voting; results become final                      |
| `transferOwnership(newOwner)` | admin only       | Inherited from OpenZeppelin `Ownable` — use with care |

**View functions**

| Function                                                                      | Returns                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| `getCandidateCount()`                                                         | number of candidates                                     |
| `getCandidate(id)`                                                            | full candidate struct                                    |
| `getAllCandidates()`                                                          | array of all candidates (with vote counts)               |
| `hasVoted(address)`                                                           | bool                                                     |
| `getElectionStatus()`                                                         | state enum, label, isActive, start/end times, counts     |
| `getResults()`                                                                | candidates + votes, total, leading ID, clear-leader flag |
| `electionState()`, `electionStartTime()`, `electionEndTime()`, `totalVotes()` | public getters                                           |

**Events**

| Event                                                 | Emitted when              |
| ----------------------------------------------------- | ------------------------- |
| `CandidateAdded(candidateId, name, ipfsCid)`          | a candidate is registered |
| `ElectionStarted(startedAt, candidateCount)`          | election starts           |
| `VoteCast(voter, candidateId, candidateNewVoteCount)` | a valid vote is recorded  |
| `ElectionEnded(endedAt, totalVotesCast)`              | election ends             |

## 10. Notes for other teams (frontend / backend)

- **ABI:** `artifacts/contracts/VotingSystem.sol/VotingSystem.json` → `.abi`
  (generated by `npx hardhat compile`).
- **Address:** `deployments/<network>.json` → `contractAddress` (written by the deploy script).
- Candidate IDs are **0-based** sequential integers.
- Listen to the four events for live UI updates; all read functions are free `view` calls.

## 11. Security notes & known limitations

- **Vote immutability:** the contract contains no function that can reset,
  decrease, transfer or delete votes, and none to remove candidates — this is
  enforced by code structure and asserted by a test that scans the ABI.
- **One vote per address:** sybil resistance is limited to wallet uniqueness.
  Anyone who controls multiple wallets can vote multiple times. For stronger
  guarantees, future work could add a voter allowlist (e.g. Merkle-proof
  registration) or one-person-one-credential schemes.
- **Ownership:** `Ownable` allows transferring admin rights
  (`transferOwnership`). Never transfer ownership to an unknown address.
- **No funds handling:** no function is `payable`; the contract is not meant
  to hold tokens.

## 12. Troubleshooting

| Problem                             | Fix                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| `Sender doesn't have funds` on Amoy | Get test POL from <https://faucet.polygon.technology/> (faucets are rate-limited) |
| RPC errors / timeouts               | Use a dedicated RPC URL (Alchemy/Infura) in `.env` instead of the public one      |
| `No deployer account found`         | Set `PRIVATE_KEY` in `.env`                                                       |
| `nonce too low`                     | Wait for pending txs to confirm, or switch RPC endpoint                           |
| Verification fails                  | Ensure `POLYGONSCAN_API_KEY` is set; re-run `compile` then `verify`               |
| Solidity version errors             | This project is tested with OpenZeppelin v5.x; keep `solidity.version` ≥ 0.8.24   |
