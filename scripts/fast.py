# fast.py
from brownie import (accounts, config, MockV3Aggregator, FloraArmy, FaunaArmy)
import numpy as np
from ens.main import ENS

def update_price():
    changes = np.random.rand(len(MockV3Aggregator))-0.5
    [agg.updateAnswer(int(agg.latestAnswer()*(1+chg))) \
        for agg,chg in zip(MockV3Aggregator,changes)]        
    return [agg.latestAnswer() for agg in MockV3Aggregator]        

def rise_price():
    [agg.updateAnswer(int(agg.latestAnswer()*1.6)) for agg in MockV3Aggregator]
    return [agg.latestAnswer() for agg in MockV3Aggregator]

def drop_price():
    [agg.updateAnswer(int(agg.latestAnswer()*0.5)) for agg in MockV3Aggregator]
    return [agg.latestAnswer() for agg in MockV3Aggregator]

def flora_team(acc=config['wallets']['test_account']):
    if len(FloraArmy) != 0:
        g_army = FloraArmy[-1]
        pairs = config['networks']['development']['mock_pair']
        acc = accounts.at(acc, force=True)
        accounts[9].transfer(acc, "2 ether")
        return [g_army.recruit(ENS.namehash(pair+".data.eth"), {"from":acc}).return_value for pair in pairs]

def fauna_team(acc=config['wallets']['test_account']):
    if len(FaunaArmy) != 0:
        r_army = FaunaArmy[-1]
        pairs = config['networks']['development']['mock_pair']
        acc = accounts.at(acc, force=True)
        accounts[9].transfer(acc, "2 ether")
        return [r_army.recruit(ENS.namehash(pair+".data.eth"), {"from":acc}).return_value for pair in pairs]