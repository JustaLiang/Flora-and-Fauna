import { Box, Container, IconButton, Paper, Snackbar, SnackbarCloseReason, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { BigNumber } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { ArmyEnhancerContext, CurrentAddressContext, FaunaArmyContext, FloraArmyContext } from "../hardhat/SymfoniContext";
import { ArmyEnhancer } from "../hardhat/typechain/ArmyEnhancer";
import { BalanceContext } from "../pages/Factory";


const useStyle = makeStyles((theme) => ({
  paper: {
    marginTop: "20px",
    padding: "32px",
  },
}));

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
interface Props {
  isFauna: boolean
}
export default function PersonalInfo(properties: Props) {
  const classes = useStyle();
  const { isFauna } = properties;
  const floraArmy = useContext(FloraArmyContext);
  const faunaArmy = useContext(FaunaArmyContext);
  const armyEnhancer = useContext(ArmyEnhancerContext);
  const [enhancer, setEnhancer] = useState<ArmyEnhancer>();
  const account = useContext(CurrentAddressContext);
  const [balance, setBalance] = useContext(BalanceContext);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchEnhancerBalance = async () => {
      if (!armyEnhancer.factory) return;
      if (isFauna && faunaArmy.instance) {
        const enhrAddr = await faunaArmy.instance.enhancerContract();
        const enhancer = armyEnhancer.factory.attach(enhrAddr);
        const rawBalance = await enhancer.balanceOf(account[0]);
        const decimals = await enhancer.decimals();
        setEnhancer(enhancer);
        setBalance(rawBalance.div(BigNumber.from(10).pow(decimals)));
      }
      if (!isFauna && floraArmy.instance) {
        const enhrAddr = await floraArmy.instance.enhancerContract();
        const enhancer = armyEnhancer.factory.attach(enhrAddr);
        const rawBalance = await enhancer.balanceOf(account[0]);
        const decimals = await enhancer.decimals();
        setEnhancer(enhancer);
        setBalance(rawBalance.div(BigNumber.from(10).pow(decimals)));
      }
    }
    fetchEnhancerBalance();
  }, [isFauna, account, armyEnhancer, faunaArmy, floraArmy, setBalance])

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
  const onCopy = () => {
    if (!enhancer) return;
    navigator.clipboard.writeText(enhancer.address);
    setOpen(true);
  }
  return (
    <Container>
      <Box display="flex" flexDirection="row" maxWidth={1000} minWidth={800}>
        <Box flexGrow={1}>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Balance
          </Typography>
        </Box>
      </Box>
      <Paper
        className={classes.paper}
        style={{ maxWidth: 1000, minWidth: 800, borderRadius: 20 }}
        elevation={3}
      >
        {account[0] ? (
          <>
            <Typography>{isFauna ? "Hemoglobin (HGB)" : "Chlorophyll (CHL)"} contract: {enhancer?.address} <IconButton onClick={onCopy}><FilterNoneIcon /></IconButton> </Typography>
            <Typography>Your {isFauna ? "Hemoglobin" : "Chlorophyll"} Balance: {balance.toString()}</Typography>
            <Snackbar open={open} autoHideDuration={1000} onClose={handleBarClose}>
              <Alert onClose={handleAlertClose} severity="success">
                Contract address copied!
              </Alert>
            </Snackbar>
          </>
        ) : (
          <>
            <Typography>
              Please connect to your metamask wallet by pressing connect button
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
}
