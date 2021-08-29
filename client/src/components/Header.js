import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, FormControlLabel, Button, Grid } from '@material-ui/core'
import Switch from '@material-ui/core/Switch';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Logo from '../assets/image/Logo.png'
const useStyle = makeStyles((theme) => ({
    appBar:{backgroundColor:'#FFFFFF'},
    green: { color: '#1CBA1C' },
    red: { color: '#FF1F5E' },
    switch_green: {
        flexGrow: 1,
        color:  '#1CBA1C'
    },
    switch_red:{
        flexGrow: 1,
        color: '#FF1F5E'
    },
    logo: {
        heigh: 40,
        width: 100,
    },
    logoButton: {
        flexGrow: 1,
    }
}))
export default function Header(props) {
    const classes = useStyle()
    return (
        <AppBar className={classes.appBar}>
            <Toolbar >
                <Grid container>
                    <Grid item lg={6} >
                        <Button component={Link} to="/">
                            <img src={Logo} className={classes.logo} />
                        </Button>
                    </Grid>
                    <Grid item lg={6} style={{ paddingTop: 20 }}>
                        <Typography variant="h5" className={clsx(classes.green, {
                            [classes.red]: props.checked
                        })} >
                            {!props.checked ? "Flora Army" : "Fauna Army"}
                        </Typography>
                    </Grid>
                </Grid>
                <FormControlLabel
                    control={<Switch />}
                    label="Change Army"
                    labelPlacement="start"
                    checked={props.checked}
                    onChange={props.toggleChecked}
                    className={clsx(classes.switch_green, {
                        [classes.switch_red]: props.checked
                    })}
                />


            </Toolbar>

        </AppBar>
    )
}
Header.propTypes = {
    checked: PropTypes.bool.isRequired,
    toggleChecked: PropTypes.func.isRequired
}