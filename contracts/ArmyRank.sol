// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArmyBase.sol";

/**
 * @title Ranking system of FloraArmy and FaunaArmy
 * @author Justa Liang
 */
abstract contract ArmyRank is ArmyBase, Ownable {

    /// @notice Base URI (prefix)
    string public baseURI;

    /// @notice Level of power to reach to upgrade minions
    int[5] public powerLevels;

    /// @notice Metadata filenames
    string[5] public metadataNames;

    // Mapping for token URIs
    mapping(uint => string) private _tokenURIs;

    /**
     * @dev Set power levels and metadata filenames
     * @param powerLevels_ Array with length 5, from high level to low
     * @param metadataNames_ Array with length 5, from high level URI to low
    */
    constructor(string memory baseURI_,
                int[5] memory powerLevels_,
                string[5] memory metadataNames_) {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
            metadataNames[i] = metadataNames_[i];
        }
        baseURI = baseURI_;
    }

    /**
     * @notice Get minion's metadata URI
     * @param minionID ID of the minion
    */
    function tokenURI(uint minionID) public view override returns (string memory) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
    
        string memory grantedURI = _tokenURIs[minionID];
        if (bytes(grantedURI).length > 0) {
            return grantedURI;
        }
        else {
            (,,,int power) = getMinionInfo(minionID);
            for (uint i = 0; i < powerLevels.length; i++) {
                if (power >= powerLevels[i]) {
                    return string(abi.encodePacked(baseURI, metadataNames[i]));
                }
            }
            return string(abi.encodePacked(baseURI, metadataNames[4]));
        }
    }

    /**
     * @notice Grant minion with current token URI
     * @param minionID ID of the minion
    */
    function grant(uint minionID) external checkCommander(minionID) {
        string memory currentURI;
        (,,,int power) = getMinionInfo(minionID);
        for (uint i = 0; i < powerLevels.length; i++) {
            if (power >= powerLevels[i]) {
                currentURI = string(abi.encodePacked(baseURI, metadataNames[i]));
            }
        }
        _tokenURIs[minionID] = currentURI;
    }

    /**
     * @notice Get minion's profile
     * @param minionID ID of the minion
     * @return profile Minion info and tokeURI
    */    
    function getMinionProfile(uint minionID) public view
            returns (MinionProfile memory profile) {
            require(
                _exists(minionID),
                "ARMY: commander query for nonexistent minion");            
            Minion storage m = minions[minionID];
            profile.branch = m.branchAddr;
            profile.armed = m.armed;
            profile.price = m.envFactor;
            profile.power = m.power;
            profile.uri = tokenURI(minionID);
    }

    /**
     * @notice Get all minions' info given minion IDs
     * @param minionIDs IDs of the minions
     * @return teamProfile Array of minion info
    */
    function getTeamProfile(uint[] calldata minionIDs)
            external view returns (MinionProfile[] memory teamProfile) {
        teamProfile = new MinionProfile[](minionIDs.length);
        for (uint i = 0; i < minionIDs.length; i++) {
            teamProfile[i] = getMinionProfile(minionIDs[i]);
        }
    }

    /**
     * @notice Liberate a minion and get some enhancer
     * @param minionID ID of the minion
    */
    function liberate(uint minionID) external checkCommander(minionID) {
        Minion storage target = minions[minionID];
        if (target.power > initPower) {
             enhancerContract.produce(msg.sender, uint(target.power - initPower));
        }
        _burn(minionID);
        delete minions[minionID];
        if (bytes(_tokenURIs[minionID]).length != 0) {
            delete _tokenURIs[minionID];
        }
    }

    /**
     * @dev Update branch prefix (give ownership to Battlefield contract in the future)
     * @param baseURI_ Prefix of URI to be set
    */
    function updateBaseURI(string calldata baseURI_) external onlyOwner {
        baseURI = baseURI_;
    }

    /**
     * @dev Change power levels (will be discarded)
     * @param powerLevels_ Array with length 5, from low level to high
    */
    function changePowerLevels(int[5] calldata powerLevels_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            powerLevels[i] = powerLevels_[i];
        }
    }

    /**
     * @dev Change metadat filename (will be discarded)
     * @param metadataNames_ Array with length 5, from low level URI to high
    */
    function changeMetadataNames(string[5] calldata metadataNames_) external onlyOwner {
        for (uint i = 0; i < 5; i++) {
            metadataNames[i] = metadataNames_[i];
        }
    }
}