# deploy.py
from brownie import (
    ZERO_ADDRESS, network, config, run,
    FloraArmy, FaunaArmy, ArmyEnhancer, ArmyRank, Battlefield)

INIT_ENHANCER = 7777777
POWER_LEVELS = [0, 1500, 3000, 5000, 10000]
FLORA_PREFIX = "https://ipfs.io/ipfs/bafybeieh3wt7szwrdujfver5nfwbqfh7z6pcodk2h5k46m24oqmizolame/"
FLORA_NAMES = ['flora_1.json','flora_2.json','flora_3.json','flora_4.json','flora_5.json']
FAUNA_PREFIX = "https://ipfs.io/ipfs/bafybeigd7f3maglyvcyvxonmu4copfosxqocg5dpyetw7ozg22m44j27le/"
FAUNA_NAMES = ['fauna_1.json','fauna_2.json','fauna_3.json','fauna_4.json','fauna_5.json']

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return
    dev = run("dev_account")
    ens = run("ens_registry")
    flora_army = FloraArmy.deploy(ens, INIT_ENHANCER, POWER_LEVELS, FLORA_NAMES, {"from": dev}, publish_source=config["verify"])
    flora_enhr = ArmyEnhancer.at(flora_army.enhancerContract())
    flora_rank = ArmyRank.at(flora_army.rankContract())
    fauna_army = FaunaArmy.deploy(ens, INIT_ENHANCER, POWER_LEVELS, FAUNA_NAMES, {"from": dev}, publish_source=config["verify"])
    fauna_enhr = ArmyEnhancer.at(fauna_army.enhancerContract())
    fauna_rank = ArmyRank.at(fauna_army.rankContract())
    btfd = Battlefield.deploy(flora_army, fauna_army, {"from": dev}, publish_source=config["verify"])
    if network.show_active() == "development":
        test_account = config["wallets"]["test_account"]
        dev.transfer(test_account, "2 ether")
        flora_enhr.transfer(test_account, INIT_ENHANCER//100*10**18, {"from":dev})
        fauna_enhr.transfer(test_account, INIT_ENHANCER//200*10**18, {"from":dev})
        flora_rank.updateBranchPrefix(ZERO_ADDRESS, FLORA_PREFIX, {"from":dev})
        fauna_rank.updateBranchPrefix(ZERO_ADDRESS, FAUNA_PREFIX, {"from":dev})
        btfd.changePropInterval(0, {"from":dev})
        btfd.changeVoteInterval(0, {"from":dev})
        flora_rank.transferOwnership(btfd, {"from":dev})
        fauna_rank.transferOwnership(btfd, {"from":dev})
    return flora_army, flora_enhr, flora_rank, fauna_army, fauna_enhr, fauna_rank, btfd
