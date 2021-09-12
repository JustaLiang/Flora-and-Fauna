import {
  AppBar, Button, Grid, Toolbar,
  Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import clsx from "clsx";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/image/Logo.png";
import { SwitchContext } from "../pages/Factory";

const useStyle = makeStyles((theme) => ({
  appBar: { backgroundColor: "#FFFFFF" },
  green: { color: "#1CBA1C" },
  red: { color: "#FF1F5E" },
  greenButton: { color: "#1CBA1C", borderColor: "#1CBA1C" },
  redButton: { color: "#FF1F5E", borderColor: "#FF1F5E" },
  switch_green: {
    flexGrow: 1,
    color: "#1CBA1C",
    fontWeight: "bold",
    fontSize: "1rem",
    width: 300,
  },
  switch_red: {
    flexGrow: 1,
    width: 300,
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#FF1F5E",
  },
  logo: {
    heigh: 40,
    width: 100,
  },
  logoButton: {
    flexGrow: 1,
  },
}));

interface Props { }

export default function Header(properties: Props) {
  const classes = useStyle();
  const [isFauna, setIsFauna] = useContext(SwitchContext);

  const onToggle = (event: React.ChangeEvent<{}>, checked: boolean) => {
    event.preventDefault();
    setIsFauna(checked);
  }

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <Grid container style={{width:'80vw'}}>
          <Grid item lg={6}>
            <Button component={Link} to="/">
              <img src={Logo} className={classes.logo} alt="Logo"/>
            </Button>
          </Grid>
          <Grid item lg={6} style={{ paddingTop: 20 }}>
            <Typography
              variant="h5"
              className={clsx(classes.green, {
                [classes.red]: isFauna,
              })}
            >
              {!isFauna ? "Flora Army" : "Fauna Army"}
            </Typography>
          </Grid>
        </Grid>
        <Button
          component={Link}
          variant="outlined"
          to="/Playground"
          className={clsx(classes.greenButton, {
            [classes.redButton]: isFauna,
          })}
          style={{
            textTransform: "none",
            marginRight: 20,
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Playground
        </Button>
        <Switch onChange={onToggle}/>

      </Toolbar>
    </AppBar>
  );
}

