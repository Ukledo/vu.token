const VUToken = artifacts.require("./VUToken.sol");
const WALLETS = require("../common/wallets");

module.exports = async (deployer, network) => {
    deployer.then(async () => {
        const asset = await VUToken.deployed();
        const totalSupply = await asset.totalSupply();

        const MARGE_TOKENS = totalSupply.mul(0.6); // 60%
        const BART_TOKENS = totalSupply.mul(0.2);  // 20%
        const HOMER_TOKENS = totalSupply.mul(0.2); // 20%

        const targets = [WALLETS.MARGE, WALLETS.BART, WALLETS.HOMER];
        const tokens = [MARGE_TOKENS, BART_TOKENS, HOMER_TOKENS];

        await asset.massTransfer(targets, tokens);
    })
}
