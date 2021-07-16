// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Cytokenin.sol";

/**
 * @notice ENS registry to get chainlink resolver
 */
interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

/**
 * @notice Chainlink resolver to get price feed proxy
 */
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

/**
 * @title CrypiranhaPlant (Crypiranha = crypto + piranha)
 * @notice ERC721 token cultivated by predicting market price (using Chainlink oracle)
 * @author Justa Liang
 */
contract CrypiranhaPlant is ERC721 {

    /// @notice Address of corresponding CTK contract
    address public ctkAddress;

    /// @notice ID counter of CRHP, imply how many CRHPs have been created
    uint public plantIDCounter;

    /// @dev ENS interface (fixed address)
    ENS private _ens;

    /// @dev Cytokenin interface (fixed address)
    CTK private _ctk;

    /// @dev Part of plant data which must be saved on-chain
    struct Plant {
        address     proxy;        // which proxy of Chainlink price feed
        bool        active;       // active or not 
        int         latestPrice;  // latest updated price
        int         power;        // power of the plant
    }

    /// @dev Plant data storage
    Plant[] private _plants;

    /// @notice Emit whenever apply operation on plant 
    event GrowthRecord( uint indexed plantID,
                        address indexed proxy,
                        bool indexed active,
                        int latestPrice,
                        int power);
    
    /**
     * @dev Set name, symbol, and addresses of interactive contracts
     * @param ensRegistryAddr Address of ENS Registry
    */
    constructor(address ensRegistryAddr)
        ERC721("Crypiranha Plant", "CRHP") {
        plantIDCounter = 0;
        _ens = ENS(ensRegistryAddr);
        Cytokenin ctkContract = new Cytokenin(address(this));
        ctkAddress = address(ctkContract);
        _ctk = CTK(ctkAddress);
        _ctk.mint(msg.sender, 7777777777);
    }

    /**
     * @notice Get plant's on-chain information
     * @param plantID ID of the plant
     * @return On-chain information of the plant
    */
    function getPlantInfo(uint plantID) public view returns (Plant memory) {
        require(_exists(plantID),
                "CHRP: gargener query for nonexistent plant");
        return _plants[plantID];
    }

    /** 
     * @notice Get plant IDs, like (2,6,9), given owner
     * @param owner Owner of these plants
     * @return IDs of these plants
    */
    function getPlantIDs(address owner) external view returns(uint[] memory) {
        uint ownerBalance = balanceOf(owner);
        uint[] memory plantIDs = new uint[](ownerBalance);
        uint listIdx = 0;
        for (uint plantID = 0; listIdx < ownerBalance; plantID++) {
            if (_exists(plantID) && ownerOf(plantID) == owner) {
                plantIDs[listIdx] = plantID;
                listIdx++;
            }
        }
        return plantIDs;
    }

    /** 
     * @notice Plant a seed
     * @param plantType ENS-namehash of given pair (ex: eth-usd.data.eth)
    */
    function seed(bytes32 plantType) external {
        address proxy = _resolve(plantType);
        require(proxy != address(0),
                "CRHP: invalid price feed");
        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(proxy);
        (,int currPrice,,,) = pricefeed.latestRoundData();
        
        // mint plant and store its data on chain
        _mint(msg.sender, plantIDCounter);
        _plants.push(Plant(proxy, true, currPrice, 1000));

        emit GrowthRecord(plantIDCounter, proxy, true, currPrice, 1000);
        plantIDCounter++;
    }
    
    /** 
     * @notice Make an active plant rest and update its power
     * @param plantID ID of the plant
    */    
    function rest(uint plantID) external checkGardener(plantID) {
        Plant storage target = _plants[plantID];
        require(target.active,
                "CRHP: plant is already inactive");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.proxy);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // update on-chain data
        target.latestPrice = currPrice;
        target.power = ((currPrice << 10)/target.latestPrice*target.power) >> 10;
        target.active = false;

        // record plant state
        emit GrowthRecord(plantID, target.proxy, false, currPrice, target.power);
    }

    /** 
     * @notice Make an inactive plant wake and update its price
     * @param plantID ID of the plant
    */  
    function wake(uint plantID) external checkGardener(plantID) {
        Plant storage target = _plants[plantID];
        require(!target.active,
                "CRHP: plant is already active");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.proxy);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // update on-chain data
        target.latestPrice = currPrice;
        target.active = true;

        // record plant state
        emit GrowthRecord(plantID, target.proxy, true, currPrice, target.power);
    }

    /** 
     * @notice Extract Cytokenin from a plant
     * @dev Gardener get CTK
     * @param plantID ID of the plant
    */  
    function extract(uint plantID) external checkGardener(plantID){
        Plant storage target = _plants[plantID];
        require(!target.active,
                "CRHP: can only extract CTK from inactive plant");
        
        _burn(plantID);
        _ctk.mint(msg.sender, uint(target.power));
    }

    /** 
     * @notice Use CTK to stimulate a plant and change its state
     * @dev Gardener cost CTK
     * @param plantID ID of the plant
    */  
    function stimulate(uint plantID) external checkGardener(plantID) {
        Plant storage target = _plants[plantID];
        
        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.proxy);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // charge CTK from gardener
        if (target.active) {
            if (currPrice < target.latestPrice) {
                _ctk.burn(msg.sender, uint((((target.latestPrice << 10)/currPrice*target.power) >> 10) - target.power));
            }
            target.active = false;
        }
        else {
            if (currPrice > target.latestPrice) {
                _ctk.burn(msg.sender, uint((((currPrice << 10)/target.latestPrice*target.power) >> 10) - target.power));
            }
            target.active = true;
        }

        // record plant state
        emit GrowthRecord(plantID, target.proxy, target.active, target.latestPrice, target.power);
    }

    /// @dev Check if gardener can access the plant
    modifier checkGardener(uint plantID) {
        require(_isApprovedOrOwner(msg.sender, plantID),
                "CRHP: gardener can't access the plant");
        _;
    }

    /** 
     * @dev Resolve ENS-namehash to Chainlink price feed proxy
     * @param node ENS-namehash of given pair
     * @return Chainlink price feed proxy
    */
    function _resolve(bytes32 node) private view returns (address) {
        Resolver resolver = _ens.resolver(node);
        return resolver.addr(node);
    }
}