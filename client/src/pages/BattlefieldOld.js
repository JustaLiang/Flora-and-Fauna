
import React, { useState, useEffect } from 'react'
import map from "../artifacts/deployments/map.json"
import { getEthereum } from "../getEthereum"
import Web3 from "web3"

export default function BattlefieldOld() {

    const [setting, setSetting] = useState({
        web3: null,
        ethereum: null,
        accounts: null,
        chainid: null,
    })

    const [btfdContract, setBtfdContract] = useState(null)

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
                    chainid: chainid,
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

            if (!btfdContract) {
                return
            }
            setBtfdContract(btfdContract)
        }
        const { web3, ethereum, accounts, chainid } = setting
        if (web3 && ethereum && accounts && chainid) {
            loadInitialContracts()
        }
    }, [setting])

    useEffect(() => {
        const fetchData = async () => {
            const { accounts } = setting
            if (accounts && btfdContract) {
                console.log(accounts)
                await updateLocked()
                await updateProposals()
                await updateGeneration() 
                await updateFields()
            }
        }
        fetchData()
        console.log('refetech')
    }, [btfdContract])

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
        const propList = await btfdContract.methods.getAllProposalInfo().call()
        setProposals(propList)
    }

    const updateLocked = async () => {
        const locked = await btfdContract.methods.fieldLocked().call()
        setLocked(locked)        
    }

    const updateGeneration = async () => {
        const generation = await btfdContract.methods.generation().call()
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
        btfdContract.methods.vote(fieldID, pid).send({ from: accounts[0] })
        .on("receipt", async () => {
            await updateProposals()
        })
        .on("error", (err) => {
            console.log(err)
        })
    }

    const onPropose = async () => {
        const { accounts } = setting
        var uriPrefix = prompt("URI Prefix")
        if (!uriPrefix || uriPrefix.slice(-1) != '/') {
            return
        }
        btfdContract.methods.propose(uriPrefix).send({ from: accounts[0], value: 10**12})
        .on("receipt", async () => {
            await updateProposals()
        })
        .on("error", (err) => {
            console.log(err)
        })
    }

    const onStartVote = async () => {
        const { accounts } = setting
        btfdContract.methods.startVote().send({ from: accounts[0] })
        .on("receipt", async () => {
            await updateLocked()
        })
        .on("error", (err) => {
            console.log(err)
        })
    }

    const onEndVote = async () => {
        const { accounts } = setting
        btfdContract.methods.endVote().send({ from: accounts[0] })
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
        const allFieldInfo = await btfdContract.methods.getAllFieldInfo().call()
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
        btfdContract.methods.floraConquer(fid, attackers).send({ from: accounts[0] })
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
        btfdContract.methods.faunaConquer(fid, attackers).send({ from: accounts[0] })
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
        btfdContract.methods.retreat(fid).send({ from: accounts[0] })
        .on("receipt", async () => {
            await updateFields()
        })
        .on("error", (err) => {
            console.log(err)
        })        
    }

    const displayProposal = (pid) => {
        const pi = proposals[pid]
        return <p key={pid}>
            proposal#{pid} -- {pi.proposer} | {pi.prefixURI} | {pi.voteCount} |
            <button value={pid} disabled={!locked} onClick={(e) => onVote(e)}>vote</button>
        </p>
    }

    const displayField = (fid) => {
        const { web3, accounts } = setting
        let style = {
            backgroundColor: 'black',
            color: 'white',
        }
        const fi = fields[fid]
        const checksumAcc = web3.utils.toChecksumAddress(accounts[0])
        if (fi.defenders.length) {
            style.backgroundColor = fi.isFlora?'green':'red'
        }
        return <p key={fid} style={style}>
            field#{fid} -- 
            <button style={{color:'green'}} value={fid} onClick={(e) => onFloraConquer(e)}>conquer</button>
            <button value={fid} onClick={(e) => onRetreat(e)}>retreat</button>
            <button style={{color:'red'}} value={fid} onClick={(e) => onFaunaConquer(e)}>conquer</button>
            -- ( {fi.defenders.join(', ')} )
            -- { fi.leader === checksumAcc?'owned':'' }
        </p>
    }

    return (
        <div>
            <h1>This is Battlefield {generation}</h1>
            <button disabled={locked} onClick={() => onPropose()}>propose</button>
            <button disabled={locked} onClick={() => onStartVote()}>start vote</button>
            <button disabled={!locked} onClick={() => onEndVote()}>end vote</button>
            <div>
                {Object.keys(proposals).map((id) => displayProposal(id))}
            </div>

            <div>
                {Object.keys(fields).map((id) => displayField(id))}
            </div>
        </div>
    )
}