import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

function invokeWrapper() {
  var provider = ethers.providers.getDefaultProvider(process.env.WEB3_PROVIDER);
  var address = process.env.WRAPPER_CONTRACT_ADDRESS;
  var privateKey = process.env.GNOSIS_WALLET_PRIVATE;

  var wallet = new ethers.Wallet(privateKey, provider);

  const wrapperAPI = `./abi/contract/Wrapper.sol`;
  var contract = new ethers.Contract(address, abi, wallet);
  //var sendPromise = contract.postQuestion("Hello World");
  /*
    The following is the signature of the postQuestion function in the wrapper contract
          postQuestion(bytes32 _merkleroot, string[] memory _treeHash) external onlyOwner returns(uint256)
   */
  var sendPromise = postQuestion(merkleroot, treeHash);

  sendPromise.then(function (transaction) {
    console.log(transaction);
    return transaction;
  });
}

function Bacalhau() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [bacalhauResponse, setBacalhauResponse] = useState("");

  useEffect(() => {
    setIsCalculating(true);
    let completedJobsArray = [
      "1000",
      "QmSCMeGh17KJWA9VHPftWqA1xdWM7McVtt3azxH3aenp1X",
      "QmZhCRWWv8x6zJKhUKwnDNzerWoUaAjyeD4aSY8tGz6qE4",
      "QmT3sHvzDBV53WqY2Z2Gt5U9zFPZYHKHMSKghbbkxt3zsM",
    ];

    let queryData = { completedJobsArray };
    const settings = {
      method: "post",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(queryData),
    };

    fetch(`http://localhost:8000/bacalhau`, settings)
      .then((res) => res.text())
      .then((res) => setBacalhauResponse(res))
      .catch((error) => console.error("error: ", error))
      .finally(() => setIsCalculating(false));
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
      }}
      className={inter.className}
    >
      <header>
        {isCalculating && <Loader />}
        {!isCalculating && <p>{bacalhauResponse}</p>}
      </header>
    </div>
  );
}

export default Bacalhau;
