import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
