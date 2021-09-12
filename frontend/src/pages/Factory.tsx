
import { BigNumber } from '@ethersproject/bignumber';
import React, { useContext, useEffect, useState } from 'react';
import { ArmyEnhancerContext, CurrentAddressContext, FaunaArmyContext, FloraArmyContext,GreeterContext } from '../hardhat/SymfoniContext';
import CollectibleListNew from '../components/CollectibleListNew';

export default function Factory() {
    const faunaArmy = useContext(FaunaArmyContext);
    const floraArmy = useContext(FloraArmyContext);
    const armyEnhancer = useContext(ArmyEnhancerContext);
    const currentAddres = useContext(CurrentAddressContext);


    const [address, setAddress] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);
    const [floraMinionList,setFloraMinionList] = useState<BigNumber[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            if (!faunaArmy.instance || !floraArmy.instance || !armyEnhancer.instance || !currentAddres) return ;
            console.log(floraArmy.instance.address);
            console.log(await floraArmy.instance.getMinionIDs(currentAddres[0]));
            console.log(floraArmy);
            console.log(floraArmy.instance);

           

        }
        fetchData();

    }, [faunaArmy, floraArmy, armyEnhancer, currentAddres])

    console.log(floraMinionList);
    return (
        <div>
            <h1>Success</h1>
            <CollectibleListNew/>
        </div>
    )
}
