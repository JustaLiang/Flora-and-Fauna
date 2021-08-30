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

    /// @notice Population of minions
    uint public population;

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
    Minion[] public minions;

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
        population = 0;
        initPower = 1000;
        ens = ENS(ensRegistryAddr);
    }

    /**
     * @notice Get if minion exists
     * @param minionID ID of the minion
     * @return Exists or not
    */
    function minionExists(uint minionID) override
            external view returns (bool) {
        return _exists(minionID);
    }

    /**
     * @notice Get minion's on-chain information
     * @param minionID ID of the minion
     * @return On-chain information of the minion
    */
    function getMinionInfo(uint minionID) override
            external view returns (address, bool, int, int) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
        Minion storage m = minions[minionID];
        return (m.branchAddr, m.armed, m.envFactor, m.power);
    }

    /**
     * @notice Get minion's profile
     * @param minionID ID of the minion
     * @return profile Minion info and tokeURI
    */    
    function getMinionProfile(uint minionID) external view
            returns (MinionProfile memory profile) {
            if (_exists(minionID)) {
                Minion storage m = minions[minionID];
                profile.branch = m.branchAddr;
                profile.armed = m.armed;
                profile.price = m.envFactor;
                profile.power = m.power;
                profile.uri = tokenURI(minionID);
            }
            else {
                profile.branch = address(0);
                profile.armed = false;
                profile.price = 0;
                profile.power = 0;
                profile.uri = "";                
            }
        }

    /**
     * @notice Get minion IDs, like (2,6,9), given commander
     * @param commander Commander of these minions
     * @return minionIDs IDs of these minions
    */
    function getMinionIDs(address commander)
            external view returns(uint[] memory minionIDs) {
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
     * @notice Get all minions' info given minion IDs
     * @param minionIDs IDs of the minions
     * @return teamInfo Array of minion info
    */
    function getTeamInfo(uint[] calldata minionIDs)
            external view returns (Minion[] memory teamInfo) {
        teamInfo = new Minion[](minionIDs.length);
        for (uint i = 0; i < minionIDs.length; i++) {
            teamInfo[i] = minions[minionIDs[i]];
        }        
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
        minions.push(Minion(branchAddr, false, currPrice, initPower));

        emit MinionState(newID, branchAddr, false, currPrice, initPower);
        serialNumber++;
        population++;
        return newID;
    }

    /**
     * @notice Liberate a minion and get some enhancer
     * @param minionID ID of the minion
    */
    function liberate(uint minionID) external override checkCommander(minionID) {
        Minion storage target = minions[minionID];
        require(
            target.armed,
            "ARMY: can only liberate armed minion");

        if (target.power > initPower) {
             enhancerContract.produce(msg.sender, uint(target.power - initPower));
        }
        _burn(minionID);
        population--;
    }

    /**
     * @notice Get minion's metadata URI
     * @param minionID ID of the minion
    */
    function tokenURI(uint minionID) public view override returns (string memory) {
        require(
            _exists(minionID),
            "ARMY: commander query for nonexistent minion");
        Minion storage target = minions[minionID];
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
        Minion storage target = minions[minionID];
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
        Resolver resolver = ens.resolver(node);
        return resolver.addr(node);
    }
}