import { useState } from "react";
import styles from "../styles/Home.module.css";
import Layout from "../components/Layout";
import { useViewerConnection } from "@self.id/framework";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

async function addTask(task) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}

export default function Tasks(props) {
  const [connection] = useViewerConnection();
  const [claim, setClaim] = useState("");
  const [credit, setCredit] = useState("");
  const [round, setRound] = useState("january");
  const [message, setMessage] = useState("");

  return (
    <Layout>
      <main className={styles.claimMain}>
        {connection.status === "connected" && (
          <div style={{ display: "flex" }} className={inter.className}>
            <form className={styles.claimForm}>
              <label htmlFor="claim">Claim</label>
              <input
                type="text"
                placeholder="Task Title"
                name="claim"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
              />

              <label htmlFor="credit">Credit</label>
              <input
                type="text"
                placeholder="Cooks"
                name="credit"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
              />

              <label htmlFor="round">Round</label>
              <select
                name="round"
                value={round}
                onChange={(e) =>
                  e.target.value == "months"
                    ? setRound("")
                    : setRound(e.target.value)
                }
              >
                <option value="january">January</option>
                <option value="february">February</option>
                <option value="march">March</option>
                <option value="april">April</option>
                <option value="may">May</option>
                <option value="june">June</option>
                <option value="july">July</option>
                <option value="august">August</option>
                <option value="september">September</option>
                <option value="october">October</option>
                <option value="november">November</option>
                <option value="december">December</option>
              </select>

              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!claim || !credit || !round) {
                    return alert(
                      "Claim, Credit & Round are all required fileds"
                    );
                  }
                  const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                  });
                  await addTask({
                    task: claim,
                    by: accounts[0],
                    credit: Number(credit),

                    round,
                  });
                  setMessage("Task Added Successfully");
                  setClaim("");
                  setCredit("");
                  setRound("");
                }}
                className={styles.btn}
                style={{ fontSize: "16px", marginTop: "20px" }}
              >
                Add task
              </button>
              <div
                style={{ margin: 10.0, padding: 10.0 }}
                className={inter.className}
              >
                <p></p>
                <p>{message}</p>
              </div>
            </form>
          </div>
        )}
      </main>
    </Layout>
  );
}
