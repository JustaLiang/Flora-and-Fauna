# Cryprianha Plant
Cultivate plants (dynamic NFTs) by predicting market. 

## Installation

1. [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html), if you haven't already. You must be using version `1.9.0` or newer.

2. Install the React client dependencies.

    ```bash
    cd client
    yarn install
    ```

3. In [MetaMask](https://metamask.io/) or another web3 browser extension.

4. Set MetaMask local RPC
![Custom RPC](assets/CustomRPC.png)
![Custom settings](assets/CustomSettings.png)

## Usage (Local)

1. Open the Brownie console. Starting the console launches a fresh instance in the background.

    ```bash
    $ brownie console
    Brownie v1.14.4 - Python development framework for Ethereum

    CrypiranhaPlantProject is the active project.

    Launching 'ganache-cli --port 8545 --gasLimit 12000000 --accounts 10 --hardfork istanbul --mnemonic hill law jazz limb penalty escape public dish stand bracket blue jar'...
    Brownie environment is ready.
    ```

2. Run the [deployment script](scripts/deploy.py) to deploy the project's smart contracts.

    ```python
    >>> run("deploy")
    ```

3. While Brownie is still running, start the React app in a different terminal.

    ```bash
    # make sure to use a different terminal, not the brownie console
    cd client
    yarn start
    ```

4. Connect Metamask to the local Ganache network. In the upper right corner, click the network dropdown menu. Select `Localhost 8545`


5. Interact with the smart contracts using the web interface or via the Brownie console.

    ```python
    # get the newest vyper storage contract
    >>> crhp = CrypiranhaPlant[-1]

    # seed a ETH/USD plant
    >>> crhp.seed(0xf599f4cd075a34b92169cf57271da65a7a936c35e3f31e854447fbb3e7eb736d)
    ```

    Any changes to the contracts from the console should show on the website after a refresh, and vice versa.


## Usage (Rinkeby)

1. Start the React app.

    ```bash
    # make sure to use a different terminal, not the brownie console
    cd client
    yarn start
    ```
2. Connect Metamask to the Rinkeby testnet

3. Interact with the smart contracts using the web interface