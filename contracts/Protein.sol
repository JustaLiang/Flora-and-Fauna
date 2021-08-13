// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice Unique operations only for Army contract
 */
interface PRTN {
    function produce(address, uint) external;
    function consume(address, uint) external;
}

/**
 * @title Protein
 * @notice ERC20 token minted or burnt by Army contract
 * @author Justa Liang
 */
contract Protein is ERC20, Ownable {

    /**
     * @dev ERC20 constructor
     * @param name Token name
     * @param symbol Token symbol
    */
    constructor(string memory name, string memory symbol) 
        ERC20(name, symbol) {
    }

    /**
     * @dev Produce protein for commander
     * @param commander Player of Army
     * @param amount Amount of protein (no decimal concerned)
    */
    function produce(address commander, uint amount) external onlyOwner {
        _mint(commander, amount*10**decimals());
    }

    /**
     * @dev Consume protein from commander
     * @param commander Player of Army
     * @param amount Amount of protein (no decimal concerned)
    */
    function consume(address commander, uint amount) external onlyOwner {
        _burn(commander, amount*10**decimals());
    }
}