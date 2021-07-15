// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @notice ENS registry to get chainlink resolver
 */
interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

/**
 * @notice Chainlink resolver to get price feed aggregator
 */
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

/**
 * @notice Allow this contract to mint or burn gardener's Cytokenin
 */
interface CTK {
    function mint(address gardener, uint amount) external;
    function burn(address gardener, uint amount) external;
}

/**
 * @title CrypiranhaPlant (ERC721) cultivated by predicting market price
 * @notice Market price obtained from Chainlink oracle
 * @author Justa Liang
 */
contract CrypiranhaPlant is ERC721 {

    using Counters for Counters.Counter;
    /// @dev OpenZeppelin Counter
    Counters.Counter private _plantIds;

    /// @notice Decimals of price change
    /// @dev set to 3, ex: 50->70 change=70*10^3/50 - 10^3 = 400 (40.0%)
    uint public decimals;

    /// @dev 10^decimals
    int private _multiplier;

    /// @dev ENS interface (fixed address)
    ENS private _ens;
    /// @dev Cytokenin interface (fixed address)
    CTK private _ctk;

    /// @dev part of plant data which must be saved on chain
    struct Plant {
        address     aggregator;     // which aggregator of Chainlink price feed
        bool        direction;      // long or short for price
        int         latestPrice;    // latest updated price
        int         power;          // power of the plant
    }

    /// @dev plant mapping
    mapping(uint => Plant) private _plants;

    /// @notice Emit whenever apply operation on plant 
    event GrowthRecord( uint indexed plantID,
                        address indexed aggregator,
                        bool indexed direction,
                        int latestPrice,
                        int power);
    
    /// @dev set name, symbol, and addresses of interactive contracts
    constructor(address ensRegistryAddr, address cytokeninAddr)
        ERC721("Crypiranha Plant", "CRHP") {
        decimals = 3;
        _multiplier = int(10**decimals);
        _ens = ENS(ensRegistryAddr);
        _ctk = CTK(cytokeninAddr);
    }

    /**
     * @notice Get plant's on-chain information
     * @param plantID ID of the plant
     * @return On-chain information of the plant
    */
    function getPlantInfo(uint plantID) public view returns (Plant memory) {
        require(_exists(plantID),
                "plant not exists");
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
     * @param plantType ENS-namehash of given pair
     * @param direction Long (true) or short (false)
     * @return ID of the new plant
    */
    function seed(bytes32 plantType, bool direction) external returns (uint) {
        address aggregator = _resolve(plantType);
        require(aggregator != address(0),
                "Garden: invalid price feed");
        AggregatorV3Interface pricefeed = AggregatorV3Interface(aggregator);
        (,int price,,,) = pricefeed.latestRoundData();
        _plantIds.increment();
        uint plantID = _plantIds.current();
        _plants[plantID] = Plant(aggregator, direction, price, 0);
        _mint(msg.sender, plantID);

        emit GrowthRecord(plantID, aggregator, direction, price, 0);
        return plantID;
    }
    
    /** 
     * @notice Update plant's power without changing direction
     * @param plantID ID of the plant
     * @return Power after update
    */    
    function keepGoing(uint plantID) external checkGardener(plantID) returns (int) {
        Plant storage sample = _plants[plantID];
        (int change, int nowPrice) = _getChange(sample);
        sample.latestPrice = nowPrice;
        sample.power = _getNewPower(sample.power, change);

        emit GrowthRecord(plantID, sample.aggregator, sample.direction, nowPrice, sample.power);
        return sample.power;
    }

    /** 
     * @notice Update plant's power and change direction
     * @param plantID ID of the plant
     * @return Power after update
    */  
    function turnAround(uint plantID) external checkGardener(plantID) returns (int) {
        Plant storage sample = _plants[plantID];
        (int change, int nowPrice) = _getChange(sample);
        sample.latestPrice = nowPrice;
        sample.power = _getNewPower(sample.power, change);
        sample.direction = !sample.direction;

        emit GrowthRecord(plantID, sample.aggregator, sample.direction, nowPrice, sample.power);
        return sample.power;
    }

    /** 
     * @notice Extract Cytokenin from healthy plant (get CTK)
     * @param plantID ID of the plant
     * @return Amount of Cytokenin extracted
    */  
    function extract(uint plantID) external checkGardener(plantID) returns (uint) {
        Plant memory sample = _plants[plantID];
        (int change,) = _getChange(sample);
        int newPower = _getNewPower(sample.power, change);
        uint gain;
        if (newPower > 0) {
            gain = uint(newPower);
            _ctk.mint(msg.sender, gain);
        }
        else {
            gain = 0;
        }
        _burn(plantID);

        emit GrowthRecord(plantID, sample.aggregator, sample.direction, 0, 0);
        return gain;
    }

    /** 
     * @notice Change direction without update plant's power (cost CTK)
     * @param plantID ID of the plant
     * @return Amount of Cytokenin cost
    */  
    function mutate(uint plantID) external checkGardener(plantID) returns (uint) {
        Plant storage sample = _plants[plantID];
        (int change,) = _getChange(sample);
        uint cost;
        if (change < 0) {
            if (sample.power > _multiplier) {
                cost = uint(-2*change*sample.power/_multiplier);
            }
            else {
                cost = uint(-2*change);
            }
            _ctk.burn(msg.sender, cost);
        }
        sample.direction = !sample.direction;

        emit GrowthRecord(plantID, sample.aggregator, sample.direction, sample.latestPrice, sample.power);
    }

    modifier checkGardener(uint plantID) {
        require(_isApprovedOrOwner(msg.sender, plantID),
                "Garden: gardener can't access this plant");
        _;
    }

    function _resolve(bytes32 node) private view returns (address) {
        Resolver resolver = _ens.resolver(node);
        return resolver.addr(node);
    }

    function _getChange(Plant memory sample) private view returns (int change, int nowPrice) {
        address aggregator = sample.aggregator;
        AggregatorV3Interface pricefeed = AggregatorV3Interface(aggregator);
        (,nowPrice,,,) = pricefeed.latestRoundData();
        if (sample.direction) {
            change = nowPrice*_multiplier/sample.latestPrice - _multiplier;
        }
        else {
            change = _multiplier - nowPrice*_multiplier/sample.latestPrice;
        }
    }

    function _getNewPower(int power, int change) private view returns (int newPower) {
        newPower = (_multiplier + power)*(_multiplier + change);
        newPower = newPower/_multiplier - _multiplier;
    }
}