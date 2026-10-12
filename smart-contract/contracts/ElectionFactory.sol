// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./VotingSystem.sol";

contract ElectionFactory {
    address public owner;

    struct Election {
        uint256 id;
        address contractAddress;
        string name;
        string category;
        uint256 createdAt;
    }

    Election[] private elections;

    event ElectionCreated(
        address indexed electionAddress,
        address indexed admin,
        uint256 indexed electionId,
        string name,
        string category
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not factory owner");
        _;
    }

    function createElection(
        string calldata name,
        string calldata category
    ) external onlyOwner returns (address) {
        require(bytes(name).length > 0, "Election name required");
        require(bytes(category).length > 0, "Election category required");

        VotingSystem election = new VotingSystem(owner);

        uint256 electionId = elections.length;

        elections.push(
            Election({
                id: electionId,
                contractAddress: address(election),
                name: name,
                category: category,
                createdAt: block.timestamp
            })
        );

        emit ElectionCreated(
            address(election),
            owner,
            electionId,
            name,
            category
        );

        return address(election);
    }

    function getElectionCount()
        external
        view
        returns (uint256)
    {
        return elections.length;
    }

    function getElection(uint256 index)
        external
        view
        returns (Election memory)
    {
        require(index < elections.length, "Invalid election");
        return elections[index];
    }

    function getAllElections()
        external
        view
        returns (Election[] memory)
    {
        return elections;
    }
}