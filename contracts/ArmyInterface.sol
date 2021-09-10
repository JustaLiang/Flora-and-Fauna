// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Army interface
 * @author Justa Liang
 */
interface ArmyInterface is IERC721 {

    // basic view
    function minionExists(uint) external view returns (bool);
    function getMinionInfo(uint) external view returns (address, bool, int, int);

    // basic command
    function recruit(bytes32) external returns (uint);
    function liberate(uint) external;
    function grant(uint) external;

    // command with different implementations between flora and fauna
    function train(uint) external;
    function arm(uint) external;
    function boost(uint) external;
    function heal(uint) external;
}