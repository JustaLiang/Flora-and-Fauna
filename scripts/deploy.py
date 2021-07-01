# deploy.py
from brownie import (
    network, config, run,
    Cytokenin, CryptoGarden)

def deploy_cytokenin():
    dev = run("dev_account")
    return Cytokenin.deploy({"from": dev}, publish_source=config["verify"])

def deploy_cryptogarden():
    dev = run("dev_account")
    ck = deploy_cytokenin()
    gd = CryptoGarden.deploy(ck.address, {"from": dev}, publish_source=config["verify"])
    ck.setGardenAddress(gd.address, {"from": dev})
    return ck, gd

def main():
    ck, gd = deploy_cryptogarden()
    if network.show_active() == "development":
        dev = run("dev_account")
        test_account = config["wallets"]["test_key"]
        dev.transfer(test_account, "100 ether")
        ck.transfer(test_account, 77*10**18, {"from":dev})
    return ck, gd, run("aggregators")