// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../interfaces/ArmyInterface.sol";
import "./ArmyEnhancer.sol";
import "./ArmyRank.sol";

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
abstract contract ArmyBase is ERC721URIStorage, ArmyInterface {

    /// @notice Corresponding Enhancer contract
    ENHR public enhancerContract;

    /// @notice Corresponding Rank contract
    RANK public rankContract;

    /// @notice Serial number of minions, imply how many minions have been created
    uint public serialNumber;

    /// @dev Inital minion's power
    int internal _initPower;

    /// @dev ENS interface (fixed address)
    ENS internal _ens;

    /// @dev Minion data structure
    struct Minion {
        address     branchAddr;   // branch address (which proxy of Chainlink price feed)
        bool        armed;        // armed or not
        int         envFactor;    // environment factor (latest updated price from Chainlink)
        int         power;     // power of the minion
    }

    /// @dev Minion data storage
    Minion[] internal _minions;

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
        _initPower = 1000;
        _ens = ENS(ensRegistryAddr);
    }

    /**
     * @notice Get if minion exists
     * @param minionID ID of the minion
     * @return Exists or not
    */
    function minionExists(uint minionID) external view override returns (bool) {
        return _exists(minionID);
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
        return (target.branchAddr, target.armed, target.envFactor, target.power);
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
     * @param branchHash ENS-namehash of given pair (ex: eth-usd.data.eth)
     * @return ID of the newly recruited minion
    */
    function recruit(bytes32 branchHash) external override returns (uint) {
        address branchAddr = _resolve(branchHash);
        require(
            branchAddr != address(0),
            "ARMY: invalid branch");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // mint minion and store its data on chain
        uint newID = serialNumber;
        _mint(msg.sender, newID);
        _minions.push(Minion(branchAddr, false, currPrice, _initPower));

        emit MinionState(newID, branchAddr, false, currPrice, _initPower);
        serialNumber++;
        return newID;
    }

    /**
     * @notice Liberate a minion and get some enhancer
     * @param minionID ID of the minion
    */
    function liberate(uint minionID) external override checkCommander(minionID) {
        Minion storage target = _minions[minionID];
        require(
            target.armed,
            "ARMY: can only liberate armed minion");

        if (target.power > _initPower) {
             enhancerContract.produce(msg.sender, uint(target.power - _initPower));
        }
        _burn(minionID);
    }

    /**
     * @notice Get minion's metadata URI
     * @param minionID ID of the minion
    */
    function tokenURI(uint minionID) public view override returns (string memory) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
        Minion memory target = _minions[minionID];
        string memory grantedURI = super.tokenURI(minionID);
        if (bytes(grantedURI).length > 11) {
            return grantedURI;
        }
        else {
            return rankContract.query(target.branchAddr, target.power);
        }
    }

    /**
     * @notice Grant minion with current token URI
     * @param minionID ID of the minion
    */
    function grant(uint minionID) external override checkCommander(minionID) {
        Minion memory target = _minions[minionID];
        _setTokenURI(minionID, rankContract.query(target.branchAddr, target.power));
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
        Resolver resolver = _ens.resolver(node);
        return resolver.addr(node);
    }
}