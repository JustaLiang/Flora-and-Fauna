import React, { useState } from 'react'
import { Box, Button, Container, Dialog, DialogTitle, Typography, DialogContent, TextField, DialogActions } from '@material-ui/core'
import Proposal from './Proposal'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import clsx from 'clsx';

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
export default function ProposalList({ locked, onPropose, onStartVote, onEndVote, onVote,proposals }) {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const [URL,setURL] = useState("")
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault()
        onPropose(URL)
        setURL("")
        setOpen(false);
    }
    console.log("Proposals :",proposals)
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
                            })} disabled={locked} style={{fontWeight:!locked?'bold':""}} onClick={handleClickOpen}>
                            propose
                        </Button>
                        <Button variant='contained' className={clsx({
                            [classes.buttonVote]:locked,
                            [classes.buttonDisabled]:!locked
                            })} disabled={locked} style={{fontWeight:!locked?'bold':""}} onClick={onStartVote}>
                            start vote
                        </Button>
                        <Button className={clsx({
                            [classes.buttonVote]:!locked,
                            [classes.buttonDisabled]:locked
                            })} 
                            variant='contained' style={{fontWeight:locked?'bold':""}} disabled={!locked} onClick={onEndVote}>
                            end vote
                        </Button>
                    </Box>


                </Box>
                <Dialog open={open} style={{}} scroll="paper"
                    classes={{
                        scrollPaper: classes.topScrollPaper,
                        paperScrollBody: classes.topPaperScrollBody,
                    }}
                    onClose={handleClose}>
                    <DialogTitle>
                        Enter your url prefix
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box style={{width:400,height:100}}>
                            <TextField 
                            value={URL}
                            onChange={(e)=>setURL(e.target.value)} 
                            variant='outlined' 
                            style={{marginTop:20,width:390}}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions >
                        <Button 
                        onClick={handleSubmit}
                        style={{marginTop:10,marginBottom:10}} 
                        variant='outlined'>Submit</Button>
                    </DialogActions>
                </Dialog>
                <Box display='flex' flexDirection='row'
                    className={classes.proposalBox}>
                    {proposals.length?
                        proposals.map((item,index) => (
                            <Box >
                                <Proposal 
                                _id={index}
                                proposer={item.proposer}
                                prefixURI={item.prefixURI}
                                votes={parseInt(item.votes)}
                                onVote={onVote} />
                            </Box>
                        )):<><Typography>No proposal now submit proposol</Typography></>
                    }
                </Box>
            </Container>
        </div>
    )
}
ProposalList.propTypes = {
    locked: PropTypes.bool.isRequired,
    onPropose: PropTypes.func.isRequired,
    onStartVote: PropTypes.func.isRequired,
    onEndVote: PropTypes.func.isRequired,
    onVote:PropTypes.func.isRequired,
    proposals:PropTypes.func.isRequired
}
