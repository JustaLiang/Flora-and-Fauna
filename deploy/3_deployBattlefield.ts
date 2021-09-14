import { ethers } from "ethers";

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { deploy, get, all, read } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    const floraArmy = await get("FloraArmy");
    const faunaArmy = await get("FaunaArmy");

    const battlefield = await deploy("Battlefield", {
        from: deployer,
        args: [floraArmy.address, faunaArmy.address],
    });
    console.log("Battlefield deployed to:", battlefield.address);
};
  