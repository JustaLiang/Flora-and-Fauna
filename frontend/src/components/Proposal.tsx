import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { CardHeader, Card, CardContent, CardActions, Box, Typography, IconButton, Button, Snackbar, SnackbarCloseReason, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import { CardCarousel } from './CardCarousel';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useContext } from 'react';
import { BattlefieldContext } from '../hardhat/SymfoniContext';
import { BigNumber } from "ethers";
import { toGatewayURL } from 'nft.storage'; 

const useStyles = makeStyles((theme) => ({
    card: {
        width: 275
    },
    image: {
        height: 280
    },
    button: {
        width: 250,
        marginLeft:5,
        background: "#ab801b",
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center"
    },
    footer: {
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "#00000008",
        borderTop: '1px solid rgba(0, 0, 0, 0.125)',
    },
    topScrollPaper: {
        alignItems: 'flex-start',
    },
    topPaperScrollBody: {
        verticalAlign: 'top',
    },

}))

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const suffixURI = [
    "flora_1.json", "flora_2.json", "flora_3.json", "flora_4.json", "flora_5.json",
    "fauna_1.json", "fauna_2.json", "fauna_3.json", "fauna_4.json", "fauna_5.json"
]

export interface ProposalInfo {
    proposer: string;
    prefixURI: string;
    voteCount: BigNumber;
}

interface Props {
    pId: number;
}

export const Proposal: React.FC<Props> = (props) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [voteOpen, setVoteOpen] = useState(false);
    const [fieldId, setFieldId] = useState("");
    const [voteError, setVoteError]=useState(false);
    const [imageURLs, setImageURLs] = useState<string[]>([]);
    const [imageCount, setImageCount] = useState<number>(0);
    const battlefield = useContext(BattlefieldContext);
    const [proposalInfo, setProposalInfo] = useState<ProposalInfo>();
    const { pId } = props;

    useEffect(() => {
        const loadProposals = async () => {
            if (!battlefield.instance) return;
            setProposalInfo(await battlefield.instance.proposals(pId));
        }
        loadProposals();
    }, [battlefield, pId])

    const onVote = async (fieldId: number) => {
        if (!battlefield.instance) return;
        try {
            const tx = await battlefield.instance.vote(fieldId, pId);
            const receipt = await tx.wait();
            console.log(receipt);
            setProposalInfo(await battlefield.instance.proposals(pId));
        }
        catch(err) {
            console.log(err);
            alert("Error");
        }

    }

    const onCopy = () => {
        if (!proposalInfo) return;
        navigator.clipboard.writeText(proposalInfo.proposer);
        setOpen(true);
    }
    const handleBarClose = (event: React.SyntheticEvent<any>, reason: SnackbarCloseReason) => {
        event?.preventDefault();
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };
    const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
        event.preventDefault();
        setOpen(false);
    } 
    const handleVoteOpen = () => {
        setVoteOpen(true);
    };
    const handleVoteClose = () => {
        setVoteOpen(false);
        setVoteError(false);
        setFieldId("");

    };
    const handleVoteSubmit: React.MouseEventHandler = () => {
        const fid = parseInt(fieldId);
        if(isNaN(fid) || (fid < 0 && fid > 20)) {
            setVoteError(true);
            return;
        }    
        onVote(fid);
        setVoteError(false);
        setFieldId("");
        setVoteOpen(false);
    }
    useEffect(() => {
        if (!proposalInfo) return;
        const { prefixURI } = proposalInfo;
        const httpPrefix = toGatewayURL(prefixURI).toString();
        suffixURI.forEach((suffix) => {
            fetch(`${httpPrefix}${suffix}`)
                .then(async (res) => {
                    if (res.status === 404) throw Error("URI error: 404");
                    const metadata = await res.json();
                    let newImageURLs = imageURLs;
                    newImageURLs.push(toGatewayURL(metadata.image).toString());
                    setImageURLs(newImageURLs);
                    setImageCount(imageURLs.length);
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    }, [proposalInfo, imageURLs])

    return (
        <div>
            <Card className={classes.card}>
                <CardHeader title={`📝  Proposal ${pId}`} style={{ textAlign: 'center' }} />
                <Box className={classes.image}>
                    {imageCount?<CardCarousel urlList={imageURLs} />:
                    <Box 
                    style={{textAlign:'center',paddingTop:150,width: 280,
                    height: 280,}}>
                        <CircularProgress/>
                    </Box>}
                </Box>
                <CardContent style={{ marginTop: 10 }}>
                    <Typography style={{ wordWrap: 'break-word' }}> Proposer: {proposalInfo?.proposer.slice(0, 10)}... <IconButton onClick={onCopy}><FilterNoneIcon /></IconButton></Typography>
                </CardContent>
                <Snackbar open={open} autoHideDuration={1000} onClose={handleBarClose}>
                    <Alert onClose={handleAlertClose} severity="success">
                        Copy!
                    </Alert>
                </Snackbar>
                <CardActions>
                    <Button className={classes.button} onClick={handleVoteOpen} >
                        Vote
                    </Button>

                </CardActions>
                <Box className={classes.footer}>
                    <Typography>Vote count: {proposalInfo?.voteCount.toNumber()}</Typography>
                </Box>
                <Dialog open={voteOpen}  scroll="paper"
                    classes={{
                        scrollPaper: classes.topScrollPaper,
                        paperScrollBody: classes.topPaperScrollBody,
                    }}
                    onClose={handleVoteClose}>
                    <DialogTitle>
                        Enter your field id
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box style={{width:200,height:100}}>
                            <TextField 
                            value={fieldId}
                            error={voteError?true:false}
                            label={voteError?"Error":""}
                            helperText={voteError?"Please Enter a valid field ID.":""}
                            onChange={(e)=>setFieldId(e.target.value)} 
                            variant='outlined' 
                            style={{marginTop:20,width:190}}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions >
                        <Button 
                        onClick={handleVoteSubmit}
                        style={{marginTop:10,marginBottom:10}} 
                        variant='outlined'>Submit</Button>
                    </DialogActions>
                </Dialog>
            </Card>
        </div>
    )
}