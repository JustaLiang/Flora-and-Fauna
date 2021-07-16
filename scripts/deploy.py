# deploy.py
from brownie import (
    network, config, run,
    Cytokenin, CrypiranhaPlant)

def main():
    dev = run("dev_account")
    ens = run("ens_registry")
    crhp = CrypiranhaPlant.deploy(ens, {"from": dev}, publish_source=config["verify"])
    ctk = Cytokenin.at(crhp.ctkAddress())
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "100 ether")
        ctk.transfer(test_account, 77*10**18, {"from":dev})
    return ctk, crhp, ens