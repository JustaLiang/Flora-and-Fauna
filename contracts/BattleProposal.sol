// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract BattleProposal {

    struct Proposal {
        address branchAddr;
        string branchPrefix;
    }

    uint updateTime;
    bool public enableProposal;
    Proposal[] public proposals;
    uint[] public votes;
    mapping (uint =>  bool) fieldHasVoted;

    event Propose(
        address indexed proposer,
        address indexed branchAddr,
        string branchPrefix  
    );

    constructor() {
        updateTime = block.timestamp;
        enableProposal = true;
    }

    function propose(address branchAddr, string calldata branchPrefix) external {
        require(enableProposal);
        proposals.push(Proposal(branchAddr, branchPrefix));
        votes.push(0);

        emit Propose(msg.sender, branchAddr, branchPrefix);
    }
}