import { useState } from "react";
import styles from "../styles/Home.module.css";
import Layout from "../components/Layout";
import { useViewerConnection } from "@self.id/framework";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Tasks(props) {
  const [connection] = useViewerConnection();
  const [claim, setClaim] = useState("");
  const [credit, setCredit] = useState("");
  const [round, setRound] = useState("january");

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
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Adding task");
                }}
                className={styles.btn}
                style={{ fontSize: "16px", marginTop: "20px" }}
              >
                Add task
              </button>
            </form>
          </div>
        )}
      </main>
    </Layout>
  );
}
