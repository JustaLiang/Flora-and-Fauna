// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CytokeninInterface.sol";
import "./Garden.sol";
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract Laboratory is Garden {

    CytokeninInterface private cytokenin;
    AggregatorV3Interface private priceFeed;

    constructor(address cytokeninAddress) {
        cytokenin = CytokeninInterface(cytokeninAddress);
    }

    function extractCytokeninFrom(uint plantID) external {
        require(msg.sender == ownerOf(plantID),
                "Laboratory: caller is not the owner of this plant");
        int prosperity = _plants[plantID].prosperity;
        require(prosperity >= 0,
                "Laboratory: only extract cytokenins from healthy plants");
        _burn(plantID);
        cytokenin.mint(msg.sender, uint(prosperity));
    }

    function recoverPhototropism(uint plantID) external {
        require(msg.sender == ownerOf(plantID),
                "Laboratory: caller is not the owner of this plant");
        Plant storage sample = _plants[plantID];
        int height = sample.height;
        priceFeed = AggregatorV3Interface(sample.gardenAddress);
        (,int price,,,) = priceFeed.latestRoundData();
        bool phototropism;
        if (sample.phototropism) {
            price = height - price;
            phototropism = false;
        }
        else {
            price = price - height;
            phototropism = true;
        }
        uint cost;
        if (price < 0) {
            cost = 0;
        }
        else {
            cost = uint(price);
        }
        cytokenin.burn(msg.sender, cost);
        sample.phototropism = phototropism;
        sample.recoveryCount += 1;
    }
}