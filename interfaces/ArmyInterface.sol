// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @dev Minion data structure
struct Minion {
    address     branchAddr;   // branch address (which proxy of Chainlink price feed)
    bool        armed;        // armed or not
    int         envFactor;    // environment factor (latest updated price from Chainlink)
    int         power;     // power of the minion
}

/**
 * @title Army interface
 * @author Justa Liang
 */
interface ArmyInterface is IERC721 {

    // basic view
    function minionExists(uint) virtual external view returns (bool);
    function getMinionInfo(uint) virtual external view returns (address, bool, int, int);

    // basic command
    function recruit(bytes32) virtual external returns (uint);
    function liberate(uint) virtual external;
    function grant(uint) virtual external;

    // command with different implementations between flora and fauna
    function train(uint) virtual external;
    function arm(uint) virtual external;
    function boost(uint) virtual external;
    function heal(uint) virtual external;
}