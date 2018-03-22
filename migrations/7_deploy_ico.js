const ICOCrowdsale = artifacts.require("./ICOCrowdsale.sol");
const VUToken = artifacts.require("./VUToken.sol");
const Whitelist = artifacts.require("./Whitelist.sol");
const WALLETS = require("../common/wallets");

module.exports = function(deployer, network, accounts) {
    const deliveryDate = new Date('July 1, 2018 00:00:00');
    const deliveryTime = deliveryDate.getTime() / 1000;

    var startTime;
    var endTime;

    if (network === "main") {
        startTime = (new Date('April 30, 2018 00:00:00')).getTime() / 1000;
        endTime = (new Date('June 30, 2018 00:00:00')).getTime() / 1000;
    } else if (network === "rinkeby") {
        startTime = (new Date()).getTime() / 1000 + 120;
        endTime = (new Date('June 30, 2018 00:00:00')).getTime() / 1000;
    } else {
        startTime = (new Date('April 30, 2018 00:00:00')).getTime() / 1000;
        endTime = (new Date('June 30, 2018 00:00:00')).getTime() / 1000;
    }

    deployer.deploy(ICOCrowdsale, VUToken.address, Whitelist.address, WALLETS.MARGE, WALLETS.LISA, startTime, endTime, deliveryTime);
};
