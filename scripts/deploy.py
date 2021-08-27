# deploy.py
from brownie import (
    network, config, run,
    FloraArmy, FaunaArmy, ArmyEnhancer, ArmyRank, Battlefield)

init_enhancer = 7777777
power_levels = [0, 1500, 3000, 5000, 10000]
flora_images = ['flora_1.json','flora_2.json','flora_3.json','flora_4.json','flora_5.json']
fauna_images = ['fauna_1.json','fauna_2.json','fauna_3.json','fauna_4.json','fauna_5.json']

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return
    dev = run("dev_account")
    ens = run("ens_registry")
    flora_army = FloraArmy.deploy(ens, init_enhancer, power_levels, flora_images, {"from": dev}, publish_source=config["verify"])
    flora_enhr = ArmyEnhancer.at(flora_army.enhancerContract())
    flora_rank = ArmyRank.at(flora_army.rankContract())
    fauna_army = FaunaArmy.deploy(ens, init_enhancer, power_levels, fauna_images, {"from": dev}, publish_source=config["verify"])
    fauna_enhr = ArmyEnhancer.at(fauna_army.enhancerContract())
    fauna_rank = ArmyRank.at(fauna_army.rankContract())
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "50 ether")
        flora_enhr.transfer(test_account, init_enhancer//100*10**18, {"from":dev})
        fauna_enhr.transfer(test_account, init_enhancer//200*10**18, {"from":dev})
        Battlefield.deploy(flora_army, fauna_army, {"from": dev}, publish_source=config["verify"])
    return flora_army, flora_enhr, flora_rank, fauna_army, fauna_enhr, fauna_rank