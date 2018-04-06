const VUTokenTestable = artifacts.require("./VUTokenTestable.sol");
const PresaleCrowdsaleTestable = artifacts.require('./PresaleCrowdsaleTestable.sol');
const ICOCrowdsaleTestable = artifacts.require('./ICOCrowdsaleTestable.sol');
const Clock = artifacts.require('./Clock.sol');
const Whitelist = artifacts.require('./Whitelist.sol');

module.exports = async (deployer, network, accounts) => {
    if (network !== "main") {
        deployer.then(async () => {
            await deployer.deploy(Clock);

            const tokenWallet = accounts[5];
            const wallet = accounts[6];

            const deliveryDate = new Date('July 1, 2018 00:00:00');
            const deliveryTime = deliveryDate.getTime() / 1000;

            //await deployer.deploy(VUTokenTestable);
            const token = await VUTokenTestable.at("0x014a6ed0ab72208efd09ac0cbfd6aad101112b06");//deployed();

            // Presale
            await deployer.deploy(PresaleCrowdsaleTestable, token.address, Whitelist.address, tokenWallet, wallet, deliveryTime);

            let presale = await PresaleCrowdsaleTestable.deployed();
            const capPhase1 = await presale.getPhaseCap(0);
            const capPhase2 = await presale.getPhaseCap(1);
            const capPhase3 = await presale.getPhaseCap(2);
            const presaleCap = capPhase1.add(capPhase2).add(capPhase3);
            await token.transfer(tokenWallet, presaleCap);
            await token.approve(PresaleCrowdsaleTestable.address, presaleCap, {from: tokenWallet});

            // ICO
            const icoCap = web3.toBigNumber(4500000).mul(web3.toBigNumber(10).pow(15));
            await deployer.deploy(ICOCrowdsaleTestable, token.address, Whitelist.address, tokenWallet, wallet, deliveryTime);
            await token.transfer(tokenWallet, icoCap);
            await token.approve(ICOCrowdsaleTestable.address, icoCap, {from: tokenWallet});
        })
    }
}
