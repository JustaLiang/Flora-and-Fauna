import {
    Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Typography
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import ColorizeIcon from "@material-ui/icons/Colorize";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import SyncIcon from "@material-ui/icons/Sync";
import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import { FloraArmyContext, FaunaArmyContext, CurrentAddressContext } from "../hardhat/SymfoniContext";
import { BigNumber } from "ethers";
import { PairMap } from "../assets/map/PairMap";
import { MinionListContext } from "./CollectibleList";
import { toGatewayURL } from "nft.storage";
import { FloraArmy } from "../hardhat/typechain/FloraArmy";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 445,
    },
    media: {
        height: 300,
    },
    info: {
        fontWeight: "bold",
    },
    green: { backgroundColor: "#1CBA1C" },
    red: { backgroundColor: "#FF1F5E" },
}));

interface MinionProfile {
    branch: string;
    armed: boolean;
    price: BigNumber;
    power: BigNumber;
    uri: string;
}

interface Props{
    isFauna: boolean;
    mId: number;
}

export const Collectible: React.FC<Props> = (props) => {
    const classes = useStyles();
    const floraArmy = useContext(FloraArmyContext);
    const faunaArmy = useContext(FaunaArmyContext);
    const [armyContract, setArmyContract] = useState<FloraArmy>();
    const account = useContext(CurrentAddressContext);
    const [setFloraMinionIds, setFaunaMinionIds] = useContext(MinionListContext);
    const [minionProfile, setMinionProfile] = useState<MinionProfile>();
    const [loading, setLoading] = useState(true);
    const [imageURL, setImageURL] = useState("fetching");
    const { isFauna, mId } = props;

    useEffect(() => {
        if (isFauna) {
            setArmyContract(faunaArmy.instance);
        }
        else {
            setArmyContract(floraArmy.instance);
        }
    }, [isFauna, faunaArmy, floraArmy]);

    useEffect(() => {
        const fetchMinionProfile = async () => {
            setImageURL("fetching");
            if (armyContract && await armyContract.minionExists(mId)) {
                setMinionProfile(await armyContract.getMinionProfile(mId));
            }
        }
        setImageURL("fetching");
        fetchMinionProfile();
    }, [armyContract, mId]);

    useEffect(() => {
        const fetchImageURI = async () => {
            if (!minionProfile) return;
            console.log(toGatewayURL(minionProfile.uri).toString());
            fetch(toGatewayURL(minionProfile.uri).toString())
                .then((res) => {
                    if (res.status === 404) throw Error("URI error: 404")
                    return res.json()
                })
                .then((metadata) => {
                    setImageURL(toGatewayURL(metadata.image).toString());
                })
                .catch((err) => {
                    setImageURL("")
                    console.log(err)
                })
        }
        fetchImageURI();
    }, [minionProfile]);

    useEffect(() => {
        if (imageURL) {
            fetch(imageURL)
                .then((res) => {
                    if (res.status !== 404)
                        setLoading(false)
                })
        }
        else {
            setLoading(false)
        }
    }, [imageURL])

    const onArm: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.arm(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                setMinionProfile(await armyContract.getMinionProfile(mId)); 
            }
            catch(err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    const onTrain: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.train(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                setMinionProfile(await armyContract.getMinionProfile(mId));
            }
            catch (err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    const onBoost: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.boost(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                setMinionProfile(await armyContract.getMinionProfile(mId));
            }
            catch (err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    const onHeal: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.heal(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                setMinionProfile(await armyContract.getMinionProfile(mId));
            }
            catch (err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    const onLiberate: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.liberate(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                const minionIds = await armyContract.getMinionIDs(account[0]);
                isFauna?setFaunaMinionIds(minionIds):setFloraMinionIds(minionIds);
            }
            catch (err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    const onGrant: React.MouseEventHandler<HTMLButtonElement> = async () => {
        if (armyContract) {
            try {
                const tx = await armyContract.grant(mId);
                const receipt = await tx.wait();
                console.log(receipt);
                setMinionProfile(await armyContract.getMinionProfile(mId));
            }
            catch (err) {
                console.log(err);
                alert("Error");
            }
        }
    }

    return (
        <Card className={classes.root} style={{ borderRadius: 20 }} elevation={3}>
            <CardHeader
                avatar={
                    <Avatar
                        className={clsx(classes.green, {
                            [classes.red]: isFauna,
                        })}
                    >
                        {mId}
                    </Avatar>
                }
                title="Minion"
                subheader={minionProfile?PairMap[minionProfile.branch]:"???"}
                action={
                    <Box>
                        <Button
                            value={mId}
                            variant="outlined"
                            disabled={!minionProfile?.armed}
                            style={{ textTransform: "none", marginTop: 10, marginRight: 10 }}
                            endIcon={<HowToRegIcon />}
                            onClick={onGrant}
                        >
                            Grant
                        </Button>
                        <Button
                            value={mId}
                            variant="outlined"
                            disabled={!minionProfile?.armed}
                            style={{ textTransform: "none", marginTop: 10, marginRight: 10 }}
                            endIcon={<SyncIcon />}
                            onClick={onLiberate}
                        >
                            Liberate
                        </Button>
                    </Box>
                }
            />
            {imageURL !== "fetching" && !loading ? (
                <CardMedia
                    className={classes.media}
                    component="img"
                    image={imageURL}
                    alt="none"
                />
            ) : (
                <Box
                    className={classes.media}
                    style={{ textAlign: "center", paddingTop: 150 }}
                >
                    <CircularProgress />
                </Box>
            )}
            <CardContent>
                <Typography variant="h6" className={classes.info}>
                    Status: {minionProfile?.armed ? "Armed" : "Trained"}
                </Typography>
                <Typography variant="h6" className={classes.info}>
                    {minionProfile?.armed ? "Latest" : "From"}:{" "}
                    {minionProfile? (minionProfile.price.toNumber() / 10 ** 8).toFixed(2):0}
                </Typography>
                <Typography variant="h6" className={classes.info}>
                    Power: {minionProfile?.power.toNumber()}
                </Typography>
            </CardContent>
            <CardActions>
                <Box
                    display="flex"
                    flexDirection="row"
                    flexWrap="wrap"
                    style={{ marginLeft: 15, gap: 15 }}
                >
                    <Box>
                        <Button
                            onClick={onArm}
                            value={mId}
                            disabled={minionProfile?.armed}
                            style={
                                minionProfile?.armed
                                    ? {
                                            color: "#D9DDDC",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                                    : {
                                            color: "#4285F4",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                            }
                            variant="outlined"
                            startIcon={<ColorizeIcon />}
                        >
                            Arm
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onTrain}
                            value={mId}
                            disabled={!minionProfile?.armed}
                            style={
                                minionProfile?.armed
                                    ? {
                                            color: "#DB4437",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                                    : {
                                            color: "#D9DDDC",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                            }
                            variant="outlined"
                            startIcon={<FitnessCenterIcon />}
                        >
                            Train
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onHeal}
                            value={mId}
                            disabled={minionProfile?.armed}
                            style={
                                minionProfile?.armed
                                    ? {
                                            color: "#D9DDDC",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                                    : {
                                            color: "#0F9D58",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                            }
                            variant="outlined"
                            startIcon={<LocalHospitalIcon />}
                        >
                            Heal
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onBoost}
                            value={mId}
                            disabled={!minionProfile?.armed}
                            style={
                                minionProfile?.armed
                                    ? {
                                            color: "#F87217",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                                    : {
                                            color: "#D9DDDC",
                                            borderRadius: 10,
                                            fontSize: 12,
                                        }
                            }
                            variant="outlined"
                            startIcon={<FlashOnIcon />}
                        >
                            Boost
                        </Button>
                    </Box>
                </Box>
            </CardActions>
        </Card>
    );
}