from brownie import network, Contract
import json

cgd_address = "0x1B5A07a23aE4c2779749a46F84E53cbA5B0e6B7f"
ctk_address = "0xf6d996cFeb09CEB0De4F416DfBfdf546dfc27Db8"

def main():
    if network.show_active() == "rinkeby":
        abi = json.load(open("scripts/old/abi.json", 'r'))
        return  Contract.from_abi("CryptoGarden", cgd_address, abi['cgd']), \
                Contract.from_abi("Cytokenin", ctk_address, abi['ctk'])