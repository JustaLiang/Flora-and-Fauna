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
  

  let floraArmy, faunaArmy, battlefield;
  let ens, resolver, link_agg;
  let lastAnswer;
  let ArmyEnhancer, floraEnhancer, faunaEnhancer;

  before(async function () {
    
    await deployments.fixture();
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    floraArmy = await ethers.getContract('FloraArmy', tokenOwner);
    faunaArmy = await ethers.getContract('FaunaArmy', tokenOwner);
    battlefield = await ethers.getContract('Battlefield', tokenOwner);

    ens = await ethers.getContract('MockEnsRegistry', tokenOwner);
    resolver = await ethers.getContract('MockPublicResolver', tokenOwner);
    link_agg = await ethers.getContract(`MockV3Aggregator_${pair}`, tokenOwner);
  
    lastAnswer = await link_agg.latestAnswer();
    // console.log('lastAnswer: ', await lastAnswer.toString());
  
    ArmyEnhancer = await ethers.getContractFactory("ArmyEnhancer");
    floraEnhancer = ArmyEnhancer.attach(await floraArmy.enhancerContract());
    faunaEnhancer = ArmyEnhancer.attach(await faunaArmy.enhancerContract());
    // console.log(await floraEnhancer.totalSupply());
    
  });

  it("Army base contract", async function () {

    // address accounts
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();

    // owner recruit link-flora
    await floraArmy.recruit(pairHash);
    const ownerFlora = await floraArmy.getMinionIDs(owner.address);

    
    assert(ownerFlora.length === 1, "mimionsID length");

    // transfer function
    await floraArmy.transferFrom(owner.address, addr1.address, ownerFlora[0]);
    assert( await floraArmy.ownerOf(ownerFlora[0]) === addr1.address, 'transfer to addr1');
    assert( await floraArmy.ownerOf(ownerFlora[0]) != owner.address, 'transfer success');
    await expect(
      floraArmy.transferFrom(owner.address, addr1.address, ownerFlora[0])
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");

    // getTeamProfile function
    const infos = await floraArmy.getTeamProfile(ownerFlora);
    infos.map(async (minion, idx) => {
      await expect(
        minion.power
      ).to.equal(await BigNumber.from(1000) );

      await expect(
        minion.armed
      ).to.equal(false );

    });

    // liberate function
    await expect(
      floraArmy.liberate(ownerFlora[0])
    ).to.be.revertedWith( "ARMY: commander can't command the minion" );

  });

  it("can't liberate before armed", async function () {

    // address accounts
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();

    // owner recruit link-flora
    await floraArmy.recruit(pairHash);
    const ownerFlora = await floraArmy.getMinionIDs(owner.address);

    // arm before liberate
    await floraArmy.arm(ownerFlora[0]);
    let info = await floraArmy.getMinionInfo(ownerFlora[0]);
    assert( await info[1] === true, 'armed = true after arm');

    await floraArmy.liberate(ownerFlora[0]);
    await expect(
      floraArmy.liberate(ownerFlora[0])
    ).to.be.revertedWith("ERC721: operator query for nonexistent token");
    await expect(
      floraArmy.ownerOf(ownerFlora[0])
    ).to.be.revertedWith("ERC721: owner query for nonexistent token");

    assert( await floraArmy.minionExists(ownerFlora[0]) === false, 'minions liberate');
  });

  it("enhancer function", async function () {

    // address accounts
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();

    // owner recruit link-flora
    await floraArmy.recruit(pairHash);
    const ownerFlora = await floraArmy.getMinionIDs(owner.address);
    assert( ownerFlora.length === 1, 'only exist one');

    // enhancer
    const ownerEnhancer = await floraEnhancer.balanceOf(owner.address);
    const totalEnhancer = await floraEnhancer.totalSupply();

    assert(ownerEnhancer.eq(totalEnhancer), 'Enhancer total supply equal to owner');
    await floraArmy.liberate(ownerFlora[0]);
    assert( ownerEnhancer.eq(await floraEnhancer.balanceOf(owner.address)), 'liberate power 1000 does not gain enhancer');
    assert( await floraArmy.minionExists(ownerFlora[0]) === false, 'minions liberate');

  });

  it("mockAgg", async function () {

    // address accounts
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();

    // owner recruit link-flora
    await link_agg.updateAnswer( 40*10**8 );
    await floraArmy.recruit(pairHash);
    const ownerFlora = await floraArmy.getMinionIDs(owner.address);
    assert( ownerFlora.length === 1, 'only exist one');

    
    let latestAnswer = await link_agg.latestAnswer();
    let info = await floraArmy.getMinionInfo(ownerFlora[0]);
    let envFactor = await info[2];
    assert( latestAnswer.eq(envFactor), 'latestAnswer equal to envFactor');

    // update price to 600
    // train -> arm

    // set link from 40 -> 60
    await link_agg.updateAnswer( 60*10**8 );
    let updateAnswer = await link_agg.latestAnswer();
    await floraArmy.arm(ownerFlora[0]);
    info = await floraArmy.getMinionInfo(ownerFlora[0]);
    // console.log(await info[3].toNumber() );
    assert( updateAnswer.eq(info[2]), 'updateAnswer equal to envFactor after arm');

    floraArmy.liberate(ownerFlora[0]);
    assert( await floraArmy.minionExists(ownerFlora[0]) === false, 'minions liberate');

  });

  it('BattleField', async function(){

    // address accounts
    const pair = 'link-usd'
    const pairHash = await ethers.utils.namehash(pair + ".data.eth"); 
    const {tokenOwner} = await getNamedAccounts();
    const [owner, addr1, addr2] = await ethers.getSigners();

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

    //BattleBase
    await expect(
      battlefield.connect(addr1).expand(100)
    ).to.be.revertedWith('Ownable: caller is not the owner')

  });

});