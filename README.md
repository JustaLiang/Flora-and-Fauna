# Green vs Red
Train minions (dynamic NFTs) by predicting market. 

## Installation

1. Install Ganache.
    
    ```bash
    npm install -g ganache-cli
    ```

2. Install project dependencies.
    
    ```bash
    pip3 install -r requirements.txt
    ```
   
3. Install the React client dependencies.

    ```bash
    cd client
    yarn install
    ```

4. In [MetaMask](https://metamask.io/), set MetaMask local RPC.  
  
<img src="./assets/CustomRPC.png" alt="Custom RPC" width="250" height="400"/><img src="./assets/CustomSettings.png" alt="Custom Settings" width="250" height="400"/>  

## Usage (Local testnet)

1. Open the Brownie console. Starting the console launches a fresh instance in the background.

    ```bash
    $ brownie console
    Brownie v1.14.4 - Python development framework for Ethereum

    Project is the active project.

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

4. Connect Metamask to the local network. In the upper right corner, click the network dropdown menu.  
   Select `Localhost 8545` and refresh the page.

<img src="./assets/SelectLocal.png" alt="Select Local" width="250" height="400"/>  

5. Interact with the smart contracts using the web interface or via the Brownie console.

    ```python
    # get the newest GreenArmy contract
    >>> g_army = GreenArmy[-1]

    # recruit a minion at ETH/USD barrack
    # 0xf599f... is the ens-namehash of "eth-usd.data.eth"
    >>> g_army.recruit('0xf599f4cd075a34b92169cf57271da65a7a936c35e3f31e854447fbb3e7eb736d')
    ```

    Any changes to the contracts from the console should show on the website after a refresh, and vice versa.


## Usage (Rinkeby testnet)

1. Start the React app.

    ```bash
    cd client
    yarn start
    ```
    
2. Connect Metamask to the local network. In the upper right corner, click the network dropdown menu.  
   Select `Rinkeby` and refresh the page.
  
<img src="./assets/SelectRinkeby.png" alt="Select Rinkeby" width="250" height="400"/>  

3. Interact with the smart contracts using the web interface.

## How to play

1. Choose a valid [Chainlink price feed](https://docs.chain.link/docs/ethereum-addresses/), for example: ETH/USD  
2. Recruit a green or red minion from this ETH/USD barrack, with initial strength 1000.  
3. Train the minion under market environment.  
   Green minions become stronger in bullish market, weaker in bearish.  
   Red minions become stronger in bearish market, weaker in bullish.  
4. Arm the minion when it's about to set off.  
   Armed minions are unaffected by market change.  
5. You can recover a minion who is suffering negative training, but it cost some extra Protein.
6. You can reinforce a armed minion to catch up training, but still it cost some extra Protein.
7. Liberate a minion and get some Protein to help other allies.  
   Seems bloody and cruel? Well it's just a game, don't take it too serious >.^
8. After recruiting some minions to form a troop, time to go on a expedition.
   
 
