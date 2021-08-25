# deploy_battlefield.py
from brownie import (
    network, config, run, Battlefield)

flora_addr = "0x9094E1bbCD0149751062136309D7E4102BC548C8"
fauna_addr = "0xaF8fdBAA535CdC9898718106eb1fA9546e54eC54"

def main():
    if network.show_active() != "development":
        check = input("It's not development mode, continue to deploy? (y/N) ")
        if check != 'y':
            return

    dev = run("dev_account")
    return Battlefield.deploy(flora_addr, fauna_addr, {"from": dev}, publish_source=config["verify"])