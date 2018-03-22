const TGEToken = artifacts.require("./TGEToken.sol");

module.exports = async (deployer, network) => {
    deployer.then(async () => {
        let asset = await TGEToken.deployed();

        // TODO: specify targets addresses
        const targets = [];
        const tokens = [];

        await asset.massTransfer(targets, tokens);
    })
}
