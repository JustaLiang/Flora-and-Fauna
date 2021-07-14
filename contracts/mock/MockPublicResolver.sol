// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockPublicResolver {
    
    mapping (bytes32 => address) private _nodeToAddress;

    function setAddr(bytes32 node, address address_) external {
        _nodeToAddress[node] = address_;
    }

    function addr(bytes32 node) public view returns (address) {
        return _nodeToAddress[node];
    }
}