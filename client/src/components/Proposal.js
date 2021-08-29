import React, { useState, useEffect,useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { CardHeader, Card, CardContent, CardActions, Box, Typography, IconButton, Button, Snackbar,Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import CardCarousel from './CardCarousel';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';

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
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const suffixURI = ["fauna_1.json", "fauna_2.json", "fauna_3.json", "fauna_4.json", "fauna_5.json",
    "flora_1.json", "flora_2.json", "flora_3.json", "flora_4.json", "flora_5.json"]

export default function Proposal({ _id, proposer, prefixURI, votes,onVote }) {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const [voteOpen,setVoteOpen] = useState(false);
    const [fieldId,setFieldId] = useState("")
    const [voteError,setVoteError]=useState(false)
    const [imageURL,setImageURL] = useState({});
    const imageRef = useRef();
    const onCopy = () => {
        navigator.clipboard.writeText(proposer);
        setOpen(true);
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };
    const handleVoteOpen = () => {
        setVoteOpen(true);
    };
    const handleVoteClose = () => {
        setVoteOpen(false);
        setVoteError(false);
        setFieldId("");

    };
    const handleVoteSubmit = (e) => {
        e.preventDefault();
        if(isNaN(parseInt(fieldId)) || (parseInt(fieldId) < 0 & parseInt(fieldId) >20)){
            setVoteError(true)
            return
        }
        
        onVote(fieldId,_id);
        setVoteError(false);
        setFieldId("");
        setVoteOpen(false);

    }
    useEffect(() => {
        var imageList = []
        suffixURI.forEach((suffix) => {
            fetch(`${prefixURI}${suffix}`)
                .then(res => {
                    if(res.status===404) console.log('404 metadata not found')
                    return res.json()
                })
                .then((object) => {
                    imageList.push(object.image)
                })

        })
        setImageURL(imageList);
    }, [])
    console.log(imageURL)
    return (
        <div>
            <Card className={classes.card}>
                <CardHeader title={`📝  Proposal ${_id}`} style={{ textAlign: 'center' }} />
                <Box className={classes.image}>
                    {imageURL.length?<CardCarousel urlList={imageURL} />: 
                    <Box 
                    style={{textAlign:'center',paddingTop:150,width: 280,
                    height: 280,}}>
                        <CircularProgress/>
                    </Box>}
                </Box>
                <CardContent style={{ marginTop: 10 }}>
                    <Typography style={{ wordWrap: 'break-word' }}> Proposer: {proposer.slice(0, 10)}... <IconButton onClick={onCopy}><FilterNoneIcon /></IconButton></Typography>
                </CardContent>
                <Snackbar open={open} autoHideDuration={1000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success">
                        Copy!
                    </Alert>
                </Snackbar>
                <CardActions>
                    <Button className={classes.button} onClick={handleVoteOpen} >
                        Vote
                    </Button>

                </CardActions>
                <Box className={classes.footer}>
                    <Typography>Vote count: {votes}</Typography>
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

Proposal.propTypes = {
    _id: PropTypes.number.isRequired,
    proposer: PropTypes.string.isRequired,
    prefixURI: PropTypes.string.isRequired,
    votes: PropTypes.number.isRequired,
    onVote: PropTypes.func.isRequired,
}