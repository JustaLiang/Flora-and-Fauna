# deploy.py
from brownie import (
    network, accounts, config,
    Cytokenin, Garden)
import brownie

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

def deploy_garden():
    dev = get_dev_account()
    ck = deploy_cytokenin()
    gd = Garden.deploy(ck.address, {"from": dev}, publish_source=config["verify"])
    ck.setGardenAddress(gd.address, {"from": dev})
    return ck, gd

def main():
    ck, gd = deploy_garden()
    return ck, gd, brownie.run("aggregators")