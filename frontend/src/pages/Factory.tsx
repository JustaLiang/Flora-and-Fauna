
import { BigNumber } from '@ethersproject/bignumber';
import { CssBaseline, Box } from '@material-ui/core';
import React, { useState } from 'react';
import { CollectibleList } from '../components/CollectibleList';
import { makeStyles } from '@material-ui/core/styles';
import BackgroundDapp from '../assets/image/BackgroundDapp.png'
import Header from '../components/Header';
import PersonalInfo from '../components/PersonalInfo';

const useStyles = makeStyles((theme) => ({
    appBarSpacer: theme.mixins.toolbar,
    root: {
        background: `url(${BackgroundDapp})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: "100% 100%",

    },
}))

export const BalanceContext = React.createContext<[BigNumber, React.Dispatch<React.SetStateAction<BigNumber>>]>([BigNumber.from(0), () => { }]);

export const SwitchContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => {}]);

export default function Factory() {
    const classes = useStyles();
    const [isFauna, setIsFauna] = useState<boolean>(false);
    const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));

    return (
        <>
            <SwitchContext.Provider value={[isFauna, setIsFauna]}>
            <BalanceContext.Provider value={[balance, setBalance]}>
            <div className={classes.root}>
                <CssBaseline />
                <Header/>

                <div className={classes.appBarSpacer} />
                <div style={{ height: 1000, padding: 30, paddingLeft: 200 }}>
                    <Box>
                        <Box display='flex' flexDirection='column' style={{ gap: 25 }}>
                            <PersonalInfo isFauna={isFauna} />
                            <CollectibleList isFauna={isFauna}/>
                        </Box>
                    </Box>
                </div>

            </div>
            </BalanceContext.Provider>
            </SwitchContext.Provider>
        </>

    )

}
