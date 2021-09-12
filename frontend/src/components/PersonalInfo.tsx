import { Box, Container, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useEffect } from "react";
import { FloraArmyContext, FaunaArmyContext, CurrentAddressContext, ArmyEnhancerContext } from "../hardhat/SymfoniContext";
import { BalanceContext } from "../pages/Factory";
import { BigNumber } from "ethers";
const useStyle = makeStyles((theme) => ({
  paper: {
    marginTop: "20px",
    padding: "32px",
  },
}));

interface Props {
  isFauna: boolean
}
export default function PersonalInfo(properties: Props) {
  const classes = useStyle();
  const { isFauna } = properties;
  const floraArmy = useContext(FloraArmyContext);
  const faunaArmy = useContext(FaunaArmyContext);
  const armyEnhancer = useContext(ArmyEnhancerContext);
  const account = useContext(CurrentAddressContext);
  const [balance, setBalance] = useContext(BalanceContext);

  useEffect(() => {
    const fetchEnhancerBalance = async () => {
      if (!armyEnhancer.factory) return;
      if (isFauna && faunaArmy.instance) {
        const enhrAddr = await faunaArmy.instance.enhancerContract();
        const enhancer = armyEnhancer.factory.attach(enhrAddr);
        const rawBalance = await enhancer.balanceOf(account[0]);
        const decimals = await enhancer.decimals();
        setBalance(rawBalance.div(BigNumber.from(10).pow(decimals)));
      } 
      if (!isFauna && floraArmy.instance) {
        const enhrAddr = await floraArmy.instance.enhancerContract();
        const enhancer = armyEnhancer.factory.attach(enhrAddr);
        const rawBalance = await enhancer.balanceOf(account[0]);
        const decimals = await enhancer.decimals();
        setBalance(rawBalance.div(BigNumber.from(10).pow(decimals)));
      }
    }
    fetchEnhancerBalance();
  }, [isFauna, account, armyEnhancer, faunaArmy, floraArmy, setBalance])

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
            <Typography>Your account address: {account[0]}</Typography>
            <Typography>Your Enhancer Balance: {balance.toString()}</Typography>
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
