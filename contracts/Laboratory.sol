// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GardenInterface.sol";
import "./CytokeninInterface.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract Laboratory {

    GardenInterface private garden;
    CytokeninInterface private cytokenin;
    AggregatorV3Interface private priceFeed;

    constructor(address gardenAddress,
                address cytokeninAddress) {
        garden = GardenInterface(gardenAddress);
        cytokenin = CytokeninInterface(cytokeninAddress);
    }

    function extractCytokeninFrom(uint plantID) external {
        require(msg.sender == garden.ownerOf(plantID),
                "Laboratory: caller is not the owner of this plant");
        garden.transferFrom(msg.sender, address(this), plantID);
        (,,,int prosperity,,,) = garden.plants(plantID);
        uint prosp = uint(prosperity);
        cytokenin.mint(msg.sender, prosp);
    }

    function changePhototropism(uint plantID) external {
        require(msg.sender == garden.ownerOf(plantID),
                "Laboratory: caller is not the owner of this plant");
        (address gardenAddr,bool phototropism,int height,,,,) = garden.plants(plantID);
        priceFeed = AggregatorV3Interface(gardenAddr);
        (,int price,,,) = priceFeed.latestRoundData();
        if (phototropism) {
            price = height - price;
        }
        else {
            price = price - height;
        }
        uint cost;
        if (price < 0) {
            cost = 0;
        }
        else {
            cost = uint(price);
        }
        cytokenin.burn(msg.sender, cost);
        garden.changePhototropism(plantID);
    }
}