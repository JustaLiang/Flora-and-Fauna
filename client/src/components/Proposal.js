import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import {CardHeader, Card, CardContent, CardActions, Box, Avatar, Typography, IconButton, Button, Snackbar } from '@material-ui/core';
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

export default function Proposal() {
    const address = "0x1BA85548aFFb8053b3520115fB2D1C437a5fbAaf"
    const classes = useStyles()
    const [open, setOpen] = useState(false);
    const onCopy = () => {
        navigator.clipboard.writeText(address);
        setOpen(true);
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };
    return (
        <div>
            <Card className={classes.card}>
                <CardHeader title="📝  Proposal 1" style={{ textAlign: 'center' }} />
                <Box className={classes.image}>
                    <CardCarousel url={'hi'} />
                </Box>
                <CardContent style={{ marginTop: 10 }}>
                    <Typography style={{ wordWrap: 'break-word' }}> Proposer: {address.slice(0, 10)}... <IconButton onClick={onCopy}><FilterNoneIcon /></IconButton></Typography>
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
                    <Typography>Vote count: 1</Typography>
                </Box>
            </Card>
        </div>
    )
}

Proposal.propTypes = {
    proposalId: PropTypes.number.isRequired,
    proposerAddress: PropTypes.string.isRequired,
    prefixURI: PropTypes.string.isRequired,
    votes: PropTypes.number.isRequired
}