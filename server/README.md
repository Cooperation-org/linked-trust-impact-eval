## To run server example

Open two terminals.

Run:

`npm install`
`npm start`

The react example can be opened on localhost:3000 and as its
`useEffect` hook runs upon loading it will make the fetch call to the express server running on localhost:8000. There is a 30 second delay between the initial fetch and the returned response as this is about the length of time it takes for bacalhau to run the compute program/.

All React relative code can be found in App.js under `useEffect` hook.

On the server side you should see the data sent from react to express appear as a console.log() in the server terminal.
Once bacalhau is done running a POST /bacalhau will show in the server terminal and the merkle root generated will be shown in the React fron end.

In the server folder a jobID.txt file and a wasm_results folder will be generated and populated as the bacalhau job completes. bacalhau.sh is the shell script that parses the incoming command from express and packages up the bacalhau run command. It then calls to retreive the job results and populates the wasm_results folder which express then pulls the generated merkle root from and returns as a response to the react fetch call. The bacalhau_compute.wasm file is the wasm compiled rust program for parsing the CID data, checking that it doesnt exceed the maximum input value and then generating the merkle tree/root.
