// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@OpenZeppelin/contracts/token/ERC721/ERC721.sol";
import "@OpenZeppelin/contracts/access/Ownable.sol";

contract Garden is ERC721, Ownable {
 
    uint public plantCounter;
    uint public decimals;
    int private sig;
    address public laboratoryAddress;
    AggregatorV3Interface private priceFeed;

    struct Plant {
        address     gardenAddress;
        bool        phototropism;
        int         height;
        int         prosperity;
        uint        mutationCount;
        uint        recoveryCount;
    }

    Plant[] internal _plants;

    event GrowthRecord( uint indexed plantID,
                        address indexed gardenAddress,
                        bool indexed phototropism,
                        int height,
                        int prosperity);
    
    constructor() ERC721("Cytokenin Plant", "CKP") {
        plantCounter = 0;
        decimals = 4;
        sig = int(10**decimals);
    }

    function checkPlant(uint plantID) public view returns (Plant memory) {
        require(_exists(plantID),
                "Garden: plant does not exist");
        return _plants[plantID];
    }

    function seed(address gardenAddress_, bool phototropism_) external {
        priceFeed = AggregatorV3Interface(gardenAddress_);
        (,int price,,,) = priceFeed.latestRoundData();
        _plants.push(Plant(gardenAddress_, phototropism_, price, 0, 0, 0));
        _mint(msg.sender, plantCounter);

        emit GrowthRecord(plantCounter, gardenAddress_, phototropism_, price, 0);
        plantCounter += 1;
    }
    
    function changePhototropism(uint plantID) external {
        require(_exists(plantID),
                "Garden: plant does not exist");
        require(ownerOf(plantID) == msg.sender,
                "Garden: caller is not the owner of this plant");

        Plant storage sample = _plants[plantID];
        address gardenAddress = sample.gardenAddress;
        priceFeed = AggregatorV3Interface(gardenAddress);
        (,int price,,,) = priceFeed.latestRoundData();
        int change;
        bool phototropism;
        if (sample.phototropism) {
            change = price*sig/sample.height - sig;
            phototropism = false;
        }
        else {
            change = sig - price*sig/sample.height;
            phototropism = true;
        }
        sample.phototropism = phototropism;
        sample.height = price;
        int prosperity = (sig + sample.prosperity)*(sig + change);
        prosperity = prosperity/sig - sig;
        sample.prosperity = prosperity;
        sample.mutationCount += 1;

        emit GrowthRecord(plantID, gardenAddress, phototropism, price, prosperity);
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
}