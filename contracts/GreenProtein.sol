// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BaseProtein.sol";

contract GreenProtein is BaseProtein {

    /// @dev set name, symbol, and ARMY contract address
    constructor(address armyAddress_) ERC20("Green Protein", "gPRTN") {
        armyAddress = armyAddress_;
    }
}