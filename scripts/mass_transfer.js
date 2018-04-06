const LoraToken = artifacts.require("./LoraToken.sol");
const eventsHelper = require("../test/helpers/eventsHelper.js");
const fs = require("fs");
const CSVParser = require("csv-parse/lib/sync");
const GetCSVWriter = require('csv-writer').createObjectCsvWriter;
const optimist = require('optimist');
const BigNumber = require('bignumber.js');

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
        accounts.push({address:web3.toHex(row.account), value:web3.toBigNumber(row.amount)});
    }

    let token = await LoraToken.deployed();

    var transfered = 0;
    while (transfered < accounts.length) {
        console.log("--");
        let accountsToTransfer = [];
        let valuesToTransfer = [];
        let i = 0;
        while (accountsToTransfer.length < batchSize && transfered + i < accounts.length) {
            accountsToTransfer.push(accounts[transfered + i].address);
            valuesToTransfer.push(accounts[transfered + i].value);
            i++;
        }

        let tx = await token.massMint(accountsToTransfer, valuesToTransfer);

        let events = eventsHelper.extractEvents(tx, "Transfer");
        for (var event of events) {
            console.log("Transfered", event.args.to, event.args.value);
        }

        transfered += accountsToTransfer.length;
    }
};
