const {ethers, getNamedAccounts, getUnnamedAccounts} = require('hardhat');
const { BigNumber } = require("ethers");
const { expect, assert } = require("chai");
const utils = require('ethers').utils;
const {deployments} = require('hardhat');

const zeroAddress = ethers.constants.AddressZero;
const initEnhancer = 7777777777777;
const powerLevels = [2000, 1500, 1300, 1100, 0];
const floraNames = ['flora_5.json', 'flora_4.json', 'flora_3.json', 'flora_2.json', 'flora_1.json'];
const faunaNames = ['fauna_5.json', 'fauna_4.json', 'fauna_3.json', 'fauna_2.json', 'fauna_1.json'];
const floraPrefix = "ipfs://bafybeieh3wt7szwrdujfver5nfwbqfh7z6pcodk2h5k46m24oqmizolame/"
const faunaPrefix = "ipfs://bafybeigd7f3maglyvcyvxonmu4copfosxqocg5dpyetw7ozg22m44j27le/"


describe("Flora and Fauna", async function () {
  


  before(async function () {
    

    
  });

  it('BattleField', async function(){

    const pair = 'link-usd'
    const pairHash = ethers.utils.namehash(pair + ".data.eth"); 
    await deployments.fixture();
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();
    
  
    const floraArmy = await ethers.getContract('FloraArmy', tokenOwner);
    const faunaArmy = await ethers.getContract('FaunaArmy', tokenOwner);
    const battlefield = await ethers.getContract('Battlefield', tokenOwner);

    const ens = await ethers.getContract('MockEnsRegistry', tokenOwner);
    const resolver = await ethers.getContract('MockPublicResolver', tokenOwner);
    const link_agg = await ethers.getContract('MockV3Aggregator', tokenOwner);
  
    let lastAnswer = await link_agg.latestAnswer();
    // console.log('lastAnswer: ', await lastAnswer.toString());
  
    const ArmyEnhancer = await ethers.getContractFactory("ArmyEnhancer");
    const floraEnhancer = ArmyEnhancer.attach(await floraArmy.enhancerContract());
    const faunaEnhancer = ArmyEnhancer.attach(await faunaArmy.enhancerContract());
    // console.log(await floraEnhancer.totalSupply());

    await floraArmy.recruit(pairHash);
    await faunaArmy.recruit(pairHash);
    await floraArmy.connect(addr1).recruit(pairHash);
    await faunaArmy.connect(addr1).recruit(pairHash);

    const ownerFlora = await floraArmy.getMinionIDs(owner.address);
    const ownerFauna = await faunaArmy.getMinionIDs(owner.address);
    const addrFlora = await floraArmy.getMinionIDs(addr1.address);
    const addrFauna = await faunaArmy.getMinionIDs(addr1.address);

    let ProposalCount = await battlefield.getProposalCount();
    assert(ProposalCount.toNumber() === 0, "Proposal length is 0");
    const ProposalInfo = await battlefield.getAllProposalInfo();
    assert(ProposalInfo.length === 0, "ProposalInfo length is 0");

    await expect(
      battlefield.propose(faunaPrefix)
    ).to.be.revertedWith('Battlefield: not enough slotting fee');

    // 1e11 wei or 0.1 slotting fee
    await expect(
      battlefield.propose(faunaPrefix, {
        value: utils.parseEther('0.0000001')
      })
     ).to.be.revertedWith('Battlefield: not enough slotting fee');

    await battlefield.propose(faunaPrefix, {
      value: utils.parseEther('0.000001')
    })

    ProposalCount = await battlefield.getProposalCount();
    assert(ProposalCount.toNumber() === 1, "Proposal length is 1");

    assert( await floraArmy.baseURI() === floraPrefix, "floraPrefix is base");
    assert( await faunaArmy.baseURI() === faunaPrefix, "faunaPrefix is base");

    // set link from 
    await link_agg.updateAnswer( 40*10**8 );
    let lastestAnswer = await link_agg.latestAnswer();
    console.log( 'Now link price: ', lastestAnswer.toNumber() );

    //BattleBase
    await expect(
      battlefield.connect(addr1).expand(100)
    ).to.be.revertedWith('Ownable: caller is not the owner')

  });

  it("Army base contract", async function () {

    
    // assert(minions.length === 3, "mimionsID length");

    // // transfer function
    // await flora_army.transferFrom(owner.address, addr1.address, minions[0]);
    // assert( await flora_army.ownerOf(minions[0]) === addr1.address, 'transfer to addr1');
    // assert( await flora_army.ownerOf(minions[0]) != owner.address, 'transfer success');
    // await expect(
    //    flora_army.transferFrom(owner.address, addr1.address, minions[0])
    // ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

    // //get minion info
    // const infos = await flora_army.getTeamInfo(minions);
    // infos.map(async (minion, idx) => {
    //   await expect(
    //     minion.power
    //   ).to.equal(await BigNumber.from(1000) );

    //   await expect(
    //     minion.armed
    //   ).to.equal(false );

    // });

    // // liberate
    // await expect(
    //   flora_army.liberate(minions[0])
    // ).to.be.revertedWith( "ARMY: commander can't command the minion" );

    // await expect(
    //   flora_army.liberate(minions[1])
    // ).to.be.revertedWith( "ARMY: can only liberate armed minion" );



  });

  it("floraArmy contract", async function () {

    // // arm before liberate
    // await flora_army.arm(minions[0]);
    // await flora_army.arm(minions[1]);
    // let info = await flora_army.getMinionInfo(minions[0]);
    // assert( await info[1] === true, 'armed = true after arm');

    // await flora_army.liberate(minions[0]);
    // await expect(
    //   flora_army.liberate(minions[0])
    // ).to.be.revertedWith("ERC721: operator query for nonexistent token");
    // await expect(
    //   flora_army.ownerOf(minions[0])
    // ).to.be.revertedWith("ERC721: owner query for nonexistent token");

    
    // const profile = await flora_army.getMinionProfile(minions[1]);
    // console.log(profile);

    // // enhancer
    // const ArmyEnhancer = await hre.ethers.getContractFactory("ArmyEnhancer");
    // const floraEnhancer = ArmyEnhancer.attach(await flora_army.enhancerContract())
    // const ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    // const totalEnhancer = await floraEnhancer.totalSupply();

    // assert(ownerEnhancer.eq(totalEnhancer), 'Enhancer total supply equal to owner');
    // await flora_army.liberate(minions[1]);
    // assert( ownerEnhancer.eq(await floraEnhancer.balanceOf(owner.address)), 'liberate power 1000 does not gain enhancer');

    // // can trained be heal when price not change?
    // await flora_army.heal(minions[2]);
    // assert( ownerEnhancer.eq(await floraEnhancer.balanceOf(owner.address)), "heal should not take enhancer if price doesn't change");
    // info = await flora_army.getMinionInfo(minions[2]);
    // assert( await info[1] === true, 'armed after heal');
  });

  it("mockAgg", async function () {
    // const ArmyEnhancer = await hre.ethers.getContractFactory("ArmyEnhancer");
    // const floraEnhancer = ArmyEnhancer.attach(await flora_army.enhancerContract())
    // let ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    // console.log(ownerEnhancer.toString());
    // const latestAnswer = await mockAgg.latestAnswer();
    // // console.log(await latestAnswer.toNumber() );
    // let info = await flora_army.getMinionInfo(minions[0]);
    // let envFactor = await info[2];
    // assert( latestAnswer.eq(envFactor), 'latestAnswer equal to envFactor');

    // // update price to 600
    // // train -> arm
    // await mockAgg.updateAnswer(600);
    // let updateAnswer = await mockAgg.latestAnswer();
    // await flora_army.arm(minions[0]);
    // info = await flora_army.getMinionInfo(minions[0]);
    // // console.log(await info[3].toNumber() );
    // assert( updateAnswer.eq(info[2]), 'updateAnswer equal to envFactor after arm');

    // // update price to 800
    // // arm -> train
    // await mockAgg.updateAnswer(800);
    // updateAnswer = await mockAgg.latestAnswer();
    // await flora_army.boost(minions[0]);
    // ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    // console.log(ownerEnhancer.toString());
    // info = await flora_army.getMinionInfo(minions[0]);
    // // console.log(await info[3].toNumber() );
    // // assert( updateAnswer.eq(info[2]), 'updateAnswer equal to envFactor after boost');

    // await flora_army.heal(minions[0]);
    // ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    // console.log(ownerEnhancer.toString());
    // await flora_army.boost(minions[0]);
    // ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    // console.log(ownerEnhancer.toString());

  });

});