// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ArmyBase.sol";

/**
 * @title Fauna Army, which grows in bearish market
 * @notice ERC721 token cultivated by predicting market price (using Chainlink oracle)
 * @author Justa Liang
 */
contract FaunaArmy is ArmyBase {

    /**
     * @dev Set name, symbol, and addresses of interactive contracts
     * @param ensRegistryAddr Address of ENS Registry
    */
    constructor(address ensRegistryAddr, uint initEnhancer,
                int[5] memory powerLevels, string[5] memory jsonNames) 
        ArmyBase(ensRegistryAddr)
        ERC721("FaunaArmy", "FaunA")
    {
        enhancerContract = ENHR(address(new ArmyEnhancer("Hemoglobin", "HGB")));
        enhancerContract.produce(msg.sender, initEnhancer);
        rankContract = RANK(address(new ArmyRank(powerLevels, jsonNames)));
        rankContract.transferOwnership(msg.sender);
    }

    /**
     * @notice Train a minion and update the environment factor
     * @param minionID ID of the minion
    */
    function train(uint minionID) external override checkCommander(minionID) {
        Minion storage target = minions[minionID];
        require(
            target.armed,
            "ARMY: minion is already in training state");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // update on-chain data
        target.envFactor = currPrice;
        target.armed = false;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, false, currPrice, target.power);
    }

    /**
     * @notice Arm a minion and update its power
     * @param minionID ID of the minion
    */
    function arm(uint minionID) external override checkCommander(minionID) {
        Minion storage target = minions[minionID];
        require(
            !target.armed,
            "ARMY: minion is already armed");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // update on-chain data
        target.power = ((target.envFactor << 16)/currPrice*target.power) >> 16;
        target.envFactor = currPrice;
        target.armed = true;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, true, currPrice, target.power);
    }

    /**
     * @notice Use Hemoglobin to stimulate an armed minion to catch up with training
     * @dev Commander cost Hemoglobin
     * @param minionID ID of the minion
    */
    function boost(uint minionID) external override checkCommander(minionID) {
        Minion storage target = minions[minionID];
        require(
            target.armed,
            "ARMY: minion is already in training state");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // change state
        if (currPrice < target.envFactor) {
             enhancerContract.consume(msg.sender, uint(((target.envFactor << 16)/currPrice*target.power) >> 16));
        }
        target.armed = false;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, false, target.envFactor, target.power);
    }

    /**
     * @notice Use Hemoglobin to heal a minion who suffer from negative training
     * @dev Commander cost Hemoglobin
     * @param minionID ID of the minion
    */
    function heal(uint minionID) external override checkCommander(minionID) {
        Minion storage target = minions[minionID];
        require(
            !target.armed,
            "ARMY: minion is not in training state");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // change state
        if (currPrice > target.envFactor) {
            enhancerContract.consume(msg.sender, uint(((currPrice << 16)/target.envFactor*target.power) >> 16));
        }
        target.armed = true;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, true, target.envFactor, target.power);
    }
}