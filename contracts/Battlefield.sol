// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ArmyInterface.sol";
import "./BattleProposal.sol";

interface ARMY is ArmyInterface {
    function serialNumber() external view returns (uint);
    function rankContract() external view returns (address);
}

interface RANK {
    function updateBranchPrefix(address, string calldata) external;
}

contract Battlefield is BattleProposal {

    uint public fieldRange;
    mapping (uint => uint[]) public fieldToDefender;
    mapping (uint => bool) public fieldIsGreen;
    mapping (address => bool) public commanderHasField;
    ARMY public floraArmy;
    ARMY public faunaArmy;
    RANK public floraRank;
    RANK public faunaRank;
    uint public floraFieldCount;
    uint public faunaFieldCount;
    int private _refPower;

    event FieldState(uint indexed fieldID,
                     address indexed conqueror,
                     uint[] team,
                     bool isGreen);

    event FieldRange(uint fieldRange);

    constructor(address floraArmyAddr, address faunaArmyAddr) {
        fieldRange = 20;
        _refPower = 1000;
        floraArmy = ARMY(floraArmyAddr);
        faunaArmy = ARMY(faunaArmyAddr);
        floraRank = RANK(floraArmy.rankContract());
        faunaRank = RANK(faunaArmy.rankContract());
        floraFieldCount = 0;
        faunaFieldCount = 0;

        emit FieldRange(fieldRange);
    }

    function expand() external {
        require(floraArmy.serialNumber() + faunaArmy.serialNumber() > fieldRange*50);
        fieldRange += 20;

        emit FieldRange(fieldRange);
    }

    function getFieldDefender(uint fieldID) external view returns (uint[] memory) {
        uint[] memory defender = fieldToDefender[fieldID];
        return defender;
    }

    function floraConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange);
        require(!commanderHasField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(floraArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(!fieldIsGreen[fieldID]);
            _fight(floraArmy, attackerTeam, faunaArmy, defenderTeam);
            commanderHasField[faunaArmy.ownerOf(defenderTeam[0])] = false;
            faunaFieldCount--;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = true;
        fieldHasVoted[fieldID] = false;
        commanderHasField[msg.sender] = true;
        floraFieldCount++;

        emit FieldState(fieldID, msg.sender, attackerTeam, true);
    }

    function faunaConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange);
        require(!commanderHasField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(faunaArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(fieldIsGreen[fieldID]);
            _fight(faunaArmy, attackerTeam, floraArmy, defenderTeam);
            commanderHasField[floraArmy.ownerOf(defenderTeam[0])] = false;
            floraFieldCount--;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = false;
        fieldHasVoted[fieldID] = false;
        commanderHasField[msg.sender] = true;
        faunaFieldCount++;

        emit FieldState(fieldID, msg.sender, attackerTeam, false);
    }

    function floraVote(address branch, uint proposalID, uint fieldID)
            external voteState(branch) {
        require(!fieldHasVoted[fieldID]);
        require(floraArmy.ownerOf(fieldToDefender[fieldID][0]) == msg.sender);
        branchVotes[branch][proposalID]++;
        fieldHasVoted[fieldID] = true;
    }

    function faunaVote(address branch, uint proposalID, uint fieldID)
            external voteState(branch) {
        require(!fieldHasVoted[fieldID]);
        require(faunaArmy.ownerOf(fieldToDefender[fieldID][0]) == msg.sender);
        branchVotes[branch][proposalID]++;        
        fieldHasVoted[fieldID] = true;
    }

    function endVote(address branch) external voteState(branch) {
        uint currentTime = block.timestamp;
        require(currentTime >= branchUpdateTimes[branch] + 7 days);
        branchUpdateTimes[branch] = currentTime;
        
        uint maxVote = 0;
        uint maxIdx = 0;
        uint[] memory votes = branchVotes[branch];
        for (uint i = 0; i < votes.length; i++) {
            if (votes[i] > maxVote) {
                maxVote = votes[i];
                maxIdx = i;
            }
        }

        string memory resultPrefix = branchProposals[branch][maxIdx];

        if (floraFieldCount >= faunaFieldCount) {
            floraRank.updateBranchPrefix(branch, resultPrefix);
        }
        if (faunaFieldCount >= floraFieldCount) {
            faunaRank.updateBranchPrefix(branch, resultPrefix);
        }

        delete branchProposals[branch];
        delete branchVotes[branch];
        branchEnableVote[branch] = false;
    }

    function _fight(ArmyInterface attacker, uint[] memory attackerTeam,
                    ArmyInterface defender, uint[] memory defenderTeam
                    ) private view {
        if (attackerTeam.length == defenderTeam.length-1) {
            (address eBranch,bool eArmed,,int ePower) = defender.getMinionInfo(defenderTeam[0]);
            int dBuff;
            if (!eArmed) {
                dBuff = 0;
            }
            else {
                dBuff = ePower - _refPower;
            }
            for (uint i = 0; i < attackerTeam.length; i++) {
                (address aBranch,bool aArmed,,int aPower) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dPower) = defender.getMinionInfo(defenderTeam[i+1]);                    
                require(aArmed && aBranch == dBranch); 
                require(!dArmed || aPower > dPower + dBuff);
            }            
        }
        else if (attackerTeam.length == defenderTeam.length) {
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aPower) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dPower) = defender.getMinionInfo(defenderTeam[i]);
                require(aArmed && aBranch == dBranch);
                require(!dArmed || aPower > dPower);
            }
        }
        else if (attackerTeam.length == defenderTeam.length+1) {
            (address eBranch,bool eArmed,,int ePower) = attacker.getMinionInfo(attackerTeam[defenderTeam.length]);
            require(eArmed);
            int aBuff = ePower - _refPower;
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aPower) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dPower) = defender.getMinionInfo(defenderTeam[i]);                    
                require(aArmed && aBranch == dBranch && eBranch != dBranch);
                require(!dArmed || aPower + aBuff > dPower);
            }
        }
        else {
            require(false);
        }
    }
}