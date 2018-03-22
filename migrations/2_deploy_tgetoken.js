const TGEToken = artifacts.require("./TGEToken.sol");

module.exports = function(deployer) {
    deployer.deploy(TGEToken);
};
