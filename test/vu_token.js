const VUToken = artifacts.require('./VUToken.sol');

const WALLETS = require("../common/wallets");
const utils = require('./helpers/utils');
const Reverter = require('./helpers/reverter');
const BigNumber = require('bignumber.js');

contract('VUToken', function (accounts) {
    let reverter = new Reverter(web3);
    let token;

    afterEach('revert', reverter.revert);

    before('before', async () => {
        token = await VUToken.deployed();
        await reverter.promisifySnapshot();
    })


    after("after", async () => {
    })

    context("After initial deployment, the token", async () => {
        it('should has valid name', async () => {
            assert.equal(await token.name(), "VU TOKEN");
        });

        it('should has valid symbol', async () => {
            assert.equal(await token.symbol(), "VU");
        });

        it('should has valid decimals', async () => {
            assert.equal(await token.decimals(), 18);
        });

        it('should has valid owner', async () => {
            assert.equal(await token.owner(), accounts[0]);
        });
    });

    context("Mass transfering", async () => {
        it('should transfer tokens if caller has enought tokens', async () => {
            const target1 = accounts[1];
            const target2 = accounts[2];
            const target3 = accounts[3];
            const tokens1 = 11;
            const tokens2 = 12;
            const tokens3 = 13;

            let initialBalance = await token.balanceOf(WALLETS.MARGE);
            assert.isTrue(initialBalance.gt(tokens1 + tokens2 + tokens3));

            assert.isTrue(await token.massTransfer.call([target1,target2,target3],[tokens1,tokens2,tokens3], {from: WALLETS.MARGE}));
        })

        it('shouldn\'t transfer tokens if caller has no enought tokens', async () => {
            let nonowner = accounts[1];
            const target = accounts[2];
            const tokens = 10;

            assert.equal(await token.balanceOf(target), 0);

            try {
                await token.massTransfer([target],[tokens], {from: nonowner});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            assert.equal(await token.balanceOf(target), 0);
        })

        it('should distribute tokens to distribution wallets', async () => {
            const asset = await VUToken.new();
            const totalSupply = await asset.totalSupply();

            const MARGE = "0x044B3e3b9a7342d71Db1A2c339557Fb6eBdC9511";
            const BART = "0x2813C200d2aeEF5b56150048961d41fF6940CcC1";
            const HOMER = "0xeF0f843bc1B27F6a536eAC599BaA36303C43Bcc6";

            const MARGE_TOKENS = totalSupply.mul(0.6); // 60%
            const BART_TOKENS = totalSupply.mul(0.2); // 20%
            const HOMER_TOKENS = totalSupply.mul(0.2); // 20%

            const targets = [MARGE, BART, HOMER];
            const tokens = [MARGE_TOKENS, BART_TOKENS, HOMER_TOKENS];

            await asset.massTransfer(targets, tokens);

            assert.isTrue(MARGE_TOKENS.eq(await asset.balanceOf(MARGE)));
            assert.isTrue(BART_TOKENS.eq(await asset.balanceOf(BART)));
            assert.isTrue(HOMER_TOKENS.eq(await asset.balanceOf(HOMER)));
        })

        it('should be distributed to WALEETS', async () => {
            const asset = await VUToken.deployed();
            const totalSupply = await asset.totalSupply();

            const MARGE_EXPECTED_TOKENS = totalSupply.mul(0.6); // 60%
            const BART_EXPECTED_TOKENS = totalSupply.mul(0.2); // 20%
            const HOMER_EXPECTED_TOKENS = totalSupply.mul(0.2); // 20%

            assert.isTrue(MARGE_EXPECTED_TOKENS.eq(await asset.balanceOf(WALLETS.MARGE)));
            assert.isTrue(BART_EXPECTED_TOKENS.eq(await asset.balanceOf(WALLETS.BART)));
            assert.isTrue(HOMER_EXPECTED_TOKENS.eq(await asset.balanceOf(WALLETS.HOMER)));
        })

        it('shouldn\'t be able to distributed more tokens than availbale', async () => {
            const asset = await VUToken.deployed();
            const totalSupply = await asset.totalSupply();

            try {
                await asset.massTransfer(["0x1"], [totalSupply.add(1)]);
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
        })
    });
});
