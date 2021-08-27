# deploy_battlefield.py
from brownie import (
    network, config, run, Battlefield)

def rinkeby():
    if network.show_active() != "rinkeby":
        print("it's not on rinkeby testnet")
        return
    check = input("It's not development mode, continue to deploy? (y/N) ")
    if check != 'y':
        return
    dev = run("dev_account")
    flora_addr = "0x938344BD845D4e56873E9e6321F602f6F0f503a2"
    fauna_addr = "0xee4e348166e5730275b760fafff2107313A4e6F0"
    return Battlefield.deploy(flora_addr, fauna_addr, {"from": dev}, publish_source=config["verify"])