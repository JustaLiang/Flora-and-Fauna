# update_mock.py
from brownie import MockV3Aggregator
import numpy as np

def main():
    changes = np.random.rand(len(MockV3Aggregator))-0.5
    [agg.updateAnswer(int(agg.latestAnswer()*(1+chg))) \
        for agg,chg in zip(MockV3Aggregator,changes)]        
    return [agg.latestAnswer() for agg in MockV3Aggregator]        
