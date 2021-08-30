// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./BattleBase.sol";

interface RANK {
    function updateBranchPrefix(address, string calldata) external;
}

/**
 * @title Battlefield of fighting for next generation
 * @notice Define voting system on battlefield
 * @author Justa Liang
 */
contract Battlefield is BattleBase, ERC721URIStorage {

    /// @notice Corresponding FloraRank contract
    RANK public floraRank;

    /// @notice Corresponding FaunaRank contract
    RANK public faunaRank;

    /// @dev Proposal contents
    struct Proposal {
        address proposer;
        string prefixURI;
        uint voteCount;
    }

    /// @notice All the proposals
    Proposal[] public proposals;

    /// @notice Latest generation in which field has voted
    mapping (uint => uint) public fieldGeneration;

    /// @notice Latest time updated for proposal or vote
    uint public updateTime;

    /// @notice Time interval of proposal state
    uint public propInterval;

    /// @notice Time interval of vote state
    uint public voteInterval;

    /// @notice One generation means going through proposal and vote
    uint public generation;

    /// @notice Name of assembly metadata of the medal designs 
    string public assemblyJson;

    /// @notice Slotting fee for making a proposal
    uint public slottingFee;

    /// @notice Emit when someone propose
    event Propose(
        address indexed proposer,
        uint proposalID,
        string prefixURI
    );

    /// @notice Emit when someone vote behalf of field
    event Vote(
        uint indexed fieldID,
        address indexed voter,
        uint indexed proposalID,
        uint voteCount
    );

    /// @notice Emit the winning proposal's info
    event Winner(
        uint indexed generation,
        address indexed winner,
        string tokenURI,
        uint proposalCount,
        uint voteCount,
        uint totalArea,
        bool floraWin,
        bool faunaWin
    );

    /**
     * @dev Set addresses of interactive contracts
     * @param floraArmyAddr Address of FloraArmy contract
     * @param faunaArmyAddr Address of FaunaArmy contract
    */
    constructor(address floraArmyAddr, address faunaArmyAddr)
        BattleBase(floraArmyAddr, faunaArmyAddr)
        ERC721("Flora&Fauna Battlefield", "F&F-BTF")
    {
        generation = 1;
        floraRank = RANK(floraArmy.rankContract());
        faunaRank = RANK(faunaArmy.rankContract());
        propInterval = 30 days;
        voteInterval = 5 days;
        assemblyJson = "series.json";
        slottingFee = 1e12 wei;
    }

    /**
     * @notice Get details of all proposals
     * @return Details of all proposals
    */
    function getAllProposalInfo() external view
                returns (Proposal[] memory) {
        return proposals;
    }

    /**
     * @notice Propose for new style of medals
     * @param prefixURI Prefix of the URI
    */
    function propose(string calldata prefixURI) payable external propState {
        require(
            msg.value >= slottingFee,
            "Battlefield: not enough slotting fee");
        proposals.push(Proposal(msg.sender, prefixURI, 0));

        emit Propose(msg.sender, proposals.length-1, prefixURI);
    }

    /**
     * @notice Start the vote state
    */
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

    /**
     * @notice Vote behalf of certain field
     * @param fieldID ID of the field
     * @param proposalID ID of the proposal
    */
    function vote(uint fieldID, uint proposalID) external voteState {
        require(
            fieldGeneration[fieldID] < generation,
            "Battlefield: field has voted in this generation");
        uint[] memory defender = fieldDefender[fieldID];
        require(
            defender.length > 0,
            "Battlefield: empty field can't vote");
        if (isFloraField[fieldID]) {
            require(
                floraArmy.ownerOf(defender[0]) == msg.sender,
                "Battlefield: not leader");
            require(
                floraFieldCount >= faunaFieldCount,
                "Battlefield: you're loser side");
        }
        else {
            require(
                faunaArmy.ownerOf(defender[0]) == msg.sender,
                "Battlefield: not leader");
            require(
                faunaFieldCount >= floraFieldCount,
                "Battlefield: you're loser side");

        }
        Proposal storage target = proposals[proposalID];
        target.voteCount++;
        fieldGeneration[fieldID] = generation;

        emit Vote(fieldID, msg.sender, proposalID, target.voteCount);
    }

    /**
     * @notice End the vote state, change medal styles and mint an assembly metadata to winner
    */
    function endVote() external voteState {
        uint currentTime = block.timestamp;
        require(
            currentTime >= updateTime + voteInterval,
            "Battlefield: not yet to end vote");
        updateTime = currentTime;
        
        uint maxVote = 0;
        uint maxIdx = 0;
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVote) {
                maxVote = proposals[i].voteCount;
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
        _setTokenURI(generation, string(abi.encodePacked(winning.prefixURI, assemblyJson)));

        delete proposals;
        fieldLocked = false;

        emit Winner(generation,
                    winning.proposer,
                    tokenURI(generation),
                    proposals.length,
                    winning.voteCount,
                    totalArea,
                    floraWin,
                    faunaWin);
        generation++;
    }

    /// @dev Check if under vote state
    modifier voteState() {
        require(fieldLocked, "Battlefield: not in proposal state");
        _;
    }

    /// @dev Check if under proposal state
    modifier propState() {
        require(!fieldLocked, "Battlefield: not in vote state");
        _;
    }

    /**
     * @dev Claim the funds from slotting fee
     * @param amount Amount of Ether
     * @param receiver Address of receiver
    */    
    function claimFunds(uint amount, address payable receiver) external onlyOwner {
        receiver.transfer(amount);
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

    function changeAssemblyJson(string calldata assemblyJson_) external onlyOwner {
        assemblyJson = assemblyJson_;
    }
}