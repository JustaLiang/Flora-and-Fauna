// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@OpenZeppelin/contracts/token/ERC721/IERC721.sol";

contract GardenInterface is IERC721 {

    function changePhototropism(uint) external;
}