# deploy.py
from brownie import (
    network, accounts, config, run,
    Cytokenin, CryptoGarden)

def get_dev_account():
    if network.show_active() == "development":
        return accounts[0]
    elif network.show_active() in config["networks"]:
        return accounts.add(config["wallets"]["from_key"])
    else:
        return accounts[0]

def deploy_cytokenin():
    dev = get_dev_account()
    return Cytokenin.deploy({"from": dev}, publish_source=config["verify"])

def deploy_cryptogarden():
    dev = get_dev_account()
    ck = deploy_cytokenin()
    gd = CryptoGarden.deploy(ck.address, {"from": dev}, publish_source=config["verify"])
    ck.setGardenAddress(gd.address, {"from": dev})
    return ck, gd

def main():
    ck, gd = deploy_cryptogarden()
    if network.show_active() == "development":
        dev = get_dev_account()
        test_account = config["wallets"]["test_key"]
        dev.transfer(test_account, "50 ether")
        ck.transfer(test_account, 77*10**18, {"from":dev})
    return ck, gd, run("aggregators")