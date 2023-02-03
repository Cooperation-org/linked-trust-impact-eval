import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { Inter } from "@next/font/google";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

function Bacalhau() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [bacalhauResponse, setBacalhauResponse] = useState("");
  const [isFetchingClaims, setIsFetchingClaims] = useState(false);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    // setIsCalculating(true);
    // let completedJobsArray = [
    //   "1000",
    //   "QmSCMeGh17KJWA9VHPftWqA1xdWM7McVtt3azxH3aenp1X",
    //   "QmZhCRWWv8x6zJKhUKwnDNzerWoUaAjyeD4aSY8tGz6qE4",
    //   "QmT3sHvzDBV53WqY2Z2Gt5U9zFPZYHKHMSKghbbkxt3zsM",
    // ];

    // let queryData = { completedJobsArray };
    // const settings = {
    //   method: "post",
    //   headers: { "Content-Type": "application/json; charset=utf-8" },
    //   body: JSON.stringify(queryData),
    // };
    // /get-round-claims/
    // fetch(`http://localhost:8000/bacalhau`, settings)
    //   .then((res) => res.text())
    //   .then((res) => setBacalhauResponse(res))
    //   .catch((error) => console.error("error: ", error))
    //   .finally(() => setIsCalculating(false));

    // fetch(`http://localhost:8000/get-round-claims/`)
    //   .then((res) => res.json())
    //   .then((data) => console.log(data))
    //   .catch((error) => console.error("error: ", error));
    // .finally(() => setIsCalculating(false));
    setIsFetchingClaims(true);
    axios
      .get("http://localhost:8000/get-round-claims/")
      .then((res) => {
        setClaims(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsFetchingClaims(false);
      });
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
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
        }}
        className={inter.className}
      >
        <header>
          {(isCalculating || isFetchingClaims) && <Loader />}
          <div style={{ display: "flex" }}>{claimsComponents}</div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            {claims.length > 0 && (
              <button
                style={{
                  padding: "10px 20px",
                  // border: "1px solid #000",
                  background: "#fff",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  try {
                    const res = await axios.post("/api/bacalhau", { claims });
                    console.log(res.data);
                  } catch (err) {
                    console.log(err.message);
                  }
                }}
              >
                Calculate
              </button>
            )}
            {claims.length === 0 && !isFetchingClaims && (
              <p> No claims found</p>
            )}
          </div>
          {!isCalculating && <p>{bacalhauResponse}</p>}
        </header>
      </div>
    </>
  );
}

export default Bacalhau;
