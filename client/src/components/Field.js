import React, { useState } from 'react'
import {  Card,  Box, IconButton, Button,Dialog, DialogTitle, DialogActions, MenuItem, Select, TextField, InputLabel,FormControl} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import EmojiFlagsIcon from '@material-ui/icons/EmojiFlags';
import Skeleton from '@material-ui/lab/Skeleton';
export default function Field() {
    const [shadow, setShadow] = useState(3)
    const [open, setOpen] = useState(false)
    const [actionOpen, setActionOpen] = useState(false)

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
    }
    return (
        <div  >
            <Card
                elevation={shadow}
                onMouseOver={() => { setShadow(7) }}
                onMouseOut={() => { setShadow(3) }}
                onClick={handleClick}
                style={{
                    height: 200, width: 200, borderRadius: 20, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                <EmojiFlagsIcon style={{ width: 75, height: 75 }} />
            </Card>
            <Dialog open={open} style={{ textAlign: 'center' }} onClose={handleClose}>
                <DialogTitle id="form-dialog-title" >
                    Field 1 Info
                </DialogTitle>
                {/* <IconButton onClick={handleClose} ><CloseIcon /></IconButton> */}
                <Box display='flex' flexDirection='column' style={{ height: 550, width: 500 }}>
                    <Box>
                        <Skeleton variant="circle" width={50} height={50} style={{ marginLeft: 50 }} />
                        <Skeleton variant="rect" width={400} height={350} style={{ marginLeft: 50, marginTop: 30 }} />
                    </Box>
                    <Box>
                        <Box display='flex'
                            flexDirection='row'
                            style={{ marginLeft: 50, marginTop: 30, justifyContent: 'flex-start', gap: 20 }}>
                            <Button onClick={handleActionClick} variant='outlined'>
                                Conquer
                            </Button>
                            <Button variant='outlined'>
                                Retreat
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
            <Dialog open={actionOpen} style={{ textAlign: 'center' }} onClose={handleActionClose}>
                <DialogTitle id="form-dialog-title" >
                    Conquer
                    <Box display='flex' style={{ height: 320, width: 300, justifyContent: 'center' }}>
                        <Box display='flex'
                            flexDirection='column'
                            style={{ gap: 40, marginTop: 30 }}>
                            <Box>
                                <FormControl>
                                    <InputLabel >Select Army</InputLabel>
                                    <Select style={{ height:55, width: 190 }}>
                                        <MenuItem value={20}>Flora Army</MenuItem>
                                        <MenuItem value={30}>Fauna Army</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box>
                                <TextField variant="outlined" label="Enter your minion ID" />
                            </Box>
                            <Box>
                                <Button variant='outlined'>Submit</Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogTitle>
            </Dialog>

        </div>
    )
}
