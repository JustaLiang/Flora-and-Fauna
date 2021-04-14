# deploy.py
from brownie import (
    network, accounts, config,
    Cytokenin, Laboratory)
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

def deploy_laboratory():
    dev = get_dev_account()
    ck = deploy_cytokenin()
    lab = Laboratory.deploy(ck.address, {"from": dev}, publish_source=config["verify"])
    ck.setLaboratoryAddress(lab.address, {"from": dev})
    return ck, lab

def main():
    ck, lab = deploy_laboratory()
    return ck, lab, brownie.run("aggregators")