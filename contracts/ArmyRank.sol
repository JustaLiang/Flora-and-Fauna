// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice Methods called by FloraArmy and FaunaArmy
 */
interface RANK {
    function transferOwnership(address) external;
    function query(address, int) external view returns (string memory);
}

/**
 * @title Ranking system of FloraArmy and FaunaArmy
 * @author Justa Liang
 */
contract ArmyRank is Ownable {

    /// @notice URI prefix of certain branch
    mapping (address => string) public branchPrefix;

    /// @notice Level of power to reach to upgrade minions
    int[5] public powerLevels;

    /// @notice Metadata filenames
    string[5] public jsonNames;

    /**
     * @dev Set power levels and metadata filenames
     * @param powerLevels_ Array with length 5, from low level to high
     * @param jsonNames_ Array with length 5, from low level URI to high
    */
    constructor(int[5] memory powerLevels_, string[5] memory jsonNames_) {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
            jsonNames[i] = jsonNames_[i];
        }
    }

    /**
     * @dev Call by Army Contract, to dynamically get token URI
     * @param branchAddr Branch address of the minion
     * @param power Power of the minion
    */
    function query(address branchAddr, int power) external view returns (string memory) {
        for (uint i = powerLevels.length-1; i >= 0; i--) {
            if (power >= powerLevels[i]) {
                string memory prefix = branchPrefix[branchAddr];
                if (bytes(prefix).length == 0) {
                    return string(abi.encodePacked(branchPrefix[address(0)], jsonNames[i]));
                }
                else {
                    return string(abi.encodePacked(branchPrefix[branchAddr], jsonNames[i]));
                }
            }
        }
    }

    /**
     * @dev Update branch prefix (give ownership to Battlefield contract in the future)
     * @param branchAddr Branch address
     * @param prefix Prefix of URI to be set
    */
    function updateBranchPrefix(address branchAddr, string calldata prefix) external onlyOwner {
        branchPrefix[branchAddr] = prefix;
    }

    /**
     * @dev Change power levels (will be discarded)
     * @param powerLevels_ Array with length 5, from low level to high
    */
    function changePowerLevels(int[5] calldata powerLevels_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
        }
    }

    /**
     * @dev Change metadat filename (will be discarded)
     * @param jsonNames_ Array with length 5, from low level URI to high
    */
    function changeJsonNames(string[5] calldata jsonNames_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            jsonNames[i] = jsonNames_[i];
        }
    }
}