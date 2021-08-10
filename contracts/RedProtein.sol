// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BaseProtein.sol";

contract RedProtein is BaseProtein {

    /// @dev set name, symbol, and ARMY contract address
    constructor(address armyAddress_) ERC20("Red Protein", "rPRTN") {
        armyAddress = armyAddress_;
    }
}