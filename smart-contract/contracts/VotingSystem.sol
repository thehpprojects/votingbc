// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// OpenZeppelin's audited Ownable contract gives us a secure "admin" pattern:
//   - The address passed to the constructor becomes the owner (admin).
//   - The `onlyOwner` modifier restricts sensitive functions to the admin.
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VotingSystem
 * @notice On-chain voting module for a decentralized voting dApp.
 *
 * Election lifecycle (one-way, single election per deployment):
 *
 *   1. Registration -> admin adds candidates (addCandidate)
 *   2. Active       -> admin starts election (startElection), voters vote (vote)
 *   3. Ended        -> admin ends election (endElection), results are final
 *
 * Security properties:
 *   - Only the deployer (admin/owner) can manage candidates and the lifecycle.
 *   - Each wallet address can vote exactly once (`hasVoted` mapping).
 *   - VOTES ARE IMMUTABLE (Requirement 9): this contract intentionally has NO
 *     function that can reset, decrease, transfer or delete recorded votes,
 *     and no function to remove candidates. Not even the admin can change
 *     recorded votes — the code simply does not allow it.
 *   - No function is `payable`, so the contract cannot receive ETH/POL
 *     through normal calls.
 */
contract VotingSystem is Ownable {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    /// @notice All on-chain data for a single candidate.
    struct Candidate {
        uint256 id;        // Unique ID, assigned automatically (0, 1, 2, ...)
        string name;       // Candidate display name
        string ipfsCid;    // IPFS CID pointing to off-chain details (photo, bio...)
        uint256 voteCount; // Votes received. Only ever incremented, never reset.
    }

    /// @notice The three lifecycle states of the election.
    enum ElectionState {
        Registration, // Admin can add candidates. Voting is NOT possible yet.
        Active,       // Election is running. Voting IS possible.
        Ended         // Election finished. Results are final.
    }

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    /// @dev All candidates. Kept private: the only access is through the
    ///      functions below, and none of them allows editing vote counts.
    Candidate[] private candidates;

    /// @notice Tracks which wallets already voted (one vote per address).
    mapping(address => bool) public hasVoted;

    /// @notice Current lifecycle state of the election.
    ElectionState public electionState;

    /// @notice Unix timestamp when the election was started (0 before that).
    uint256 public electionStartTime;

    /// @notice Unix timestamp when the election was ended (0 before that).
    uint256 public electionEndTime;

    /// @notice Total number of valid votes cast.
    uint256 public totalVotes;

    // ---------------------------------------------------------------------
    // Events (Requirement 11) — let frontends/indexers react to changes
    // ---------------------------------------------------------------------

    event CandidateAdded(uint256 indexed candidateId, string name, string ipfsCid);
    event ElectionStarted(uint256 startedAt, uint256 candidateCount);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 candidateNewVoteCount);
    event ElectionEnded(uint256 endedAt, uint256 totalVotesCast);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    /// @dev Reverts unless the election is currently Active (Requirement 5).
    modifier onlyWhenElectionIsActive() {
        require(electionState == ElectionState.Active, "Election is not active");
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor — Requirement 1: the deployer becomes the admin
    // ---------------------------------------------------------------------

    constructor(address admin) Ownable(admin) {}

    // ---------------------------------------------------------------------
    // Admin functions (Requirement 2 & 4)
    // ---------------------------------------------------------------------

    /**
     * @notice Register a new candidate. Only possible during Registration.
     * @param name     Candidate's display name (must not be empty).
     * @param ipfsCid  IPFS CID with the candidate's off-chain info.
     */
    function addCandidate(string calldata name, string calldata ipfsCid) external onlyOwner {
        require(
            electionState == ElectionState.Registration,
            "Candidates can only be added before the election starts"
        );
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");

        // IDs are assigned automatically and sequentially: 0, 1, 2, ...
        uint256 newCandidateId = candidates.length;
        candidates.push(
            Candidate({ id: newCandidateId, name: name, ipfsCid: ipfsCid, voteCount: 0 })
        );

        emit CandidateAdded(newCandidateId, name, ipfsCid);
    }

    /**
     * @notice Start the election. Moves state Registration -> Active.
     */
    function startElection() external onlyOwner {
        require(
            electionState == ElectionState.Registration,
            "Election has already started or ended"
        );
        require(candidates.length > 0, "Cannot start election without candidates");

        electionState = ElectionState.Active;
        electionStartTime = block.timestamp;

        emit ElectionStarted(block.timestamp, candidates.length);
    }

    /**
     * @notice End the election. Moves state Active -> Ended. Results are final.
     */
    function endElection() external onlyOwner {
        require(electionState == ElectionState.Active, "Election can only be ended while active");

        electionState = ElectionState.Ended;
        electionEndTime = block.timestamp;

        emit ElectionEnded(block.timestamp, totalVotes);
    }

    // ---------------------------------------------------------------------
    // Voter functions (Requirements 5, 6, 7, 8)
    // ---------------------------------------------------------------------

    /**
     * @notice Cast one vote for a candidate.
     * @dev Checks, in order:
     *        1. election must be Active        (modifier, Requirement 5)
     *        2. wallet has not voted yet       (Requirement 6)
     *        3. candidate ID exists            (Requirement 7)
     *      A valid vote increments the candidate's count (Requirement 8).
     * @param candidateId ID of the candidate to vote for (0-based).
     */
    function vote(uint256 candidateId) external onlyWhenElectionIsActive {
        require(!hasVoted[msg.sender], "This wallet has already voted");
        require(candidateId < candidates.length, "Invalid candidate ID");

        // All state changes happen in one atomic transaction:
        // if anything reverts, nothing is saved (a failed vote never
        // marks the wallet as "voted").
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount += 1;
        totalVotes += 1;

        emit VoteCast(msg.sender, candidateId, candidates[candidateId].voteCount);
    }

    // ---------------------------------------------------------------------
    // View functions (Requirement 10) — free to call, read-only
    // ---------------------------------------------------------------------

    /// @notice Number of registered candidates.
    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /// @notice Get one candidate by ID. Reverts for invalid IDs.
    function getCandidate(uint256 candidateId) external view returns (Candidate memory) {
        require(candidateId < candidates.length, "Invalid candidate ID");
        return candidates[candidateId];
    }

    /// @notice Get all candidates with their current vote counts.
    function getAllCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @notice Full snapshot of the election status (handy for frontends).
     * @return currentState  Enum value: 0 = Registration, 1 = Active, 2 = Ended
     * @return stateLabel    Human-readable state name
     * @return isActive      True only while voting is possible
     * @return startedAt     Start timestamp (0 if not started)
     * @return endedAt       End timestamp (0 if not ended)
     * @return candidateCount Number of registered candidates
     * @return votesCast     Total valid votes so far
     */
    function getElectionStatus()
        external
        view
        returns (
            ElectionState currentState,
            string memory stateLabel,
            bool isActive,
            uint256 startedAt,
            uint256 endedAt,
            uint256 candidateCount,
            uint256 votesCast
        )
    {
        currentState = electionState;
        stateLabel = _stateLabel(electionState);
        isActive = (electionState == ElectionState.Active);
        startedAt = electionStartTime;
        endedAt = electionEndTime;
        candidateCount = candidates.length;
        votesCast = totalVotes;
    }

    /**
     * @notice Election results: every candidate's votes plus the leader.
     * @return candidatesWithVotes All candidates (id, name, ipfsCid, voteCount)
     * @return totalVotesCast      Total valid votes
     * @return leadingCandidateId  ID of the candidate with the most votes.
     *                             Equals type(uint256).max when no votes exist.
     * @return hasClearLeader      False if nobody voted or there is a tie.
     */
    function getResults()
        external
        view
        returns (
            Candidate[] memory candidatesWithVotes,
            uint256 totalVotesCast,
            uint256 leadingCandidateId,
            bool hasClearLeader
        )
    {
        candidatesWithVotes = candidates;
        totalVotesCast = totalVotes;

        leadingCandidateId = type(uint256).max; // sentinel = "no leader yet"
        uint256 leaderVotes = 0;
        bool isTie = false;

        for (uint256 i = 0; i < candidates.length; i++) {
            uint256 votes = candidates[i].voteCount;
            if (votes > leaderVotes) {
                leaderVotes = votes;
                leadingCandidateId = candidates[i].id;
                isTie = false;
            } else if (votes == leaderVotes && votes > 0) {
                isTie = true;
            }
        }

        hasClearLeader = (leadingCandidateId != type(uint256).max) && !isTie;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    function _stateLabel(ElectionState _state) private pure returns (string memory) {
        if (_state == ElectionState.Registration) return "Registration";
        if (_state == ElectionState.Active) return "Active";
        return "Ended";
    }
}