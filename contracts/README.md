# Impact Evaluator Wrapper Contract

**Description**: Wrapper.sol first verifies the Merkle root and the Merkle tree with Reality.eth and then allows the user to claim their funds after verifying their eligibility and amount on the Merkle tree. \
 The contract is deployed on the Goerli network and interacts with a mock Reality.eth contract that always returns a `bytes32` response for all `askQuestion()` calls, and returns a `bytes32` true for all `getFinalAnswer()` calls. Transactions use mock ERC20 tokens for transfers. The deployment addresses of Wrapper, MockReality and TestERC20 are listed in the `addresses.txt` file. The contract supports all ERC20 tokens, and the specific token used can be selected at the time of deployment.
\
\
In this README.md we will go through the process of:
- Installing the required dependencies.
- Running a *local blockchain* node using `anvil`.
- Deploying MockReality, MockERC20 and Wrapper contract on it using `forge create`. 
- Calling the Wrapper contract's function using `cast`.
\
The process of deploying to Goerli will be quite similar. 
## Dependencies

The project is written in Solidity and uses [Foundry](https://github.com/foundry-rs/foundry) as the development framework. \
To install Foundry run: \
`$ curl -L https://foundry.paradigm.xyz | bash` \
This will download foundryup , Foundry's toolchain installer. Install it by running: \
`$ foundryup` \
Now we have four binaries: `forge`, `cast`, `anvil` and `chisel`. Which is more than what we need to run this project. \
For more information on Foundry check out [Foundry Book](https://book.getfoundry.sh/)

## Installation

Clone the project repo by running: \
`$ https://github.com/foundry-rs/foundry.git` \
go to contracts folder which contains all the files for this piece of project. \
`$ cd linked-trust-ie/contracts/` \
Install the submodule dependencies in the project by running: \
`$ forge install` \
Install OpenZeppelin Contracts as a dependency(You may have to commit your previous changes beforehand) \
`$ forge install OpenZeppelin/openzeppelin-contracts` \
To build, run: \
`$ forge build` \
Look for Known issues below if you get import related errors. \
To run test: \
`$ forge test` 

Now that the contracts are compiled and tested, run:  \
`$ anvil` \
Anvil creates a testnet node for deploying and testing smart contracts.  

```
                             _   _
                            (_) | |
      __ _   _ __   __   __  _  | |
     / _` | | '_ \  \ \ / / | | | |
    | (_| | | | | |  \ V /  | | | |
     \__,_| |_| |_|   \_/   |_| |_|

    0.1.0 (cd7850b 2023-02-01T00:08:03.956233742Z)
    https://github.com/foundry-rs/foundry

Available Accounts
==================

(0) "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" (10000 ETH)
(1) "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" (10000 ETH)
(2) "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" (10000 ETH)
(3) "0x90F79bf6EB2c4f870365E785982E1f101E93b906" (10000 ETH)
(4) "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" (10000 ETH)
(5) "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" (10000 ETH)
(6) "0x976EA74026E726554dB657fA54763abd0C3a0aa9" (10000 ETH)
(7) "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" (10000 ETH)
(8) "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" (10000 ETH)
(9) "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" (10000 ETH)

Private Keys
==================

(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
(1) 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
(2) 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
(3) 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
(4) 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
(5) 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
(6) 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
(7) 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
(8) 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
(9) 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

Wallet
==================
Mnemonic:          test test test test test test test test test test test junk
Derivation path:   m/44'/60'/0'/0/


Base Fee
==================

1000000000

Gas Limit
==================

30000000

Genesis Timestamp
==================

1675859029

Listening on 127.0.0.1:8545


```

Here anvil gives us ten accounts, their private keys and an rpc endpoint on `127.0.0.1:8545`

Now that we have a network and contracts, we'll deploy. More information about deploying can be found in the docs [here](https://book.getfoundry.sh/forge/deploying) . Keep `anvil`'s instance running on one terminal and open another terminal to do the calls.

We will use account0's private key to deploy RealityMock. Export it by: 

`$ export PRIVATE_KEY=<private key from account0>`

`$ forge create --rpc-url http://localhost:8545/ --private-key $PRIVATE_KEY  src/mock/RealityMock.sol:RealityMock`

```
[⠔] Compiling...
No files changed, compilation skipped
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x0147a03c5ecf5bf0a6d12ae6e6637ec5479c7ccef8153e955e00a38d6a3d198e

```
We will keep Reality's address `0x5FbDB2315678afecb367f032d93F642f64180aa3` because we need to pass it to Wrapper's constructor during deployment.

Another parameter Wrapper Contract's constructor needs for deployment is TestERC20 deployment address so we'll keep it handy as well.

`$ forge create --rpc-url http://localhost:8545/ --private-key $PRIVATE_KEY src/mock/TestERC20.sol:TestERC20`

```
[⠔] Compiling...
No files changed, compilation skipped
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Transaction hash: 0x19d8a8d5af348710982ea52395301c534d354983e6ff88a804027470ff6e34b1

```
Now that we have all the required parameters, we'll deploy Wrapper as well. \
We will pass Reality's and TestERC20's deployment address as `--contructor-args`. 

`$ forge create --rpc-url http://localhost:8545/ --private-key $PRIVATE_KEY src/Wrapper.sol:Wrapper --constructor-args 0x5FbDB2315678afecb367f032d93F642f64180aa3 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

```
[⠔] Compiling...
No files changed, compilation skipped
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Transaction hash: 0x38f6c61509a19b02377a762b5a062218366f2b235f1fd39f59622f5cc2463fc5


```
Now we call `postQuestion()` from Wrapper contract, by passing a string(Merkle Root) and string[] (Tree Hashes) in it. `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` is the deployment address of Wrapper Contract. The response is a bytes32 question Id.

`$ cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 "postQuestion(string ,string[])(bytes32)" "0xb6a5508696541a52a1d2ab60952234050efc34e49c68e19f4389d10dca9e4c46" ["0x8584e54df79d9ea3216195ce034977968f01457c100","0x624ec4a3ffa86bcef4d06706034d1fddbc9f56b4100","0x7ff8b020c2ecd40613063ae1d2ee6a2a383793fa100"] `

```
0x0000000000000000000000000000000000000000000000000000000063e3b228

```
Now we try to call `postQuestion()` from account1, instead of account0. 

`$ cast call 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 "postQuestion(string ,string[])(bytes32)" "0xb6a5508696541a52a1d2ab60952234050efc34e49c68e19f4389d10dca9e4c46" ["0x8584e54df79d9ea3216195ce034977968f01457c100","0x624ec4a3ffa86bcef4d06706034d1fddbc9f56b4100","0x7ff8b020c2ecd40613063ae1d2ee6a2a383793fa100"]`

```
Error: 
(code: 3, message: execution reverted: Ownable: caller is not the owner, data: Some(String("0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000204f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572")))
```
The Transaction returns with an `Error` beacause the Wrapper Contract wasn't deployed by `account1` and can't be called by it. 


## Known issues
You may have to make a `remappings.txt` file in the root folder of the project and add following mappings if you get mapping related errors while working with `forge`.

```
ds-test/=lib/forge-std/lib/ds-test/src/
forge-std/=lib/forge-std/src/
openzeppelin-contracts/=lib/openzeppelin-contracts/contracts/
```
If this doesn't work out, remove "contracts" in all import and try again \
`$ import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol"` => `import "openzeppelin-contracts/token/ERC20/IERC20.sol"`.


## Getting help
If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.

---
