// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ArmyBase.sol";

/**
 * @title Green Army, which grows in bullish market
 * @notice ERC721 token cultivated by predicting market price (using Chainlink oracle)
 * @author Justa Liang
 */
contract GreenArmy is ArmyBase {

    /**
     * @dev Set name, symbol, and addresses of interactive contracts
     * @param ensRegistryAddr Address of ENS Registry
    */
    constructor(address ensRegistryAddr, uint initProtein) 
        ArmyBase(ensRegistryAddr)
        ERC721("Green Army", "gARMY")
    {
        proteinContract = PRTN(address(new ArmyProtein("Green Army Protein", "gPRTN")));
        proteinContract.produce(msg.sender, initProtein);
    }

    /**
     * @notice Train a minion and update the environment factor
     * @param minionID ID of the minion
    */
    function train(uint minionID) external override checkCommander(minionID) {
        Minion storage target = _minions[minionID];
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
        emit MinionState(minionID, target.branchAddr, false, currPrice, target.strength);
    }

    /**
     * @notice Arm a minion and update its strength
     * @param minionID ID of the minion
    */
    function arm(uint minionID) external override checkCommander(minionID) {
        Minion storage target = _minions[minionID];
        require(
            !target.armed,
            "ARMY: minion is already armed");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // update on-chain data
        target.strength = ((currPrice << 16)/target.envFactor*target.strength) >> 16;
        target.envFactor = currPrice;
        target.armed = true;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, true, currPrice, target.strength);
    }

    /**
     * @notice Use Protein to stimulate an armed minion to catch up training
     * @dev Commander cost Protein
     * @param minionID ID of the minion
    */
    function reinforce(uint minionID) external override checkCommander(minionID) {
        Minion storage target = _minions[minionID];
        require(
            target.armed,
            "ARMY: minion is already in training state");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // change state
        if (currPrice > target.envFactor) {
             proteinContract.consume(msg.sender, uint(((currPrice << 16)/target.envFactor*target.strength) >> 16));
        }
        target.armed = false;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, false, target.envFactor, target.strength);
    }

    /**
     * @notice Use Protein to recover a minion who suffer from negative training
     * @dev Commander cost Protein
     * @param minionID ID of the minion
    */
    function recover(uint minionID) external override checkCommander(minionID) {
        Minion storage target = _minions[minionID];
        require(
            !target.armed,
            "ARMY: minion is not in training state");

        // get current price
        AggregatorV3Interface pricefeed = AggregatorV3Interface(target.branchAddr);
        (,int currPrice,,,) = pricefeed.latestRoundData();

        // change state
        if (currPrice < target.envFactor) {
            proteinContract.consume(msg.sender, uint(((target.envFactor << 16)/currPrice*target.strength) >> 16));
        }
        target.armed = true;

        // emit minion state
        emit MinionState(minionID, target.branchAddr, true, target.envFactor, target.strength);
    }
}