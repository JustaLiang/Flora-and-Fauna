import { ethers } from "hardhat";
import { Signer } from "ethers";
import { assert } from "chai";

describe("greeter contract", function () {
  it("Greet", async function () {
    const [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Greeter");

    const hardhatToken = await Token.deploy('hello');

    let greet = await hardhatToken.greet();

    assert(greet === 'hello', "greet is not hello");

    hardhatToken.setGreeting('new hello');

    greet = await hardhatToken.greet();

    assert(greet === 'new hello', "greet is not new hello");

    console.log('greeter address: ', hardhatToken.address)
  

  });


});