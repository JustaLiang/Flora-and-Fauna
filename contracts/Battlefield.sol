// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BattleBase.sol";

interface RANK {
    function updateBranchPrefix(address, string calldata) external;
}

contract Battlefield is BattleBase, ERC721URIStorage, Ownable {

    //-- access ArmyRank
    RANK public floraRank;
    RANK public faunaRank;

    //-- vote
    struct Proposal {
        address proposer;
        string prefixURI;
        uint votes;
    }

    Proposal[] public proposals;
    mapping (uint => bool) public fieldHasVoted;
    uint public updateTime;
    uint public propInterval;
    uint public voteInterval;

    //-- token
    uint public generation;
    string public seriesName;

    //-- profit
    uint public slottingFee;

    //--- event
    event Propose(
        address indexed proposer,
        uint proposalID,
        string prefixURI
    );

    event Vote(
        uint indexed fieldID,
        address indexed voter,
        uint indexed proposalID,
        uint voteCount
    );

    event Winner(
        uint indexed generation,
        address indexed winner,
        string tokenURI,
        uint proposalCount,
        uint voteCount,
        uint fieldRange,
        bool floraWin,
        bool faunaWin
    );

    constructor(address floraArmyAddr, address faunaArmyAddr)
        BattleBase(floraArmyAddr, faunaArmyAddr)
        ERC721("Flora&Fauna Medal Styles", "F&F")
    {
        generation = 0;
        floraRank = RANK(floraArmy.rankContract());
        faunaRank = RANK(faunaArmy.rankContract());
        propInterval = 30 days;
        voteInterval = 5 days;
        seriesName = "series.json";
        slottingFee = 1e12 wei;
    }

    function propose(string calldata prefixURI) payable external propState {
        require(
            msg.value >= slottingFee,
            "Battlefield: not enough slotting fee");
        proposals.push(Proposal(msg.sender, prefixURI, 0));

        emit Propose(msg.sender, proposals.length-1, prefixURI);
    }

    function regainRightToVote(uint fieldID) external propState {
        require(
            fieldHasVoted[fieldID],
            "Battlefield: field already have the right to vote");
        fieldHasVoted[fieldID] = false;
    }

    function startVote() external propState {
        require(
            proposals.length > 1,
            "Battlefield: not enough proposals");
        uint currentTime = block.timestamp;
        require(
            currentTime >= updateTime + propInterval,
            "Battlefield: not yet to start vote");
        updateTime = currentTime;
        fieldLocked = true;
    }

    function vote(uint fieldID, uint proposalID) external voteState {
        require(
            !fieldHasVoted[fieldID],
            "Battlefield: field has voted");
        uint[] memory defenders = fieldDefenders[fieldID];
        require(
            defenders.length > 0,
            "Battlefield: empty field can't vote");
        if (isFloraField[fieldID]) {
            require(
                floraArmy.ownerOf(defenders[0]) == msg.sender,
                "Battlefield: not leader");
        }
        else {
            require(
                faunaArmy.ownerOf(defenders[0]) == msg.sender,
                "Battlefield: not leader");
        }
        Proposal storage target = proposals[proposalID];
        target.votes++;
        fieldHasVoted[fieldID] = true;

        emit Vote(fieldID, msg.sender, proposalID, target.votes);
    }

    function endVote() external voteState {
        uint currentTime = block.timestamp;
        require(
            currentTime >= updateTime + propInterval,
            "Battlefield: not yet to end vote");
        updateTime = currentTime;
        
        uint maxVote = 0;
        uint maxIdx = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].votes > maxVote) {
                maxVote = proposals[i].votes;
                maxIdx = i;
            }
        }

        Proposal memory winning = proposals[maxIdx];

        bool floraWin = false;
        bool faunaWin = false;
        if (floraFieldCount >= faunaFieldCount) {
            floraRank.updateBranchPrefix(address(0), winning.prefixURI);
            floraWin = true;
        }
        if (faunaFieldCount >= floraFieldCount) {
            faunaRank.updateBranchPrefix(address(0), winning.prefixURI);
            faunaWin = true;
        }

        _mint(winning.proposer, generation);
        _setTokenURI(generation, string(abi.encodePacked(winning.prefixURI, seriesName)));

        delete proposals;
        fieldLocked = false;

        emit Winner(generation,
                    winning.proposer,
                    tokenURI(generation),
                    proposals.length,
                    winning.votes,
                    fieldRange,
                    floraWin,
                    faunaWin);
        generation++;
    }

    function changePropInterval(uint propInterval_) external onlyOwner {
        propInterval = propInterval_;
    }

    function changeVoteInterval(uint voteInterval_) external onlyOwner {
        voteInterval = voteInterval_;
    }

    function changeSlottingFee(uint slottingFee_) external onlyOwner {
        slottingFee = slottingFee_;
    }

    function claimFunds(uint amount, address payable receiver) external onlyOwner {
        receiver.transfer(amount);
    }

    modifier voteState() {
        require(fieldLocked, "Battlefield: not in proposal state");
        _;
    }

    modifier propState() {
        require(!fieldLocked, "Battlefield: not in vote state");
        _;
    }
}