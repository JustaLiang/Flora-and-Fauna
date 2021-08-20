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
    ARMY public floraArmy;
    ARMY public faunaArmy;
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
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(floraArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(!fieldIsGreen[fieldID]);
            _fight(floraArmy, attackerTeam, faunaArmy, defenderTeam);
            commanderHaveField[faunaArmy.ownerOf(defenderTeam[0])] = false;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = true;
        commanderHaveField[msg.sender] = true;

        emit FieldState(fieldID, msg.sender, attackerTeam, true);
    }

    function faunaConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(faunaArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldToDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(fieldIsGreen[fieldID]);
            _fight(faunaArmy, attackerTeam, floraArmy, defenderTeam);
            commanderHaveField[floraArmy.ownerOf(defenderTeam[0])] = false;
        }
        else {
            require(attackerTeam.length == 1);
        }
        fieldToDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = false;
        commanderHaveField[msg.sender] = true;

        emit FieldState(fieldID, msg.sender, attackerTeam, false);
    }

    function floraRetreat(uint fieldID) external {
        uint[] memory defender = fieldToDefender[fieldID];
        require(defender.length > 0);
        require(fieldIsGreen[fieldID]);
        require(floraArmy.ownerOf(defender[0]) == msg.sender);
        fieldToDefender[fieldID] = new uint[](0);
        commanderHaveField[msg.sender] = false;

        emit FieldState(fieldID, address(0), fieldToDefender[fieldID], true);
    }

    function faunaRetreat(uint fieldID) external {
        uint[] memory defender = fieldToDefender[fieldID];
        require(defender.length > 0);
        require(!fieldIsGreen[fieldID]);
        require(faunaArmy.ownerOf(defender[0]) == msg.sender);
        fieldToDefender[fieldID] = new uint[](0);
        commanderHaveField[msg.sender] = false;

        emit FieldState(fieldID, address(0), fieldToDefender[fieldID], false);
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