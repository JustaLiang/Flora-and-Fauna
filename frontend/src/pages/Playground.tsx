import { AppBar, Box, Button, Container, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useContext, useEffect } from 'react';
import { Link } from "react-router-dom";
import Logo from '../assets/image/Logo.png';
import redPlayground from '../assets/image/redPlayground.png';
import { Battlefield } from '../components/Battlefield';
import { ProposalList } from '../components/ProposalList';
import { BattlefieldContext } from '../hardhat/SymfoniContext';

const useStyles = makeStyles((theme) => ({
    root: {
        background: `url(${redPlayground})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition:'50% 50%',
        backgroundSize: "100% 100%",

    },
    logo: {
        heigh: 40,
        width: 100,
    }
    
}))

interface Props { }

export const Playground: React.FC<Props> = () => {
    const classes = useStyles();
    const battlefield = useContext(BattlefieldContext);

    useEffect(() => {
        const loadContract = async () => {
            if (!battlefield.instance) return;
            console.log("Battlefield is deployed at ", battlefield.instance.address);
        };
        loadContract();
    }, [battlefield])

    return ( 
        <>
            <div >
                <AppBar style={{ background: "#FFFFFF", boxShadow: 'none',borderBottom:'1px solid rgba(0, 0, 0, 0.125)'}}>
                    <Toolbar>
                        <Container maxWidth='xl'>
                        <Box display="flex" flexDirection="row" justifyContent="space-between" >
                            <Box >
                            <Button component={Link} to="/">
                            <img src={Logo} className={classes.logo} alt="FF" />
                        </Button>
                            </Box>
                            <Box >
                                <Button 
                                    variant='outlined'
                                    style={{
                                        marginTop:20,marginRight:30,textTransform:'none',fontSize:16,fontWeight:'bold'
                                    }}
                                    component={Link} to="/Factory"
                                >
                                    Factory
                                </Button>
                                <Button 
                                    variant='outlined'
                                    style={{
                                        marginTop:20,textTransform:'none',fontSize:16,fontWeight:'bold'
                                    }}
                                    href="https://docs.google.com/document/d/1AwX-eP3bZ_XL-YBK7c2zRt0PAFiJFwo-sstIe6dzVns/edit?usp=sharing" target="_blank"
                                >
                                    WhitePaper
                                </Button>
                            </Box>
                        </Box>
                        </Container>
                    </Toolbar>
                </AppBar>
            </div>
            <div className={classes.root} style={{ paddingLeft: 100, paddingTop: 100, }}>
                <ProposalList/>
                <Battlefield/>
            </div>
        </>
    )
}
