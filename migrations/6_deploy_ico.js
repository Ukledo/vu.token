const ICOCrowdsale = artifacts.require("./ICOCrowdsale.sol");
const TGEToken = artifacts.require("./TGEToken.sol");
const Whitelist = artifacts.require("./Whitelist.sol");

module.exports = function(deployer, network, accounts) {
  var startDate = new Date('April 11, 2018 00:00:00');
  var endDate = new Date('April 20, 2018 00:00:00');

  var startDateSec = startDate.getTime() / 1000;
  var endDateSec = endDate.getTime() / 1000;

  deployer.deploy(ICOCrowdsale, accounts[0], TGEToken.address, accounts[0], Whitelist.address, startDateSec, endDateSec);
};
