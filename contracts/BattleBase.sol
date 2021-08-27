// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/ArmyInterface.sol";

interface ARMY is ArmyInterface {
    function serialNumber() external view returns (uint);
    function rankContract() external view returns (address);
}

abstract contract BattleBase {

    bool public fieldLocked;
    uint public fieldRange;
    mapping (uint => uint[]) public fieldDefenders;
    mapping (uint => bool) public isFloraField;
    mapping (uint => bool) public floraOnField;
    mapping (uint => bool) public faunaOnField;
    ARMY public floraArmy;
    ARMY public faunaArmy;
    uint public floraFieldCount;
    uint public faunaFieldCount;
    int private _refPower;

    event FieldState(uint indexed fieldID,
                     address indexed conqueror,
                     bool indexed isGreen,
                     uint[] team);

    event FieldRange(uint fieldRange);

    constructor(address floraArmyAddr, address faunaArmyAddr) {
        fieldLocked = false;
        fieldRange = 20;
        _refPower = 1000;
        floraArmy = ARMY(floraArmyAddr);
        faunaArmy = ARMY(faunaArmyAddr);
        floraFieldCount = 0;
        faunaFieldCount = 0;

        emit FieldRange(fieldRange);
    }

    function expand() external {
        require(
            floraArmy.serialNumber() + faunaArmy.serialNumber() > fieldRange*5,
            "Battlefield: not enough army");
        fieldRange += 20;

        emit FieldRange(fieldRange);
    }

    function getFieldDefender(uint fieldID) external view returns (uint[] memory) {
        uint[] memory defender = fieldDefenders[fieldID];
        return defender;
    }

    function floraConquer(uint fieldID, uint[] calldata attackerTeam) external preCheck(fieldID) {
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(
                !floraOnField[attackerTeam[i]],
                "Battlefield: the flora minion already on field");
            require(
                floraArmy.ownerOf(attackerTeam[i]) == msg.sender,
                "Battlefield: not the commander of the flora minion");
        }
        uint[] memory defenderTeam = fieldDefenders[fieldID];
        if (defenderTeam.length > 0) {
            if (isFloraField[fieldID]) {
                _fight(floraArmy, attackerTeam, floraArmy, defenderTeam);
                _removeFlora(defenderTeam);
                _addFlora(attackerTeam);
            }
            else {
                _fight(floraArmy, attackerTeam, faunaArmy, defenderTeam);
                _removeFauna(defenderTeam);
                faunaFieldCount--;
                _addFlora(attackerTeam);
                floraFieldCount++;
            }
        }
        else {
            require(
                attackerTeam.length == 1,
                "Battlefield: must conquer empty field with only one flora minion");
            _addFlora(attackerTeam);
            floraFieldCount++;
        }
        fieldDefenders[fieldID] = attackerTeam;
        isFloraField[fieldID] = true;

        emit FieldState(fieldID, msg.sender, true, attackerTeam);
    }

    function faunaConquer(uint fieldID, uint[] calldata attackerTeam) external preCheck(fieldID) {
        for(uint i = 0; i < attackerTeam.length; i++) {
            require(
                !faunaOnField[attackerTeam[i]],
                "Battlefield: the fauna minion already on field");
            require(
                faunaArmy.ownerOf(attackerTeam[i]) == msg.sender,
                "Battlefield: not the commander of the fauna minion");
        }
        uint[] memory defenderTeam = fieldDefenders[fieldID];
        if (defenderTeam.length > 0) {
            if (isFloraField[fieldID]) {
                _fight(faunaArmy, attackerTeam, floraArmy, defenderTeam);
                _removeFlora(defenderTeam);
                floraFieldCount--;
                _addFauna(attackerTeam);
                faunaFieldCount++;
            }
            else {
                _fight(faunaArmy, attackerTeam, faunaArmy, defenderTeam);
                _removeFauna(defenderTeam);
                _addFauna(attackerTeam);
            } 
        }
        else {
            require(
                attackerTeam.length == 1,
                "Battlefield: must conquer empty field with only one fauna minion");
            _addFauna(attackerTeam);
            faunaFieldCount++;
        }
        fieldDefenders[fieldID] = attackerTeam;
        isFloraField[fieldID] = false;

        emit FieldState(fieldID, msg.sender, false, attackerTeam);
    }

    function retreat(uint fieldID) external {
        uint[] memory defenders = fieldDefenders[fieldID];
        require(
            defenders.length > 0,
            "Battlefield: retreat from empty field");
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
        delete fieldDefenders[fieldID];

        emit FieldState(fieldID, address(0), isFloraField[fieldID], fieldDefenders[fieldID]);
    }

    modifier preCheck(uint fieldID) {
        require(
            !fieldLocked,
            "Battlefield: battlefield is locked now");
        require(
            fieldID < fieldRange,
            "Battlefield: field out of range");
        _;
    }

    function _fight(ArmyInterface attacker, uint[] memory attackerTeam,
                    ArmyInterface defender, uint[] memory defenderTeam
                    ) private view {
        if (attackerTeam.length == defenderTeam.length-1 && attackerTeam.length != 0) {
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
                require(
                    aArmed && aBranch == dBranch,
                    "Battlefield: minion not qualified"); 
                require(
                    !dArmed || aPower > dPower + dBuff,
                    "Battlefield: defeated");
            }            
        }
        else if (attackerTeam.length == defenderTeam.length) {
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aPower) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dPower) = defender.getMinionInfo(defenderTeam[i]);
                require(
                    aArmed && aBranch == dBranch,
                    "Battlefield: minion not qualified");
                require(
                    !dArmed || aPower > dPower,
                    "Battlefield: defeated");
            }
        }
        else if (attackerTeam.length == defenderTeam.length+1) {
            (address eBranch,bool eArmed,,int ePower) = attacker.getMinionInfo(attackerTeam[defenderTeam.length]);
            require(eArmed);
            int aBuff = ePower - _refPower;
            for (uint i = 0; i < defenderTeam.length; i++) {
                (address aBranch,bool aArmed,,int aPower) = attacker.getMinionInfo(attackerTeam[i]);
                (address dBranch,bool dArmed,,int dPower) = defender.getMinionInfo(defenderTeam[i]);                    
                require(
                    aArmed && aBranch == dBranch && eBranch != dBranch,
                    "Battlefield: minion not qualified");
                require(
                    !dArmed || aPower + aBuff > dPower,
                    "Battlefield: defeated");
            }
        }
        else {
            require(false, "Battlefield: number of minions not match");
        }
    }

    function _addFlora(uint[] memory newTeam) private {
        for (uint i = 0; i < newTeam.length; i++) {
            floraOnField[newTeam[i]] = true;
        }
    }

    function _addFauna(uint[] memory newTeam) private {
        for (uint i = 0; i < newTeam.length; i++) {
            faunaOnField[newTeam[i]] = true;
        }
    } 

    function _removeFlora(uint[] memory oldTeam) private {
        for (uint i = 0; i < oldTeam.length; i++) {
            floraOnField[oldTeam[i]] = false;
        }
    }

    function _removeFauna(uint[] memory oldTeam) private {
        for (uint i = 0; i < oldTeam.length; i++) {
            faunaOnField[oldTeam[i]] = false;
        }        
    }
}