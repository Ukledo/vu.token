# VU Token

## Intro

In the present article under consideration there are some vital user guidelines on compiling, deploying and managing the smart contracts of VU Token.

## Smart Contract security in Ethereum is hard

First of all, pay attention to such an important step as setting up your private key. If you have Ethereum address then you should have a wallet file (with a password). You can find an example in `secrets.json` file in this repo. Copy and paste you private wallet file into secret.json, and also change the password in section `main` in `truffle.js` to the correct one:

```
main: {
    network_id: 1,
    provider: new HDWalletProvider(getWallet(), "password", 'https://mainnet.infura.io/'),
    gas: 4700000,
    gasPrice: 1000000000
}
```

NB! *Do not use the default wallet file and password which are in the repo now. Change it instead. And do not forget that your personal key is private, do not share it and commit it in a public repo!*

## Setting up your environment

Install the [Truffle](https://github.com/trufflesuite/truffle) development framework, which helps with smart contract creation, compiling, deployment and testing. Let’s start (again, you may need to prepend `sudo` depending on your setup):
```
# Step 1
# First, let's install truffle
$ npm install -g truffle
```

Install [ganache-cli](https://github.com/trufflesuite/ganache-cli) and run it (you may need to prepend `sudo` depending on your setup):
```
# Step 2
$ npm install -g ganache-cli
$ ganache-cli
```

You should be able to compile the example contracts by running
```
# Step 3
$ truffle compile
```

Then, to _deploy the contracts_ to the simulated network using the `ganache-cli` node we have running, you need to run
```
# Step 4
$ truffle migrate
```

## Interacting with your smart contract

Now, after the Step 4, our contracts are deployed in local `ganache-cli` network. Let’s play with it! You can send messages to it via function calls and read its public state. We’ll use the `Truffle console` for that:

```
# Step 5
$ ./node_modules/.bin/truffle console
truffle(development)> let owner = web3.eth.accounts[0];
truffle(development)> VUToken.deployed().then(l => l.balanceOf(owner))
```

Please note, at the present time, your contracts are in local network simulator. The previous steps are only have affect only on local network, whereas public ones are not changed.

## Deploying to the real testnet network

Now you are prepared to deploy VUToken and Crowdsale contracts in Rinkeby testnet. Run `truffle console`

```
bash-3.2$ ./node_modules/.bin/truffle console --network rinkeby
```

And then

```
truffle(rinkeby)> compile
....
truffle(rinkeby)> migrate
....
```

Note that this time, it will take longer to complete, as we’re connecting to the actual network and not the one simulated by `ganache-cli`. Once it is completed, you can interact with the contracts using the same approach as before, just remember to specify the target network by using `--network` option.

Congratulation! Now you have `VUToken` in `Rinkeby` testnet.

Please test it carefully and save the artifacts from `/build` folder for further usage.

## Afterwards

There are also some useful code snippets which show how to perform basic operations with your contracts.

### To check your balance of VU Token
```
VUToken.deployed().then(t => t.balanceOf.call("your address here"))
```

### Transfer tokens to other address
```
VUToken.deployed().then(t => t.transfer("destination address", 1000)
```
where 1000 - number of tokens you want to send

### Mass transfer
If you have to `transfer` tokens to multiple targets, there is a very useful function `massTransfer`:

```
let token = await VUToken.deployed();
let target1 = ;
let tokens1 = ;
...
await token.massTransfer([target1,target2],[tokens1,tokens2]);

```

### The key crowdsale contracts

#### WhiteList

`Whitelist` is a smart contract which holds a list of whitelisted users, the users who passed KYC.

`PresaleCrowdsale` and `ICOCrowdsale` have a shared `whitelist`. So, the user who has been whitelisted during Presale,
will be automatically permitted to buy tokens during ICO as well. There is no need to add it twice, for Presale, and then for ICO.

How to interact with the WhiteList contract:
```
let whiteList = await Whitelist.deployed();

await whiteList.addToWhitelist(whitelistedAddress);
assert.isTrue(await whiteList.isWhitelisted(whitelistedAddress));

await whiteList.removeFromWhitelist(whitelistedAddress);
assert.isFalse(await whiteList.isWhitelisted(whitelistedAddress));
```

#### PresaleCrowdsale

Returns id of the current phase: 0 - for the 1st Phase, 1 - for the 2nd one, and etc.
```
PresaleCrowdsale.deployed().then(p => p.getPhase())
```

Returns `true` if presale is closed:
```
PresaleCrowdsale.deployed().then(p => p.hasClosed())
```

How to buy the tokens during presale:
```
PresaleCrowdsale.deployed().then(p => p.buyTokens(participant, {from: participant, value:value}));
```
where `beneficiary` is an address performing the token purchase.

#### ICOCrowdsale

The same functions are available, except for `getPhase`. ICO has no phases, there is only fixed rate.

### The key crowdsale contracts for testing

 - PresaleCrowdsaleTestable
 - ICOCrowdsaleTestable

 They have the same functionality as `PresaleCrowdsale` and `ICOCrowdsale` respectively.

 But soft caps, hard caps, phase limits are reduced in 10^5 times. This allows to test all functionality and a whole presale/ico workflows even if a tester has only 1 ETH.

### Whitelisting

There is a special js script designed to be used for mass whitelisting:

 ```
$ truffle exec ./scripts/mass_whitelisting.js --data ./scripts/data.csv --batch_size 5
 ```

 ## The Presale/ICO activation workflow

 1. Deploy the contracts in mainnet (or testnet)

 2. `MARGE` should allow 150000000 tokens for `PresaleCrowdsale` contract, see `6_init_presale3.js`
 3. Wait for the _openingTime_
 4. Presale, wait for the _closingTime_
 5. Burn unsold tokens from MARGE wallet

 6. `MARGE` should allow 450000000 tokens for `ICOCrowdsale` contract, see `8_init_ico.js`
 7. Wait for the _openingTime_
 8. ICO, wait for the _closingTime_
 9. Burn unsold tokens from MARGE wallet

 10. Participants will be able to withdraw purchased tokens after _deliveryDate_

  ### Presale Params
  - _openingTime_: March 29, 2018 00:00:00
  - _closingTime_: April 30, 2018 00:00:00
  - _deliveryTime_: July 1, 2018 00:00:00;

  See `5_deploy_presale.js`

  ### ICO Params
  - _openingTime_: April 30, 2018 00:00:00
  - _closingTime_: June 30, 2018 00:00:00
  - _deliveryTime_: July 1, 2018 00:00:00

  See `7_deploy_ico.js`

# Good luck!
