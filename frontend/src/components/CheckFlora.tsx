import React, { useContext, useEffect, useState } from 'react';
import { FloraArmyContext } from "../hardhat/SymfoniContext";

interface Props { };

interface MinionProfile {
    branch: string,
    armed: Boolean,
    price: number,
    power: number,
    uri: string,
};

export const CheckFlora: React.FC<Props> = () => {
    const flora = useContext(FloraArmyContext);
    const [minionId, setMinionId] = useState<number>(0);
    const [minionProfile, setMinionProfile] = useState<MinionProfile>({
        branch: "",
        armed: false,
        price: 0,
        power: 0,
        uri: ""
    });
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
        
        flora.instance.getMinionProfile(minionId)
        .then((info) => {
            setMinionProfile({
                branch: info.branch,
                armed:  info.armed,
                price:  info.price.toNumber(),
                power:  info.power.toNumber(),
                uri:    info.uri,
            })            
        })
        .catch((err) => {
            console.log(err);
        })
    };

    return (
        <div>
            <img ref={imageURI} alt="loading"></img>
            <p>Status: {minionProfile.armed?"Armed":"Trained"}</p>
            <p>Price: {minionProfile.price}</p>
            <p>Power: {minionProfile.power}</p>
            <input onChange={(e) => setMinionId(parseInt(e.target.value))}></input>
            <button onClick={onCheck}>check minion</button>
        </div>
    )
}