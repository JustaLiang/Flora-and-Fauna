// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ArmyEnhancer.sol";

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
abstract contract ArmyBase is ERC721Enumerable {

    /// @notice Corresponding Enhancer contract
    ENHR public enhancerContract;

    /// @notice Serial number of minions, imply how many minions have been created
    uint public serialNumber;

    /// @notice Inital minion's power
    int public initPower;

    /// @notice ENS interface (fixed address)
    ENS public ens;

    /// @dev Minion data structure
    struct Minion {
        address     branchAddr;   // branch address (which proxy of Chainlink price feed)
        bool        armed;        // armed or not
        int         envFactor;    // environment factor (latest updated price from Chainlink)
        int         power;        // power of the minion
    }

    /// @dev Minion profile to view
    struct MinionProfile {
        address     branch;
        bool        armed;
        int         price;
        int         power;
        string      uri;
    }

    /// @dev Minion data storage
    mapping(uint => Minion) public minions;

    /// @notice Emit when minion's state changes 
    event MinionState(
        uint indexed minionID,
        address indexed branchAddress,
        bool indexed armed,
        int environmentFactor,
        int power
    );

    /**
     * @dev Set name, symbol, and addresses of interactive contracts
     * @param ensRegistryAddr Address of ENS Registry
    */
    constructor(address ensRegistryAddr) {
        serialNumber = 0;
        initPower = 1000;
        ens = ENS(ensRegistryAddr);
    }

    /**
     * @notice Get if minion exists
     * @param minionID ID of the minion
     * @return Exists or not
    */
    function minionExists(uint minionID) external view returns (bool) {
        return _exists(minionID);
    }

    /**
     * @notice Get minion's on-chain information
     * @param minionID ID of the minion
     * @return On-chain information of the minion
    */
    function getMinionInfo(uint minionID) public view returns (address, bool, int, int) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
        Minion storage m = minions[minionID];
        return (m.branchAddr, m.armed, m.envFactor, m.power);
    }

    /**
     * @notice Get minion IDs, like (2,6,9), given commander
     * @param commander Commander of these minions
     * @return minionIDs IDs of these minions
    */
    function getMinionIDs(address commander)
            public view returns(uint[] memory minionIDs) {
        uint minionCount = balanceOf(commander);
        minionIDs = new uint[](minionCount);
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
     * @param branchHash ENS-namehash of given pair (ex: eth-usd.data.eth)
     * @return ID of the newly recruited minion
    */
    function recruit(bytes32 branchHash) external returns (uint) {
        address branchAddr = _resolve(branchHash);
        require(
            branchAddr != address(0),
            "ARMY: invalid branch");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // mint minion and store its data on chain
        uint newID = serialNumber;
        _safeMint(msg.sender, newID);
        minions[newID] = Minion(branchAddr, false, currPrice, initPower);

        emit MinionState(newID, branchAddr, false, currPrice, initPower);
        serialNumber++;
        return newID;
    }

    /**
     * @dev Check if commander can command the minion
     * @param minionID ID of the minion
    */
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
        Resolver resolver = ens.resolver(node);
        return resolver.addr(node);
    }
}