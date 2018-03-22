const Whitelist = artifacts.require('./Whitelist.sol');
const utils = require('./helpers/utils');
const Reverter = require('./helpers/reverter');

contract('Whitelist', function (accounts) {
    let reverter = new Reverter(web3);

    afterEach('revert', reverter.revert);

    before('before', async () => {
        await reverter.promisifySnapshot();
    })

    context("Whitelist", async () => {
        it('should add/remove the address to the whitelist if caller is owner', async () => {
            const whitelistedAddress = accounts[2];

            let whiteList = await Whitelist.deployed();

            await whiteList.addToWhitelist(whitelistedAddress);
            assert.isTrue(await whiteList.isWhitelisted(whitelistedAddress));

            await whiteList.removeFromWhitelist(whitelistedAddress);
            assert.isFalse(await whiteList.isWhitelisted(whitelistedAddress));

        })

        it('shouldn\'t add the address to the whitelist if caller isn\'t owner', async () => {
            const whitelistedAddress = accounts[2];

            let whiteList = await Whitelist.deployed();

            try {
                await whiteList.addToWhitelist(whitelistedAddress, {from: accounts[1]});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            assert.isFalse(await whiteList.isWhitelisted(whitelistedAddress));
        })

        it('should add authorized address if caller is owner', async () => {
            const authorized = accounts[1];
            const whitelistedAddress = accounts[2];

            let whiteList = await Whitelist.deployed();

            await whiteList.authorize(authorized);
            assert.isTrue(await whiteList.authorized(authorized));

            await whiteList.addToWhitelist(whitelistedAddress, {from: authorized});
            assert.isTrue(await whiteList.isWhitelisted(whitelistedAddress));

            await whiteList.reject(authorized);
            assert.isFalse(await whiteList.authorized(authorized));
        })

        it('shouldn\'t authorize address if caller is non-owner', async () => {
            const nonauthorized = accounts[1];
            const whitelistedAddress = accounts[2];

            let whiteList = await Whitelist.deployed();

            try {
                await whiteList.addToWhitelist(whitelistedAddress, {from: nonauthorized});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }

            assert.isFalse(await whiteList.isWhitelisted(whitelistedAddress));
        })

        it('should authorize array of address if caller is authorized', async () => {
            const authorized = accounts[1];
            const whitelistedAddresses = [accounts[7], accounts[8]];

            let whiteList = await Whitelist.deployed();

            await whiteList.authorize(authorized);
            assert.isTrue(await whiteList.authorized(authorized));

            await whiteList.addManyToWhitelist(whitelistedAddresses, {from: authorized});
            assert.isTrue(await whiteList.isWhitelisted(whitelistedAddresses[0]));
            assert.isTrue(await whiteList.isWhitelisted(whitelistedAddresses[1]));
        })

        it('shouldn\'t authorize array of address if caller is non-authorized', async () => {
            const nonauthorized = accounts[1];
            const whitelistedAddresses = [accounts[7], accounts[8]];

            let whiteList = await Whitelist.deployed();

            try {
                await whiteList.addManyToWhitelist(whitelistedAddresses, {from: nonauthorized});
                assert.isTrue(false);
            } catch (error) {
                utils.ensureException(error);
            }
            assert.isFalse(await whiteList.isWhitelisted(whitelistedAddresses[0]));
            assert.isFalse(await whiteList.isWhitelisted(whitelistedAddresses[1]));
        })
    });
});
