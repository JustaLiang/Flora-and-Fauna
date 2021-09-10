const hre = require("hardhat");
const deployENS = require('./deploy-ens');


const main = async () => {
    const ensAddress = await hre.run('deploy-ens');
    console.log('ens address',ensAddress);
}

main();