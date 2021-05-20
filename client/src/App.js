import React from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends React.Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        laboratory: null,
        yourPlants: {},
        plantID: 0,
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()

        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        
        const {chainid} = this.state

        if (chainid <= 42) {
            // Wrong Network!
            return
        }

        const laboratory = await this.loadContract("dev", "Laboratory")

        if (!laboratory) {
            return
        }

        this.setState({laboratory})

        await this.getPlantList()
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    getPlantList = async () => {
        const {accounts, laboratory} = this.state
        const plantIDs = await laboratory.methods.getPlantsByOwner(accounts[0]).call()
        let updatePlants = {}
        for (let id of plantIDs)
        {
            updatePlants[id] = await laboratory.methods.showPlant(id).call()
        }
        this.setState({yourPlants: updatePlants})
    }

    render() {
        const {
            web3, accounts, chainid,
            laboratory, yourPlants, plantID
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        if (isNaN(chainid) || chainid <= 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!laboratory) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const plantList = Object.keys(yourPlants).map(function (id) {
            return <li> {id}: {yourPlants[id].join(" | ")}</li>
        });

        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }

            <h2>Crypto Gardener</h2>
            <div>Your plants: <br/> {plantList}</div>
            <br/>
            <form onSubmit={() => this.getPlantList()}>
                <div>
                    <label>Update: </label>
                    <br/>
                    <input
                        name="plantID"
                        type="text"
                        value={plantID}
                        onChange={(e) => this.setState({plantID: e.target.value})}
                    />
                    <br/>
                    <button type="submit" disabled={!isAccountsUnlocked}>Submit</button>

                </div>
            </form>
        </div>)
    }
}

export default App
