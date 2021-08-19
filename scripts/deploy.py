# deploy.py
from brownie import (
    network, config, run,
    GreenArmy, RedArmy, ArmyProtein, ArmyRank, Battlefield)

init_protein = 7777777

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return
    dev = run("dev_account")
    ens = run("ens_registry")
    g_army = GreenArmy.deploy(ens, init_protein, {"from": dev}, publish_source=config["verify"])
    g_prtn = ArmyProtein.at(g_army.proteinContract())
    g_rank = ArmyRank.at(g_army.rankContract())
    r_army = RedArmy.deploy(ens, init_protein, {"from": dev}, publish_source=config["verify"])
    r_prtn = ArmyProtein.at(r_army.proteinContract())
    r_rank = ArmyRank.at(r_army.rankContract())
    btf = Battlefield.deploy(g_army, r_army, {"from": dev}, publish_source=config["verify"])
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "99 ether")
        g_prtn.transfer(test_account, init_protein//100*10**18, {"from":dev})
        r_prtn.transfer(test_account, init_protein//150*10**18, {"from":dev})
    return g_army, g_prtn, g_rank, r_army, r_prtn, r_rank, btf