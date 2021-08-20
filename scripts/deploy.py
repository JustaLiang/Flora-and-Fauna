# deploy.py
from brownie import (
    network, config, run,
    FloraArmy, FaunaArmy, ArmyEnhancer, ArmyRank, Battlefield)

init_enhancer = 7777777
power_levels = [0, 1010, 1020, 1030, 1040]
json_names = ['level_1.json','level_2.json','level_3.json','level_4.json','level_5.json']

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return
    dev = run("dev_account")
    ens = run("ens_registry")
    g_army = FloraArmy.deploy(ens, init_enhancer, power_levels, json_names, {"from": dev}, publish_source=config["verify"])
    g_enhr = ArmyEnhancer.at(g_army.enhancerContract())
    g_rank = ArmyRank.at(g_army.rankContract())
    r_army = FaunaArmy.deploy(ens, init_enhancer, power_levels, json_names, {"from": dev}, publish_source=config["verify"])
    r_enhr = ArmyEnhancer.at(r_army.enhancerContract())
    r_rank = ArmyRank.at(r_army.rankContract())
    btf = Battlefield.deploy(g_army, r_army, {"from": dev}, publish_source=config["verify"])
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "50 ether")
        g_enhr.transfer(test_account, init_enhancer//100*10**18, {"from":dev})
        r_enhr.transfer(test_account, init_enhancer//150*10**18, {"from":dev})
    return g_army, g_enhr, g_rank, r_army, r_enhr, r_rank, btf