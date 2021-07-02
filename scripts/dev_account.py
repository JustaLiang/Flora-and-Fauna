# dev_account.py
from brownie import (
    network, accounts, config)

def main():
    if network.show_active() == "development":
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])