import { Box, Button, Container, Dialog, DialogContent, DialogTitle, Divider, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useContext, useEffect, useState } from 'react';
import { BattlefieldContext } from '../hardhat/SymfoniContext';
import MetaDataForm from './MetaDataForm';
import { Proposal } from './Proposal';

const useStyles = makeStyles((theme) => ({
    proposalBox: {
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 30,
        width: 1170,
        gap: 20,
        overflowX: "scroll",
        border: '0.5px solid rgba(0, 0, 0, 0.125)',
    },
    topScrollPaper: {
        alignItems: 'flex-start',
    },
    topPaperScrollBody: {
        verticalAlign: 'top',
    },
    buttonDisabled:{

    },
    buttonPropose:{
        background:'#000000',
        color:'#FFFFFF',
    },
    buttonVote:{
        background:'#FFFFFF',
        color:'#000000',
    }
}))

interface Props { }

export const ProposalList: React.FC<Props> = () => {
    const classes = useStyles();
    const battlefield = useContext(BattlefieldContext);
    const [locked, setLocked] = useState<boolean>(false);
    const [proposalCount, setProposalCount] = useState<number>(0);
    const [open, setOpen] = useState(false);
    const [URL, setURL] = useState("");

    useEffect(() => {
        const loadProposals = async () => {
            if (!battlefield.instance) return;
            setLocked(await battlefield.instance.fieldLocked());
            console.log(locked?"Locked":"unLocked");
            const pCount = await battlefield.instance.getProposalCount();
            setProposalCount(pCount.toNumber());
            console.log("Proposal count:", proposalCount);
        }
        loadProposals();
    }, [battlefield, locked, proposalCount])

    const onPropose = async (uriPrefix: string) => {
        if (!battlefield.instance) return;
        if (!uriPrefix || uriPrefix.slice(-1) !== '/') return;
        const tx = await battlefield.instance.propose(uriPrefix, {value: 10**12});
        const receipt =  await tx.wait();
        if (receipt.status) {
            const pCount = await battlefield.instance.getProposalCount();
            setProposalCount(pCount.toNumber());
            console.log("Proposal count:", proposalCount);
        }
        else {
            console.log(receipt.logs);
        }
    }

    const onStartVote = async () => {
        if (!battlefield.instance) return;
        const tx = await battlefield.instance.startVote();
        const receipt =  await tx.wait();
        if (receipt.status) {
            setLocked(await battlefield.instance.fieldLocked());
        }
        else {
            console.log(receipt.logs);
        }
    }

    const onEndVote = async () => {
        if (!battlefield.instance) return;
        const tx = await battlefield.instance.endVote();
        const receipt =  await tx.wait();
        if (receipt.status) {
            setLocked(await battlefield.instance.fieldLocked());
            const pCount = await battlefield.instance.getProposalCount();
            setProposalCount(pCount.toNumber());
        }
        else {
            console.log(receipt.logs);
        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit: React.MouseEventHandler = () => {
        onPropose(URL)
        setURL("")
        setOpen(false);
    }

    return (
        <div>
            <Container maxWidth='lg'>
                <Box display='flex'
                    flexDirection='row'
                    justifyContent='space-between'
                    style={{ paddingLeft: 10, paddingTop:20, paddingRight: 50, marginBottom: 20 }}>
                    <Box >
                        <Typography variant='h6' style={{fontWeight:'bold'}}>
                            Proposal List
                        </Typography>
                    </Box>
                    <Box display='flex' flexDirection='row' style={{ gap: 10 }}>
                        <Button variant='contained' className={clsx({
                            [classes.buttonPropose]:!locked,
                            [classes.buttonDisabled]:locked
                            })} disabled={locked} style={{fontWeight:!locked?'bold':undefined}} onClick={handleClickOpen}>
                            propose
                        </Button>
                        <Button variant='contained' className={clsx({
                            [classes.buttonVote]:locked,
                            [classes.buttonDisabled]:!locked
                            })} disabled={locked} style={{fontWeight:!locked?'bold':undefined}} onClick={onStartVote}>
                            start vote
                        </Button>
                        <Button className={clsx({
                            [classes.buttonVote]:!locked,
                            [classes.buttonDisabled]:locked
                            })} 
                            variant='contained' style={{fontWeight:locked?'bold':undefined}} disabled={!locked} onClick={onEndVote}>
                            end vote
                        </Button>
                    </Box>
                </Box>
                <Dialog open={open} style={{}} scroll="paper" maxWidth='xl'
                    classes={{
                        scrollPaper: classes.topScrollPaper,
                        paperScrollBody: classes.topPaperScrollBody,
                    }}
                    onClose={handleClose}>
                    <DialogTitle>
                        Enter your url prefix
                    </DialogTitle>
                    <DialogContent >
                        <Box style={{width:400,height:100}}>
                            <TextField 
                            value={URL}
                            onChange={(e)=>setURL(e.target.value)} 
                            variant='outlined' 
                            style={{marginTop:20,width:390}}
                            />
                        </Box>
                        <Button
                        variant='outlined'
                        onClick={handleSubmit}
                        style={{marginTop:10, marginBottom:10, textTransform:'none'}}
                        >
                            Submit
                        </Button>
                        <Divider style={{marginTop:20,marginBottom:20}}/>
                        <p style={{color:'#9e9d9d'}}>or</p>
                        <MetaDataForm/>
                    </DialogContent>
                    

                </Dialog>
                <Box display='flex' flexDirection='row'
                    className={classes.proposalBox}>
                    {proposalCount?
                        Array.from(Array(proposalCount).keys()).map((pId) => (
                            <Box key={pId}>
                                <Proposal 
                                pId={pId}
                                />
                            </Box>
                        )):<><Typography>No proposal now submit proposol</Typography></>
                    }
                </Box>
            </Container>
        </div>
    )
}
