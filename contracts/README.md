# Impact Evaluator Wrapper Contract

**Description**: Wrapper.sol first verifies the Merkle root and the Merkle tree with Reality.eth and then allows the user to claim their funds after verifying their eligibility and amount on the Merkle tree. The contract is deployed on the Goerli network and interacts with a mock Reality.eth contract that always returns "True" for all question calls. Transactions use mock USDC tokens for transfers. The deployment addresses are of Wrapper, Mock Reality and Mock listed in the `addresses.txt` file. The contract supports all ERC20 tokens, and the specific token used can be selected at the time of deployment.

## Dependencies

The project is written in Solidity and uses [Foundry](https://github.com/foundry-rs/foundry) as the develpment framework.
To install Foundry run:
`curl -L https://foundry.paradigm.xyz | bash`
This will download foundryup , Foundry's toolchain installer. Install it by running:
`foundryup`
Now we have four binaries: `forge`, `cast`, `anvil` and `chisel`. Which is more than what we need to run this project
For more information on Foundry check out [Foundry Book](https://book.getfoundry.sh/)

## Installation

Clone the project repo by running:
`https://github.com/foundry-rs/foundry.git`
go to contracts folder which contains all the files for this piece of project.
`cd linked-trust-ie/contracts/`
Install the submodule dependencies in the project by running:
`forge install`
Install OpenZeppelin Contracts as a dependency(You may have to commit your previous changes beforehand)
`forge install OpenZeppelin/openzeppelin-contracts`
To build, run:
`forge build`
Look for Known issues below if you get import related errors. 
To run test:
`forge test`

## Known issues
You may have to make a `remappings.txt` file in your root folder of the project, and add following mappings if you get mapping related errors while working with `forge`.

```
ds-test/=lib/forge-std/lib/ds-test/src/
forge-std/=lib/forge-std/src/
openzeppelin-contracts/=lib/openzeppelin-contracts/contracts/

```
If this doesn't work out, remove "contracts" in all import and try again
`import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol"` => `import "openzeppelin-contracts/token/ERC20/IERC20.sol"`.


## Getting help
If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.

---

