import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Inter } from "@next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Review() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.tasks);
      });
  }, []);

  let tasksComponent;
  if (tasks.length > 0) {
    tasksComponent = tasks.map((task) => (
      <div
        key={task.id}
        className={inter.className}
        style={{
          padding: "10px",
          border: "1px solid black",
          borderRadius: "5px",
          marginRight: "10px",
        }}
      >
        <div>Task: {task.task}</div>
        <div>Claimant: {task.by}</div>
        <div>Credit: {task.credit}</div>
        <div>Round: {task.round}</div>
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
    ));
  }

  return (
    <main className={styles.main}>
      <div style={{ display: "flex" }}>{tasksComponent}</div>
    </main>
  );
}
