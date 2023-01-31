import { useState } from "react";
import styles from "../../styles/Cid.module.css";
import { Inter } from "@next/font/google";
// import head component
import Head from "next/head";
//  import css

const inter = Inter({ subsets: ["latin"] });

async function getCID(streamID) {
  try {
    /*
    const response = await fetch("/api/cid", {
      method: "POST",
      body: JSON.stringify(streamID),
    });
    console.log("Get CID Returned");
    */

    fetch("/api/cid", {
      method: "POST",
      body: JSON.stringify(streamID),
    })
      .then((res) => res.json())
      .then((b) => {
        console.log(`b.cid:  ${JSON.stringify(b)}`);
        return b.cid;
      });

    //return response.json({ response });
    //return response.json();
    //console.log(`getCID:  Response:  ${JSON.stringify(response)}`);
    //console.log(`getting json`);
    //const myjson = response.json.Cid;

    //console.log(
    //  `getCID response stringified after getting in json format:  ${JSON.stringify(
    //    response
    //  )}`
    //);
    //return response;
  } catch (err) {
    console.log(`getCID ERROR: - ${err}`);
    throw new Error("Unable to retrieve stream");
  }
}

export default function Cid(props) {
  //const [connection] = useViewerConnection();
  const [streamID, setStreamID] = useState("");
  const [streamCID, setStreamCID] = useState("");

  const [message, setMessage] = useState("");

  return (
    <main className={styles.claimMain}>
      {
        //<div style={{ display: "flex" }} className={inter.className}>
        <div className={styles.grid} style={{ margin: "60px 5px 0px 70px" }}>
          <form className={styles.claimForm}>
            <label htmlFor="streamID">StreamID: </label>
            <input
              type="text"
              placeholder="Stream ID"
              name="streamID"
              size="100"
              value={streamID || ""}
              onChange={(e) => setStreamID(e.target.value)}
            />
            <div className={styles.button}>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!streamID) {
                    return alert("Stream ID is a required field");
                  }

                  try {
                    fetch("/api/cid", {
                      method: "POST",
                      body: JSON.stringify(streamID),
                    })
                      .then((res) => res.json())
                      .then((b) => {
                        console.log(`CID Page b.cid:  ${JSON.stringify(b)}`);
                        setStreamCID(JSON.stringify(b.cid));
                      });

                    setMessage(`Retrieved CID for Stream ${streamID}`);
                    setStreamID("");
                  } catch (err) {
                    setMessage(`Error:  Unable to retrieve stream`);
                  }
                }}
                className={styles.btn}
                style={{ fontSize: "16px", margin: "15px 0px 0px 400px" }}
              >
                Get CID
              </button>
            </div>

            <div className="wrap" style={{ marginTop: "20px" }}>
              <div className="wrap">
                <label htmlFor="cid">CID:</label>
              </div>
              <textarea
                readOnly
                id="cid"
                rows="20"
                cols="100"
                //style={{ resize: none }}
                placeholder="Stream CID"
                value={streamCID}
              ></textarea>
            </div>
            <div
              style={{ margin: 10.0, padding: 10.0 }}
              className={inter.className}
            >
              <p></p>
              <p>{message}</p>
            </div>
          </form>
        </div>
      }
    </main>
  );
}
