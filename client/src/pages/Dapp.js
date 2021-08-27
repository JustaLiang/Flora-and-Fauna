
import Header from '../components/Header'
import PersonalInfo from '../components/PersonalInfo'
import CollectibleList from '../components/CollectibleList'
import BackgroundDapp from '../assets/image/BackgroundDapp.png'
import { CssBaseline } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core'
import clsx from 'clsx';
import React, { useState, useEffect } from 'react'
import map from "../artifacts/deployments/map.json"
import { getEthereum } from "../getEthereum"
import Web3 from "web3"

const namehash = require("eth-ens-namehash")

const useStyles = makeStyles((theme) => ({
    appBarSpacer: theme.mixins.toolbar,
    root: {
        background: `url(${BackgroundDapp})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: "100% 100%",

    },
}))
export default function Dapp() {

    const classes = useStyles();

    const [setting, setSetting] = useState({
        web3: null,
        ethereum: null,
        accounts: null,
        chainid: null,
    })
    const [contractInfo, setContractInfo] = useState({
        enhrContract: null,
        armyContract: null,
        enhrDecimals: 0,
    })
    const [balance, setBalance] = useState(0)
    const [minionList, setMinionList] = useState({})
    const [tokenURI, setTokenURI] = useState([])
    const [checked, setChecked] = useState(false)
    const armyType = checked ? "FaunaArmy" : "FloraArmy";

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
                // console.log('success')
                // console.log('web3', web3)
                // console.log('etheruem', ethereum)
                // console.log('accounts', accounts)
                // console.log('chainid', chainid)
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
            const enhancerType = checked ? 0 : 1
            const enhrContract = await loadContract(chain, "ArmyEnhancer", enhancerType)
            const armyContract = await loadContract(chain, armyType, 0)

            if (!enhrContract || !armyContract) {
                return
            }
            const enhrDecimals = await enhrContract.methods.decimals().call()
            setContractInfo({
                enhrContract: enhrContract,
                armyContract: armyContract,
                enhrDecimals: enhrDecimals
            })


        }
        const { web3, ethereum, accounts, chainid } = setting
        if (web3 && ethereum && accounts && chainid) {
            loadInitialContracts()
        }


    }, [setting, checked])

    useEffect(() => {
        const fetchData = async () => {
            const { accounts } = setting
            const { enhrContract, enhrDecimals, armyContract } = contractInfo
            if (accounts && enhrContract && enhrDecimals && armyContract) {
                console.log(accounts)

                await enhrGetBalance()
                await armyGetList()
            }
        }
        fetchData()
    }, [contractInfo])

    useEffect(() => {
        setTokenURI([])
        for (const key in minionList) {
            fetch(minionList[key][4])
                .then(res => res.json())
                .then((object) => {
                    setTokenURI(oldArray => [...oldArray, object.image])
                })
        }
    }, [minionList])
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

    const enhrGetBalance = async () => {
        const { accounts } = setting
        const { enhrContract, enhrDecimals } = contractInfo
        if (accounts.length === 0) {
            return
        }
        const enhrBalance = ((await enhrContract.methods.balanceOf(accounts[0]).call()) / 10 ** enhrDecimals).toFixed(2)
        setBalance(enhrBalance)
    }

    const armyGetList = async () => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        if (accounts.length === 0) {
            return
        }
        const minionIDs = await armyContract.methods.getMinionIDs(accounts[0]).call()
        let minionList = {}
        for (let id of minionIDs) {
            minionList[id] = Object.values(await armyContract.methods.getMinionInfo(id).call())
            minionList[id].push(await armyContract.methods.tokenURI(id).call())
        }
        console.log(minionList)
        setMinionList(minionList)
    }
    const onRecruit = async (quote, base) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        let success;
        try {
            const pairNode = namehash.hash(`${quote}-${base}.data.eth`)

            armyContract.methods.recruit(pairNode).send({ from: accounts[0] })
                .on("receipt", () => {
                    armyGetList()
                })
                .on("error", (err) => {
                    console.log(err)
                })
            success = true
        }
        catch (err) {
            console.log(err)
            success = false
        }
        return success

    }

    const onTrain = async (e) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        armyContract.methods.train(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                armyGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onArm = async (e) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        armyContract.methods.arm(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                armyGetList()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onSell = async (e) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        armyContract.methods.liberate(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                armyGetList()
                enhrGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onBoost = async (e) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        armyContract.methods.boost(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                armyGetList()
                enhrGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const onHeal = async (e) => {
        const { accounts } = setting
        const { armyContract } = contractInfo
        e.preventDefault()
        const pid = parseInt(e.currentTarget.value)
        armyContract.methods.heal(pid).send({ from: accounts[0] })
            .on("receipt", () => {
                armyGetList()
                enhrGetBalance()
            })
            .on("error", (err) => {
                console.log(err)
            })
    }

    const handleChecked = () => {
        setChecked(!checked)
    }



    return (
        <>
            <div className={classes.root}>
                <CssBaseline />
                <Header checked={checked} toggleChecked={handleChecked} />

                <div className={classes.appBarSpacer} />
                <div style={{ height: 1000, padding: 30, paddingLeft: 200 }}>

                    <Box>
                        <Box display='flex' flexDirection='column' style={{ gap: 25 }}>
                            <PersonalInfo balance={balance} address={setting.accounts ? setting.accounts[0] : ""} />
                            <CollectibleList
                                checked={checked}
                                list={minionList}
                                tokenURI={tokenURI}
                                onArm={onArm}
                                onTrain={onTrain}
                                onBoost={onBoost}
                                onHeal={onHeal}
                                onSell={onSell}
                                onRecruit={onRecruit} />
                        </Box>
                    </Box>
                </div>

            </div>
        </>

    )
}
