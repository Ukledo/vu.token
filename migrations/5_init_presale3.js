const Presale3Crowdsale = artifacts.require("./Presale3Crowdsale.sol");
const TGEToken = artifacts.require("./TGEToken.sol");

module.exports = function(deployer) {
    deployer.then(async () => {
        let asset = await TGEToken.deployed();
        let presaleCrowdsale = await Presale3Crowdsale.deployed();

        const presaleCap = web3.toBigNumber(150000000).mul(web3.toBigNumber(10).pow(18));
        await asset.approve(presaleCrowdsale.address, presaleCap);
    })
};
