const Whitelist = artifacts.require("./Whitelist.sol");

const eventsHelper = require("../test/helpers/eventsHelper.js");
const fs = require("fs");
const CSVParser = require("csv-parse/lib/sync");
const GetCSVWriter = require('csv-writer').createObjectCsvWriter;
const optimist = require('optimist');
var BigNumber = require('bignumber.js');

const ENCODING = 'utf-8';

module.exports = async () => {
    const argv = optimist.argv;

    const dataFilePath = argv.data;
    const batchSize = argv.batch_size ? argv.batch_size : 20;

    const rawData = fs.readFileSync(dataFilePath).toString(ENCODING);
    const data = CSVParser(rawData, {columns: true});

    if (data.length == 0) {
        throw "Data file is empty or incorrect CSVParser format. Aborted";
    }


    let accounts = [];
    for (let row of data) {
        accounts.push({address:web3.toHex(row.account)});
    }

    let whitelist = await Whitelist.deployed();

    var whitelistedCount = 0;
    while (whitelistedCount < accounts.length) {
        console.log("--");
        let accountsToImport = [];
        let i = 0;
        while (accountsToImport.length < batchSize && whitelistedCount + i < accounts.length) {
            accountsToImport.push(accounts[whitelistedCount + i].address);
            i++;
        }

        let tx = await whitelist.addManyToWhitelist(accountsToImport);

        let eventsAllowed = eventsHelper.extractEvents(tx, "UserAllowed");
        for (var eventAllowed of eventsAllowed) {
            console.log("Used was added to whitelist", eventAllowed.args.user);
        }

        let eventsDisallowed = eventsHelper.extractEvents(tx, "UserDisallowed");
        for (var eventDisallowed of eventsDisallowed) {
            console.error("Used was NOT added to whitelist", eventDisallowed.args.user);
        }

        whitelistedCount += accountsToImport.length;
    }
};
