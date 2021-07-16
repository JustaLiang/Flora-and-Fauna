// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice Unique operations only for CRHP contract
 */
interface CTK {
    function mint(address gardener, uint amount) external;
    function burn(address gardener, uint amount) external;
}

/**
 * @title Cytokenin (cytokinin + token)
 * @notice ERC20 token minted or burnt by CryprianhaPlant contract
 * @author Justa Liang
 */
contract Cytokenin is ERC20 {

    /// @notice Address of corresponding CRHP contract
    address public crhpAddress;

    /// @dev set name, symbol, and CHRP contract address 
    constructor(address crhpAddress_) ERC20("Cytokenin", "CTK") {
        crhpAddress = crhpAddress_;
    }

    /// @dev Check if the operation is sent by CRHP contract
    modifier onlyCRHP {
        require(msg.sender == crhpAddress,
                "CTK: this method is only for CRHP contract");
        _;
    }

    /** 
     * @dev Mint CTK for gardener
     * @param gardener Player of CRHP
     * @param amount Amount of CTK (no decimal concerned)
    */
    function mint(address gardener, uint amount) external onlyCRHP {
        _mint(gardener, amount*10**decimals());
    }

    /** 
     * @dev Burn CTK from gardener
     * @param gardener Player of CRHP
     * @param amount Amount of CTK (no decimal concerned)
    */
    function burn(address gardener, uint amount) external onlyCRHP {
        _burn(gardener, amount*10**decimals());
    }
}