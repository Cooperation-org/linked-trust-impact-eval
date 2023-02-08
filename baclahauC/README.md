#### Impact Evaluator Bacalhau Compute

**Description**: This program is designed to obtain task claims data from
IPFS, verify that the amount set in the claim root of each task is not
exceeded by the value of each earned claim and verify that the total value
of all root claims does not exceed the maximum limit set for the current
calculations.

Once the program has verified that all of the claim amounts are valid it
creates a SHA256 based linear Merkle Tree that can be used for on-chain
token airdrops.

- **Technology stack**: The Bacalhau Compute module is a single threaded
  Rust based program compiled down to wasm32-wasi designed to run on the
  Bacalhau network. This program can be implemented by any project that wants
  to have a decentralized, trusted and repeatable calculation to both verify
  their claim amounts and create a SHA256 based Merkle tree. This program can
  also serve as a starting point for projects where more complex calculations
  on claim data can be implemented.

This project implements SHA256 for its Merkle tree and root creation due to
conflicts with existing Rust Cargo packages that support keccak256 such as
the ethers crate which causes any Rust program that implements it to fail on
Bacalhau. While it is not certain what causes this incompatibility it seems
to be an issue with something in the crate needing the ability to run on
multiple threads which is not supported by Bacalhau. Due to this, this
project also serves as a great starting point for anyone who needs to build
Merkle trees and their roots on Bacalhau.

- **Status**: This program is a Beta build as future version will be
  implemented in a more modular manor.

## Dependencies

This project depends on a local installation of Rust, the Bacalhau CLI, the
standard Rust crate, the serde and serde_json Rust crates, the sha2 Rust
crate and the hex Rust crate. Version numbers for these crates can be found
in the dependencies section of the Cargo.toml file.

## Installation

The Bacalhau CLI can be installed with the following command:

`curl -sL https://get.bacalhau.org/install.sh | bash`

Rust can be installed locally with the following command:

`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

Cargo crates will be installed automatically when the program is run thanks
to the Cargo.toml file.

## Usage

To run the calculation program locally as a rust program using the test
claims json run the following command inside the bacalhauC folder:

`cargo run ./jsons/inputs`

Running this will produce both the Merkle Tree and Root inside the outputs folder.

To run this program on Bacalhau as a WASM image use the command:

`bacalhau wasm run ./bacalhau_compute.wasm -v bafybeidwbw2xgm3elpoeom37oungx6bvopjg4r6n7krj6d6thimbzusadu:CID1 CID1 | tee jobID.txt`

To retrieve the results of your calculation run:

`rm -rf wasm_results && mkdir -p wasm_results`

and then run:

`bacalhau get $(grep "Job ID:" jobID.txt | cut -f2 -d:) --output-dir wasm_results`

This will store the generated root and hash inside of the wasm_results
folder.

If you wish to use your own claims with this program make sure you replace  
the IPFS CID with your desired CID in the above command

If you wish to modify this program you can do so through the /src/main.rs
file. Testing of modifications can be done in Rust without any set up but
tests on Bacalhau will require that your first compile to WASM and then move
the WASM image from the target folder and replace the existing WASM file in
the bacalhauC folder.

Compiling to WASM can be done with the command:
`cargo build --target wasm32-wasi --release`

## Known issues

The compute program expects that the input IPFS CID is a folder with a json in it, not the json itself. Prior versions of this
program had been designed to work with a CID that directly represented the claims file however this had to be changed due to
the way web3.storage was uploading the claims.json. Due to this change the program is now limited to ONLY working with
a json named "claims.json" uploaded to IPFS as a folder not a file.

MAKE SURE THAT THE IPFS CID YOU ARE TRYING TO USE IS A FOLDER CONTAINING
THE CLAIMS.JSON, NOT JUST THE JSON ITSELF.

## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.
