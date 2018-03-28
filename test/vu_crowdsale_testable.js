const VUTokenTestable = artifacts.require('./VUTokenTestable.sol');
const Whitelist = artifacts.require('./Whitelist.sol');
const PresaleCrowdsaleTestable = artifacts.require('./PresaleCrowdsaleTestable.sol');
const ICOCrowdsaleTestable = artifacts.require('./ICOCrowdsaleTestable.sol');
const Clock = artifacts.require('./Clock.sol');

const utils = require('./helpers/utils');
const Reverter = require('./helpers/reverter');
const BigNumber = require('bignumber.js');
const TimeMachine = require('./helpers/timemachine');

var Phase = {Phase1: 0, Phase2: 1, Phase3: 2,};

contract('ICOCrawdsaleTestable', function (accounts) {
    let reverter = new Reverter(web3);
    let token;
    let testIco;
    let clock;

    let timeMachine = new TimeMachine(web3);

    const owner = accounts[0];
    const participant = accounts[1];

    const tokenWallet = accounts[5];
    const wallet = accounts[6];

    afterEach('revert', reverter.revert);

    before('before', async () => {
        token = await VUTokenTestable.deployed();
        testIco = await ICOCrowdsaleTestable.deployed();

        let whiteList = await Whitelist.deployed();
        await whiteList.addToWhitelist(participant);

        clock = await Clock.deployed();

        await reverter.promisifySnapshot();
    })


    after("after", async () => {
    })

    context("Crowdsale Testable", async () => {
        it('should not allow non-whitelisted users to buy tokens', async () => {
            let participant1 = accounts[7];
            let whiteList = await Whitelist.deployed();

            const presale = await PresaleCrowdsaleTestable.deployed();

            try {
                await presale.buyTokens(participant1, {from: participant1, value:1000});

                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            assert.equal(await token.balanceOf(participant1), 0);
            assert.equal(await presale.balances(participant1), 0);
        })

        it('should be initialized with valid rate 1:7500 (1st phase)', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();


            assert.isTrue((await token.balanceOf(participant)).isZero());
            let initialWalletBalance = await web3.eth.getBalance(wallet);

            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const value = 1;
            await testPresale.buyTokens(participant, {from: participant, value:value});

            let balance = await testPresale.balances(participant);
            let rate = await testPresale.getPhaseRate(Phase.Phase1);

            assert.isTrue(rate.eq(7500));
            assert.isTrue(balance.eq(value * 7500));
            assert.equal(await token.balanceOf(participant), 0);
        })

        // it('shouldn\'t allow to buy tokens if closed', async () => {
        //     const presale = await PresaleCrowdsaleTestable.deployed();
        //
        //     const value = 10;
        //     await presale.buyTokens(participant, {from: participant, value:value});
        //
        //     await presale.close();
        //
        //     try {
        //         await presale.buyTokens(participant, {from: participant, value:value});
        //         assert.isTrue(false);
        //     } catch (error) {
        //         utils.ensureException(error);
        //     }
        //
        //     let balance = await presale.balances(participant);
        //     let rate = await presale.getPhaseRate(Phase.Phase1);
        //     assert.isTrue(balance.eq(rate.mul(value)));
        //
        //     assert.equal(await token.balanceOf(participant), 0);
        // })

        it('should correctly calc 1st phase with multiple purchases', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();


            assert.isTrue((await token.balanceOf(participant)).isZero());
            let initialWalletBalance = await web3.eth.getBalance(wallet);

            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();

            const value1 = capPhase1.sub(ratePhase1.mul(3000)).div(ratePhase1);
            await testPresale.buyTokens(participant, {from: participant, value:value1});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const value2 = 1000;
            await testPresale.buyTokens(participant, {from: participant, value:value2});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const value3 = 2000;
            await testPresale.buyTokens(participant, {from: participant, value:value3});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            assert.isTrue(value1.add(value2).add(value3).mul(ratePhase1).eq(capPhase1));

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('should correctly calc 1st/2nd phase with multiple purchases', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();

            let initialWalletBalance = await web3.eth.getBalance(wallet);

            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();

            await testPresale.buyTokens(participant, {from: participant, value:capPhase1.div(ratePhase1)});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            await testPresale.buyTokens(participant, {from: participant, value:100});
            assert.equal(await testPresale.getPhase(), Phase.Phase2);

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('should correctly calc 1st/2nd/3rd phase with multiple purchases', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();
            let initialWalletBalance = await web3.eth.getBalance(wallet);

            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();

            await testPresale.buyTokens(participant, {from: participant, value:capPhase1.div(ratePhase1)});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            const capPhase2 = await testPresale.getPhaseCap(Phase.Phase2);
            const ratePhase2 = await testPresale.PHASE2_RATE();

            await testPresale.buyTokens(participant, {from: participant, value:capPhase2.div(ratePhase2)});
            assert.equal(await testPresale.getPhase(), Phase.Phase2);

            await testPresale.buyTokens(participant, {from: participant, value:10});
            assert.equal(await testPresale.getPhase(), Phase.Phase3);

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('should correctly calc transition 1st -> 2nd', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();


            const initialWalletBalance = await web3.eth.getBalance(wallet);
            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();

            await testPresale.buyTokens(participant, {from: participant, value:(capPhase1.div(ratePhase1).sub(10))});
            assert.equal(await testPresale.getPhase(), Phase.Phase1);

            await testPresale.buyTokens(participant, {from: participant, value:100});
            assert.equal(await testPresale.getPhase(), Phase.Phase2);

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('should correctly calc transition start -> 2nd', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();


            const initialWalletBalance = await web3.eth.getBalance(wallet);
            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();

            await testPresale.buyTokens(participant, {from: participant, value:(capPhase1.div(ratePhase1).add(10))});
            assert.equal(await testPresale.getPhase(), Phase.Phase2);

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('should correctly calc transition start -> 3rd', async () => {
            const testPresale = await PresaleCrowdsaleTestable.deployed();


            const initialWalletBalance = await web3.eth.getBalance(wallet);

            const capPhase1 = await testPresale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await testPresale.PHASE1_RATE();
            const capPhase2 = await testPresale.getPhaseCap(Phase.Phase2);
            const ratePhase2 = await testPresale.PHASE2_RATE();

            const value = (capPhase1.div(ratePhase1)).add(capPhase2.div(ratePhase2));
            await testPresale.buyTokens(participant, {from: participant, value:value.add(7200)});
            assert.equal(await testPresale.getPhase(), Phase.Phase3);

            await assertTokenBalance(participant, testPresale);
            await assertWalletBalance(wallet, initialWalletBalance);
            await assertCap(testPresale);
        })

        it('shouldn\'t allow to buy tokens more then limit', async () => {
            const presale = await PresaleCrowdsaleTestable.deployed();

            let token = await VUTokenTestable.deployed();
            let allowance = await token.allowance(tokenWallet, presale.address);

            const capPhase1 = await presale.getPhaseCap(Phase.Phase1);
            const ratePhase1 = await presale.PHASE1_RATE();
            const capPhase2 = await presale.getPhaseCap(Phase.Phase2);
            const ratePhase2 = await presale.PHASE2_RATE();
            const capPhase3 = await presale.getPhaseCap(Phase.Phase3);
            const ratePhase3 = await presale.PHASE3_RATE();

            const value = (capPhase1.div(ratePhase1)).add(capPhase2.div(ratePhase2)).add(capPhase3.div(ratePhase3));

            try {
                await presale.buyTokens(participant, {from: participant, value:value.add(1)});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
        })
    });

    context("ICOTestable", async () => {
        it('should be initialized with valid rate 1:6000', async () => {
            let ico = await ICOCrowdsaleTestable.deployed();

            assert.isTrue((await ico.rate()).eq(await ico.RATE()));

            const value = 100;
            await ico.buyTokens(participant, {from: participant, value:value});

            let balance = await ico.balances(participant);
            assert.isTrue(balance.div(value).eq(await ico.rate()));
            assert.isTrue((await token.balanceOf(participant)).isZero());
        })

        it('should not allow non-whitelisted users to buy tokens', async () => {
            let participant1 = accounts[7];
            let whiteList = await Whitelist.deployed();

            let ico = await ICOCrowdsaleTestable.deployed();

            try {
                await ico.buyTokens(participant1, {from: participant1, value:1000});

                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            assert.equal(await token.balanceOf(participant1), 0);
        })

        it('should be initialized with valid rate 1:6000', async () => {
            assert.isTrue((await token.balanceOf(participant)).isZero());
            let initialWalletBalance = await web3.eth.getBalance(wallet);

            let ico = await ICOCrowdsaleTestable.deployed();

            const value = 1;
            await ico.buyTokens(participant, {from: participant, value:value});

            let balance = await ico.balances(participant);
            let rate = await ico.rate();

            assert.isTrue(rate.eq(6000));
            assert.isTrue(balance.eq(value * 6000));

            assert.isTrue((await token.balanceOf(participant)).isZero());
        })

        it('shouldn\'t allow to buy tokens more then limit', async () => {
            const ico = await ICOCrowdsaleTestable.deployed();

            let token = await VUTokenTestable.deployed();
            let allowance = await token.allowance(tokenWallet, ico.address);

            const value = (await ico.limit()).div(await ico.RATE());

            try {
                await ico.buyTokens(participant, {from: participant, value:value.add(100)});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
        })

        it('should allow to withdraw tokens after delivery date', async () => {
            assert.isTrue((await token.balanceOf(participant)).isZero());
            let initialWalletBalance = await web3.eth.getBalance(wallet);

            let ico = await ICOCrowdsaleTestable.deployed();

            const value = 1;
            await ico.buyTokens(participant, {from: participant, value:value});

            let balance = await ico.balances(participant);
            let rate = await ico.rate();

            assert.isTrue(balance.eq(rate.mul(value)));
            assert.isTrue((await token.balanceOf(participant)).isZero());

            try {
                await ico.withdrawTokens({from: participant});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            let deliveryTime = await ico.deliveryTime();
            let now = await clock.time();
            await timeMachine.jump(deliveryTime - now + 10);

            await ico.withdrawTokens({from: participant});

            assert.isTrue((await token.balanceOf(participant)).eq(rate.mul(value)));
            assert.isTrue((await ico.balances(participant)).isZero());

            const non_participant = accounts[8];
            assert.isTrue((await ico.balances(non_participant)).isZero())
            try {
                await ico.withdrawTokens({from: non_participant});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            try {
                await ico.buyTokens(participant, {from: participant, value:1000});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
        })
    });

    let calcExpectedBalance = async (wallet, initialBalance) => {
        const presale = await PresaleCrowdsaleTestable.deployed();

        const tokensSold = await presale.tokensSold();

        const capPhase1 = await presale.getPhaseCap(Phase.Phase1);
        const ratePhase1 = await presale.PHASE1_RATE();
        const capPhase2 = await presale.getPhaseCap(Phase.Phase2);
        const ratePhase2 = await presale.PHASE2_RATE();
        const capPhase3 = await presale.getPhaseCap(Phase.Phase3);
        const ratePhase3 = await presale.PHASE3_RATE();

        if (capPhase1.gte(tokensSold)) {
            return (new BigNumber(capPhase1)).idiv(ratePhase1).plus(initialBalance);
        }

        if (capPhase2.gte(tokensSold)) {
            const phase1Raised = (new BigNumber(capPhase1)).idiv(ratePhase1);
            const phase2Raised = (new BigNumber(tokensSold)).minus(capPhase1).idiv(ratePhase2);
            return phase1Raised.plus(phase2Raised).plus(initialBalance);
        }

        if (capPhase3.gte(tokensSold)) {
            const phase1Raised = (new BigNumber(capPhase1)).idiv(ratePhase1);
            const phase2Raised = (new BigNumber(capPhase2)).idiv(ratePhase2);
            const phase3Raised = (new BigNumber(tokensSold)).minus(capPhase2).minus(capPhase1).idiv(ratePhase3);
            return phase1Raised.plus(phase2Raised).plus(phase3Raised).plus(initialBalance);
        }

        assert.isTrue(false);
    }

    let assertWalletBalance = async (wallet, initialWalletBalance) => {
        const walletBalance = await web3.eth.getBalance(wallet);
        const expectedBalance = await calcExpectedBalance(wallet, initialWalletBalance);
        assert.isTrue(expectedBalance.eq(walletBalance));
    }

    let assertTokenBalance = async (participant, crowdsale) => {
        let participantTokens = await crowdsale.balances(participant);
        let tokensSold = await crowdsale.tokensSold();
        assert.isTrue(participantTokens.eq(tokensSold));
    }

    let assertCap = async (crowdsale) => {
        // const tokensSold = await crowdsale.tokensSold();
        // const softCap = await testPresale.goal();
        // const hardCap = await testPresale.hardCap();
        //
        // assert.isTrue(hardCap.gte(tokensSold));
        //
        // if (tokensSold.gte(softCap)) {
        //     assert.isTrue(await crowdsale.goalReached());
        // } else {
        //     assert.isFalse(await crowdsale.goalReached());
        // }
    }
});
