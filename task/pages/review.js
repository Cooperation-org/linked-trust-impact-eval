import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Inter } from "@next/font/google";
import Layout from "../components/Layout";
import { useViewerConnection } from "@self.id/framework";
import { getCompose } from "../compose";

const inter = Inter({ subsets: ["latin"] });

export const CREATE_CLAIM = `
  mutation (
    $claim: String!
    $by: String!
    $credit: Int!
    $round: String!
  ){
    createClaim(
      input: {
        content: {
          claim: $claim
          by: $by
          credit: $credit
          round: $round
        }
      }
    ){
      document {
        id
        claim
        by
        credit
        signed_by {
          id
        }
        round
      }
    }
  }
`;
const task = "";
const by = "";
const credit = 0;
const round = "";

async function deleteTask(task) {
  const response = await fetch("/api/tasks", {
    method: "DELETE",
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(response.statusText);
  }

  return await response.json();
}

export default function Review() {
  const [tasks, setTasks] = useState([]);
  const [connection] = useViewerConnection();
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.tasks);
      });
  }, []);

  let tasksComponent;
  if (tasks.length > 0) {
    tasksComponent = tasks.map((taskInDB) => {
      const { id, task, by, credit, round } = taskInDB;
      const acc = by.slice(0, 4) + "..." + by.slice(34);
      return (
        <div
          key={id}
          className={inter.className}
          style={{
            padding: "20px",
            background: "white",
            borderRadius: "5px",
            margin: "10px 10px 0 0",
            boxShadow: "1px 1px 2px rgba(0, 0, 0, .25)",
            width: "200px",
          }}
        >
          <div style={{ fontWeight: "300" }}>Task:</div>
          <div style={{ fontWeight: "600" }}>{task}</div>
          <div style={{ fontWeight: "300" }}>Claimant:</div>
          <div style={{ fontWeight: "600" }}>{acc}</div>
          <div style={{ fontWeight: "300" }}>Credit:</div>
          <div style={{ fontWeight: "600" }}>{credit}</div>
          <div style={{ fontWeight: "300" }}>Round:</div>
          <div style={{ fontWeight: "600" }}>{round}</div>
          <div
            style={{
              paddingTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className={styles.btn}
              onClick={async () => {
                const compose = await getCompose(connection.selfID.did);

                const variables = {
                  claim: task,
                  by,
                  credit: Number(credit),
                  round,
                };

                const composeDBResult = await compose.executeQuery(
                  CREATE_CLAIM,
                  variables
                );

                const dataStr = JSON.stringify(composeDBResult.data);

                if (!composeDBResult.errors) {
                  setMessage(`Approved!`);
                  setTasks(() => {
                    console.log(
                      `setTasks filtering task: ${task.id} using ID ${id}`
                    );
                    deleteTask(id);
                    return tasks.filter((task) => task.id !== id);
                  });
                } else {
                  setMessage(`Error:  ${composeDBResult.errors}`);
                }

                // Make the claim in composedb
              }}
            >
              Approve
            </button>
          </div>
        </div>
      );
    });
  }

  var myLayout = (
    <Layout>
      <main className={styles.main}>
        {connection.status === "connected" && (
          <div
            style={{ display: "flex", maxWidth: "1000px", flexWrap: "wrap" }}
          >
            {tasksComponent}
            <div
              style={{ margin: 10.0, padding: 10.0 }}
              className={inter.className}
            >
              <p></p>
              <p>{message}</p>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );

  return myLayout;
}
