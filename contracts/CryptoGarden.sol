// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@openZeppelin/contracts/token/ERC721/ERC721.sol";
import "./CytokeninInterface.sol";

contract CryptoGarden is ERC721 {
 
    uint public idCounter;
    uint public decimals;
    int private sig;
    AggregatorV3Interface private pricefeed;
    CytokeninInterface private cytokeninContract;

    struct CryptoPlant {
        address     aggregator;
        bool        directionUp;
        int         latestPrice;  
        int         prosperity;
        uint        turningCount;
        uint        recoveryCount;
    }

    CryptoPlant[] private cryptoPlants;

    event GrowthRecord( uint indexed plantID,
                        address indexed aggregator,
                        bool indexed directionUp,
                        int latestPrice,
                        int prosperity);
    
    constructor(address cytokeninAddress) ERC721("Crypto Plants", "CP") {
        idCounter = 0;
        decimals = 3;
        sig = int(10**decimals);
        cytokeninContract = CytokeninInterface(cytokeninAddress);
    }

    modifier checkGardener(uint plantID) {
        require(_isApprovedOrOwner(msg.sender, plantID),
                "Garden: gardener can't access this plant");
        _;
    }

    function existPlant(uint plantID) public view returns (bool) {
        return _exists(plantID);
    }

    function showPlant(uint plantID) public view returns (CryptoPlant memory) {
        return cryptoPlants[plantID];
    }

    function seed(address aggregator_, bool directionUp_) external {
        pricefeed = AggregatorV3Interface(aggregator_);
        (,int price,,,) = pricefeed.latestRoundData();
        cryptoPlants.push(CryptoPlant(aggregator_, directionUp_, price, 0, 0, 0));
        _mint(msg.sender, idCounter);

        emit GrowthRecord(idCounter, aggregator_, directionUp_, price, 0);
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
        sample.turningCount += 1;

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
            cytokeninContract.mint(msg.sender, uint(prosperity));
        }
        _burn(plantID);
    }

    function recoverTurning(uint plantID) external checkGardener(plantID) {
        CryptoPlant storage sample = cryptoPlants[plantID];
        int latestPrice = sample.latestPrice;
        pricefeed = AggregatorV3Interface(sample.aggregator);
        (,int price,,,) = pricefeed.latestRoundData();
        bool directionUp;
        if (sample.directionUp) {
            price = latestPrice - price;
            directionUp = false;
        }
        else {
            price = price - latestPrice;
            directionUp = true;
        }
        uint cost;
        if (price < 0) {
            cost = 0;
        }
        else {
            cost = uint(price);
        }
        cytokeninContract.burn(msg.sender, cost);
        sample.directionUp = directionUp;
        sample.recoveryCount += 1;
    }
}