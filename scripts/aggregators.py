# price_feed.py
from brownie import (
    network, accounts, config, 
    MockV3Aggregator)

def main():
    net = network.show_active()
    if net == "development":
        return [MockV3Aggregator.deploy(8,2400*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,63000*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,550*10**8, {"from": accounts[1]}),
                MockV3Aggregator.deploy(8,36*10**8, {"from": accounts[1]})]

    if net in config["networks"]:
        return [MockV3Aggregator.at(config["networks"][net]["eth_usd_price_feed"]),
                MockV3Aggregator.at(config["networks"][net]["btc_usd_price_feed"]),
                MockV3Aggregator.at(config["networks"][net]["bnb_usd_price_feed"]),
                MockV3Aggregator.at(config["networks"][net]["link_usd_price_feed"])]
    else:
        print("Unsupported network")
        return []