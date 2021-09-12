import {
    Box, Button, Container, Dialog,
    DialogTitle, Grid, Paper, Typography
  } from "@material-ui/core";
  import { makeStyles } from "@material-ui/core/styles";
  import AddIcon from "@material-ui/icons/Add";
  import clsx from "clsx";
  import React, { useEffect, useState, useContext } from "react";
  import PairMap from "../assets/map/index";
  import Collectible from "./Collectible";
  import Recruit from "./Recruit";
  import { FloraArmyContext, CurrentAddressContext } from "../hardhat/SymfoniContext";
  
  const useStyles = makeStyles((theme) => ({
    root: {
      marginTop: 10,
      maxHeight: 580,
      overflow: "auto",
      maxWidth: 1040,
    },
    search: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    paper: {
      marginTop: "20px",
      padding: "32px",
    },
    green: {
      background: "#1CBA1C",
      borderRadius: 10,
      color: "#FFFFFF",
      padding: 10,
      fontWeight: "bold",
      border: "none",
    },
    red: {
      background: "#FF1F5E",
      borderRadius: 10,
      color: "#FFFFFF",
      padding: 10,
      fontWeight: "bold",
      border: "none",
    },
    gif: {
      width: "70%",
      height: "70%",
      paddingBottom: 100,
    },
  }));
 
  
  export default function CollectibleList() {
    
    const flora = useContext(FloraArmyContext);
    const address = useContext(CurrentAddressContext);
    const classes = useStyles();
    useEffect(() => {
        const doAsync = async () =>{
            if(!flora.instance || !address[0]) return 
            console.log('collectible list');
            flora.instance.getMinionIDs(address[0])
            .then(object=>{console.log("obejct: ",object)})
            .catch((err)=>{console.log(err)});
        }
        doAsync();
      }, [flora]);

    return (
      <div>
        </div>
    );
  }
  
  
  