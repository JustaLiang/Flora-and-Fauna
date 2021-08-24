// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface RANK {
    function transferOwnership(address) external;
    function query(address, int) external view returns (string memory);
    function updateBranchPrefix(address, string calldata) external;
}

contract ArmyRank is Ownable {
    mapping (address => string) public branchPrefix;
    int[5] public powerLevels;
    string[5] public jsonNames;

    constructor(int[5] memory powerLevels_, string[5] memory jsonNames_) {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
            jsonNames[i] = jsonNames_[i];
        }
    }

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

    function updateBranchPrefix(address branchAddr, string calldata prefix) external onlyOwner {
        branchPrefix[branchAddr] = prefix;
    }

    function changeJsonNames(string[5] calldata jsonNames_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            jsonNames[i] = jsonNames_[i];
        }
    }

    function changePowerLeves(int[5] calldata powerLevels_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
        }
    }
}