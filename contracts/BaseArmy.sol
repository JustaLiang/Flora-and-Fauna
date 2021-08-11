// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/ArmyInterface.sol";
import "./BaseProtein.sol";

/**
 * @notice ENS registry to get chainlink resolver
 */
interface ENS {
    function resolver(bytes32) external view returns (Resolver);
}

/**
 * @notice Chainlink resolver to get price feed proxy
 */
interface Resolver {
    function addr(bytes32) external view returns (address);
}

/**
 * @title Army contract with basic command
 * @author Justa Liang
 */
abstract contract BaseArmy is ERC721, ArmyInterface {

    /// @notice Address of corresponding PRTN contract
    address public prtnAddress;

    /// @notice Serial Number of minions, imply how many minions have been created
    uint public serialNumber;

    /// @notice Inital minion's strength
    int public initStrength;

    /// @dev ENS interface (fixed address)
    ENS internal _ens;

    /// @dev Cytokenin interface (fixed address)
    PRTN internal _prtn;

    /// @dev Minion data structure
    struct Minion {
        address     barrackAddr;  // barrack address (which proxy of Chainlink price feed)
        bool        armed;        // armed or not
        int         envFactor;    // environment factor (latest updated price from Chainlink)
        int         strength;     // strength of the minion
    }

    /// @dev Minion data storage
    Minion[] internal _minions;

    /// @notice Emit when minion's state changes 
    event MinionState(
        uint indexed minionID,
        address indexed barrackAddress,
        bool indexed armed,
        int environmentFactor,
        int strength
    );

    /// @dev Check if commander can command the minion
    modifier checkCommander(uint minionID) {
        require(
            _isApprovedOrOwner(msg.sender, minionID),
            "ARMY: commander can't command the minion");
        _;
    }

    /**
     * @dev Resolve ENS-namehash to Chainlink price feed proxy
     * @param node ENS-namehash of given pair
     * @return Chainlink price feed proxy
    */
    function _resolve(bytes32 node) internal view returns (address) {
        Resolver resolver = _ens.resolver(node);
        return resolver.addr(node);
    }

    /**
     * @notice Get minion's on-chain information
     * @param minionID ID of the minion
     * @return On-chain information of the minion
    */
    function getMinionInfo(uint minionID) external view override
                                            returns (address, bool, int, int) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
        Minion memory target = _minions[minionID];
        return (target.barrackAddr, target.armed, target.envFactor, target.strength);
    }

    /**
     * @notice Get minion IDs, like (2,6,9), given commander
     * @param commander Commander of these minions
     * @return IDs of these minions
    */
    function getMinionIDs(address commander) external view override returns(uint[] memory) {
        uint minionCount = balanceOf(commander);
        uint[] memory minionIDs = new uint[](minionCount);
        uint listIdx = 0;
        for (uint minionID = 0; listIdx < minionCount; minionID++) {
            if (_exists(minionID) && ownerOf(minionID) == commander) {
                minionIDs[listIdx] = minionID;
                listIdx++;
            }
        }
        return minionIDs;
    }

    /**
     * @notice Recruit a minion
     * @param barrackType ENS-namehash of given pair (ex: eth-usd.data.eth)
    */
    function recruit(bytes32 barrackType) external override {
        address barrackAddr = _resolve(barrackType);
        require(
            barrackAddr != address(0),
            "ARMY: invalid barrack type");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(barrackAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // mint minion and store its data on chain
        _mint(msg.sender, serialNumber);
        _minions.push(Minion(barrackAddr, false, currPrice, initStrength));

        emit MinionState(serialNumber, barrackAddr, false, currPrice, initStrength);
        serialNumber++;
    }

    /**
     * @notice Liberate a minion and get some protein
     * @dev Commander get protein
     * @param minionID ID of the minion
    */
    function liberate(uint minionID) external override checkCommander(minionID){
        Minion storage target = _minions[minionID];
        require(
            target.armed,
            "ARMY: can only liberate armed minion");
        require(
            target.strength > initStrength,
            "ARMY: can only liberate healthy minion");

        _burn(minionID);
        _prtn.produce(msg.sender, uint(target.strength - initStrength));
    }
}