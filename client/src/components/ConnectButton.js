import { Button, Box, Typography } from "@material-ui/core";
import { useEthers, useEtherBalance } from "@usedapp/core";

export default function ConnectButton() {
  const {activateBrowserWallet, account } = useEthers();
  const etherBalance = useEtherBalance(account);
  const  handleConnectWallet = ()=>{
    activateBrowserWallet();
  }
  return account ? (
    <Box>
      <Typography color="white" fontSize="md">
        {etherBalance && etherBalance} ETH
      </Typography>
    </Box>
  ) : (
    <Button onClick={handleConnectWallet}>Connect to a wallet</Button>
  );
}