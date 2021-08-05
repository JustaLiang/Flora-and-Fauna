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
        cytkContract: null,
        crhpContract: null,
        cytkDecimals: 0,
        //--- display
        cytkBalance: 0,
        crhpList: {},
        crhpInfo: [],
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
        const cytkContract = await this.loadContract(chain, "Cytokenin")
        const crhpContract = await this.loadContract(chain, "CrypiranhaPlant")
        if (!cytkContract || !crhpContract) {
            return
        }
        const cytkDecimals = await cytkContract.methods.decimals().call()

        this.setState({ cytkContract, crhpContract, cytkDecimals })
    
        await this.ctykGetBalance()
        await this.crhpGetList()
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

    ctykGetBalance = async () => {
        const {accounts, cytkContract, cytkDecimals} = this.state
        if (accounts.length === 0) {
            return
        }
        this.setState({ cytkBalance: ((await cytkContract.methods.balanceOf(accounts[0]).call())/10**cytkDecimals).toFixed(2) })
    }

    crhpGetList = async () => {
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

    crhpDisplay = (id) => {
        const { crhpList } = this.state
        return <form className="plant" key={id} onSubmit={(e) => this.crhpShow(e)}>
            <div>
                #{id} : | {crhpList[id][0].substring(0,10)}... | {crhpList[id].slice(1).join(" | ")} |
                <button type="submit" value={id} onClick={(e) => this.setState({ crhpID: e.target.value })}>check</button>
                <button value={id} onClick={(e) => this.crhpRest(e)}>rest</button>
                <button value={id} onClick={(e) => this.crhpWake(e)}>wake</button>
                <button value={id} onClick={(e) => this.crhpExtract(e)}>extract</button>
                <button value={id} onClick={(e) => this.crhpStimulate(e)}>stimulate</button>
            </div>
        </form>
    }

    crhpShow = async (e) => {
        const { crhpContract, crhpID } = this.state
        e.preventDefault()
        const pid = parseInt(crhpID)
        if (isNaN(pid)) {
            this.setState({ crhpInfo: ["invalid plant ID"] })
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

    crhpSeed = async (e) => {
        const { accounts, crhpContract, quote, base } = this.state
        e.preventDefault()
        const pairNode = namehash.hash(`${quote}-${base}.data.eth`)

        crhpContract.methods.seed(pairNode).send({ from: accounts[0] })
            .on("receipt", () => {
                this.crhpGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    crhpRest = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.rest(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.crhpGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    crhpWake = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.wake(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.crhpGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    crhpExtract = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.extract(pid).send({ from:accounts[0] })
            .on("receipt", () => {
                this.crhpGetList()
                this.ctykGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    crhpStimulate = async (e) => {
        const { accounts, crhpContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        crhpContract.methods.stimulate(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.crhpGetList()
                this.ctykGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    render() {
        const {
            ethereum, accounts, chainid,
            cytkContract, crhpContract,
            cytkBalance, crhpList, crhpInfo,
            quote, base, crhpID
        } = this.state

        if (!ethereum) {
            return <div>Loading ethereum, accounts, and contracts...</div>
        }

        if (isNaN(chainid)) {
            return <div>Wrong Network!</div>
        }

        if (!cytkContract || !crhpContract) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const plantList = Object.keys(crhpList).map((id) => this.crhpDisplay(id))

        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page.</strong>
                    </p>
                    : null
            }
            <h1>Crypiranha Plant</h1>
            <img src="https://i.imgur.com/aZKE2Ve.jpeg" alt="Plant on Link" width="500" height="250"/>
            <div> <h3>cytokenin</h3>{cytkBalance}</div>
            <div> <h3>garden</h3>{plantList}</div>
            <br/>
            <form onSubmit={(e) => this.crhpSeed(e)}>
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
                    <button type="submit" disabled={!isAccountsUnlocked}>seed</button>
                </div>
            </form>
            <br/>
            <form onSubmit={(e) => this.crhpShow(e)}>
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
