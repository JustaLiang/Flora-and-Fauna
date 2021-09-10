const hre = require("hardhat");
const ethers = require("ethers");

const zeroAddress = ethers.constants.AddressZero;
const initEnhancer = 7777777777777;
const powerLevels = [0, 1100, 1300, 1500, 2000];
const floraPrefix = "https://ipfs.io/ipfs/bafybeieh3wt7szwrdujfver5nfwbqfh7z6pcodk2h5k46m24oqmizolame/";
const floraNames = ['flora_1.json', 'flora_2.json', 'flora_3.json', 'flora_4.json', 'flora_5.json'];
const faunaPrefix = "https://ipfs.io/ipfs/bafybeigd7f3maglyvcyvxonmu4copfosxqocg5dpyetw7ozg22m44j27le/";
const faunaNames = ['fauna_1.json', 'fauna_2.json', 'fauna_3.json', 'fauna_4.json', 'fauna_5.json'];

const main = async () => {

  //--- get chain ID
  const chainId = await hre.getChainId();

  //--- setup local ENS, resolver and aggregator when in local network
  const setupEnsRegistry = async () => {
    const ENS = await hre.ethers.getContractFactory("MockEnsRegistry");
    const ens = await ENS.deploy();
    await ens.deployed();
    console.log("ENS deployed to:", ens.address);

    const Resolver = await hre.ethers.getContractFactory("MockPublicResolver");
    const resolver = await Resolver.deploy();
    await resolver.deployed();
    console.log("Resolver deployed to:", resolver.address);

    const Aggregator = await hre.ethers.getContractFactory("MockV3Aggregator");
    const mockPairs = ['eth-usd', 'btc-usd', 'bnb-usd', 'link-usd'];
    const mockPrices = [3500, 50000, 400, 30];

    mockPairs.map(async (pair, idx) => {
      const namehash = ethers.utils.namehash(pair + ".data.eth");
      console.log(idx);
      console.log(pair, namehash);
      const mockAgg = await Aggregator.deploy(1, mockPrices[idx] * 8);
      await mockAgg.deployed();
      console.log(pair, "Aggregator deployed to:", mockAgg.address);
      ens.setResolver(namehash, resolver.address);
      resolver.setAddr(namehash, mockAgg.address);
    })
    return ens.address;
  }

  //--- get ENS registry address
  const ensRegistryAddr = (chainId === '1337') ?
    await setupEnsRegistry() : "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

  //--- deploy FloraArmy
  const FloraArmy = await hre.ethers.getContractFactory("FloraArmy");
  const floraArmy = await FloraArmy.deploy(
    ensRegistryAddr, initEnhancer, powerLevels, floraNames
  );
  await floraArmy.deployed();
  console.log("FloraArmy deployed to:", floraArmy.address);

  //--- deploy FaunaArmy
  const FaunaArmy = await hre.ethers.getContractFactory("FaunaArmy");
  const faunaArmy = await FaunaArmy.deploy(
    ensRegistryAddr, initEnhancer, powerLevels, faunaNames
  );
  await faunaArmy.deployed();
  console.log("FaunaArmy deployed to:", faunaArmy.address);

  //--- setup FloraRank prefix
  const FloraRank = await hre.ethers.getContractFactory("ArmyRank");
  const floraRank = FloraRank.attach(await floraArmy.rankContract())
  floraRank.updateBranchPrefix(zeroAddress, floraPrefix);
  console.log("FloraRank prefix:", await floraRank.branchPrefix(zeroAddress));
  
  //--- setup FaunaRank prefix
  const FaunaRank = await hre.ethers.getContractFactory("ArmyRank");
  const faunaRank = FaunaRank.attach(await faunaArmy.rankContract())
  faunaRank.updateBranchPrefix(zeroAddress, faunaPrefix);
  console.log("FaunaRank prefix:", await faunaRank.branchPrefix(zeroAddress));

  //--- deploy battlefield
  const Battlefield = await hre.ethers.getContractFactory("Battlefield");
  const battlefield = await Battlefield.deploy(floraArmy.address, faunaArmy.address);
  await battlefield.deployed();
  console.log("Battlefield deployed to:", battlefield.address);
}
module.exports = main

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
