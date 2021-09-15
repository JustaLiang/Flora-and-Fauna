import { BigNumber } from "@ethersproject/bignumber";
import {
    Box, Button, Container, Dialog,
    DialogTitle, Grid, Paper, Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import clsx from "clsx";
import React, { useContext, useEffect, useState } from "react";
import { CurrentAddressContext, FaunaArmyContext, FloraArmyContext } from "../hardhat/SymfoniContext";
import { Collectible } from "./Collectible";
import Recruit from "./Recruit";

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: 10,
        maxHeight: 580,
        overflow: "auto",
        maxWidth: 1040,
    },
    search: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    paper: {
        marginTop: "20px",
        padding: "32px",
    },
    green: {
        background: "#1CBA1C",
        borderRadius: 10,
        color: "#FFFFFF",
        padding: 10,
        fontWeight: "bold",
        border: "none",
    },
    red: {
        background: "#FF1F5E",
        borderRadius: 10,
        color: "#FFFFFF",
        padding: 10,
        fontWeight: "bold",
        border: "none",
    },
    gif: {
        width: "70%",
        height: "70%",
        paddingBottom: 100,
    },
}));

interface Props {
    isFauna: boolean,
}

export const MinionListContext = React.createContext<[
    React.Dispatch<React.SetStateAction<BigNumber[]>>,
    React.Dispatch<React.SetStateAction<BigNumber[]>>
]>([() => { }, () => { }]);

export const CollectibleList: React.FC<Props> = (props) => {
    const classes = useStyles();
    const { isFauna } = props;
    const [open, setOpen] = useState(false);
    const floraArmy = useContext(FloraArmyContext);
    const faunaArmy = useContext(FaunaArmyContext);
    const account = useContext(CurrentAddressContext);
    const [floraMinionIds, setFloraMinionIds] = useState<BigNumber[]>([]);
    const [faunaMinionIds, setFaunaMinionIds] = useState<BigNumber[]>([]);
    const [notEmpty, setNotEmpty] = useState<boolean>(false);

    useEffect(() => {
        const fetchPlayerMinions = async () => {
            if (floraArmy.instance)
                setFloraMinionIds(await floraArmy.instance.getMinionIDs(account[0]));
            if (faunaArmy.instance)
                setFaunaMinionIds(await faunaArmy.instance.getMinionIDs(account[0]));
        }
        fetchPlayerMinions();
    }, [account, faunaArmy, floraArmy])

    useEffect(() => {
        if (isFauna) {
            console.log(faunaMinionIds);
            setNotEmpty(faunaMinionIds.length > 0);
        }
        else {
            console.log(floraMinionIds);
            setNotEmpty(floraMinionIds.length > 0);
        }
    }, [isFauna, floraMinionIds, faunaMinionIds])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <MinionListContext.Provider value={[setFloraMinionIds, setFaunaMinionIds]}>
            <Container maxWidth="lg">
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    maxWidth={1000}
                >
                    <Box>
                        <Typography variant="h6" style={{ fontWeight: "bold" }}>
                            {" "}
                            Collectibles
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            className={clsx(classes.green, {
                                [classes.red]: isFauna,
                            })}
                            variant="outlined"
                            endIcon={<AddIcon />}
                            onClick={handleClickOpen}
                        >
                            Recruit Minion
                        </Button>
                        <Dialog
                            open={open}
                            style={{ textAlign: "center" }}
                            onClose={handleClose}
                        >
                            <DialogTitle id="form-dialog-title">Recruit Minion</DialogTitle>
                            <Recruit isFauna={isFauna} onClose={handleClose} />
                        </Dialog>
                    </Box>
                </Box>
                <Grid
                    container
                    spacing={5}
                    className={classes.root}
                    alignItems="center"
                >
                    {(notEmpty)? (
                        isFauna? (
                            faunaMinionIds.map((mid) => (
                                <Grid item lg={6} key={mid.toNumber()}>
                                    <Collectible
                                        isFauna={isFauna}
                                        mId={mid.toNumber()}
                                    />
                                </Grid>
                        ))) : (
                            floraMinionIds.map((mid) => (
                                <Grid item lg={6} key={mid.toNumber()}>
                                    <Collectible
                                        isFauna={isFauna}
                                        mId={mid.toNumber()}
                                    />
                                </Grid>
                        )))
                    ) : (
                        <Grid item lg={12}>
                            <Paper
                                className={classes.paper}
                                style={{ minWidth: 800, borderRadius: 20 }}
                            >
                                <Typography>
                                    You don't have any collectible yet. Recruit a minoin to have
                                    your first one!
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
            </MinionListContext.Provider>
        </div>
    );
}


