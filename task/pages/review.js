import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Inter } from "@next/font/google";
import Layout from "../components/Layout";
import { useViewerConnection } from "@self.id/framework";

const inter = Inter({ subsets: ["latin"] });

export default function Review() {
  const [tasks, setTasks] = useState([]);
  const [connection] = useViewerConnection();

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.tasks);
      });
  }, []);

  let tasksComponent;
  if (tasks.length > 0) {
    tasksComponent = tasks.map((task) => {
      const by = task.by;
      const acc = by.slice(0, 4) + "..." + by.slice(34);
      console.log(acc);
      return (
        <div
          key={task.id}
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
          <div style={{ fontWeight: "600" }}>{task.task}</div>
          <div style={{ fontWeight: "300" }}>Claimant:</div>
          <div style={{ fontWeight: "600" }}>{acc}</div>
          <div style={{ fontWeight: "300" }}>Credit:</div>
          <div style={{ fontWeight: "600" }}>{task.credit}</div>
          <div style={{ fontWeight: "300" }}>Round:</div>
          <div style={{ fontWeight: "600" }}>{task.round}</div>
          <div
            style={{
              paddingTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className={styles.btn}
              onClick={() => {
                console.log("Approving");
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

  return (
    <Layout>
      <main className={styles.main}>
        {connection.status === "connected" && (
          <div
            style={{ display: "flex", maxWidth: "1000px", flexWrap: "wrap" }}
          >
            {tasksComponent}
          </div>
        )}
      </main>
    </Layout>
  );
}
