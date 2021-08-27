import React, { useState } from 'react'
import PropTypes from 'prop-types';
import { Container, Paper, TextField, Box, Typography, Button, Link, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert';
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
export default function Recruit(props) {
    const { onRecruit } = props
    const [state, setState] = useState({
        quote: "ETH",
        base: "USD"
    })
    const [open, setOpen] = useState(false)
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const handleClick = async (e) => {
        e.preventDefault()
        const success = await onRecruit(state.quote, state.base)
        if (!success) setOpen(true)
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };
    return (
        <div>
            <Container maxWidth='sm'>
                <Paper style={{ padding: 32 }} elevation={0}>
                    <Box display="flex"
                        flexDirection="column"
                        alignItems='center'
                        ustifyContent="space-between"
                        style={{ gap: 10 }} >
                        <Box>
                            <TextField name="quote" value={state.quote} onChange={handleChange} variant='outlined' />
                        </Box>
                        <Box>
                            <Typography > / </Typography>
                        </Box>
                        <Box>
                            <TextField name="base" value={state.base} onChange={handleChange} variant='outlined' />
                        </Box>
                        <Box>
                            <Typography> <Link href="https://docs.chain.link/docs/ethereum-addresses/" target="_blank">Check valid pairs </Link></Typography>
                        </Box>
                        <Box>
                            <Button
                                onClick={handleClick}
                                variant='outlined'
                                color='primary'
                                stlye={{paddingBottom:10}}>
                                Recruit
                            </Button>
                        </Box>
                    </Box>
                    </Paper>
            </Container>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    Please enter a valid pair!
                </Alert>
            </Snackbar>
        </div>
    )

}
Recruit.propTypes = {
    onRecruit: PropTypes.func.isRequired,

}
