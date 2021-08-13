// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ArmyInterface.sol";

interface ARMY is ArmyInterface {
    function serialNumber() external view returns (uint);
}

contract Battlefield {

    uint public fieldRange;
    mapping (uint => uint[]) public fieldToDefender;
    mapping (uint => bool) public fieldIsGreen;
    mapping (address => bool) public commanderHaveField;
    ARMY public greenArmy;
    ARMY public redArmy;
    int private _refStrength;

    event FieldState(uint indexed fieldID,
                     address indexed conqueror,
                     uint[] team,
                     bool isGreen);

    event FieldRange(uint fieldRange);

    constructor(address greenArmyAddr, address redArmyAddr) {
        fieldRange = 20;
        _refStrength = 1000;
        greenArmy = ARMY(greenArmyAddr);
        redArmy = ARMY(redArmyAddr);

        emit FieldRange(fieldRange);
    }

    function expand() external {
        require(greenArmy.serialNumber() + redArmy.serialNumber() > fieldRange*50);
        fieldRange += 20;

        emit FieldRange(fieldRange);
    }

    function getFieldDefender(uint fieldID) external view returns (uint[] memory) {
        uint[] memory defender = fieldToDefender[fieldID];
        return defender;
    }

    function greenConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(greenArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(!fieldIsGreen[fieldID]);
            _fight(greenArmy, attackerTeam, redArmy, defenderTeam);
            commanderHaveField[redArmy.ownerOf(defenderTeam[0])] = false;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = true;
        commanderHaveField[msg.sender] = true;

        emit FieldState(fieldID, msg.sender, attackerTeam, true);
    }

    function redConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(redArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(fieldIsGreen[fieldID]);
            _fight(redArmy, attackerTeam, greenArmy, defenderTeam);
            commanderHaveField[greenArmy.ownerOf(defenderTeam[0])] = false;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = false;
        commanderHaveField[msg.sender] = true;

        emit FieldState(fieldID, msg.sender, attackerTeam, false);
    }

    function greenRetreat(uint fieldID) external {
        uint[] memory defender = fieldToDefender[fieldID];
        require(defender.length > 0);
        require(fieldIsGreen[fieldID]);
        require(greenArmy.ownerOf(defender[0]) == msg.sender);
        fieldToDefender[fieldID] = new uint[](0);
        commanderHaveField[msg.sender] = false;

        emit FieldState(fieldID, address(0), fieldToDefender[fieldID], true);
    }

    function redRetreat(uint fieldID) external {
        uint[] memory defender = fieldToDefender[fieldID];
        require(defender.length > 0);
        require(!fieldIsGreen[fieldID]);
        require(redArmy.ownerOf(defender[0]) == msg.sender);
        fieldToDefender[fieldID] = new uint[](0);
        commanderHaveField[msg.sender] = false;

        emit FieldState(fieldID, address(0), fieldToDefender[fieldID], false);
    }

    function _fight(ArmyInterface attacker, uint[] memory attackerTeam,
                    ArmyInterface defender, uint[] memory defenderTeam
                    ) private view {
        if (attackerTeam.length == defenderTeam.length-1) {
            (address eBranch,bool eArmed,,int eStrength) = defender.getMinionInfo(defenderTeam[0]);
            int dBuff;
            if (!eArmed) {
                dBuff = 0;
            }
            else {
                dBuff = eStrength - _refStrength;
            }
            for (uint i = 0; i < attackerTeam.length; i++) {
                (address aBranch,bool aArmed,,int aStrength) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dStrength) = defender.getMinionInfo(defenderTeam[i+1]);                    
                require(aArmed && aBranch == dBranch); 
                require(!dArmed || aStrength > dStrength + dBuff);
            }            
        }
        else if (attackerTeam.length == defenderTeam.length) {
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aStrength) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dStrength) = defender.getMinionInfo(defenderTeam[i]);
                require(aArmed && aBranch == dBranch);
                require(!dArmed || aStrength > dStrength);
            }
        }
        else if (attackerTeam.length == defenderTeam.length+1) {
            (address eBranch,bool eArmed,,int eStrength) = attacker.getMinionInfo(attackerTeam[defenderTeam.length]);
            require(eArmed);
            int aBuff = eStrength - _refStrength;
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aStrength) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dStrength) = defender.getMinionInfo(defenderTeam[i]);                    
                require(aArmed && aBranch == dBranch && eBranch != dBranch);
                require(!dArmed || aStrength + aBuff > dStrength);
            }
        }
        else {
            require(false);
        }
    }
}