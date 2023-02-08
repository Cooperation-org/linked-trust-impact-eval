#### Impact Evaluator Bacalhau Server

**Description**: The Bacalhau server provides and easy method for a front end
interface to initiate a Bacalhau program through a fetch request. This
method allows for information such as parameters and IPFS CIDs to be passed
down to the bacalhau program as well as any returned files to be passed back
to the front end.

- **Technology stack**: This project is built using node.js and express.js
  and implements a custom Bash script used to initiate the Bacalhau program.

- **Status**: This program is a Beta version

## Dependencies

This program relies on both node.js and express.js as well as the NPM
package child_process which is used to call a bash script in order to
interact with the bacalhau CLI. The bacalhau CLI MUST be installed on the
host machine in order for this server to work properly.

## Installation

Inside the server folder run:
`npm install`

## Configuration

This server can easily be adjusted to work with any Bacalhau WASM program by
replacing the WASM file found in this folder with the desired WASM file. The
run command on line 5 of the bacalhau.sh file will need to be changed to
reflect the new WASM images name. Additional logic may need to be
implemented to accommodate the new programs expected input parameters in
both the bacalhau.sh file and the bacalhau.js file found in routes.

## Usage

To start the server run:
`npm start`

## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in
sthis repository's Issue Tracker.
