module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const floraArmy = await get("FloraArmy");
    const faunaArmy = await get("FaunaArmy");

    const battlefield = await deploy("Battlefield", {
        from: deployer,
        args: [floraArmy.address, faunaArmy.address],
    });
    console.log("Battlefield deployed to:", battlefield.address);
};
  