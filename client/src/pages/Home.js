import React from 'react'
import { AppBar, Toolbar, Box, Button, Container, Typography, Grid, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Logo from '../assets/image/Logo.png'
import Overlap from '../assets/image/Overlap.png'
import Background from '../assets/image/Background.jpg'
import BackgroundDapp from '../assets/image/BackgroundDapp.png'
import Wallet from '../assets/image/Wallet.svg'
import Collection from '../assets/image/Collection.svg'
import Image from '../assets/image/Image.svg'
import { Link } from "react-router-dom";
import fauna_1 from '../assets/image/fauna_1.png'
import fauna_2 from '../assets/image/fauna_2.png'
import fauna_3 from '../assets/image/fauna_3.png'
import fauna_4 from '../assets/image/fauna_4.png'
import fauna_5 from '../assets/image/fauna_5.png'
import flora_1 from '../assets/image/flora_1.png'
import flora_2 from '../assets/image/flora_2.png'
import flora_3 from '../assets/image/flora_3.png'
import flora_4 from '../assets/image/flora_4.png'
import flora_5 from '../assets/image/flora_5.png'

// const card = [fauna_1, flora_1, fauna_2, flora_2, fauna_3, flora_3, fauna_4, flora_4, fauna_5, flora_5]
const card = [flora_1, flora_2, flora_3, flora_4, flora_5, fauna_1, fauna_2, fauna_3, fauna_4, fauna_5,]

const useStyles = makeStyles((theme) => ({

    logo: {
        heigh: 40,
        width: 100,
    },
    bodyLeft: {
        padding: " 88px 152px"
    },
    main: {
        backgroundImage: `url(${BackgroundDapp})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: "100% 100%"
    },
    title: {
        fontWeight: "bold",
        fontSize: 48,
        width: 560,
    },
    subheading: {
        marginTop: 40,
        fontSize: 36,
        color: "#373737",
        width: 560
    },
    summary: {
        marginTop: 40,
        fontWeight: 500,
        fontSize: 24,
        color: "#575c61",
        width: 560,
        marginBottom: 40
    },
    button: {
        textTransform: 'none',
        color: "#FFFFFF",
        boderRadius: 8,
        fontWeight: "bold",
        padding: "12px 24px"
    },
    overlap: {
        background:`url(${Overlap})`,
        backgroundSize: "cover",
        backgroundPosition:'50% '
    },
    h2: {
        fontWeight: "bold",
        fontSize: 36,
    },
    svg: {
        height: 40,
        width: 40
    },
    p_title: {
        fontWeight: 600,
        fontSize: 20,
        color: '#04111d',
        marginTop: 10,
        marginBottom: 10

    },
    p_body: {
        fontSize: 16,
        color: "#707a83"
    },
    footer: {
        color: 'grey'
    }

}))
export default function Home() {
    const classes = useStyles()
    return (
        <div>
            <AppBar style={{ background: "#FFFFFF", boxShadow: 'none', }}>
                <Toolbar>
                    <Container maxWidth="xl">
                        <Box display="flex" flexDirection="row" justifyContent="space-between" className={classes.header} >
                            <Box >
                                <img src={Logo} alt='logo' className={classes.logo} />
                            </Box>
                            <Box>
                                <Button variant='contained'
                                    className={classes.button}
                                    style={{
                                        marginTop: 10,
                                        marginRight: 20,
                                        background: "#3ea93e",

                                    }}
                                    component={Link} to="/Factory"
                                >
                                    Factory
                                </Button>
                                <Button variant='contained'
                                    className={classes.button}
                                    style={{
                                        marginTop: 10,
                                        background: "#e31e55",
                                        marginRight:20

                                    }}
                                    component={Link} to="/Playground"
                                >
                                    Playground
                                </Button>
                                <Button
                                    style={{
                                        marginTop: 10,
                                        textTransform: 'none',
                                        boderRadius: 8,
                                        fontWeight: "bold",
                                        padding: "12px 24px"

                                    }}
                                    variant='outlined'
                                    href="https://docs.google.com/document/d/1AwX-eP3bZ_XL-YBK7c2zRt0PAFiJFwo-sstIe6dzVns/edit?usp=sharing" target="_blank"
                                >Whitepaper
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Toolbar>

            </AppBar>
            <main>
                <Toolbar />

                    <Box display='flex' flexDirection='row' className={classes.main} style={{ height: 830 }}>
                        <Box className={classes.bodyLeft}>
                            <Typography className={classes.title}>People trade NFT</Typography>
                            <Typography className={classes.title}> We trade to mint NFT</Typography>
                            <Typography className={classes.subheading}>Welcome to a New World of Upgradable NFT</Typography>
                            <Typography className={classes.summary}>Over <span style={{ color: "#5c1fa6" }}>4 million transaction</span> happen every day, seizing these opportunities to become a trading artist. Find your potential. Have a meaningful trading journey. Change the ecosytem of NFT.</Typography>
                            <Button variant='contained'
                                className={classes.button}
                                style={{
                                    marginTop: 10,
                                    marginRight: 20,
                                    background: "#3ea93e",

                                }}
                                component={Link} to="/Factory"
                            >
                                Factory
                            </Button>
                            <Button variant='contained'
                                className={classes.button}
                                style={{
                                    marginTop: 10,
                                    background: "#e31e55",

                                }}
                                component={Link} to="/Playground"
                            >
                                Playground
                            </Button>
                        </Box>
                        <Box >
                            <Box style={{width:730,height:610,marginTop:50}} className={classes.overlap} />

                        </Box>
                    </Box>
                <Divider />
                <Box style={{ height: 430, marginTop: 100 }}>
                    <Container maxWidth="lg">
                        <Typography variant='h2' className={classes.h2} style={{ textAlign: "center" }}>Trade and mint your NFTs</Typography>
                        <Grid container justifyContent="center" spacing={3} style={{ marginTop: 50 }}>
                            <Grid item lg={4} style={{ textAlign: "center" }}>
                                <img src={Wallet} alt='Wallet' className={classes.svg}></img>
                                <Typography className={classes.p_title}>Connect your wallet
                                </Typography>
                                <Typography className={classes.p_body}>Connect to your wallet without any friction by clicking the connect button. We support metamask wallet and any gas fee should be pay in ETH.</Typography>
                            </Grid>
                            <Grid item lg={4} style={{ textAlign: "center" }}>
                                <img src={Collection} alt='Collection' className={classes.svg}></img>
                                <Typography className={classes.p_title}>Mint NFT and join army
                                </Typography>
                                <Typography className={classes.p_body}>Select trading pair and mint NFT. Add flora or fauna army according to the prediction.</Typography>
                            </Grid>
                            <Grid item lg={4} style={{ textAlign: "center" }}>
                                <img src={Image} alt='NFT' className={classes.svg}></img>
                                <Typography className={classes.p_title}>Trade and upgrade NFT
                                </Typography>
                                <Typography className={classes.p_body}>Predict the price change. Use your trading skill to upgrade NFT. Up to five levels can be achieved.</Typography>

                            </Grid>
                            {/* <Grid item lg={3} style={{ textAlign: "center" }}>
                                <img src={Label} alt='Label' className={classes.svg}></img>
                                <Typography className={classes.p_title}>List them for sale
                                </Typography>
                                <Typography className={classes.p_body}>Choose between auctions, fixed-price listings, and declining-price listings. You choose how you want to sell your NFTs, and we help you sell them!

                                </Typography>

                            </Grid> */}
                        </Grid>
                    </Container>
                </Box>
                <Divider />
                <Box style={{ height: 430, marginBottom: 50, marginTop: 50 }}>
                    <Typography variant='h2' className={classes.h2} style={{ textAlign: "center", marginBottom: 50 }}>Explore Collectibles</Typography>
                    <Container maxWidth='lg'>
                        <Box display='flex' flexDirection='row' overflow="visible" style={{ flexWrap: 'no-wrap', overflowX: "scroll", gap: 5 }}>
                            {card.map((item) => (
                                <img src={item} alt='card' style={{ width: 300, height: 300 }} />
                            ))}

                        </Box>
                    </Container>
                </Box>
            </main>
            <Divider />
            <Box style={{ textAlign: 'center', marginTop: 50, marginBottom: 50 }}>
                <Typography variant='h6' className={classes.footer}>Contact: jeffreylin0723@gmail.com</Typography>
                <Typography variant='h6' className={classes.footer}>Github:  <a href="https://github.com/jeff0723/Flora-Fauna" target="_blank">Flora-Fauna</a></Typography>

                <Typography variant='body' style={{ color: 'grey' }}>{"Copyright © "}</Typography>

            </Box>

        </div>
    )
}
