# deploy.py
from brownie import (
    network, config, run,
    FloraArmy, FaunaArmy, ArmyEnhancer, ArmyRank, Battlefield)

init_enhancer = 7777777
power_levels = [0, 1010, 1030, 1050, 1100]
flora_images = ['flora_1.jpg','flora_2.jpg','flora_3.jpg','flora_4.jpg','flora_5.jpg']
fauna_images = ['fauna_1.jpg','fauna_2.jpg','fauna_3.jpg','fauna_4.jpg','fauna_5.jpg']

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return
    dev = run("dev_account")
    ens = run("ens_registry")
    g_army = FloraArmy.deploy(ens, init_enhancer, power_levels, flora_images, {"from": dev}, publish_source=config["verify"])
    g_enhr = ArmyEnhancer.at(g_army.enhancerContract())
    g_rank = ArmyRank.at(g_army.rankContract())
    r_army = FaunaArmy.deploy(ens, init_enhancer, power_levels, fauna_images, {"from": dev}, publish_source=config["verify"])
    r_enhr = ArmyEnhancer.at(r_army.enhancerContract())
    r_rank = ArmyRank.at(r_army.rankContract())
    btf = Battlefield.deploy(g_army, r_army, {"from": dev}, publish_source=config["verify"])
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "50 ether")
        g_enhr.transfer(test_account, init_enhancer//100*10**18, {"from":dev})
        r_enhr.transfer(test_account, init_enhancer//150*10**18, {"from":dev})
    return g_army, g_enhr, g_rank, r_army, r_enhr, r_rank, btf