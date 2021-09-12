import {
  Box, Button, Container, Dialog,
  DialogTitle, Grid, Paper, Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import PairMap from "../assets/map/index";
import Collectible from "./Collectible";
import Recruit from "./Recruit";

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
type IList = {
  [key:number]:{
    0:string,
    1:boolean,
    2:string,
    3:string,
    4:string
  }
}
interface Props {
  checked: boolean,
  list: IList,
  tokenURI: string[],
  onArm: React.MouseEventHandler<HTMLButtonElement>,
  onTrain: React.MouseEventHandler<HTMLButtonElement>,
  onBoost: React.MouseEventHandler<HTMLButtonElement>,
  onHeal: React.MouseEventHandler<HTMLButtonElement>,
  onLiberate: React.MouseEventHandler<HTMLButtonElement>,
  onRecruit: (quote: string, base: string) => boolean,
  onGrant: React.MouseEventHandler<HTMLButtonElement>
}
interface IState {
  data: {
    _id: string,
    address: string,
    isArmed: boolean,
    price: string,
    power: string,
    tokenURI: string
  }[]
}

export default function CollectibleList(properties: Props) {
  const {
    checked,
    list,
    onArm,
    onTrain,
    onBoost,
    onHeal,
    onLiberate,
    onRecruit,
    onGrant,
  } = properties;
  const [data, setData] = useState<IState['data']>([]);
  const [open, setOpen] = useState(false);

  const classes = useStyles();
  useEffect(() => {
    if (list) {
      const temporary:IState['data'] = [];
      for (const key in list) {
        temporary.push({
          _id: key,
          address: PairMap[list[key][0]],
          isArmed: list[key][1],
          price: list[key][2],
          power: list[key][3],
          tokenURI: list[key][4],
        });
      }
      setData(temporary);
    }
  }, [list]);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  console.log("List:", list);
  return (
    <div>
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          maxWidth={1000}
        >
          <Box>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {" "}
              Collectibles
            </Typography>
          </Box>
          <Box>
            <Button
              className={clsx(classes.green, {
                [classes.red]: checked,
              })}
              variant="outlined"
              endIcon={<AddIcon />}
              onClick={handleClickOpen}
            >
              Recruit Minion
            </Button>
            <Dialog
              open={open}
              style={{ textAlign: "center" }}
              onClose={handleClose}
            >
              <DialogTitle id="form-dialog-title">Recruit Minion</DialogTitle>
              <Recruit onRecruit={onRecruit} onClose={handleClose} />
            </Dialog>
          </Box>
        </Box>
        <Grid
          container
          spacing={5}
          className={classes.root}
          alignItems="center"
        >
          {data.length > 0 ? (
            data.map((item, index) => (
              <Grid item lg={6} key={index}>
                <Collectible
                  checked={checked}
                  _id={item._id}
                  address={item.address}
                  isArmed={item.isArmed}
                  price={item.price}
                  power={item.power}
                  tokenURI={item.tokenURI}
                  onArm={onArm}
                  onTrain={onTrain}
                  onBoost={onBoost}
                  onHeal={onHeal}
                  onLiberate={onLiberate}
                  onGrant={onGrant}
                />
              </Grid>
            ))
          ) : (
            <Grid item lg={12}>
              <Paper
                className={classes.paper}
                style={{ minWidth: 800, borderRadius: 20 }}
              >
                <Typography>
                  You don't have any collectible yet. Recruit a minoin to have
                  your first one!
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </div>
  );
}


