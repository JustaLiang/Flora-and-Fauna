import React from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends React.Component {

    state = {
        //--- base
        web3: null,
        accounts: null,
        chainid: null,
        cytokenin: null,
        laboratory: null,
        ckDecimals: 0,
        //--- display
        yourCytokenin: 0,
        yourPlants: {},
        plantInfo: [],
        //--- input
        aggregatorIndex: 0,
        queryPlantID: 0,
        changePlantID: 0,
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
        
        const { chainid } = this.state

        if (chainid <= 42) {
            // Wrong Network!
            return
        }

        const cytokenin = await this.loadContract("dev", "Cytokenin")
        const laboratory = await this.loadContract("dev", "Laboratory")
        const ckDecimals = await cytokenin.methods.decimals().call()

        if (!cytokenin || !laboratory) {
            return
        }

        this.setState({ cytokenin, laboratory, ckDecimals })

        await this.getCytokeninBalance()
        await this.getPlantList()
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const { web3 } = this.state

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

    getCytokeninBalance = async () => {
        const {accounts, cytokenin, ckDecimals} = this.state
        if (accounts.length == 0) {
            return
        }
        this.setState({ yourCytokenin: ((await cytokenin.methods.balanceOf(accounts[0]).call())/10**ckDecimals).toFixed(2) })
    }

    getPlantList = async () => {
        const { accounts, laboratory } = this.state
        if (accounts.length == 0) {
            return
        }
        const plantIDs = await laboratory.methods.getPlantsByOwner(accounts[0]).call()
        let yourPlants = {}
        for (let id of plantIDs)
        {
            yourPlants[id] = await laboratory.methods.showPlant(id).call()
        }
        this.setState({ yourPlants })
    }

    plantSeed = async (e) => {
        const { accounts, laboratory, aggregatorIndex } = this.state
        e.preventDefault()
        const aggs = map["dev"]["MockV3Aggregator"]
        if (aggregatorIndex >= aggs.length || aggregatorIndex < 0) {
            console.log(`invalid aggregator (max: ${aggs.length - 1})`)
            return
        }
        const aggregator = aggs[aggregatorIndex]
        await laboratory.methods.seed(aggregator, true).send({ from: accounts[0] })
            .on("receipt", async () => {
                await this.getPlantList()
            })
            .on("error", async () => {
                console.log("error")
            })
    }

    showCertainPlant = async (e) => {
        const { laboratory, queryPlantID } = this.state
        e.preventDefault()
        const pid = parseInt(queryPlantID)
        if (isNaN(pid)) {
            alert("invalid plant ID")
            return
        }
        try {
            this.setState({ plantInfo: await laboratory.methods.showPlant(pid).call() })
        } catch (e) {
            console.log(e)
            this.setState({ plantInfo: ["not exists"] })
        }
    }

    changeDirection = async (e) => {
        const { accounts, laboratory, changePlantID } = this.state
        e.preventDefault()
        const pid = parseInt(changePlantID)
        if (isNaN(pid)) {
            alert("invalid plant ID")
            return
        }
        await laboratory.methods.changePhototropism(pid).send({ from: accounts[0] })
            .on("receipt", async () => {
                await this.getPlantList()
            })
            .on("error", async () => {
                console.log("error")
            })
    }

    render() {
        const {
            web3, accounts, chainid,
            cytokenin, laboratory,
            yourCytokenin, yourPlants, plantInfo,
            aggregatorIndex, queryPlantID, changePlantID
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        if (isNaN(chainid) || chainid <= 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!cytokenin || !laboratory) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const plantList = Object.keys(yourPlants).map(function (id) {
            return <li key={id}> {id}: {yourPlants[id].join(" | ")}</li>
        });

        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page.</strong>
                    </p>
                    : null
            }

            <h1>Crypto Gardener</h1>
            <div> <h3>your cytokenin</h3>{yourCytokenin}</div>
            <div> <h3>your plants</h3>{plantList}</div>
            <br/>
            <form onSubmit={(e) => this.plantSeed(e)}>
                <div>
                    <h3>plant a seed</h3>
                    <input
                        name="aggregatorIndex"
                        type="text"
                        value={aggregatorIndex}
                        onChange={(e) => this.setState({ aggregatorIndex: e.target.value })}
                    />
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked}>seed</button>
                </div>
            </form>
            <br/>
            <form onSubmit={(e) => this.showCertainPlant(e)}>
                <div>
                    <h3>query a plant</h3>
                    <input
                        name="queryPlantID"
                        type="text"
                        value={queryPlantID}
                        onChange={(e) => this.setState({queryPlantID: e.target.value})}
                    />
                    <br/>
                    <button type="submit" disabled={!isAccountsUnlocked}>query</button>
                </div>
            <div> <br/>{plantInfo.join(" | ")}</div>
            </form>
            <br/>
            <form onSubmit={(e) => this.changeDirection(e)}>
                <div>
                    <h3>change a plant</h3>
                    <input
                        name="changePlantID"
                        type="text"
                        value={changePlantID}
                        onChange={(e) => this.setState({ changePlantID: e.target.value })}
                    />
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked}>change</button>
                </div>
            </form>
        </div>)
    }
}

export default App
