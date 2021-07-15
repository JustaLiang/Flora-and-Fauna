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
        ctkContract: null,
        crhpContract: null,
        ctkDecimals: 0,
        //--- display
        ctkBalance: 0,
        crhpList: {},
        crhpInfo: [],
        seedResponse: "",
        //--- input
        directionUp: true,
        quote: "ETH",
        base: "USD",
        crhpID: 0,
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
        const ctkContract = await this.loadContract(chain, "Cytokenin")
        const crhpContract = await this.loadContract(chain, "CrypiranhaPlant")
        if (!ctkContract || !crhpContract) {
            return
        }
        const ctkDecimals = await ctkContract.methods.decimals().call()

        this.setState({ ctkContract, crhpContract, ctkDecimals })
    
        await this.getCTKBalance()
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

    getCTKBalance = async () => {
        const {accounts, ctkContract, ctkDecimals} = this.state
        if (accounts.length === 0) {
            return
        }
        this.setState({ ctkBalance: ((await ctkContract.methods.balanceOf(accounts[0]).call())/10**ctkDecimals).toFixed(2) })
    }

    getPlantList = async () => {
        const { accounts, crhpContract } = this.state
        if (accounts.length === 0) {
            return
        }
        const plantIDs = await crhpContract.methods.getPlantIDs(accounts[0]).call()
        let crhpList = {}
        for (let id of plantIDs)
        {
            crhpList[id] = await crhpContract.methods.getPlantInfo(id).call()
        }
        this.setState({ crhpList })
    }

    plantDisplay = (id) => {
        const { crhpList } = this.state
        return <form className="plant" key={id} onSubmit={(e) => this.showPlantInfo(e)}>
            <div>
                #{id} <br/>
                {crhpList[id][0].substring(0,16)}... <br/> 
                {crhpList[id].slice(1).join(" | ")} |--
                <button type="submit" value={id} onClick={(e) => this.setState({ crhpID: e.target.value })}>check</button>
                <br/>
                <button value={id} onClick={(e) => this.keepGoing(e)}>keep going</button>
                <button value={id} onClick={(e) => this.extractCTK(e)}>extract</button>
                <br/>
                <button value={id} onClick={(e) => this.turnAround(e)}>turn around</button>
                <button value={id} onClick={(e) => this.mutateCRHP(e)}>mutate</button>
            </div>
        </form>
    }

    showPlantInfo = async (e) => {
        const { crhpContract, crhpID } = this.state
        e.preventDefault()
        const pid = parseInt(crhpID)
        if (isNaN(pid)) {
            alert("invalid plant ID")
            return
        }

        crhpContract.methods.getPlantInfo(pid).call()
            .then((result) => {
            this.setState({ crhpInfo: result })
            })
            .catch((err) => {
            console.log(err)
            this.setState({ crhpInfo: ["not exists"] })
            })
    }

    plantSeed = async (e) => {
        const { accounts, crhpContract, directionUp, quote, base } = this.state
        e.preventDefault()
        const pairNode = namehash.hash(`${quote}-${base}.data.eth`)

        crhpContract.methods.seed(pairNode, directionUp).send({ from: accounts[0] })
            .then(() => {
                this.setState({seedResponse: "Plant a seed successfully"})
                this.getPlantList()
            })
            .catch((err) => {
                console.log(err)
                this.setState({seedResponse: "Invalid pair"})
            })
    }

    keepGoing = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.keepGoing(pid).send({ from: accounts[0] })
            .then(() => {
                this.getPlantList()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    turnAround = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.turnAround(pid).send({ from: accounts[0] })
            .then(() => {
                this.getPlantList()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    extractCTK = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.extract(pid).send({ from:accounts[0] })
            .then(() => {
                this.getPlantList()
                this.getCTKBalance()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    mutateCRHP = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.mutate(pid).send({ from: accounts[0] })
            .then(() => {
                this.getPlantList()
                this.getCTKBalance()
            })
            .catch((err) => {
                console.log(err)
            })
    }

    render() {
        const {
            ethereum, accounts, chainid,
            ctkContract, crhpContract,
            ctkBalance, crhpList, crhpInfo, seedResponse,
            quote, base, crhpID
        } = this.state

        if (!ethereum) {
            return <div>Loading ethereum, accounts, and contracts...</div>
        }

        if (isNaN(chainid)) {
            return <div>Wrong Network!</div>
        }

        if (!ctkContract || !crhpContract) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const plantList = Object.keys(crhpList).map((id) => this.plantDisplay(id))

        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page.</strong>
                    </p>
                    : null
            }

            <h1>Crypiranha Plant</h1>
            <div> <h3>cytokenin</h3>{ctkBalance}</div>
            <div> <h3>garden</h3>{plantList}</div>
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
                    <a href="https://docs.chain.link/docs/ethereum-addresses/"
                       target="_blank"
                       rel="noopener noreferrer">
                        Check valid pairs
                    </a>
                    <br/>
                    <button type="submit" disabled={!isAccountsUnlocked} onClick={() => (this.setState({directionUp: true}))}>go up</button>
                    <button type="submit" disabled={!isAccountsUnlocked} onClick={() => (this.setState({directionUp: false}))}>go down</button>
                    <p>{seedResponse}</p>
                </div>
            </form>
            <br/>
            <form onSubmit={(e) => this.showPlantInfo(e)}>
                <div>
                    <h3>check a plant</h3>
                    <input
                        name="crhpID"
                        type="text"
                        value={crhpID}
                        onChange={(e) => this.setState({crhpID: e.target.value})}
                    />
                    <br/>
                    <button type="submit" disabled={!isAccountsUnlocked}>check</button>
                </div>
            <div> <br/>{crhpInfo.join(" | ")}</div>
            </form>
        </div>)
    }
}

export default App
