#!/bin/bash
declare -a cid=("$@")


STR1="bacalhau wasm run ./bacalhau_compute.wasm "
STR=""

STR="${STR1} -v ${cid}:CID CID | tee jobID.txt"


echo "${STR}"
 $STR > jobID.txt
 rm -rf wasm_results && mkdir -p wasm_results
 bacalhau get $(grep "Job ID:" jobID.txt | cut -f2 -d:) --output-dir wasm_results

# bacalhau wasm run ./bacalhau_compute.wasm -v QmSCMeGh17KJWA9VHPftWqA1xdWM7McVtt3azxH3aenp1X:CID1 -v QmZhCRWWv8x6zJKhUKwnDNzerWoUaAjyeD4aSY8tGz6qE4:CID2 -v QmT3sHvzDBV53WqY2Z2Gt5U9zFPZYHKHMSKghbbkxt3zsM:CID3 1000 CID1 CID2 CID3 | tee jobID.txt
# bacalhau wasm run ./bacalhau_compute.wasm -v QmTFcE6qwbpN5YozkR7u8yztZGYYjAztuxeF3VQMpAJwh1:CID1   CID1  | tee jobID.txt
