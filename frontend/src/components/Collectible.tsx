import {
  Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Typography
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import ColorizeIcon from "@material-ui/icons/Colorize";
import FitnessCenterIcon from "@material-ui/icons/FitnessCenter";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HowToRegIcon from "@material-ui/icons/HowToReg";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import SyncIcon from "@material-ui/icons/Sync";
import clsx from "clsx";
import React, { useEffect, useState } from "react";


const useStyles = makeStyles((theme) => ({
  root: {
    width: 445,
  },
  media: {
    height: 300,
  },
  info: {
    fontWeight: "bold",
  },
  green: { backgroundColor: "#1CBA1C" },
  red: { backgroundColor: "#FF1F5E" },
}));

interface Props{
  checked:boolean,
  _id: string,
  address: string,
  isArmed: boolean,
  price: string,
  power: string,
  tokenURI: string,
  onArm: React.MouseEventHandler<HTMLButtonElement> ,
  onTrain: React.MouseEventHandler<HTMLButtonElement> ,
  onBoost: React.MouseEventHandler<HTMLButtonElement> ,
  onHeal: React.MouseEventHandler<HTMLButtonElement> ,
  onLiberate: React.MouseEventHandler<HTMLButtonElement>,
  onGrant:React.MouseEventHandler<HTMLButtonElement>
}

export default function Collectible(properties: Props) {
  const classes = useStyles();
  const {
    checked,
    _id,
    tokenURI,
    onArm,
    onTrain,
    onBoost,
    onHeal,
    onLiberate,
    onGrant,
  } = properties;
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    fetch(tokenURI)
      .then((res) => res.json())
      .then((object) => {
        setImageURL(object.image);
        setLoading(false);
      });
  }, [tokenURI]);

  return (
    <Card className={classes.root} style={{ borderRadius: 20 }} elevation={3}>
      <CardHeader
        avatar={
          <Avatar
            className={clsx(classes.green, {
              [classes.red]: properties.checked,
            })}
          >
            {_id}
          </Avatar>
        }
        title="Minion"
        subheader={properties.address}
        action={
          <Box>
            <Button
              value={_id}
              variant="outlined"
              disabled={!properties.isArmed}
              style={{ textTransform: "none", marginTop: 10, marginRight: 10 }}
              endIcon={<HowToRegIcon />}
              onClick={onGrant}
            >
              Grant
            </Button>
            <Button
              value={_id}
              variant="outlined"
              disabled={!properties.isArmed}
              style={{ textTransform: "none", marginTop: 10, marginRight: 10 }}
              endIcon={<SyncIcon />}
              onClick={onLiberate}
            >
              Liberate
            </Button>
          </Box>
        }
      />
      {!loading ? (
        <CardMedia
          className={classes.media}
          component="img"
          image={imageURL}
          alt="none"
        />
      ) : (
        <Box
          className={classes.media}
          style={{ textAlign: "center", paddingTop: 150 }}
        >
          <CircularProgress />
        </Box>
      )}
      <CardContent>
        <Typography variant="h6" className={classes.info}>
          Status: {properties.isArmed ? "Armed" : "Trained"}
        </Typography>
        <Typography variant="h6" className={classes.info}>
          {properties.isArmed ? "Latest" : "From"}:{" "}
          {(+properties.price / 10 ** 8).toFixed(2)}
        </Typography>
        <Typography variant="h6" className={classes.info}>
          Power: {properties.power}
        </Typography>
      </CardContent>
      <CardActions>
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          style={{ marginLeft: 15, gap: 15 }}
        >
          <Box>
            <Button
              onClick={onArm}
              value={_id}
              disabled={properties.isArmed}
              style={
                properties.isArmed
                  ? {
                      color: "#D9DDDC",
                      borderRadius: 10,
                      fontSize: 12,
                    }
                  : {
                      color: "#4285F4",
                      borderRadius: 10,
                      fontSize: 12,
                    }
              }
              variant="outlined"
              startIcon={<ColorizeIcon />}
            >
              Arm
            </Button>
          </Box>
          <Box>
            <Button
              onClick={onTrain}
              value={_id}
              disabled={!properties.isArmed}
              style={
                properties.isArmed
                  ? {
                      color: "#DB4437",
                      borderRadius: 10,
                      fontSize: 12,
                    }
                  : {
                      color: "#D9DDDC",
                      borderRadius: 10,
                      fontSize: 12,
                    }
              }
              variant="outlined"
              startIcon={<FitnessCenterIcon />}
            >
              Train
            </Button>
          </Box>
          <Box>
            <Button
              onClick={onHeal}
              value={_id}
              disabled={properties.isArmed}
              style={
                properties.isArmed
                  ? {
                      color: "#D9DDDC",
                      borderRadius: 10,
                      fontSize: 12,
                    }
                  : {
                      color: "#0F9D58",
                      borderRadius: 10,
                      fontSize: 12,
                    }
              }
              variant="outlined"
              startIcon={<LocalHospitalIcon />}
            >
              Heal
            </Button>
          </Box>
          <Box>
            <Button
              onClick={onBoost}
              value={_id}
              disabled={!properties.isArmed}
              style={
                properties.isArmed
                  ? {
                      color: "#F87217",
                      borderRadius: 10,
                      fontSize: 12,
                    }
                  : {
                      color: "#D9DDDC",
                      borderRadius: 10,
                      fontSize: 12,
                    }
              }
              variant="outlined"
              startIcon={<FlashOnIcon />}
            >
              Boost
            </Button>
          </Box>
        </Box>
      </CardActions>
    </Card>
  );
}

