const hre = require("hardhat");
import { floraPrefix, faunaPrefix } from "../scripts/param";

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { read } = deployments;
  
    const floraRankAddr = await read("FloraArmy","rankContract");
    console.log("FloraRank deployed to:", floraRankAddr);
    const faunaRankAddr = await read("FaunaArmy","rankContract");
    console.log("FaunaRank deployed to:", faunaRankAddr);

    const ArmyRank = await hre.ethers.getContractFactory("ArmyRank");
    const zeroAddr = hre.ethers.constants.AddressZero;

    const floraRank = ArmyRank.attach(floraRankAddr);
    floraRank.updateBranchPrefix(zeroAddr, floraPrefix);
    console.log("Flora prefix:", await floraRank.branchPrefix(zeroAddr));

    const faunaRank = ArmyRank.attach(faunaRankAddr);
    faunaRank.updateBranchPrefix(zeroAddr, faunaPrefix);
    console.log("Fauna prefix:", await faunaRank.branchPrefix(zeroAddr));
};
  