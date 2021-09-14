import { ethers } from "ethers";

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { deploy, get, all, read } = deployments;
    const { deployer } = await getNamedAccounts();

    const floraArmy = await get("FloraArmy");
    const faunaArmy = await get("FaunaArmy");

    const battlefield = await deploy("Battlefield", {
        from: deployer,
        args: [floraArmy.address, faunaArmy.address],
    });
    console.log("Battlefield deployed to:", battlefield.address);

    const allDeployments = await all();
    Object.keys(allDeployments).map((cName) => {
      console.log(cName, allDeployments[cName].address);
    })
    
    const testPairs = ['eth-usd', 'btc-usd', 'bnb-usd', 'link-usd'];
    testPairs.map(async (pair) => {
      const pairHash = ethers.utils.namehash(pair + ".data.eth");
      console.log(pair, await read("MockEnsRegistry", "resolver", pairHash));
      console.log(pair, await read("MockPublicResolver", "addr", pairHash));
    })
};
  