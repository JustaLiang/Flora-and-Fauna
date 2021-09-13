import React, { useContext, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, Box, Button, Dialog, DialogTitle, MenuItem, Select, TextField, InputLabel, FormControl, CardHeader, Avatar, Typography } from '@material-ui/core';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
import Skeleton from '@material-ui/lab/Skeleton';
import clsx from 'clsx';
import { PairMap } from '../assets/map/PairMap';
import { BigNumber, ethers } from 'ethers';
import { BattlefieldContext, FaunaArmyContext, FloraArmyContext, CurrentAddressContext } from '../hardhat/SymfoniContext';
import { toGatewayURL } from "nft.storage";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 445,
    },
    media: {
        height: 300,
    },
    info: {
        fontWeight: 'bold'
    },
    white:{

    },
    green: { 
        backgroundColor: '#1e751e'
     },
    red: { 
        backgroundColor: '#d31406'
     },

}))

export interface FieldInfo {
    leader: string;
    defender: BigNumber[];
    isFlora: boolean;    
}

interface MinionProfile {
    branch: string;
    armed: boolean;
    price: BigNumber;
    power: BigNumber;
    uri: string;   
}

interface Props {
    fId: number;
    fieldInfo: FieldInfo;
}

export const Field: React.FC<Props> = (props) => {
    const classes = useStyles();
    const { fId, fieldInfo } = props;
    const [field, setField] = useState<FieldInfo>(fieldInfo);

    const account = useContext(CurrentAddressContext);
    const battlefield = useContext(BattlefieldContext);
    const floraArmy = useContext(FloraArmyContext);
    const faunaArmy = useContext(FaunaArmyContext);
    const [minionProfile, setMinionProfile] = useState<MinionProfile>();
    const [checksumAcc, setChecksumAcc] = useState<string>();

    const [shadow, setShadow] = useState(3);
    const [open, setOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [imageURL,setImageURL] = useState("");
    const [input, setInput] = useState({
        army: 'FloraArmy',
        minionID: ""
    });
    const [inputError, setInputError] = useState(false);

    useEffect(() => {
        const { defender, isFlora } = field;
        const fetchProfile = async () => {
            if (isFlora && floraArmy.instance)
                setMinionProfile(await floraArmy.instance.getMinionProfile(defender[0]));
            if (!isFlora && faunaArmy.instance)
                setMinionProfile(await faunaArmy.instance.getMinionProfile(defender[0]));
        }
        if (defender.length) fetchProfile();
        if (account[0]) setChecksumAcc(ethers.utils.getAddress(account[0]));
    }, [field, floraArmy, faunaArmy, account])

    useEffect(() => {
        if (!minionProfile) return;
        fetch(toGatewayURL(minionProfile.uri).toString())
            .then(res => res.json())
            .then(metadata => setImageURL(toGatewayURL(metadata.image).toString()))
    }, [minionProfile])

    const onFloraConquer = async (fid: number, attackerID: number) => {
        if (!battlefield.instance) return;
        const tx = await battlefield.instance.floraConquer(fid, attackerID);
        const receipt =  await tx.wait();
        if (receipt.status) {
            setField(await battlefield.instance.getFieldInfo(fid));
        }
        else {
            console.log(receipt.logs);
        }
    }

    const onFaunaConquer = async (fid: number, attackerID: number) => {
        if (!battlefield.instance) return;
        const tx = await battlefield.instance.faunaConquer(fid, attackerID);
        const receipt =  await tx.wait();
        if (receipt.status) {
            setField(await battlefield.instance.getFieldInfo(fid));
        }
        else {
            console.log(receipt.logs);
        }
    }

    const onRetreat = async (fid: number) => {
        if (!battlefield.instance) return;
        const tx = await battlefield.instance.retreat(fid);
        const receipt =  await tx.wait();
        if (receipt.status) { 
            setField(await battlefield.instance.getFieldInfo(fid));
        }
        else {
            console.log(receipt.logs);
        }
    }

    const handleClick = () => {
        setOpen(true)
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleActionClick = () => {
        setActionOpen(true)
    }
    const handleActionClose = () => {
        setActionOpen(false)
        setInputError(false)
        setInput({
            army: 'FloraArmy',
            minionID: ""
        })

    }
    const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const name = event.target.name;
        if (name) setInput({...input,
            [name]: event.target.value
        })
    }
    const handleConquer: React.MouseEventHandler = () => {
        if (isNaN(parseInt(input.minionID))) {
            setInputError(true)
            return
        }
        if(input.army==='FloraArmy'){
            onFloraConquer(fId,parseInt(input.minionID))
        }
        else{
            onFaunaConquer(fId,parseInt(input.minionID))
        }
        handleActionClose();
    }
    const handleRetreat: React.MouseEventHandler = () => {
        onRetreat(fId);
    }
    return (
        <div  >
            <Card
                elevation={shadow}
                onMouseOver={() => { setShadow(7) }}
                onMouseOut={() => { setShadow(3) }}
                onClick={handleClick}
                className={clsx(classes.white, {
                    [classes.green]:field.isFlora && field.defender.length,
                    [classes.red]: !field.isFlora && field.defender.length,
                  })}
                style={{
                    height: 200, width: 200, borderRadius: 20, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                {checksumAcc===field.leader?<EmojiFlagsIcon style={{ width: 75, height: 75,color:"#FFFFFF" }} />:
                <Typography style={{fontWeight:'bold',fontSize:30,color:field.defender.length?"#FFFFFF":"#000000"}} >{fId}</Typography>
                }
            </Card>
            <Dialog open={open} style={{ textAlign: 'center' }} onClose={handleClose}>
                <DialogTitle id="form-dialog-title" >
                    Field {fId} Info
                </DialogTitle>
                <Box display='flex' flexDirection='column' style={{ height: 600, width: 500 }}>
                    {field.defender.length ? (
                        <>
                            <CardHeader
                                style={{ marginLeft: 50, textAlign: 'left' }}
                                title={field.isFlora ? "Flora Defender" : "Fauna Defender"}
                                subheader={minionProfile?PairMap[minionProfile.branch]:'???'}
                                avatar={
                                    <Avatar className={clsx(classes.green, {
                                        [classes.red]: !field.isFlora
                                    })}>
                                        {field.defender[0].toNumber()}
                                    </Avatar>
                                } />
                            <Box style={{
                                backgroundImage: `url(${imageURL})`,
                                backgroundSize: "cover",
                                backgroundPosition: '50% 50%',
                                width: 400,
                                height: 350,
                                marginLeft: 50
                            }} />
                            <Box>
                                <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'left', marginLeft: 75 }}>
                                    Status: {minionProfile?.armed ? "Armed" : "Unarmed"}
                                </Typography>
                                <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'left', marginLeft: 75 }}>
                                    Power: {minionProfile?.power.toNumber()}
                                </Typography>

                            </Box>
                        </>

                    ) :
                        (<Box>
                            <Skeleton variant="circle" width={50} height={50} style={{ marginLeft: 50 }} />
                            <Skeleton variant="rect" width={400} height={350} style={{ marginLeft: 50, marginTop: 30 }} />
                        </Box>)

                    }

                    <Box>
                        <Box display='flex'
                            flexDirection='row'
                            style={{ marginLeft: 75, marginTop: 30, justifyContent: 'flex-start', gap: 20 }}>
                            <Button onClick={handleActionClick} 
                            style={{background:'#000000',color:'#FFFFFF' ,fontWeight:'bold'}}
                            variant='outlined'>
                                Conquer
                            </Button>
                            {checksumAcc===field.leader?
                            <Button onClick={handleRetreat} 
                            style={{background:'#FFFFFF',color:'#000000' ,fontWeight:'bold'}}
                            variant='outlined'>
                                Retreat
                            </Button>:<></>
                            }
                        </Box>
                    </Box>
                </Box>
            </Dialog>
            <Dialog open={actionOpen} style={{ textAlign: 'center' }} onClose={handleActionClose}>
                <DialogTitle id="form-dialog-title" >
                    Conquer a field
                    <Box display='flex' style={{ height: 320, width: 300, justifyContent: 'center' }}>
                        <Box display='flex'
                            flexDirection='column'
                            style={{ gap: 40, marginTop: 30 }}>
                            <Box>
                                <FormControl>
                                    <InputLabel >Select Army</InputLabel>
                                    <Select name='army' value={input.army} onChange={handleChange} style={{ height: 55, width: 190 }}>
                                        <MenuItem value={"FloraArmy"}>Flora Army</MenuItem>
                                        <MenuItem value={"FaunaArmy"}>Fauna Army</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box>
                                <TextField
                                    error={inputError ? true : false}
                                    helperText={inputError ? "Please Enter a valid field ID." : ""}
                                    name='minionID'
                                    value={input.minionID}
                                    onChange={handleChange}
                                    variant="outlined"
                                    label="Enter your minion ID" />
                            </Box>
                            <Box>
                                <Button variant='outlined' onClick={handleConquer}>Submit</Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogTitle>
            </Dialog>

        </div>
    )
}
