import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { Inter } from "@next/font/google";
let abi = require("../data/abi.json");

const inter = Inter({ subsets: ["latin"] });

function invokeWrapper() {
  var provider = ethers.providers.getDefaultProvider(process.env.WEB3_PROVIDER);
  var address = process.env.WRAPPER_CONTRACT_ADDRESS;
  var privateKey = process.env.GNOSIS_WALLET_PRIVATE;
  var wallet = new ethers.Wallet(privateKey, provider);

  // The abi is imported above from ../data/abi.json
  //console.log({abi});
  var contract = new ethers.Contract(address, abi, wallet);

  /*
    The following is the signature of the postQuestion function in the wrapper contract
          postQuestion(bytes32 _merkleroot, string[] memory _treeHash) external onlyOwner returns(uint256)
   */
  var sendPromise = contract.postQuestion(merkleroot, treeHash);

  sendPromise.then(function (transaction) {
    console.log(transaction);
    return transaction;
  });
}

function Bacalhau() {
  const [isLoading, setIsLoading] = useState(false);
  const [bacalhauResponse, setBacalhauResponse] = useState("");
  const [claims, setClaims] = useState([]);
  const [cid, setCid] = useState("");
  const [limit, setLimit] = useState();

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/get-round-claims/`)
      .then((res) => res.json())
      .then((data) => setClaims(data))
      .catch((error) => console.error("error: ", error))
      .finally(() => setIsLoading(false));
  }, []);

  const claimsComponents = claims.map((claim) => {
    const {
      amount,
      amountUnits,
      claim: claimTitle,
      effectiveDate,
      subject,
      id,
    } = claim;

    return (
      <div
        key={id}
        style={{
          padding: "40px",
          background: "#fff",
          margin: "10px",
          borderRadius: "5px",
          boxShadow: "1px 10px 22px -5px rgba(0,0,0,0.47)",
        }}
      >
        <div>
          Claimant: <span style={{ fontWeight: "bold" }}>{subject}</span>
        </div>
        <div style={{ marginTop: "12px" }}>
          Claim: <span style={{ fontWeight: "bold" }}>{claimTitle}</span>
        </div>
        <div style={{ marginTop: "12px" }}>
          Amount:{" "}
          <span style={{ fontWeight: "bold" }}>
            {amount} {amountUnits}
          </span>
        </div>
        <div style={{ marginTop: "12px" }}>
          Date:{" "}
          <span style={{ fontWeight: "bold" }}>
            {new Date(effectiveDate * 1000).toLocaleDateString("en-us", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    );
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
        }}
        className={inter.className}
      >
        <header>
          {isLoading && <Loader />}
          {!isLoading && !cid && claims.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="number"
                  placeholder="Amount in USDC"
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    width: "400px",
                    fontFamily: "inherit",
                    margin: "20px 0",
                    textAlign: "center",
                  }}
                  onChange={(e) => {
                    setLimit(e.currentTarget.value);
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {claimsComponents}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  style={{
                    padding: "10px 20px",
                    background: "#fff",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    if (!limit) {
                      alert("Limit is needed");
                      return;
                    }

                    try {
                      setIsLoading(true);
                      const limitAsNumber = Number(limit);
                      const res = await fetch("/api/bacalhau", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ claims, limit: limitAsNumber }),
                      });
                      const data = await res.json();
                      const { cid } = data;
                      setCid(cid);
                    } catch (err) {
                      console.log(err.message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Pin to Web3
                </button>
              </div>
            </>
          )}
          {claims.length === 0 && !isLoading && <p> No claims found</p>}
          {!isLoading && cid && (
            <div style={{ textAlign: "center" }}>
              <p>
                CID:<span style={{ fontWeight: "bold" }}> {cid}</span>
              </p>
              <button
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const res = await fetch("http://localhost:9000/bacalhau", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ cid }),
                    });
                    const data = await res.json();
                    console.log(data);
                    const { root } = data;
                    setBacalhauResponse(root);
                  } catch (err) {
                    console.log(err.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Calculate
              </button>
            </div>
          )}
          {!isLoading && <p>{bacalhauResponse}</p>}
        </header>
      </div>
    </>
  );
}

export default Bacalhau;
