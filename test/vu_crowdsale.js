const VUToken = artifacts.require('./VUToken.sol');
const Whitelist = artifacts.require('./Whitelist.sol');
const ICOCrowdsale = artifacts.require('./ICOCrowdsale.sol');
const PresaleCrowdsale = artifacts.require('./PresaleCrowdsale.sol');

const WALLETS = require("../common/wallets");
const utils = require('./helpers/utils');
const Reverter = require('./helpers/reverter');
const TimeMachine = require('./helpers/timemachine');
const BigNumber = require('bignumber.js');
const Clock = artifacts.require('./Clock.sol');

var Phase = {Phase1: 0, Phase2: 1, Phase3: 2,};

contract('ICOCrawdsale', function (accounts) {
    let reverter = new Reverter(web3);
    let clock;

    afterEach('revert', reverter.revert);

    before('before', async () => {
        clock = await Clock.deployed();
        await reverter.promisifySnapshot();
    })


    after("after", async () => {
    })

    context("Presale", async () => {
        it('should has valid WhiteList address', async () => {
            let presale = await PresaleCrowdsale.deployed();
            let whitelist = await Whitelist.deployed();
            assert.equal(Whitelist.address, await presale.whitelist());
        })

        it('should has valid token address', async () => {
            let asset = await VUToken.deployed();
            let presale = await PresaleCrowdsale.deployed();
            assert.equal(asset.address, await presale.token());
        })

        it('should has valid owner address', async () => {
            let presale = await PresaleCrowdsale.deployed();
            assert.equal(accounts[0], await presale.owner());
        })

        it('should has valid tokenWallet', async () => {
            let presale = await PresaleCrowdsale.deployed();
            assert.equal(WALLETS.MARGE.toLowerCase(), await presale.tokenWallet());
        })

        it('should has valid wallet', async () => {
            let presale = await PresaleCrowdsale.deployed();
            assert.equal(WALLETS.LISA.toLowerCase(), await presale.wallet());
        })

        it('should has correct rates', async () => {
            let presale = await PresaleCrowdsale.deployed();

            assert.isTrue((await presale.getPhaseRate(Phase.Phase1)).eq(await presale.PHASE1_RATE()));
            assert.isTrue((await presale.getPhaseRate(Phase.Phase2)).eq(await presale.PHASE2_RATE()));
            assert.isTrue((await presale.getPhaseRate(Phase.Phase3)).eq(await presale.PHASE3_RATE()));

            const phase1Rate = 7500;
            const phase2Rate = 6900;
            const phase3Rate = 6300;

            assert.isTrue((await presale.getPhaseRate(Phase.Phase1)).eq(phase1Rate));
            assert.isTrue((await presale.getPhaseRate(Phase.Phase2)).eq(phase2Rate));
            assert.isTrue((await presale.getPhaseRate(Phase.Phase3)).eq(phase3Rate));
        })

        it('shouldn\'t be able to calc unexists phase rate/cap', async () => {
            let presale = await PresaleCrowdsale.deployed();

            try {
                await presale.getPhaseRate(4);
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
        })

        it('should has correct caps', async () => {
            let presale = await PresaleCrowdsale.deployed();

            assert.isTrue((await presale.getPhaseCap(Phase.Phase1)).eq(await presale.PHASE1_CAP()));
            assert.isTrue((await presale.getPhaseCap(Phase.Phase2)).eq(await presale.PHASE2_CAP()));
            assert.isTrue((await presale.getPhaseCap(Phase.Phase3)).eq(await presale.PHASE3_CAP()));

            const phase1Cap = web3.toBigNumber(30000000).mul(web3.toBigNumber(10).pow(18));
            const phase2Cap = web3.toBigNumber(40000000).mul(web3.toBigNumber(10).pow(18));
            const phase3Cap = web3.toBigNumber(80000000).mul(web3.toBigNumber(10).pow(18));

            assert.isTrue((await presale.getPhaseCap(Phase.Phase1)).eq(phase1Cap));
            assert.isTrue((await presale.getPhaseCap(Phase.Phase2)).eq(phase2Cap));
            assert.isTrue((await presale.getPhaseCap(Phase.Phase3)).eq(phase3Cap));
        })

        // it('should be initialized with valid allowance', async () => {
        //     const presale = await PresaleCrowdsaleTestable.deployed();
        //
        //     const allowance = await token.allowance(tokenWallet, presale.address);
        //     const presaleCap = web3.toBigNumber(150000000).mul(web3.toBigNumber(10).pow(18));
        //
        //     assert.isTrue(presaleCap.eq(allowance));
        // })

        it('shouldn\'t allow to deploy Presale contract with invalid Whitelist param', async () => {
          try {
              const deliveryDate = new Date('July 1, 2018 00:00:00');
              const deliveryTime = deliveryDate.getTime() / 1000;
              const now = await clock.time();
              await PresaleCrowdsale.new(VUToken.address, 0x0, WALLETS.MARGE, WALLETS.LISA, now + 10, now + 100, deliveryTime);

              assert.isTrue(false);
          } catch (error) {
              utils.ensureException(error);
          }
        })

        it('shouldn\'t allow to deploy Presale contract with invalid deliveryTime param', async () => {
          try {
              const now = await clock.time();
              await PresaleCrowdsale.new(VUToken.address, Whitelist.address, WALLETS.MARGE, WALLETS.LISA, now + 10, now + 100, 0);

              assert.isTrue(false);
          } catch (error) {
              utils.ensureException(error);
          }

          try {
              const deliveryDate = new Date('July 1, 2018 00:00:00');
              const deliveryTime = deliveryDate.getTime();
              const now = await clock.time();
              await PresaleCrowdsale.new(VUToken.address, Whitelist.address, WALLETS.MARGE, WALLETS.LISA, now + 10, now + 100, deliveryTime);

              assert.isTrue(false);
          } catch (error) {
              utils.ensureException(error);
          }
        })
    });

    context("ICO", async () => {
        it('should has valid token address', async () => {
            let asset = await VUToken.deployed();
            let ico = await ICOCrowdsale.deployed();
            assert.equal(asset.address, await ico.token());
        })

        it('should be initialized with valid rate 1:6000', async () => {
            let ico = await ICOCrowdsale.deployed();
            assert.isTrue((await ico.rate()).eq(await ico.RATE()));
            assert.isTrue((await ico.rate()).eq(6000));
        })

        it('should has valid tokenWallet', async () => {
            let ico = await ICOCrowdsale.deployed();
            assert.equal(WALLETS.MARGE.toLowerCase(), await ico.tokenWallet());
        })

        it('should has valid wallet', async () => {
            let ico = await ICOCrowdsale.deployed();
            assert.equal(WALLETS.LISA.toLowerCase(), await ico.wallet());
        })
    });
});
