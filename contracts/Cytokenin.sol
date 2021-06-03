// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openZeppelin/contracts/token/ERC20/ERC20.sol";
import "@openZeppelin/contracts/access/Ownable.sol";

contract Cytokenin is ERC20, Ownable {

    bool public ifSetGardenAddress;
    address public gardenAddress;

    constructor() ERC20("Cytokenin", "CK") {
        _mint(msg.sender, 7777777777e18);
        ifSetGardenAddress = false;
        gardenAddress = address(0);
    }

    modifier onlyGarden {
        require(msg.sender == gardenAddress,
                "Cytokenin: this method is only for Garden");
        _;
    }

    function setGardenAddress(address gardenAddress_) external onlyOwner {
        require(!ifSetGardenAddress,
                "Cytokenin: address of Garden has been set");
        gardenAddress = gardenAddress_;
        ifSetGardenAddress = true;
    }

    function mint(address gardener, uint amount) external onlyGarden {
        _mint(gardener, amount*10**decimals());
    }

    function burn(address gardener, uint amount) external onlyGarden {
        _burn(gardener, amount*10**decimals());
    }
}