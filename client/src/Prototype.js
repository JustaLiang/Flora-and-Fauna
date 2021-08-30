import React from "react"
import './App.css'
import map from "./artifacts/deployments/map.json"
import { getEthereum } from "./getEthereum"
import Web3 from "web3"

const namehash = require("eth-ens-namehash")

class Prototype extends React.Component {

    state = {
        //--- base
        web3: null,
        ethereum: null,
        accounts: null,
        chainid: null,
        prtnContract: null,
        armyContract: null,
        prtnDecimals: 0,
        //--- display
        prtnBalance: 0,
        minionList: {},
        minionInfo: [],
        //--- input
        quote: "ETH",
        base: "USD",
        minionID: 0,
    }

    componentDidMount = async () => {

        try {
            const ethereum = await getEthereum()
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            const chainid = parseInt(await ethereum.request({ method: 'eth_chainId' }))
            const web3 = new Web3(ethereum)
            this.setState({ web3, ethereum, accounts, chainid }, await this.loadInitialContracts)
            console.log('web3',web3)
            console.log('etheruem',ethereum)
            console.log('accounts',accounts)
            console.log('chainid',chainid)
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
        const prtnContract = await this.loadContract(chain, "ArmyProtein", 1)
        const armyContract = await this.loadContract(chain, "GreenArmy", 0)
        if (!prtnContract || !armyContract) {
            return
        }
        const prtnDecimals = await prtnContract.methods.decimals().call()

        this.setState({ prtnContract, armyContract, prtnDecimals })

        await this.prtnGetBalance()
        await this.armyGetList()
    }

    loadContract = async (chain, contractName, which) => {
        // Load a deployed contract instance into a web3 contract object
        const { web3 } = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][which]
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

    prtnGetBalance = async () => {
        const { accounts, prtnContract, prtnDecimals } = this.state
        if (accounts.length === 0) {
            return
        }
        this.setState({ prtnBalance: ((await prtnContract.methods.balanceOf(accounts[0]).call()) / 10 ** prtnDecimals).toFixed(2) })
    }

    armyGetList = async () => {
        const { accounts, armyContract } = this.state
        if (accounts.length === 0) {
            return
        }
        const minionIDs = await armyContract.methods.getMinionIDs(accounts[0]).call()
        const minionInfos = await armyContract.methods.getTeamInfo(minionIDs).call()
        let minionList = {}
        for (let i = 0; i < minionIDs.length; i++) {
            minionList[minionIDs[i]] = minionInfos[i]
        }
        this.setState({ minionList })
    }

    armyDisplay = (id) => {
        const { minionList } = this.state
        return <form className="minion" key={id} onSubmit={(e) => this.armyShow(e)}>
            <div>
                #{id} : | {minionList[id][0].substring(0, 10)}... | {minionList[id].slice(1).join(" | ")} |
                <button type="submit" value={id} onClick={(e) => this.setState({ minionID: e.target.value })}>check</button>
                <button value={id} onClick={(e) => this.armyArm(e)}>arm</button>
                <button value={id} onClick={(e) => this.armyTrain(e)}>train</button>
                <button value={id} onClick={(e) => this.armyRecover(e)}>recover</button>
                <button value={id} onClick={(e) => this.armyReinforce(e)}>reinforce</button>
                <button value={id} onClick={(e) => this.armyLiberate(e)}>liberate</button>
            </div>
        </form>
    }

    armyShow = async (e) => {
        const { armyContract, minionID } = this.state
        e.preventDefault()
        const pid = parseInt(minionID)
        if (isNaN(pid)) {
            this.setState({ minionInfo: ["invalid minion ID"] })
            return
        }

        armyContract.methods.getMinionInfo(pid).call()
            .then((result) => {
                this.setState({ minionInfo: Object.values(result) })
            })
            .catch((err) => {
                console.log(err)
                this.setState({ minionInfo: ["not exists"] })
            })
    }

    armyRecruit = async (e) => {
        const { accounts, armyContract, quote, base } = this.state
        e.preventDefault()
        const pairNode = namehash.hash(`${quote}-${base}.data.eth`)

        armyContract.methods.recruit(pairNode).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    armyTrain = async (e) => {
        const { accounts, armyContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        armyContract.methods.train(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    armyArm = async (e) => {
        const { accounts, armyContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        armyContract.methods.arm(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    armyLiberate = async (e) => {
        const { accounts, armyContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        armyContract.methods.liberate(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
                this.prtnGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    armyReinforce = async (e) => {
        const { accounts, armyContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        armyContract.methods.reinforce(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
                this.prtnGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    armyRecover = async (e) => {
        const { accounts, armyContract } = this.state
        e.preventDefault()
        const pid = parseInt(e.target.value)
        armyContract.methods.recover(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                this.armyGetList()
                this.prtnGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    render() {
        const {
            ethereum, accounts, chainid,
            prtnContract, armyContract,
            prtnBalance, minionList, minionInfo,
            quote, base, minionID
        } = this.state

        if (!ethereum) {
            return <div>Loading ethereum, accounts, and contracts...</div>
        }

        if (isNaN(chainid)) {
            return <div>Wrong Network!</div>
        }

        if (!prtnContract || !armyContract) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const mList = Object.keys(minionList).map((id) => this.armyDisplay(id))

        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page.</strong>
                    </p>
                    : null
            }
            <h1>Green Army</h1>
            <div> <h3>Green Protein</h3>{prtnBalance}</div>
            <div> <h3>Your Barrack</h3>{mList}</div>
            <br />
            <form onSubmit={(e) => this.armyRecruit(e)}>
                <div>
                    <h3>Recruit a minion</h3>
                    <input name="quote" type="text" value={quote}
                        onChange={(e) => this.setState({ quote: e.target.value })} />
                    {" / "}
                    <input name="base" type="text" value={base}
                        onChange={(e) => this.setState({ base: e.target.value })} />
                    <br />
                    <a href="https://docs.chain.link/docs/ethereum-addresses/"
                        target="_blank"
                        rel="noopener noreferrer">
                        Check valid pairs
                    </a>
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked}>recruit</button>
                </div>
            </form>
            <br />
            <form onSubmit={(e) => this.armyShow(e)}>
                <div>
                    <h3>Check a minion</h3>
                    <input
                        name="minionID"
                        type="text"
                        value={minionID}
                        onChange={(e) => this.setState({ minionID: e.target.value })}
                    />
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked}>check</button>
                </div>
                <div> <br />{minionInfo.join(" | ")}</div>
            </form>
        </div>)
    }
}

export default Prototype
