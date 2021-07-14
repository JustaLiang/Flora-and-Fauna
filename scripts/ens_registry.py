# ens_registry.py
from brownie import (
    network, accounts, config,
    MockEnsRegistry, MockPublicResolver, MockV3Aggregator)
from ens.main import ENS

def main():
    net = network.show_active()
    if net == "development":
        ens = MockEnsRegistry.deploy({"from": accounts[1]})
        resolver = MockPublicResolver.deploy({"from":accounts[2]})
        for pair,price in zip(config["networks"][net]["mock_pair"], config["networks"][net]["mock_price"]):
            hashID = ENS.namehash(pair+".data.eth")
            aggAddr = MockV3Aggregator.deploy(8, price*10**8, {"from": accounts[2]})
            ens.setResolver(hashID, resolver)
            resolver.setAddr(hashID, aggAddr)
        return ens
    else:
        return config["networks"][net]["ens_registry"]