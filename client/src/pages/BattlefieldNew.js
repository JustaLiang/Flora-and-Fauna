import React, { useState, useEffect } from 'react'
import map from "../artifacts/deployments/map.json"
import { getEthereum } from "../getEthereum"
import Web3 from "web3"
import Battlefield from '../components/Battlefield'
import ProposalList from '../components/ProposalList'
export default function BattlefieldNew() {
    const [setting, setSetting] = useState({
        web3: null,
        ethereum: null,
        accounts: null,
        chainid: null,
    })

    const [contracts, setContracts] = useState({
        btfdContract: null,
        floraContract: null,
        faunaContract: null,
    })

    const [locked, setLocked] = useState(false)

    const [fields, setFields] = useState([])

    const [proposals, setProposals] = useState([])

    const [generation, setGeneration] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ethereum = await getEthereum()
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                const chainid = parseInt(await ethereum.request({ method: 'eth_chainId' }))
                const web3 = new Web3(ethereum)
                setSetting({
                    web3: web3,
                    ethereum: ethereum,
                    accounts: accounts,
                    chainid: chainid
                })
            } catch (e) {
                console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
                console.log(e)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        const loadInitialContracts = async () => {
            const { chainid } = setting
            console.log("chainid:", chainid)
            let chain = "dev";
            if (chainid <= 42) {
                chain = chainid.toString()
            }
            const btfdContract = await loadContract(chain, "Battlefield", 0)
            const floraContract = await loadContract(chain, "FloraArmy", 0)
            const faunaContract = await loadContract(chain, "FaunaArmy", 0)

            if (!btfdContract || !floraContract || !faunaContract) {
                return
            }
            setContracts({
                btfdContract:btfdContract,
                floraContract:floraContract,
                faunaContract:faunaContract,
            })
        }
        const { web3, ethereum, accounts, chainid } = setting
        if (web3 && ethereum && accounts && chainid) {
            loadInitialContracts()
        }
    }, [setting])

    useEffect(() => {
        const fetchData = async () => {
            const { accounts } = setting
            if (accounts && contracts.btfdContract) {
                console.log(accounts)
                await updateLocked()
                await updateProposals()
                await updateGeneration() 
                await updateFields()
            }
        }
        fetchData()
        console.log('refetech')
    }, [])

    const loadContract = async (chain, contractName, which) => {
        // Load a deployed contract instance into a web3 contract object
        const { web3 } = setting

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
            contractArtifact = await import(`../artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "../artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    const updateProposals = async () => {
        const propList = await contracts.btfdContract.methods.getAllProposalInfo().call()
        setProposals(propList)
    }

    const updateLocked = async () => {
        const locked = await contracts.btfdContract.methods.fieldLocked().call()
        setLocked(locked)
    }

    const updateGeneration = async () => {
        const generation = await contracts.btfdContract.methods.generation().call()
        setGeneration(generation)
    }

    const onVote = async (e) => {
        const { accounts } = setting
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        const fieldID = parseInt(prompt("which field"))
        if (isNaN(fieldID)) {
            return
        }
        contracts.btfdContract.methods.vote(fieldID, pid).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateProposals()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onPropose = async (uriPrefix) => {
        const { accounts } = setting
        if (!uriPrefix || uriPrefix.slice(-1) != '/') {
            return
        }
        contracts.btfdContract.methods.propose(uriPrefix).send({ from: accounts[0], value: 10 ** 12 })
            .on("receipt", async () => {
                await updateProposals()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onStartVote = async () => {
        const { accounts } = setting
        contracts.btfdContract.methods.startVote().send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateLocked()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onEndVote = async () => {
        const { accounts } = setting
        contracts.btfdContract.methods.endVote().send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateLocked()
                await updateProposals()
                await updateGeneration()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const updateFields = async () => {
        const allFieldInfo = await contracts.btfdContract.methods.getAllFieldInfo().call()
        setFields(allFieldInfo)
    }

    const onFloraConquer = async (e) => {
        const { accounts } = setting
        e.preventDefault()
        const fid = parseInt(e.currentTarget.value)
        const attackerStr = prompt("Flora minions")
        if (!attackerStr) {
            return
        }
        const attackers = attackerStr.split(' ')
        for (let minionID of attackers) {
            if (isNaN(parseInt(minionID))) {
                return
            }
        }
        contracts.btfdContract.methods.floraConquer(fid, attackers).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onFaunaConquer = async (e) => {
        const { accounts } = setting
        e.preventDefault()
        const fid = parseInt(e.currentTarget.value)
        const attackerStr = prompt("Fauna minions")
        if (!attackerStr) {
            return
        }
        const attackers = attackerStr.split(' ')
        for (let minionID of attackers) {
            if (isNaN(parseInt(minionID))) {
                return
            }
        }
        contracts.btfdContract.methods.faunaConquer(fid, attackers).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onRetreat = async (e) => {
        const { accounts } = setting
        e.preventDefault()
        const fid = parseInt(e.currentTarget.value)
        contracts.btfdContract.methods.retreat(fid).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const getMinionInfo = async (isFlora, mid) => {
        if (isFlora) {
            return contracts.floraContract.methods.getMinionInfo(mid).call()
        }
        else {
            return contracts.faunaContract.methods.getMinionInfo(mid).call()
        }
    }

    return (
        <div style={{ paddingLeft: 100, paddingTop: 100 }}>
            <ProposalList
                locked={locked}
                onPropose={onPropose}
                onStartVote={onStartVote}
                onEndVote={onEndVote}
                proposals={proposals}
            />
            <Battlefield />
        </div>
    )
}
