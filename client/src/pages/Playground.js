import React, { useState, useEffect } from 'react'
import map from "../artifacts/deployments/map.json"
import { getEthereum } from "../getEthereum"
import Web3 from "web3"
import { Container, Box, Button } from '@material-ui/core';
import Battlefield from '../components/Battlefield'
import greenPlayground from '../assets/image/greenPlayground.png'
import redPlayground from '../assets/image/redPlayground.png'

import ProposalList from '../components/ProposalList'
import { makeStyles } from '@material-ui/core/styles';
import Logo from '../assets/image/Logo.png'
import { Link } from "react-router-dom";

import { AppBar, Toolbar, CssBaseline  } from '@material-ui/core'
const useStyles = makeStyles((theme) => ({
    root: {
        background: `url(${redPlayground})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition:'50% 50%',
        backgroundSize: "100% 100%",

    },
    logo: {
        heigh: 40,
        width: 100,
    },
}))
export default function Playground() {
    const classes = useStyles();
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

    const [checksumAcc, setChecksumAcc] = useState("")

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
                btfdContract: btfdContract,
                floraContract: floraContract,
                faunaContract: faunaContract,
            })
        }
        const { web3, ethereum, accounts, chainid } = setting
        if (web3 && ethereum && accounts && chainid) {
            setChecksumAcc(web3.utils.toChecksumAddress(accounts[0]))
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
    }, [contracts])

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

    const onVote = async (fieldID, pid) => {
        const { accounts } = setting
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

    const onFloraConquer = async (fid, attackerID) => {
        const { accounts } = setting
        contracts.btfdContract.methods.floraConquer(fid, [attackerID]).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onFaunaConquer = async (fid, attackerID) => {
        const { accounts } = setting
        contracts.btfdContract.methods.faunaConquer(fid, [attackerID]).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onRetreat = async (fid) => {
        const { accounts } = setting
        contracts.btfdContract.methods.retreat(fid).send({ from: accounts[0] })
            .on("receipt", async () => {
                await updateFields()
            })
            .on("error", (err) => {
                console.log(err)
            })
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
            style.backgroundColor = fi.isFlora ? 'green' : 'red'
        }
        return <p key={fid} style={style}>
            field#{fid} --
            <button style={{ color: 'green' }} value={fid} onClick={(e) => onFloraConquer(e)}>conquer</button>
            <button value={fid} onClick={(e) => onRetreat(e)}>retreat</button>
            <button style={{ color: 'red' }} value={fid} onClick={(e) => onFaunaConquer(e)}>conquer</button>
            -- ( {fi.defenders.join(', ')} )
            -- {fi.leader === checksumAcc ? 'owned' : ''}
        </p>
    }

    const getMinionInfo = async (isFlora, mid) => {
        if (isFlora) {
            return await contracts.floraContract.methods.getMinionProfile(mid).call()
        }
        else {
            return await contracts.faunaContract.methods.getMinionProfile(mid).call()
        }
    }
    console.log('fields', fields)
    return ( 
        <>
            <div >
                <AppBar style={{ background: "#FFFFFF", boxShadow: 'none',borderBottom:'1px solid rgba(0, 0, 0, 0.125)'}}>
                    <Toolbar>
                        <Container maxWidth='xl'>
                        <Box display="flex" flexDirection="row" justifyContent="space-between" >
                            <Box >
                            <Button component={Link} to="/">
                            <img src={Logo} className={classes.logo} />
                        </Button>
                            </Box>
                            <Box >
                                <Button 
                                    variant='outlined'
                                    className={classes.button}
                                    style={{
                                        marginTop:20,marginRight:30,textTransform:'none',fontSize:16,fontWeight:'bold'
                                    }}
                                    component={Link} to="/Factory"
                                >
                                    Factory
                                </Button>
                                <Button 
                                    variant='outlined'
                                    className={classes.button}
                                    style={{
                                        marginTop:20,textTransform:'none',fontSize:16,fontWeight:'bold'
                                    }}
                                    href="https://docs.google.com/document/d/1AwX-eP3bZ_XL-YBK7c2zRt0PAFiJFwo-sstIe6dzVns/edit?usp=sharing" target="_blank"
                                >
                                    WhitePaper
                                </Button>
                            </Box>
                        </Box>
                        </Container>
                    </Toolbar>
                </AppBar>
            </div>
            <div className={classes.root} style={{ paddingLeft: 100, paddingTop: 100, }}>
                <ProposalList
                    locked={locked}
                    onPropose={onPropose}
                    onStartVote={onStartVote}
                    onEndVote={onEndVote}
                    onVote={onVote}
                    proposals={proposals}
                />
                <Battlefield
                    fields={fields}
                    getMinionInfo={getMinionInfo}
                    onFloraConquer={onFloraConquer}
                    onFaunaConquer={onFaunaConquer}
                    onRetreat={onRetreat}
                    checksumAcc={checksumAcc} />
            </div>
        </>
    )
}
