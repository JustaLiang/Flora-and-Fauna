import React from "react"
import './App.css'
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"
import Web3 from "web3"

const namehash = require("eth-ens-namehash")

class App extends React.Component {

    state = {
        //--- base
        web3: null,
        ethereum: null,
        accounts: null,
        chainid: null,
        cytokenin: null,
        garden: null,
        ckDecimals: 0,
        //--- display
        yourCytokenin: 0,
        yourPlants: {},
        plantInfo: [],
        seedResponse: "",
        //--- input
        directionUp: true,
        quote: "ETH",
        base: "USD",
        queryPlantID: 0,
    }

    componentDidMount = async () => {

        try {
            const ethereum = await getEthereum()
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            const chainid = parseInt(await ethereum.request({ method: 'eth_chainId' }))
            const web3 = new Web3(ethereum)
            this.setState({web3, ethereum, accounts, chainid }, await this.loadInitialContracts)
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }
    }

    loadInitialContracts = async () => {
        
        const { chainid } = this.state
        let chain = "dev";
        if (chainid <= 42) {
            chain = chainid.toString()
        }
        const cytokenin = await this.loadContract(chain, "Cytokenin")
        const garden = await this.loadContract(chain, "CryptoGarden")
        if (!cytokenin || !garden) {
            return
        }
        const ckDecimals = await cytokenin.methods.decimals().call()

        this.setState({ cytokenin, garden, ckDecimals })
    
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
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain (ID: "${chain}").`)
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
        if (accounts.length === 0) {
            return
        }
        this.setState({ yourCytokenin: ((await cytokenin.methods.balanceOf(accounts[0]).call())/10**ckDecimals).toFixed(2) })
    }

    getPlantList = async () => {
        const { accounts, garden } = this.state
        if (accounts.length === 0) {
            return
        }
        const plantIDs = await garden.methods.getPlantsByOwner(accounts[0]).call()
        let yourPlants = {}
        for (let id of plantIDs)
        {
            yourPlants[id] = await garden.methods.showPlant(id).call()
        }
        this.setState({ yourPlants })
    }

    plantInterface = (id) => {
        const { yourPlants } = this.state
        return <form className="plant" key={id} onSubmit={(e) => this.showCertainPlant(e)}>
            <div>
                {id}: {yourPlants[id].join(" | ")}
                <button type="submit" value={id} onClick={(e) => this.setState({ queryPlantID: e.target.value })}>check</button>
                <button value={id} onClick={(e) => this.changeDirection(e)}>turn</button>
                <button value={id} onClick={(e) => this.extractCytokenin(e)}>extract</button>
                <button value={id} onClick={(e) => this.recover(e)}>recover</button>
            </div>
        </form>
    }

    showCertainPlant = async (e) => {
        const { garden, queryPlantID } = this.state
        e.preventDefault()
        const pid = parseInt(queryPlantID)
        if (isNaN(pid)) {
            alert("invalid plant ID")
            return
        }
        if (!(await garden.methods.existPlant(pid).call())) {
            this.setState({ plantInfo: ["not exists"] })
            return
        }

        garden.methods.showPlant(pid).call()
            .then((result) => {
            this.setState({ plantInfo: result })
            })
            .catch((err) => {
            console.log(err)
            this.setState({ plantInfo: ["not exists"] })
            })
    }

    plantSeed = async (e) => {
        const { accounts, garden, directionUp, quote, base } = this.state
        e.preventDefault()
        const pairNode = namehash.hash(`${quote}-${base}.data.eth`)

        await garden.methods.seed(pairNode, directionUp).send({ from: accounts[0] })
            .then(() => {
                this.setState({seedResponse: "Plant a seed successfully"})
                this.getPlantList()
            })
            .catch((err) => {
                console.log(err)
                this.setState({seedResponse: "Invalid pair"})
            })
    }
    
    changeDirection = async (e) => {
        const { accounts, garden } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        garden.methods.turnAround(pid).send({ from: accounts[0] })
            .then(() => {
                this.getPlantList()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    extractCytokenin = async (e) => {
        const { accounts, garden } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        garden.methods.extractCytokenin(pid).send({ from:accounts[0] })
            .then(() => {
                this.getPlantList()
                this.getCytokeninBalance()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    recover = async (e) => {
        const { accounts, garden } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        garden.methods.recoverTurning(pid).send({ from: accounts[0] })
            .then(() => {
                this.getPlantList()
                this.getCytokeninBalance()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    render() {
        const {
            ethereum, accounts, chainid,
            cytokenin, garden,
            yourCytokenin, yourPlants, plantInfo, seedResponse,
            quote, base, queryPlantID
        } = this.state

        if (!ethereum) {
            return <div>Loading ethereum, accounts, and contracts...</div>
        }

        if (isNaN(chainid)) {
            return <div>Wrong Network!</div>
        }

        if (!cytokenin || !garden) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const plantList = Object.keys(yourPlants).map((id) => this.plantInterface(id))

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
                    <input name="quote" type="text" value={quote}
                        onChange={(e) => this.setState({ quote: e.target.value })}/>
                    {" / "}
                    <input name="base" type="text" value={base}
                        onChange={(e) => this.setState({ base: e.target.value })}/>
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked} onClick={() => (this.setState({directionUp: true}))}>go up</button>
                    <button type="submit" disabled={!isAccountsUnlocked} onClick={() => (this.setState({directionUp: false}))}>go down</button>
                    <p>{seedResponse}</p>
                </div>
            </form>
            <br/>
            <form onSubmit={(e) => this.showCertainPlant(e)}>
                <div>
                    <h3>check a plant</h3>
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
        </div>)
    }
}

export default App
