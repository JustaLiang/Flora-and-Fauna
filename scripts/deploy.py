# deploy.py
from brownie import (
    network, config, run,
    Cytokenin, CrypiranhaPlant)

def main():
    dev = run("dev_account")
    ens = run("ens_registry")
    ctk = Cytokenin.deploy({"from": dev}, publish_source=config["verify"])
    crhp = CrypiranhaPlant.deploy(ens, ctk, {"from": dev}, publish_source=config["verify"])
    ctk.setGardenAddress(crhp.address, {"from": dev})
    if network.show_active() == "development":
        test_account = config["wallets"]["test_key"]
        dev.transfer(test_account, "100 ether")
        ctk.transfer(test_account, 77*10**18, {"from":dev})
    return ctk, crhp, ens