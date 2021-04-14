// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@OpenZeppelin/contracts/token/ERC20/ERC20.sol";
import "@OpenZeppelin/contracts/access/Ownable.sol";

contract Cytokenin is ERC20, Ownable {

    bool public ifSetLaboratoryAddress;
    address public laboratoryAddress;

    constructor() ERC20("Cytokenin", "CK") {
        _mint(msg.sender, 7777777777e18);
        ifSetLaboratoryAddress = false;
        laboratoryAddress = address(0);
    }

    modifier onlyLaboratory {
        require(msg.sender == laboratoryAddress,
                "Cytokenin: this method only call by Laboratory");
        _;
    }

    function setLaboratoryAddress(address laboratoryAddress_) external onlyOwner {
        require(!ifSetLaboratoryAddress,
                "Cytokenin: address of Laboratory has been set");
        laboratoryAddress = laboratoryAddress_;
        ifSetLaboratoryAddress = true;
    }

    function mint(address who, uint amount) external onlyLaboratory {
        _mint(who, amount*10**decimals());
    }

    function burn(address who, uint amount) external onlyLaboratory {
        _burn(who, amount*10**decimals());
    }
}