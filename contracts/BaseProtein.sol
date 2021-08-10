// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Unique operations only for ARMY contract
 */
interface PRTN {
    function produce(address, uint) external;
    function consume(address, uint) external;
}

/**
 * @title Protein
 * @notice ERC20 token minted or burnt by ARMY contract
 * @author Justa Liang
 */
abstract contract BaseProtein is ERC20 {

    /// @notice Address of corresponding ARMY contract
    address public armyAddress;

    /// @dev Check if the operation is sent by corresponding ARMY contract
    modifier onlyARMY {
        require(msg.sender == armyAddress, "PRTN: this method is only for ARMY contract: ");
        _;
    }

    /**
     * @dev Produce protein for commander
     * @param commander Player of ARMY
     * @param amount Amount of protein (no decimal concerned)
    */
    function produce(address commander, uint amount) external onlyARMY {
        _mint(commander, amount*10**decimals());
    }

    /**
     * @dev Consume protein from commander
     * @param commander Player of ARMY
     * @param amount Amount of protein (no decimal concerned)
    */
    function consume(address commander, uint amount) external onlyARMY {
        _burn(commander, amount*10**decimals());
    }
}