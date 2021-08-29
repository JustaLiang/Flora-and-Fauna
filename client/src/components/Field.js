import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Card, Box, Button, Dialog, DialogTitle, MenuItem, Select, TextField, InputLabel, FormControl, CardHeader, Avatar, Typography, CardContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
import Skeleton from '@material-ui/lab/Skeleton';
import clsx from 'clsx';
import PairMap from '../assets/map/index.js'

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
        backgroundColor: '#1CBA1C'
     },
    red: { 
        backgroundColor: '#FF1F5E'
     },

}))
export default function Field({ _id, field, getMinionInfo,onFloraConquer,onFaunaConquer,onRetreat,checksumAcc}) {
    const classes = useStyles()
    const { defenders, isFlora, leader } = field;
    const [shadow, setShadow] = useState(3);
    const [open, setOpen] = useState(false);
    const [actionOpen, setActionOpen] = useState(false);
    const [minionInfo, setMinionInfo] = useState([]);
    const [imageURL,setImageURL] = useState("");
    const [input, setInput] = useState({
        army: 'FloraArmy',
        minionID: ""
    });
    const [inputError, setInputError] = useState(false);
    
    useEffect(() => {
        const fetchInfo = async () => {
            setMinionInfo(await getMinionInfo(isFlora, defenders[0]))
        }
        if (defenders.length) fetchInfo()
    }, [])

    useEffect(()=>{
        if(minionInfo.uri){
            fetch(minionInfo.uri)
            .then(res => res.json())
            .then((object) => {
                setImageURL(object.image)
            })
        }
    },[minionInfo])

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
    const handleChange = (event) => {
        const name = event.target.name;
        setInput({
            ...input,
            [name]: event.target.value
        })
    }
    const handleConquer = (event) => {
        event.preventDefault()
        if (isNaN(parseInt(input.minionID))) {
            setInputError(true)
            return
        }
        if(input.army==='FloraArmy'){
            onFloraConquer(_id,parseInt(input.minionID))
        }
        else{
            onFaunaConquer(_id,parseInt(input.minionID))
        }
        handleActionClose()
    }
    const handleRetreat = (event) => {
        event.preventDefault()
        onRetreat(_id);
    }
    return (
        <div  >
            <Card
                elevation={shadow}
                onMouseOver={() => { setShadow(7) }}
                onMouseOut={() => { setShadow(3) }}
                onClick={handleClick}
                className={clsx(classes.white, {
                    [classes.green]:isFlora && defenders.length,
                    [classes.red]: !isFlora && defenders.length,
                  })}
                style={{
                    height: 200, width: 200, borderRadius: 20, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                {checksumAcc===leader?<EmojiFlagsIcon style={{ width: 75, height: 75 }} />:""}
            </Card>
            <Dialog open={open} style={{ textAlign: 'center' }} onClose={handleClose}>
                <DialogTitle id="form-dialog-title" >
                    Field {_id} Info
                </DialogTitle>
                <Box display='flex' flexDirection='column' style={{ height: 600, width: 500 }}>
                    {defenders.length ? (
                        <>
                            <CardHeader
                                style={{ marginLeft: 50, textAlign: 'left' }}
                                title={isFlora ? "Flora Defender" : "Fauna Defender"}
                                subheader={PairMap[minionInfo.branch]}
                                avatar={
                                    <Avatar className={clsx(classes.green, {
                                        [classes.red]: !isFlora
                                    })}>
                                        {defenders[0]}
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
                                    Status: {minionInfo.armed ? "Armed" : "Unarmed"}
                                </Typography>
                                <Typography variant='h6' style={{ fontWeight: 'bold', textAlign: 'left', marginLeft: 75 }}>
                                    Power: {minionInfo.power}
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
                            <Button onClick={handleActionClick} variant='outlined'>
                                Conquer
                            </Button>
                            <Button onClick={handleRetreat} variant='outlined'>
                                Retreat
                            </Button>
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
Field.propTypes = {
    _id: PropTypes.number.isRequired,
    field: PropTypes.array.isRequired,
    getMinionInfo: PropTypes.func.isRequired,
    onFloraConquer: PropTypes.func.isRequired,
    onFaunaConquer: PropTypes.func.isRequired,
    checksumAcc:PropTypes.string.isRequired
}
