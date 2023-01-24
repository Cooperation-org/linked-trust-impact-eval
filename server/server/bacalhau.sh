#!/bin/bash
declare -a array=("$@")
# get length of an array
arraylength=${#array[@]}

STR1="bacalhau wasm run ./bacalhau_compute.wasm "
STR=""
MAX=0
end=${arraylength}
# use for loop to read all values and indexes
for (( i=0; i<${arraylength}; i++ ));
do
  if [ $i -eq 0 ]
  then
    STR1="${STR1}"
  else
  STRI="-v ${array[$i]}:CID$i "
  if [ $i -eq 1 ]
  then
    STR="${STR1}${STRI}"
  else
    STR="${STR}${STRI}"
  fi
fi
done

for (( i=0; i<${arraylength}; i++ ));
do
  if [ $i -eq 0 ]
  then
    STR="${STR} ${array[$i]}"
  else
    STR="${STR} CID$i"
fi
done

echo "${STR}"
 $STR > jobID.txt
 rm -rf wasm_results && mkdir -p wasm_results
 bacalhau get $(grep "Job ID:" jobID.txt | cut -f2 -d:) --output-dir wasm_results

# bacalhau wasm run ./bacalhau_compute.wasm -v QmSCMeGh17KJWA9VHPftWqA1xdWM7McVtt3azxH3aenp1X:CID1 -v QmZhCRWWv8x6zJKhUKwnDNzerWoUaAjyeD4aSY8tGz6qE4:CID2 -v QmT3sHvzDBV53WqY2Z2Gt5U9zFPZYHKHMSKghbbkxt3zsM:CID3 1000 CID1 CID2 CID3 | tee jobID.txt
