const Presale3Crowdsale = artifacts.require("./Presale3Crowdsale.sol");
const TGEToken = artifacts.require("./TGEToken.sol");
const Whitelist = artifacts.require("./Whitelist.sol");

module.exports = function(deployer, network, accounts) {
    var startDate = new Date('April 1, 2018 00:00:00');
    var endDate = new Date('April 10, 2018 00:00:00');

    var startTime = startDate.getTime() / 1000;
    var endTime = endDate.getTime() / 1000;

    deployer.deploy(Presale3Crowdsale, accounts[0], TGEToken.address, accounts[0], Whitelist.address, startTime, endTime);
};
