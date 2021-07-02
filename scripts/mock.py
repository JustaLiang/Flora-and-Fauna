# mock.py
from brownie import (
    network, accounts, 
    MockV3Aggregator)

def main():
    net = network.show_active()
    if net == "development":
        return [MockV3Aggregator.deploy(8,2400*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,63000*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,550*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,36*10**8, {"from": accounts[1]})]
    else:
        return []