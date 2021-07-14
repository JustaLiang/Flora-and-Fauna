// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockEnsRegistry {
    
    mapping (bytes32 => address) private _resolver;

    function setResolver(bytes32 node, address resolverAddr) external {
        _resolver[node] = resolverAddr;
    }

    function resolver(bytes32 node) public view returns (address) {
        return _resolver[node];
    }
}