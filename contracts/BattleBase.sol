// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ArmyInterface.sol";

/**
 * @notice Operations only for Army contract
 */
interface ARMY is ArmyInterface {
    function population() external view returns (uint);
    function rankContract() external view returns (address);
}

/**
 * @title Battle mechanism
 * @notice Define how to figh on battlefield
 * @author Justa Liang
 */
abstract contract BattleBase is Ownable {

    /// @notice If Battlefield locked, lock for vote, unlock for proposal
    bool public fieldLocked;

    /// @notice Total area of battlefield
    uint public totalArea;

    /// @notice Defenders on cetain field
    mapping (uint => uint[]) public fieldDefenders;

    /// @notice If field be occupied by flora army 
    mapping (uint => bool) public isFloraField;

    /// @notice If certain flora minion on field
    mapping (uint => bool) public floraOnField;

    /// @notice If certain fauna minion on field
    mapping (uint => bool) public faunaOnField;

    /// @notice Corresponding FloraArmy contract
    ARMY public floraArmy;

    /// @notice Corresponding FaunaArmy contract
    ARMY public faunaArmy;

    /// @notice Number of fields occupied by flora army
    uint public floraFieldCount;

    /// @notice Number of fields occupied by fauna army
    uint public faunaFieldCount;

    /// @dev Initial power of flora and fauna minions
    int private _refPower;

    struct FieldInfo {
        address leader;
        uint[] defenders;
        bool isFlora;
    }

    /// @notice Emit when field's state changes
    event FieldState(uint indexed fieldID,
                     address indexed conqueror,
                     bool indexed isGreen,
                     uint[] team);

    /// @notice Emit when total area of battlefield changes
    event TotalArea(uint totalArea);

    /**
     * @dev Set addresses of interactive contracts
     * @param floraArmyAddr Address of FloraArmy contract
     * @param faunaArmyAddr Address of FaunaArmy contract
    */
    constructor(address floraArmyAddr, address faunaArmyAddr) {
        fieldLocked = false;
        totalArea = 20;
        _refPower = 1000;
        floraArmy = ARMY(floraArmyAddr);
        faunaArmy = ARMY(faunaArmyAddr);
        floraFieldCount = 0;
        faunaFieldCount = 0;

        emit TotalArea(totalArea);
    }

    /**
     * @notice Expand the battlefield and increase it's total area
    */
    function expand(uint increaseSize) external onlyOwner {
        totalArea += increaseSize;
        require(
            totalArea < floraArmy.population() + faunaArmy.population(),
            "Battlefield: no need for expansion");

        emit TotalArea(totalArea);
    }

    /**
     * @notice Get minion IDs on certain field
     * @param fieldID ID of the field
     * @return Array of minion IDs
    */ 
    function getFieldDefenders(uint fieldID) public view returns (uint[] memory) {
        return fieldDefenders[fieldID];
    }

    /**
     * @notice Get the leader on certain field
     * @param fieldID ID of the field
     * @return Owner of the first minion
    */ 
    function getFieldLeader(uint fieldID) public view returns (address) {
        uint[] memory defender = fieldDefenders[fieldID];
        if (defender.length == 0) {
            return address(0);
        }
        else if (isFloraField[fieldID]) {
            return floraArmy.ownerOf(defender[0]);
        }
        else {
            return faunaArmy.ownerOf(defender[0]);
        }
    }

    /**
     * @notice Get the field info
     * @param fieldID ID of the field
     * @return fieldInfo Leader, defenders and side
    */ 
    function getFieldInfo(uint fieldID) external view
            returns (FieldInfo memory fieldInfo) {
        fieldInfo.leader = getFieldLeader(fieldID);
        fieldInfo.defenders = getFieldDefenders(fieldID);
        fieldInfo.isFlora = isFloraField[fieldID];            
    }

    /**
     * @notice Get the every field info 
     * @return allFieldInfo Info of every field
    */ 
    function getAllFieldInfo() external view
            returns (FieldInfo[] memory allFieldInfo) {
        allFieldInfo = new FieldInfo[](totalArea);
        for (uint fid = 0; fid < totalArea; fid++) {
            allFieldInfo[fid].leader = getFieldLeader(fid);
            allFieldInfo[fid].defenders = getFieldDefenders(fid);
            allFieldInfo[fid].isFlora = isFloraField[fid];
        }
    }

    /**
     * @notice Send flora army to conquer certain field
     * @param fieldID ID of the field
     * @param attackerTeam Array of flora minion IDs to attack
    */ 
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
            }
            else {
                _fight(floraArmy, attackerTeam, faunaArmy, defenderTeam);
                _removeFauna(defenderTeam);
            }
        }
        else {
            require(
                attackerTeam.length == 1,
                "Battlefield: must conquer empty field with only one flora minion");
        }
        _addFlora(attackerTeam);
        fieldDefenders[fieldID] = attackerTeam;
        isFloraField[fieldID] = true;

        emit FieldState(fieldID, msg.sender, true, attackerTeam);
    }

    /**
     * @notice Send fauna army to conquer certain field
     * @param fieldID ID of the field
     * @param attackerTeam Array of fauna minion IDs to attack
    */ 
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
            }
            else {
                _fight(faunaArmy, attackerTeam, faunaArmy, defenderTeam);
                _removeFauna(defenderTeam);
            } 
        }
        else {
            require(
                attackerTeam.length == 1,
                "Battlefield: must conquer empty field with only one fauna minion");
        }
        _addFauna(attackerTeam);
        fieldDefenders[fieldID] = attackerTeam;
        isFloraField[fieldID] = false;

        emit FieldState(fieldID, msg.sender, false, attackerTeam);
    }

    /**
     * @notice Retreat from certain field
     * @param fieldID ID of the field
    */    
    function retreat(uint fieldID) external {
        uint[] memory defenders = fieldDefenders[fieldID];
        require(
            defenders.length > 0,
            "Battlefield: retreat from empty field");
        if (isFloraField[fieldID]) {
            require(
                floraArmy.ownerOf(defenders[0]) == msg.sender,
                "Battlefield: not leader");
            _removeFlora(defenders);
        }
        else {
            require(
                faunaArmy.ownerOf(defenders[0]) == msg.sender,
                "Battlefield: not leader");
            _removeFauna(defenders);
        }
        delete fieldDefenders[fieldID];

        emit FieldState(fieldID, address(0), isFloraField[fieldID], fieldDefenders[fieldID]);
    }

    /**
     * @dev Check if locked or out of range
     * @param fieldID ID of the field
    */
    modifier preCheck(uint fieldID) {
        require(
            !fieldLocked,
            "Battlefield: battlefield is locked now");
        require(
            fieldID < totalArea,
            "Battlefield: field out of range");
        _;
    }

    /**
     * @dev Determine win or not, cancel tx if lose
     * @param attacker Which side of attacker army
     * @param attackerTeam Array of attacker IDs
     * @param defender Which side of defender army
     * @param defenderTeam Array of defender IDs
    */
    function _fight(ArmyInterface attacker, uint[] memory attackerTeam,
                    ArmyInterface defender, uint[] memory defenderTeam
                    ) private view {
        for (uint i = 0; i < defenderTeam.length; i++) {
            if (!defender.minionExists(defenderTeam[i])) {
                return;
            }
        }
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

    /**
     * @dev Add flora minions to field
     * @param newTeam Array of flora minion IDs to be added
    */
    function _addFlora(uint[] memory newTeam) private {
        for (uint i = 0; i < newTeam.length; i++) {
            floraOnField[newTeam[i]] = true;
        }
        floraFieldCount++;
    }

    /**
     * @dev Add fauna minions to field
     * @param newTeam Array of fauna minion IDs to be added
    */
    function _addFauna(uint[] memory newTeam) private {
        for (uint i = 0; i < newTeam.length; i++) {
            faunaOnField[newTeam[i]] = true;
        }
        faunaFieldCount++;
    } 

    /**
     * @dev Remove flora minions from field
     * @param oldTeam Array of flora minion IDs to be removed
    */
    function _removeFlora(uint[] memory oldTeam) private {
        for (uint i = 0; i < oldTeam.length; i++) {
            floraOnField[oldTeam[i]] = false;
        }
        floraFieldCount--;
    }

    /**
     * @dev Remove fauna minions from field
     * @param oldTeam Array of fauna minion IDs to be removed
    */
    function _removeFauna(uint[] memory oldTeam) private {
        for (uint i = 0; i < oldTeam.length; i++) {
            faunaOnField[oldTeam[i]] = false;
        }        
        faunaFieldCount--;
    }
}