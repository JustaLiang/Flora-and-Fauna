// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@OpenZeppelin/contracts/token/ERC721/ERC721.sol";
import "@OpenZeppelin/contracts/access/Ownable.sol";

contract Garden is ERC721, Ownable {
 
    uint public plantCounter;
    uint public decimals;
    address public laboratoryAddress;
    AggregatorV3Interface private priceFeed;

    struct Plant {
        address     gardenAddress;
        bool        phototropism;
        int         height;
        int         prosperity;
        uint        mutationCount;
        uint        recoveryCount;
        uint        startTime;
    }

    Plant[] public plants;

    event GrowthRecord( uint indexed plantID,
                        address indexed gardenAddress,
                        bool indexed phototropism,
                        int height,
                        int prosperity);
    
    constructor() ERC721("Cytokenin Plant", "CKP") {
        plantCounter = 0;
        decimals = 4;
    }

    function seed(address gardenAddress_, bool phototropism_) external {
        priceFeed = AggregatorV3Interface(gardenAddress_);
        (,int price,,uint timeStamp,) = priceFeed.latestRoundData();
        plants.push(Plant(gardenAddress_, phototropism_, price, 0, 0, 0, timeStamp));
        _mint(msg.sender, plantCounter);

        emit GrowthRecord(plantCounter, gardenAddress_, phototropism_, price, 0);
        plantCounter += 1;
    }
    
    function mutate(uint plantID_) external {
        require(ownerOf(plantID_) == msg.sender,
                "Garden: caller is not the owner of this plant");

        address gardenAddress = plants[plantID_].gardenAddress;
        priceFeed = AggregatorV3Interface(gardenAddress);
        (,int price,,,) = priceFeed.latestRoundData();
        int change;
        bool phototropism;
        if (plants[plantID_].phototropism) {
            change = price*decimals/plants[plantID_].height - decimals;
            phototropism = false;
        }
        else {
            change = decimals - price*decimals/plants[plantID_].height;
            phototropism = true;
        }
        plants[plantID_].phototropism = phototropism;
        plants[plantID_].height = price;
        int prosperity = (decimals + plants[plantID_].prosperity)*(decimals + change);
        prosperity = prosperity/decimals - decimals;
        plants[plantID_].prosperity = prosperity;
        plants[plantID_].mutationCount += 1;

        emit GrowthRecord(plantID_, gardenAddress, phototropism, price, prosperity);
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

    function changePhototropism(uint plantID) external {
        require(msg.sender == laboratoryAddress,
                "Garden: this method only call by Laboratory");
        plants[plantID].phototropism = !plants[plantID].phototropism;
        plants[plantID].recoveryCount += 1;
    }

}