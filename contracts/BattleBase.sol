// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArmyInterface.sol";

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
    mapping (uint => uint[]) public fieldDefender;

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
        uint[] defender;
        bool isFlora;
    }

    /// @notice Emit when field's state changes
    event FieldState(uint indexed fieldID,
                     address indexed conqueror,
                     bool indexed isGreen,
                     uint[] defender);

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
    function getFieldDefender(uint fieldID) public view returns (uint[] memory) {
        return fieldDefender[fieldID];
    }

    /**
     * @notice Get the leader on certain field
     * @param fieldID ID of the field
     * @return Owner of the first minion
    */ 
    function getFieldLeader(uint fieldID) public view returns (address) {
        uint[] memory defender = fieldDefender[fieldID];
        if (defender.length == 0) {
            return address(0);
        }
        else if (isFloraField[fieldID]) {
            if (floraArmy.minionExists(defender[0])) {
                return floraArmy.ownerOf(defender[0]);
            }
            else {
                return address(0);
            }
        }
        else {
            if (faunaArmy.minionExists(defender[0])) {
                return faunaArmy.ownerOf(defender[0]);
            }
            else {
                return address(0);
            }
        }
    }

    /**
     * @notice Get the field info
     * @param fieldID ID of the field
     * @return fieldInfo Leader, defender and side
    */ 
    function getFieldInfo(uint fieldID) public view
            returns (FieldInfo memory fieldInfo) {
        fieldInfo.leader = getFieldLeader(fieldID);
        if (fieldInfo.leader != address(0)) {
            fieldInfo.defender = getFieldDefender(fieldID);
            fieldInfo.isFlora = isFloraField[fieldID];
        }
        else {
            delete fieldInfo;
        }
    }

    /**
     * @notice Get the every field info 
     * @return allFieldInfo Info of every field
    */ 
    function getAllFieldInfo() external view
            returns (FieldInfo[] memory allFieldInfo) {
        allFieldInfo = new FieldInfo[](totalArea);
        for (uint fid = 0; fid < totalArea; fid++) {
            allFieldInfo[fid] = getFieldInfo(fid);
        }
    }

    /**
     * @notice Send flora army to conquer certain field
     * @param fieldID ID of the field
     * @param attackerID ID of the flora attacker minion
    */ 
    function floraConquer(uint fieldID, uint attackerID) external preCheck(fieldID) {
        require(
            !floraOnField[attackerID],
            "Battlefield: the flora minion already on field");
        require(
            floraArmy.ownerOf(attackerID) == msg.sender,
            "Battlefield: not the commander of the flora minion");
        uint[] memory defender = fieldDefender[fieldID];
        if (defender.length > 0) {
            uint defenderID = defender[0];
            if (isFloraField[fieldID]) {
                _fight(floraArmy, attackerID, floraArmy, defenderID);
                floraOnField[defenderID] = false;
            }
            else {
                _fight(floraArmy, attackerID, faunaArmy, defenderID);
                faunaOnField[defenderID] = false;
                faunaFieldCount--;
                floraFieldCount++;
            }
            fieldDefender[fieldID][0] = attackerID;
        }
        else {
            fieldDefender[fieldID].push(attackerID);
            floraFieldCount++;
        }
        floraOnField[attackerID] = true;
        isFloraField[fieldID] = true;

        emit FieldState(fieldID, msg.sender, true, fieldDefender[fieldID]);
    }

    /**
     * @notice Send fauna army to conquer certain field
     * @param fieldID ID of the field
     * @param attackerID ID of the fauna attacker minion
    */ 
    function faunaConquer(uint fieldID, uint attackerID) external preCheck(fieldID) {
        require(
            !faunaOnField[attackerID],
            "Battlefield: the fauna minion already on field");
        require(
            faunaArmy.ownerOf(attackerID) == msg.sender,
            "Battlefield: not the commander of the fauna minion");
        uint[] memory defender = fieldDefender[fieldID];
        if (defender.length > 0) {
            uint defenderID = defender[0];
            if (isFloraField[fieldID]) {
                _fight(faunaArmy, attackerID, floraArmy, defenderID);
                floraOnField[defenderID] = false;
                floraFieldCount--;
                faunaFieldCount++;
            }
            else {
                _fight(faunaArmy, attackerID, faunaArmy, defenderID);
                faunaOnField[defenderID] = false;
            } 
            fieldDefender[fieldID][0] = attackerID;
        }
        else {
            fieldDefender[fieldID].push(attackerID);
            faunaFieldCount++;            
        }
        faunaOnField[attackerID] = true;
        isFloraField[fieldID] = false;

        emit FieldState(fieldID, msg.sender, false, fieldDefender[fieldID]);
    }

    /**
     * @notice Retreat from certain field
     * @param fieldID ID of the field
    */    
    function retreat(uint fieldID) external {
        uint[] memory defender = fieldDefender[fieldID];
        require(
            defender.length > 0,
            "Battlefield: retreat from empty field");
        uint defenderID = defender[0];
        if (isFloraField[fieldID]) {
            require(
                floraArmy.ownerOf(defenderID) == msg.sender,
                "Battlefield: not leader");
            floraOnField[defenderID] = false;
        }
        else {
            require(
                faunaArmy.ownerOf(defenderID) == msg.sender,
                "Battlefield: not leader");
            faunaOnField[defenderID] = false;
        }
        delete fieldDefender[fieldID];

        emit FieldState(fieldID, address(0), isFloraField[fieldID], fieldDefender[fieldID]);
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
     * @param attackerSide Which side of attacker army
     * @param attackerID ID of attacker minion
     * @param defenderSide Which side of defender army
     * @param defenderID ID of defender minion
    */
    function _fight(ArmyInterface attackerSide, uint attackerID,
                    ArmyInterface defenderSide, uint defenderID
                    ) private view {
        if (defenderSide.minionExists(defenderID)) {
            (,bool aArmed,,int aPower) = attackerSide.getMinionInfo(attackerID);
            (,bool dArmed,,int dPower) = defenderSide.getMinionInfo(defenderID);
            require(aArmed, "Battlefield: attacker should be armed");
            require(!dArmed || aPower > dPower, "Battlefield: defeated");
        }
    }
}