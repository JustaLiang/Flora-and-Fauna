# dev_account.py
from brownie import (
    network, accounts, config)

def main():
    if network.show_active() == "development":
        return accounts[0]
    elif network.show_active() in config["networks"]:
        return accounts.add(config["wallets"]["from_key"])
    else:
        return accounts[0]