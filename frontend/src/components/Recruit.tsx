import {
  Box, Button, Container, Link, Paper, Snackbar, TextField, Typography
} from "@material-ui/core";
import { AlertProps } from "@material-ui/lab/Alert";
import MuiAlert from "@material-ui/lab/Alert";
import PropTypes from "prop-types";
import React, { useState } from "react";
function Alert(properties: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...properties} />;
}
interface Props {
  onRecruit: (quote: string, base: string) => boolean,
  onClose: React.MouseEventHandler<HTMLButtonElement>
}
export default function Recruit(properties: Props) {
  const { onRecruit, onClose } = properties;
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
Recruit.propTypes = {
  onRecruit: PropTypes.func.isRequired,
};
