import { ethers } from "hardhat";
import { Signer } from "ethers";
import { assert } from "chai";

const {deployments} = require('hardhat');

describe('Greet fixture', () => {
  it('testing 1 2 3', async function () {
    await deployments.fixture(['Greeter']);
    const Token = await deployments.get('Greeter'); // Token is available because the fixture was executed
    console.log(Token.address);

  });
});
