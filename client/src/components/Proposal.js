import React, { useState, useEffect,useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { CardHeader, Card, CardContent, CardActions, Box, Avatar, Typography, IconButton, Button, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import CardCarousel from './CardCarousel';
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
        background: "#1CBA1C",
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
    }

}))
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const suffixURI = ["fauna_1.json", "fauna_2.json", "fauna_3.json", "fauna_4.json", "fauna_5.json",
    "flora_1.json", "flora_2.json", "flora_3.json", "flora_4.json", "flora_5.json"]

export default function Proposal({ _id, proposer, prefixURI, votes }) {
    const classes = useStyles()
    const [open, setOpen] = useState(false);
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
    useEffect(() => {
        var imageList = []
        suffixURI.forEach((suffix, index) => {
            fetch(`${prefixURI}${suffix}`)
                .then(res => res.json())
                .then((object) => {
                    imageList.push(object.image)
                })
        })
        setImageURL(imageList);
        imageRef.current = imageList
    }, [])
    console.log(imageURL)
    return (
        <div>
            <Card className={classes.card}>
                <CardHeader title={`📝  Proposal ${_id}`} style={{ textAlign: 'center' }} />
                <Box className={classes.image}>
                    <CardCarousel urlList={imageURL} />
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
                    <Button className={classes.button}>
                        Vote
                    </Button>

                </CardActions>
                <Box className={classes.footer}>
                    <Typography>Vote count: {votes}</Typography>
                </Box>
            </Card>
        </div>
    )
}

Proposal.propTypes = {
    _id: PropTypes.number.isRequired,
    proposer: PropTypes.string.isRequired,
    prefixURI: PropTypes.string.isRequired,
    votes: PropTypes.number.isRequired
}