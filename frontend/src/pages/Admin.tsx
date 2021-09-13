
import React, { useState, useContext, useEffect } from 'react';
import { MockPublicResolverContext, MockV3AggregatorContext, SignerContext } from '../hardhat/SymfoniContext';
import { ethers, BigNumber } from "ethers"; 
import { MockV3Aggregator } from '../hardhat/typechain/MockV3Aggregator';

export default function Admin() {
    const signer = useContext(SignerContext);
    const resolver = useContext(MockPublicResolverContext);
    const mockAgg = useContext(MockV3AggregatorContext);
    const [chainId, setChainId] = useState(0);
    const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
    const [ethAgg, setEthAgg] = useState<MockV3Aggregator>();

    useEffect(() => {
        const fetchChainId = async () => {
            if (signer[0])
                setChainId(await signer[0].getChainId());
        }
        fetchChainId();
    }, [signer, chainId]);

    useEffect(() => {
        const resolveAggAddr = async () => {
            resolver.instance?.addr(ethers.utils.namehash("eth-usd.data.eth"))
                .then(async (ethAggAddr) => {
                    console.log(ethAggAddr);
                    if (!ethAggAddr) return;
                    const ethAgg = mockAgg.factory?.attach(ethAggAddr);
                    if (!ethAgg) return;
                    setEthAgg(ethAgg);
                    setPrice(await ethAgg.latestAnswer());
                })
        }
        resolveAggAddr();
    }, [resolver, mockAgg]);

    const onRise = async () => {
        if (!ethAgg) return;
        const tx = await ethAgg.updateAnswer(price.mul(1350).div(1000))
        await tx.wait();
        setPrice(await ethAgg.latestAnswer());
    }

    const onDrop = async () => {
        if (!ethAgg) return;
        const tx = await ethAgg.updateAnswer(price.mul(740).div(1000))
        await tx.wait();
        setPrice(await ethAgg.latestAnswer());
    }

    return (
        <div>
        {chainId === 1337?
            <div> 
                <h1>ETH/USD: {price.div(10**8).toNumber()}</h1>
                <br/>
                <button onClick={onRise}>rise</button>
                <button onClick={onDrop}>drop</button>
            </div>
        :
            <h1>Not connect to localhost</h1>
        }
        </div>
    )


}
