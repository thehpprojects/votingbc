// test/VotingSystem.test.js
// Complete test suite for the VotingSystem smart contract.
// Every test block is labeled with the requirement(s) it verifies.

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers");

// Mirror of the ElectionState enum in the contract
const State = {
  Registration: 0,
  Active: 1,
  Ended: 2,
};

describe("VotingSystem", function () {
  let voting; // deployed contract instance
  let admin; // deployer -> contract owner
  let alice, bob, carol; // regular voter wallets

  // Placeholder IPFS CIDs for testing (use real CIDs in production)
  const CANDIDATE_DATA = [
    { name: "Alice Johnson", cid: "QmAliceCandidateIpfsCid" },
    { name: "Bob Smith", cid: "QmBobCandidateIpfsCid" },
    { name: "Carol Lee", cid: "QmCarolCandidateIpfsCid" },
  ];

  // Fresh deployment before EVERY test so tests stay independent.
  beforeEach(async function () {
    [admin, alice, bob, carol] = await ethers.getSigners();

    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    voting = await VotingSystem.deploy();
    await voting.waitForDeployment();
  });

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  /** Admin registers all three test candidates. */
  async function addAllCandidates() {
    for (const c of CANDIDATE_DATA) {
      await voting.addCandidate(c.name, c.cid);
    }
  }

  /** Register candidates and start the election. */
  async function startElectionWithCandidates() {
    await addAllCandidates();
    await voting.startElection();
  }

  // -------------------------------------------------------------------
  // Requirement 1: the deployer is the admin
  // -------------------------------------------------------------------
  describe("Deployment (Requirement 1)", function () {
    it("sets the deployer as admin (owner)", async function () {
      expect(await voting.owner()).to.equal(admin.address);
    });

    it("starts in Registration state with zero candidates and zero votes", async function () {
      expect(await voting.electionState()).to.equal(State.Registration);
      expect(await voting.getCandidateCount()).to.equal(0);
      expect(await voting.totalVotes()).to.equal(0);
    });
  });

  // -------------------------------------------------------------------
  // Requirements 2 & 3: only admin adds candidates; candidate fields
  // -------------------------------------------------------------------
  describe("Candidate management (Requirements 2 & 3)", function () {
    it("lets the admin add candidates with sequential IDs and zero votes", async function () {
      await addAllCandidates();
      expect(await voting.getCandidateCount()).to.equal(3);

      for (let i = 0; i < CANDIDATE_DATA.length; i++) {
        const c = await voting.getCandidate(i);
        expect(c.id).to.equal(i);
        expect(c.name).to.equal(CANDIDATE_DATA[i].name);
        expect(c.ipfsCid).to.equal(CANDIDATE_DATA[i].cid);
        expect(c.voteCount).to.equal(0);
      }
    });

    it("emits CandidateAdded with the correct data (Requirement 11)", async function () {
      await expect(voting.addCandidate("Alice Johnson", "QmAliceCid"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(0, "Alice Johnson", "QmAliceCid");
    });

    it("prevents non-admins from adding candidates", async function () {
      await expect(voting.connect(alice).addCandidate("Mallory", "QmEvilCid"))
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(alice.address);
    });

    it("rejects empty name or empty IPFS CID", async function () {
      await expect(voting.addCandidate("", "QmSomeCid")).to.be.revertedWith(
        "Candidate name cannot be empty",
      );
      await expect(voting.addCandidate("Alice", "")).to.be.revertedWith(
        "IPFS CID cannot be empty",
      );
    });

    it("does not allow adding candidates once the election has started", async function () {
      await startElectionWithCandidates();
      await expect(
        voting.addCandidate("Late Larry", "QmLateCid"),
      ).to.be.revertedWith(
        "Candidates can only be added before the election starts",
      );
    });
  });

  // -------------------------------------------------------------------
  // Requirement 4: only admin starts the election
  // -------------------------------------------------------------------
  describe("Starting the election (Requirements 4 & 11)", function () {
    it("lets the admin start the election and emits ElectionStarted", async function () {
      await addAllCandidates();
      // Timestamp varies per block, so we just verify the event fired
      await expect(voting.startElection()).to.emit(voting, "ElectionStarted");

      expect(await voting.electionState()).to.equal(State.Active);
      expect(await voting.electionStartTime()).to.be.greaterThan(0);

      const status = await voting.getElectionStatus();
      expect(status.isActive).to.equal(true);
      expect(status.stateLabel).to.equal("Active");
    });

    it("prevents non-admins from starting the election", async function () {
      await addAllCandidates();
      await expect(voting.connect(alice).startElection())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(alice.address);
    });

    it("cannot start an election with zero candidates", async function () {
      await expect(voting.startElection()).to.be.revertedWith(
        "Cannot start election without candidates",
      );
    });

    it("cannot start the election twice", async function () {
      await startElectionWithCandidates();
      await expect(voting.startElection()).to.be.revertedWith(
        "Election has already started or ended",
      );
    });
  });

  // -------------------------------------------------------------------
  // Requirements 5, 6, 7, 8: voting rules
  // -------------------------------------------------------------------
  describe("Voting (Requirements 5, 6, 7, 8, 11)", function () {
    it("accepts a valid vote, increments the count and emits VoteCast", async function () {
      await startElectionWithCandidates();

      await expect(voting.connect(alice).vote(0))
        .to.emit(voting, "VoteCast")
        .withArgs(alice.address, 0, 1); // voter, candidate ID, new vote count

      const candidate = await voting.getCandidate(0);
      expect(candidate.voteCount).to.equal(1);
      expect(await voting.totalVotes()).to.equal(1);
      expect(await voting.hasVoted(alice.address)).to.equal(true);
      expect(await voting.hasVoted(bob.address)).to.equal(false);
    });

    it("counts votes from multiple voters correctly", async function () {
      await startElectionWithCandidates();

      await voting.connect(alice).vote(0); // candidate 0
      await voting.connect(bob).vote(0); // candidate 0
      await voting.connect(carol).vote(2); // candidate 2
      await voting.connect(admin).vote(1); // the admin is also allowed ONE vote

      expect((await voting.getCandidate(0)).voteCount).to.equal(2);
      expect((await voting.getCandidate(1)).voteCount).to.equal(1);
      expect((await voting.getCandidate(2)).voteCount).to.equal(1);
      expect(await voting.totalVotes()).to.equal(4);
    });

    it("rejects votes before the election has started (Requirement 5)", async function () {
      await addAllCandidates(); // still in Registration
      await expect(voting.connect(alice).vote(0)).to.be.revertedWith(
        "Election is not active",
      );
    });

    it("rejects a second vote from the same wallet (Requirement 6)", async function () {
      await startElectionWithCandidates();

      await voting.connect(alice).vote(0);

      // Same candidate...
      await expect(voting.connect(alice).vote(0)).to.be.revertedWith(
        "This wallet has already voted",
      );
      // ...or a different one: one wallet, one vote, period.
      await expect(voting.connect(alice).vote(1)).to.be.revertedWith(
        "This wallet has already voted",
      );
    });

    it("rejects invalid candidate IDs (Requirement 7)", async function () {
      await startElectionWithCandidates(); // 3 candidates -> valid IDs: 0, 1, 2

      await expect(voting.connect(alice).vote(3)).to.be.revertedWith(
        "Invalid candidate ID",
      );
      await expect(voting.connect(bob).vote(999)).to.be.revertedWith(
        "Invalid candidate ID",
      );
    });

    it("a failed vote does NOT mark the wallet as having voted", async function () {
      await startElectionWithCandidates();

      await expect(voting.connect(alice).vote(42)).to.be.reverted;

      expect(await voting.hasVoted(alice.address)).to.equal(false);

      // Alice can still cast a valid vote afterwards.
      await voting.connect(alice).vote(1);
      expect(await voting.hasVoted(alice.address)).to.equal(true);
    });
  });

  // -------------------------------------------------------------------
  // Requirement 4 (ending) + Requirement 5 (no voting after end)
  // -------------------------------------------------------------------
  describe("Ending the election (Requirements 4, 5, 11)", function () {
    it("lets the admin end an active election and emits ElectionEnded", async function () {
      await startElectionWithCandidates();
      await voting.connect(alice).vote(1);
      await voting.connect(bob).vote(1);
      // Timestamp varies per block, so we just verify the event fired
      await expect(voting.endElection()).to.emit(voting, "ElectionEnded");

      expect(await voting.electionState()).to.equal(State.Ended);
      expect(await voting.electionEndTime()).to.be.greaterThan(0);
    });

    it("prevents non-admins from ending the election", async function () {
      await startElectionWithCandidates();
      await expect(voting.connect(alice).endElection())
        .to.be.revertedWithCustomError(voting, "OwnableUnauthorizedAccount")
        .withArgs(alice.address);
    });

    it("cannot end the election before it has started", async function () {
      await expect(voting.endElection()).to.be.revertedWith(
        "Election can only be ended while active",
      );
    });

    it("cannot end the election twice", async function () {
      await startElectionWithCandidates();
      await voting.endElection();
      await expect(voting.endElection()).to.be.revertedWith(
        "Election can only be ended while active",
      );
    });

    it("rejects votes after the election has ended (Requirement 5)", async function () {
      await startElectionWithCandidates();
      await voting.endElection();
      await expect(voting.connect(alice).vote(0)).to.be.revertedWith(
        "Election is not active",
      );
    });

    it("cannot restart the election after it has ended", async function () {
      await startElectionWithCandidates();
      await voting.endElection();
      await expect(voting.startElection()).to.be.revertedWith(
        "Election has already started or ended",
      );
    });
  });

  // -------------------------------------------------------------------
  // Requirement 10: view functions
  // -------------------------------------------------------------------
  describe("View functions (Requirement 10)", function () {
    it("getAllCandidates returns every candidate with full data", async function () {
      await addAllCandidates();

      const all = await voting.getAllCandidates();
      expect(all.length).to.equal(3);
      expect(all[2].name).to.equal("Carol Lee");
      expect(all[2].ipfsCid).to.equal("QmCarolCandidateIpfsCid");
      expect(all[2].voteCount).to.equal(0);
    });

    it("getCandidate rejects out-of-range IDs", async function () {
      await expect(voting.getCandidate(0)).to.be.revertedWith(
        "Invalid candidate ID",
      );
    });

    it("getElectionStatus reflects the full lifecycle", async function () {
      // 1) Registration
      let status = await voting.getElectionStatus();
      expect(status.currentState).to.equal(State.Registration);
      expect(status.stateLabel).to.equal("Registration");
      expect(status.isActive).to.equal(false);

      // 2) Active
      await startElectionWithCandidates();
      status = await voting.getElectionStatus();
      expect(status.currentState).to.equal(State.Active);
      expect(status.isActive).to.equal(true);
      expect(status.candidateCount).to.equal(3);
      expect(status.votesCast).to.equal(0);

      // 3) Ended
      await voting.connect(alice).vote(0);
      await voting.endElection();
      status = await voting.getElectionStatus();
      expect(status.currentState).to.equal(State.Ended);
      expect(status.stateLabel).to.equal("Ended");
      expect(status.isActive).to.equal(false);
      expect(status.votesCast).to.equal(1);
    });

    it("getResults reports counts, total and the leading candidate", async function () {
      await startElectionWithCandidates();
      await voting.connect(alice).vote(1);
      await voting.connect(bob).vote(1);
      await voting.connect(carol).vote(0);

      const [candidatesWithVotes, totalVotesCast, leadingId, hasClearLeader] =
        await voting.getResults();

      expect(totalVotesCast).to.equal(3);
      expect(candidatesWithVotes[0].voteCount).to.equal(1);
      expect(candidatesWithVotes[1].voteCount).to.equal(2);
      expect(candidatesWithVotes[2].voteCount).to.equal(0);
      expect(leadingId).to.equal(1);
      expect(hasClearLeader).to.equal(true);
    });

    it("getResults flags a tie instead of declaring a winner", async function () {
      await startElectionWithCandidates();
      await voting.connect(alice).vote(0);
      await voting.connect(bob).vote(1);

      const [, , leadingId, hasClearLeader] = await voting.getResults();
      expect(hasClearLeader).to.equal(false);
      expect(leadingId).to.equal(0); // first candidate holding the max votes
    });

    it("getResults reports no leader when no votes were cast", async function () {
      await startElectionWithCandidates();

      const [, totalVotesCast, leadingId, hasClearLeader] =
        await voting.getResults();
      expect(totalVotesCast).to.equal(0);
      expect(hasClearLeader).to.equal(false);
      expect(leadingId).to.equal(ethers.MaxUint256); // sentinel = "no leader"
    });
  });

  // -------------------------------------------------------------------
  // Requirement 9: votes are immutable, even for the admin
  // -------------------------------------------------------------------
  describe("Vote immutability (Requirement 9)", function () {
    it("exposes no function that could modify or delete votes/candidates", async function () {
      // If any of these functions existed in the ABI, admin (or anyone)
      // could tamper with results. The contract must not compile with them.
      const forbiddenFunctions = [
        "setVoteCount",
        "setVotes",
        "resetVotes",
        "clearVotes",
        "resetElection",
        "removeCandidate",
        "deleteCandidate",
        "updateCandidate",
        "transferVotes",
      ];

      for (const fn of forbiddenFunctions) {
        expect(
          voting.interface.getFunction(fn),
          `unexpected mutator found in ABI: ${fn}`,
        ).to.be.null;
      }
    });

    it("keeps recorded votes intact even after the election ends", async function () {
      await startElectionWithCandidates();
      await voting.connect(alice).vote(2);
      await voting.endElection();

      const candidate = await voting.getCandidate(2);
      expect(candidate.voteCount).to.equal(1);
      expect(await voting.totalVotes()).to.equal(1);
    });

    it("the admin is also limited to a single vote", async function () {
      await startElectionWithCandidates();

      await voting.connect(admin).vote(0);
      await expect(voting.connect(admin).vote(1)).to.be.revertedWith(
        "This wallet has already voted",
      );
    });
  });
});
