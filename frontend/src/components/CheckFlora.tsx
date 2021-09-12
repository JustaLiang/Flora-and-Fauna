import { BigNumber } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { FloraArmyContext } from "../hardhat/SymfoniContext";

interface Props { }

interface MinionProfile {
    branch: string;
    armed: Boolean;
    price: BigNumber;
    power: BigNumber;
    uri: string;
}

export const CheckFlora: React.FC<Props> = () => {
    const flora = useContext(FloraArmyContext);
    const [minionId, setMinionId] = useState<number>(0);
    const [minionProfile, setMinionProfile] = useState<MinionProfile>();
    const [imageURI, setImageURI] = useState<string>("loading");

    useEffect(() => {
        const doAsync = async () => {
            if (!flora.instance) return;
            console.log("FloraArmy is deployed at ", flora.instance.address);
        };
        doAsync();
    }, [flora]);

    useEffect(() => {
        const updateImageURI = async () => {
            if (!minionProfile) return;
            fetch(minionProfile.uri)
                .then((res) => {
                    if (res.status === 404) throw Error("URI error: 404")
                    return res.json()
                })
                .then((metadata) => {
                    setImageURI(metadata.image.slice(6))
                })
                .catch((err) => {
                    setImageURI("")
                    console.log(err)
                })
        }
        updateImageURI();
    }, [minionProfile]);

    const onCheck = async () => {
        if (!flora.instance) throw Error("FloraArmy instance not ready");
        setMinionProfile(await flora.instance.getMinionProfile(minionId));
    };

    return (
        <div>
            <img ref={imageURI} alt="loading"></img>
            <p>Status: {minionProfile?.armed?"Armed":"Trained"}</p>
            <p>Price: {minionProfile?.price.toNumber()}</p>
            <p>Power: {minionProfile?.power.toNumber()}</p>
            <input onChange={(e) => setMinionId(parseInt(e.target.value))}></input>
            <button onClick={onCheck}>check minion</button>
        </div>
    )
}