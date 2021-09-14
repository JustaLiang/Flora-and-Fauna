module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
}) => {
    const { all } = deployments;

    const allDeployments = await all();
    Object.keys(allDeployments).map((cName) => {
        console.log(cName, allDeployments[cName].address);
    });
};
