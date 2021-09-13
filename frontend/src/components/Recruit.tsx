import {
  Box, Button, Container, Link, Paper, Snackbar, TextField, Typography
} from "@material-ui/core";
import { AlertProps } from "@material-ui/lab/Alert";
import MuiAlert from "@material-ui/lab/Alert";
import React, { useContext, useState } from "react";
import { CurrentAddressContext, FaunaArmyContext, FloraArmyContext } from "../hardhat/SymfoniContext";
import { MinionListContext } from "./CollectibleList";
import { ethers } from "ethers";
function Alert(properties: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...properties} />;
}
interface Props {
  isFauna: boolean,
  onClose: React.MouseEventHandler<HTMLButtonElement>
}
export default function Recruit(properties: Props) {
  const { isFauna, onClose } = properties;
  const floraArmy = useContext(FloraArmyContext);
  const faunaArmy = useContext(FaunaArmyContext);
  const account = useContext(CurrentAddressContext);
  const [setFloraMinionIds, setFaunaMinionIds] = useContext(MinionListContext);
  const [state, setState] = useState({
    quote: "ETH",
    base: "USD",
  });
  const [open, setOpen] = useState(false);
  const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const onRecruit = async(quote: string, base: string) => {
    const pairHash =  ethers.utils.namehash(`${quote}-${base}.data.eth`);
    console.log(pairHash);
    if (isFauna && faunaArmy.instance) {
      const tx = await faunaArmy.instance.recruit(pairHash);
      const receipt = await tx.wait();
      console.log(receipt);
      if (receipt.status) {
        setFaunaMinionIds(await faunaArmy.instance.getMinionIDs(account[0]));
        return true;
      }
      else {
        console.log(receipt.status);
      }
    }
    if (!isFauna && floraArmy.instance) {
      const tx = await floraArmy.instance.recruit(pairHash);
      const receipt = await tx.wait();
      if (receipt.status) {
        setFloraMinionIds(await floraArmy.instance.getMinionIDs(account[0]));
        return true;
      }
      else
        console.log(receipt.logs);     
    }
    return false;
  }

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const success = await onRecruit(state.quote, state.base);
    if (!success) setOpen(true);
    onClose(e);
  };
  const handleClose = (event: React.SyntheticEvent<Element, Event>, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <div>
      <Container maxWidth="sm">
        <Paper style={{ padding: 32 }} elevation={0}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            style={{ gap: 10 }}
          >
            <Box>
              <TextField
                name="quote"
                value={state.quote}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box>
              <Typography> / </Typography>
            </Box>
            <Box>
              <TextField
                name="base"
                value={state.base}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <Box>
              <Typography>
                {" "}
                <Link
                  href="https://docs.chain.link/docs/ethereum-addresses/"
                  target="_blank"
                >
                  Check valid pairs{" "}
                </Link>
              </Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleClick}
                style={{ paddingBottom: 10 }}
              >
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
  );
}