#!/bin/bash
declare -a cid=("$@")


STR1="bacalhau wasm run ./bacalhau_compute.wasm "
STR=""

STR="${STR1} -v ${cid}:CID CID | tee jobID.txt"


echo "${STR}"
 $STR > jobID.txt
 rm -rf wasm_results && mkdir -p wasm_results
 bacalhau get $(grep "Job ID:" jobID.txt | cut -f2 -d:) --output-dir wasm_results
