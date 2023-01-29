import { useState } from "react";
import styles from "../styles/Home.module.css";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

async function getCID(streamID) {
  // try {
  console.log("Requesting CID");
  const response = await fetch("/api/cid", {
    method: "POST",
    body: JSON.stringify({ streamID }),
  });

  console.log("This is the response from the api call", response);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
  //   const response = await fetch("/api/cid", {
  //     method: "POST",
  //     body: JSON.stringify(streamID),
  //   });
  //   console.log("Reached line 14");
  //   console.log("response.json() >>>", response);

  //   //return response.json({ response });
  //   return response.json();
  // } catch (err) {
  //   console.log("Entered error block");
  //   console.log(`getCID ERROR: - ${err}`);
  //   throw new Error("Unable to retrieve stream");
  // }
}

// const response = await fetch("/api/tasks", {
//   method: "POST",
//   body: JSON.stringify(task),
// });

// if (!response.ok) {
//   throw new Error(response.statusText);
// }

// return await response.json();

export default function Cid(props) {
  //const [connection] = useViewerConnection();
  const [streamID, setStreamID] = useState("");
  const [streamCID, setStreamCID] = useState("");

  const [message, setMessage] = useState("");

  return (
    <main className={styles.claimMain}>
      {
        <div style={{ display: "flex" }} className={inter.className}>
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
            <div>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!streamID) {
                    return alert("Stream ID is a required field");
                  }

                  try {
                    const response = await getCID(streamID);
                    console.log("Result from CID request", response);
                    setStreamCID(JSON.stringify(response, null, 2));
                    setMessage(`Retrieved CID for Stream ${streamID}`);
                    setStreamID("");
                  } catch (err) {
                    setMessage(`Error:  Unable to retrieve stream`);
                  }
                }}
                className={styles.btn}
                style={{ fontSize: "16px", marginTop: "20px" }}
              >
                Get CID
              </button>
            </div>

            <div className="wrap">
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
