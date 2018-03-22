# TGE VU token

## Setting up your environment

Install the [Truffle](https://github.com/trufflesuite/truffle) development framework, which helps with smart contract creation, compiling, deployment and testing. Let’s start (again, you may need to prepend sudo depending on your setup):

```
# First, let's install truffle
$ npm install -g truffle
```

Install [testrpc](https://github.com/trufflesuite/ganache-cli) and run it (you may need to prepend sudo depending on your setup):

```
$ npm install -g ethereumjs-testrpc
$ testrpc
```

You should be able to compile the example contracts by running `truffle compile`.

```
TODO
```

Then, to deploy the contracts to the simulated network using the `testrpc` node we have running, you need to run `truffle migrate`:

```
TODO
```

## Interacting with your smart contract

Now that our contract is deployed in local testrpc, let’s play with it! You can send messages to it via function calls and read its public state. We’ll use the Truffle console for that:

```
bash-3.2$ ./node_modules/.bin/truffle console
truffle(development)> let owner = web3.eth.accounts[0];
truffle(development)> TGEToken.deployed().then(l => l.balanceOf(owner))
```

## Setting up founders and team addresses

Before deploying the token to mainnet, please add valid founder's and team's addresses to
- `migrations/3_mint_team.js `
- `migrations/4_mint_founders.js`

## Smart Contract security in Ethereum is hard

One more important step: setting up your private key. If you have Ethereum address then you should have wallet file (with a password). Copy and paste it into secret.json, also change the password in section main in truffle.js to correct one:

```
main: {
    network_id: 1,
    provider: new HDWalletProvider(getWallet(), "password", 'https://mainnet.infura.io/'),
    gas: 4700000,
    gasPrice: 1000000000
}
```

Important! Do not use the wallet file and password which are in the repo now! Do not share your wallet file and do not commit it in a public repo!

## Deploying to the real testnet network

Now you are prepared to deploy TGEToken in Rinkeby testnet. Run truffle console

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

Note that this time, it will take longer to complete, as we’re connecting to the actual network and not one simulated by `testrpc`. Once it completes, you can interact with the contract using the same approach as before.

Congratulation! Now you have TGEToken in Rinkeby testnet.

Please test it carefully.

## Afterwards

### To check your balance of this token
```
TGEToken.deployed().then(t => t.balanceOf.call("your address here"))
```

### Transfer tokens to other addresses
```
TGEToken.deployed().then(t => t.transfer("destination address", 1000)
```
where 1000 - number of tokens you want to send

### Mass transfer
If you have to mint tokens to multiple target, there is a very useful function `massTransfer`:

```
let target1 = ;
let tokens1 = ;
...
await token.massTransfer([target1,target2],[tokens1,tokens2]);
```

# Good luck!
