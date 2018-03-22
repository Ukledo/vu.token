const ICOCrowdsale = artifacts.require("./ICOCrowdsale.sol");
const TGEToken = artifacts.require("./TGEToken.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
      let asset = await TGEToken.deployed();
      let icoCrowdsale = await ICOCrowdsale.deployed();

      const icoCap = web3.toBigNumber(450000000).mul(web3.toBigNumber(10).pow(18));
      await asset.approve(icoCrowdsale.address, icoCap);
  })
};
