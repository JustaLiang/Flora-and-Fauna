// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openZeppelin/contracts/token/ERC721/ERC721.sol";
import "@openZeppelin/contracts/token/ERC20/IERC20.sol";

// ENS Registry Contract
interface ENS {
    function resolver(bytes32 node) external view returns (Resolver);
}

// Chainlink Resolver
interface Resolver {
    function addr(bytes32 node) external view returns (address);
}

// Cytokenin operation
interface CytokeninInterface is IERC20 {
    function mint(address who, uint amount) external;
    function burn(address who, uint amount) external;
}

// main
contract CryptoGarden is ERC721 {
 
    uint public idCounter;
    uint public decimals;
    int private sig;
    AggregatorV3Interface private pricefeed;
    CytokeninInterface private cytokenin;
    ENS private ens;

    struct CryptoPlant {
        address     aggregator;
        bool        directionUp;
        int         latestPrice;  
        int         prosperity;
    }

    CryptoPlant[] private cryptoPlants;

    event GrowthRecord( uint indexed plantID,
                        address indexed aggregator,
                        bool indexed directionUp,
                        int latestPrice,
                        int prosperity);
    
    constructor(address ensRegistry, address cytokeninAddress) ERC721("Crypto Plants", "CP") {
        idCounter = 0;
        decimals = 3;
        sig = int(10**decimals);
        ens = ENS(ensRegistry);
        cytokenin = CytokeninInterface(cytokeninAddress);
    }

    modifier checkGardener(uint plantID) {
        require(_isApprovedOrOwner(msg.sender, plantID),
                "Garden: gardener can't access this plant");
        _;
    }

    function _resolve(bytes32 node) private view returns (address) {
        Resolver resolver = ens.resolver(node);
        return resolver.addr(node);
    }

    function existPlant(uint plantID) public view returns (bool) {
        return _exists(plantID);
    }

    function showPlant(uint plantID) public view returns (CryptoPlant memory) {
        return cryptoPlants[plantID];
    }

    function seed(bytes32 node, bool directionUp) external {
        address aggregator = _resolve(node);
        require(aggregator != address(0),
                "invalid price feed");
        pricefeed = AggregatorV3Interface(aggregator);
        (,int price,,,) = pricefeed.latestRoundData();
        cryptoPlants.push(CryptoPlant(aggregator, directionUp, price, 0));
        _mint(msg.sender, idCounter);

        emit GrowthRecord(idCounter, aggregator, directionUp, price, 0);
        idCounter += 1;
    }
    
    function turnAround(uint plantID) public checkGardener(plantID) {
        CryptoPlant storage sample = cryptoPlants[plantID];
        address aggregator = sample.aggregator;
        pricefeed = AggregatorV3Interface(aggregator);
        (,int price,,,) = pricefeed.latestRoundData();
        int change;
        bool directionUp;
        if (sample.directionUp) {
            change = price*sig/sample.latestPrice - sig;
            directionUp = false;
        }
        else {
            change = sig - price*sig/sample.latestPrice;
            directionUp = true;
        }
        sample.directionUp = directionUp;
        sample.latestPrice = price;
        int prosperity = (sig + sample.prosperity)*(sig + change);
        prosperity = prosperity/sig - sig;
        sample.prosperity = prosperity;

        emit GrowthRecord(plantID, aggregator, directionUp, price, prosperity);
    }

    function getPlantsByOwner(address owner) external view returns(uint[] memory) {
        uint ownerBalance = balanceOf(owner);
        uint[] memory plantIDList = new uint[](ownerBalance);
        uint listIdx = 0;
        for (uint plantID = 0; listIdx < ownerBalance; plantID++) {
            if (_exists(plantID) && ownerOf(plantID) == owner) {
                plantIDList[listIdx] = plantID;
                listIdx++;
            }
        }
        return plantIDList;
    }

    function extractCytokenin(uint plantID) external checkGardener(plantID) {
        int prosperity = cryptoPlants[plantID].prosperity;
        if (prosperity > 0) {
            cytokenin.mint(msg.sender, uint(prosperity));
        }
        _burn(plantID);
        emit GrowthRecord(plantID, address(0), false, 0, 0);
    }

    function recoverTurning(uint plantID) external checkGardener(plantID) {
        CryptoPlant storage sample = cryptoPlants[plantID];
        int latestPrice = sample.latestPrice;
        pricefeed = AggregatorV3Interface(sample.aggregator);
        (,int price,,,) = pricefeed.latestRoundData();
        int change;
        bool directionUp;
        if (sample.directionUp) {
            change = price*sig/latestPrice - sig;
            directionUp = false;
        }
        else {
            change = sig - price*sig/latestPrice;
            directionUp = true;
        }
        uint cost = 0;
        if (change < 0) {
            if (sample.prosperity > sig) {
                cost = uint(-2*change*sample.prosperity/sig);
            }
            else {
                cost = uint(-2*change);
            }
        }

        cytokenin.burn(msg.sender, cost);
        sample.directionUp = directionUp;
        emit GrowthRecord(plantID, sample.aggregator, sample.directionUp, latestPrice, sample.prosperity);
    }
}