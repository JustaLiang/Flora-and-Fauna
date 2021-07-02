# deploy.py
from brownie import (
    network, config, run,
    Cytokenin, CryptoGarden)

def main():
    dev = run("dev_account")
    ck = Cytokenin.deploy({"from": dev}, publish_source=config["verify"])
    gd = CryptoGarden.deploy(ck.address, {"from": dev}, publish_source=config["verify"])
    ck.setGardenAddress(gd.address, {"from": dev})
    if network.show_active() == "development":
        test_account = config["wallets"]["test_key"]
        dev.transfer(test_account, "100 ether")
        ck.transfer(test_account, 77*10**18, {"from":dev})
    return ck, gd, run("mock")