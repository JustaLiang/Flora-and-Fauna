// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract BattleProposal {

    mapping (uint => bool) fieldHasVoted;
    mapping (address => string[]) branchProposals;
    mapping (address => uint[]) branchVotes;
    mapping (address => uint) branchUpdateTimes;
    mapping (address => bool) branchEnableVote;

    event Propose(
        address indexed proposer,
        address indexed branchAddress,
        string branchPrefix
    );

    function propose(address branch, string calldata prefix) external propState(branch) {
        branchProposals[branch].push(prefix);
        branchVotes[branch].push(0);

        emit Propose(msg.sender, branch, prefix);
    }

    function startVote(address branch) external propState(branch) {
        require(branchProposals[branch].length > 0);
        uint currentTime = block.timestamp;
        require(currentTime >= branchUpdateTimes[branch] + 28 days);
        branchUpdateTimes[branch] = currentTime;
        branchEnableVote[branch] = true;
    }

    modifier voteState(address branch) {
        require(branchEnableVote[branch]);
        require(branchProposals[branch].length > 0);
        _;
    }

    modifier propState(address branch) {
        require(!branchEnableVote[branch]);
        _;
    }
}