import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia, CardHeader, Card, CardContent, CardActions, Box, Avatar, Typography,Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import BuildIcon from '@material-ui/icons/Build';
import SportsKabaddiIcon from '@material-ui/icons/SportsKabaddi';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import clsx from 'clsx';


const useStyles = makeStyles((theme) => ({
    root: {
        width: 445,
    },
    media: {
        height: 300,
    },
    info:{
        fontWeight:'bold'
    },
    green: { backgroundColor: '#1CBA1C' },
    red: { backgroundColor: '#FF1F5E' },

}))
export default function Collectible(props) {
    const classes = useStyles()
    const { _id, onArm, onTrain, onBoost, onHeal, onSell } = props
    return (
        <Card className={classes.root} style={{borderRadius:20}} elevation={3}>
            <CardHeader
                avatar={
                    <Avatar className={clsx(classes.green, {
                        [classes.red]: props.checked
                    })}>
                        {_id}
                    </Avatar>
                }
                title="Minion Warrier"
                subheader={props.address}
                action={
                    <Button
                        value={_id}
                        variant='outlined'
                        style={{textTransform:"none",marginTop:10,marginRight:10}}
                        endIcon={<MonetizationOnIcon />}
                        onClick={onSell}
                    >Liberate
                    </Button>
                }
            />

            <CardMedia
                className={classes.media}
                component="img"
                image={props.tokenURI}
                alt="none"
            />
            <CardContent>
                <Typography variant='h6' className={classes.info}>
                    Status: {props.isArmed?"Armed":"Unarmed"}
                </Typography>
                <Typography variant='h6' className={classes.info}>
                    Price: {(props.price/10**8).toFixed(2)}
                </Typography>
                <Typography variant='h6' className={classes.info}>
                    Power: {props.power}
                </Typography>
            </CardContent>
            <CardActions>
                <Box display="flex" flexDirection="row" flexWrap="wrap" style={{ marginLeft: 15, gap: 15 }}>
                    <Box >
                        <Button
                            onClick={onArm}
                            value={_id}
                            style={{
                                color: "#4285F4",
                                borderRadius: 10,
                                fontSize:12
                            }}
                            variant='outlined'
                            startIcon={<BuildIcon />}>
                            Arm
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onTrain}
                            value={_id}
                            style={{
                                color: "#DB4437",
                                borderRadius: 10,
                                fontSize:12
                            }}
                            variant='outlined'
                            startIcon={<SportsKabaddiIcon />}>
                            Train
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onBoost}
                            value={_id}
                            style={{
                                color: "#F4B400",
                                borderRadius: 10,
                                fontSize:12
                            }}
                            variant='outlined'
                            startIcon={<FlashOnIcon />}>
                            Boost
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            onClick={onHeal}
                            value={_id}
                            style={{
                                color: "#0F9D58",
                                borderRadius: 10,
                                fontSize:12
                            }}
                            variant='outlined'
                            startIcon={<LocalHospitalIcon />}>
                            Heal
                        </Button>
                    </Box>
                </Box>
            </CardActions>

        </Card>
    )
}

Collectible.propTypes = {
    checked: PropTypes.bool.isRequired,
    _id: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    isArmed: PropTypes.bool.isRequired,
    price: PropTypes.number.isRequired,
    power: PropTypes.number.isRequired,
    tokenURI:PropTypes.string.isRequired,
    onArm: PropTypes.func.isRequired,
    onTrain: PropTypes.func.isRequired,
    onBoost: PropTypes.func.isRequired,
    onHeal: PropTypes.func.isRequired,
    onSell: PropTypes.func.isRequired
}