# deploy.py
from brownie import (
    network, config, run,
    GreenArmy, GreenProtein, RedArmy, RedProtein)

def main():
    dev = run("dev_account")
    ens = run("ens_registry")
    g_army = GreenArmy.deploy(ens, {"from": dev}, publish_source=config["verify"])
    g_prtn = GreenProtein.at(g_army.prtnAddress())
    r_army = RedArmy.deploy(ens, {"from": dev}, publish_source=config["verify"])
    r_prtn = RedProtein.at(r_army.prtnAddress())
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "100 ether")
        g_prtn.transfer(test_account, 77*10**18, {"from":dev})
        r_prtn.transfer(test_account, 77*10**18, {"from":dev})
    return g_army, g_prtn, r_army, r_prtn, ens