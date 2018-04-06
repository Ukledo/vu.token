const VUToken = artifacts.require("./VUToken.sol");

module.exports = function(deployer) {
    deployer.deploy(VUToken);
};
