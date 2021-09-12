import { initEnhancer, powerLevels, floraNames } from "../scripts/param";

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const chainId = await getChainId();
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    //--- get ENS registry address
    const ensAddr = (chainId === '1337') ?
        (await get("MockEnsRegistry")).address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
    console.log("ensAddr:", ensAddr);

    //--- deploy FloraArmy
    const floraArmy = await deploy("FloraArmy", {
        from: deployer,
        args: [ensAddr, initEnhancer, powerLevels, floraNames]
    });
    console.log("FloraArmy deployed to:", floraArmy.address);
};
  