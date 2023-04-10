# Linked Trust Impact Evaluator

**Description**:
This is a reference application that completes the full lifecycle of writing impact claims onto Ceramic ComposeDB, computing the rewards in Bacalhau and distributing rewards. For every "round", the wrapper contract will put the result on-chain using Gnosis safe. When all wallet owners approve the transactions, the rewards will be distributed.

The intent is to support pluggable sources for impact claim data. This POC implementation specifically extracts claim data from an open source task tracker, in this case Taiga, and allows the claimants and approvers to sign the data via Ceramic. The implementation in this repository is a working orchestrator that triggers the data flows to happen in a transparent and traceable way.

## Dependencies

- Ceramic ComposeDB
- Ceramic JS HTTP Client
- Next.js
- web3.storage
- Bacalhau
- Ether.js
- Solidity

## Component Details

The solution is comprised of three major components.

[Impact Evaluator Console](./task/README.md)
Provides a user interface that manages the workflow.

[Impact Evaluator Bacalhau Server](server/README.md)
Provides and easy method for a front end interface to initiate a Bacalhau program through a fetch request. This method allows for information such as parameters and IPFS CIDs to be passed down to the bacalhau program as well as any returned files to be passed back to the front end.

[Bacalhau Calc](./baclahauC/README.md)
Performs the award calculations and balances them to the total reward amount in the root claim.

[Wrapper Contract](./contracts/README.md)
Uses the result of the Bacalhau Calc to release the rewards that have been approved and earned.

## Installation

Each of the components can be installed separately and tested in isolation. However, to perform an end-to-end workflow, all components need to be installed and configured.

Detailed instructions on how to install, configure, and get each of the components up and running can be found here:

[Impact Evaluator Console](./task/INSTALL.md)

[Bacalhau Calc](./baclahauC/README.md)

[Wrapper Contract](./contracts/README.md)

## Usage

Once the components have been installed and configured, the Impact Evaluator Console can be used to initiate the workflow with the approvel process.

```
http://localhost:3000/approve/Approve

```

Tasks that have been approved and the work has been complete, can be processed for reward distribution:

```
http://localhost:3000/distribute/Distribute
```

Tasks that have been distributed and ready for rewards to be calculated and distributed can be done so using the Payment function:

```
http://localhost:3000/bacalhau
```
