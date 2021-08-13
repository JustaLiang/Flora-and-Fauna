# update_mock.py
from brownie import (accounts, config, MockV3Aggregator, GreenArmy, RedArmy)
import numpy as np
from ens.main import ENS

def update_mock():
    changes = np.random.rand(len(MockV3Aggregator))-0.5
    [agg.updateAnswer(int(agg.latestAnswer()*(1+chg))) \
        for agg,chg in zip(MockV3Aggregator,changes)]        
    return [agg.latestAnswer() for agg in MockV3Aggregator]        

def green_team(acc=accounts[0]):
    if len(GreenArmy) != 0:
        g_army = GreenArmy[-1]
        pairs = config['networks']['development']['mock_pair']
        return [g_army.recruit(ENS.namehash(pair+".data.eth"), {"from":acc}).return_value for pair in pairs]

def red_team(acc=accounts[0]):
    if len(RedArmy) != 0:
        r_army = RedArmy[-1]
        pairs = config['networks']['development']['mock_pair']
        return [r_army.recruit(ENS.namehash(pair+".data.eth"), {"from":acc}).return_value for pair in pairs]