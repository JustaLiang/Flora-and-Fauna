// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ArmyInterface.sol";

contract Battlefield {
    uint public fieldRange;
    mapping (uint => uint[]) public fieldDefender;
    mapping (uint => bool) public fieldIsGreen;
    mapping (address => bool) commanderHaveField;
    ArmyInterface public greenArmy;
    ArmyInterface public redArmy;
    int public refStrength;

    event Conquest( address indexed conqueror,  
                    uint indexed fieldID,
                    uint[] team);

    constructor(address greenArmyAddr, address redArmyAddr) {
        fieldRange = 100;
        refStrength = 1000;
        greenArmy = ArmyInterface(greenArmyAddr);
        redArmy = ArmyInterface(redArmyAddr);
    }

    function greenConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(greenArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(!fieldIsGreen[fieldID]);
            _fight(greenArmy, attackerTeam, redArmy, defenderTeam);
            commanderHaveField[redArmy.ownerOf(defenderTeam[0])] = false;
        }
        fieldDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = true;
        commanderHaveField[msg.sender] = true;

        emit Conquest(msg.sender, fieldID, attackerTeam);
    }

    function redConquer(uint fieldID, uint[] calldata attackerTeam) external {
        require(fieldID < fieldRange && !commanderHaveField[msg.sender]);
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(redArmy.ownerOf(attackerTeam[i]) == msg.sender);
        }
        uint[] memory defenderTeam = fieldDefender[fieldID];
        if (defenderTeam.length > 0) {
            require(fieldIsGreen[fieldID]);
            _fight(redArmy, attackerTeam, greenArmy, defenderTeam);
            commanderHaveField[greenArmy.ownerOf(defenderTeam[0])] = false;
        }
        fieldDefender[fieldID] = attackerTeam;
        fieldIsGreen[fieldID] = false;
        commanderHaveField[msg.sender] = true;

        emit Conquest(msg.sender, fieldID, attackerTeam);
    }

    function _fight(ArmyInterface attacker, uint[] memory attackerTeam,
                    ArmyInterface defender, uint[] memory defenderTeam
                    ) private view {
        if (attackerTeam.length == defenderTeam.length) {
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aType,bool aArmed,,int aStrength) = attacker.getMinionInfo(attackerTeam[i]);
                (address dType,bool dArmed,,int dStrength) = defender.getMinionInfo(defenderTeam[i]);
                require(aArmed && (!dArmed || (aType == dType && aStrength > dStrength)));
            }
        }
        else if (attackerTeam.length == defenderTeam.length+1) {
            (address eType,bool eArmed,,int eStrength) = attacker.getMinionInfo(attackerTeam[defenderTeam.length]);
            require(eArmed);
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aType,bool aArmed,,int aStrength) = attacker.getMinionInfo(attackerTeam[i]);
                (address dType,bool dArmed,,int dStrength) = defender.getMinionInfo(defenderTeam[i]);                    
                require(aArmed && (!dArmed || (aType == dType && eType != dType &&
                                               aStrength*eStrength/refStrength > dStrength)));
            }
        }
        else {
            require(false);
        }
    }
}