import { Contract } from "ethers";
import { initEnhancer, powerLevels, faunaNames, faunaPrefix } from "../scripts/param";

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const chainId = await getChainId();
    const { deploy, get, execute } = deployments;
    const { deployer } = await getNamedAccounts();

    //--- get ENS registry address
    const ensAddr = (chainId === '1337') ?
        (await get("MockEnsRegistry")).address : "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
    console.log("ensAddr:", ensAddr);

    //--- deploy FaunaArmy
    await deploy("FaunaArmy", {
        from: deployer,
        args: [ensAddr, initEnhancer, powerLevels, faunaNames]
        })
        .then((faunaArmy: Contract) => {
            console.log("FaunaArmy deployed to:", faunaArmy.address);
            execute("FaunaArmy", {from: deployer}, "updateBaseURI", faunaPrefix);
        });
};
  