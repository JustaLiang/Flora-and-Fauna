from brownie import Contract
import json

cgd_address = "0x1B5A07a23aE4c2779749a46F84E53cbA5B0e6B7f"

def main():
    cgd_abi = json.load(open("scripts/cgd_abi.json", 'r'))
    return Contract.from_abi("CryptoGarden", cgd_address, cgd_abi['abi'])