// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Army interface
 * @author Justa Liang
 */
interface ArmyInterface is IERC721 {

    // basic view command
    function serialNumber() virtual external view returns (uint);
    function getMinionInfo(uint) virtual external view returns (address, bool, int, int);
    function getMinionIDs(address) virtual external view returns (uint[] memory);

    // basic command
    function recruit(bytes32) virtual external returns (uint);
    function liberate(uint) virtual external;

    // command with different implementations between green and red
    function train(uint) virtual external;
    function arm(uint) virtual external;
    function reinforce(uint) virtual external;
    function recover(uint) virtual external;
}