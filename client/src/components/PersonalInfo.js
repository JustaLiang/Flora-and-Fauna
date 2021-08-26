import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Container, Box, Typography, Button, Paper } from '@material-ui/core'
import { useEthers } from "@usedapp/core";
import { useDispatch} from 'react-redux';
import { setConnected } from '../redux/actions';
import { useHistory } from 'react-router';
const useStyle = makeStyles((theme) => ({
    paper: {
        marginTop: '20px',
        padding: '32px',
    }
}))
export default function PersonalInfo(props) {
    const { balance, address } = props
    const { activateBrowserWallet, account } = useEthers();
    const classes = useStyle();
    const history = useHistory();
    const dispatch = useDispatch();
    const handleConnect = () => {
        activateBrowserWallet();
    }

    useEffect(() => {
        if(account) 
        {
            dispatch(setConnected(account));
            history.go(0)
        }
    }, [account])


    return (
        <Container>
            <Box display="flex" flexDirection="row" maxWidth={1000} minWidth={800}>
                <Box flexGrow={1}>
                    <Typography variant='h6' style={{fontWeight:'bold'}}>Balance</Typography>
                </Box>
                <Box>
                    {!address?<>
                    <Button variant='outlined' onClick={handleConnect}> Connect</Button>
                    </>:<></>}
                </Box>
            </Box>
            <Paper className={classes.paper} style={{ maxWidth: 1000 , minWidth:800, borderRadius:20}} elevation={3}>
                {address ?
                    <>
                        <Typography>Your account address:  {address}</Typography>
                        <Typography>Your Enhancer Balance:  {balance}</Typography></> : <>
                        <Typography>Please connect to your metamask wallet by pressing connect button</Typography></>
                }

            </Paper>
        </Container>
    )
}
PersonalInfo.propTypes = {
    balance: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
}