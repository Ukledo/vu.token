const PresaleCrowdsale = artifacts.require("./PresaleCrowdsale.sol");
const VUToken = artifacts.require("./VUToken.sol");
const Whitelist = artifacts.require("./Whitelist.sol");
const WALLETS = require("../common/wallets");

module.exports = function(deployer, network, accounts) {
    const deliveryDate = new Date('July 1, 2018 00:00:00');
    const deliveryTime = deliveryDate.getTime() / 1000;
    deployer.deploy(PresaleCrowdsale, VUToken.address, Whitelist.address, WALLETS.MARGE, WALLETS.LISA, deliveryTime);
};
