import { Box, Button, Container, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useEthers } from "@usedapp/core";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { setConnected } from "../redux/actions";
const useStyle = makeStyles((theme) => ({
  paper: {
    marginTop: "20px",
    padding: "32px",
  },
}));

interface Props {
  balance: number,
  address: string
}
export default function PersonalInfo(properties:Props) {
  const { balance, address } = properties;
  const { activateBrowserWallet, account } = useEthers();
  const classes = useStyle();
  const history = useHistory();
  const dispatch = useDispatch();
  const handleConnect = () => {
    activateBrowserWallet();
  };

  useEffect(() => {
    if (account) {
      dispatch(setConnected(account));
      history.go(0);
    }
  }, [account]);

  return (
    <Container>
      <Box display="flex" flexDirection="row" maxWidth={1000} minWidth={800}>
        <Box flexGrow={1}>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            Balance
          </Typography>
        </Box>
        <Box>
          {!address ? (
            <>
              <Button variant="outlined" onClick={handleConnect}>
                {" "}
                Connect
              </Button>
            </>
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <Paper
        className={classes.paper}
        style={{ maxWidth: 1000, minWidth: 800, borderRadius: 20 }}
        elevation={3}
      >
        {address ? (
          <>
            <Typography>Your account address: {address}</Typography>
            <Typography>Your Enhancer Balance: {balance}</Typography>
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
