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
    $claimed_by: String!
    $root_claim_id: String
    $amount: Int!
    $effective_date: String!
  ){
    createLinkedClaim(
      input: {
        content: {
          claim: $claim
          claimed_by: $claimed_by
          root_claim_id: $root_claim_id
          amount: $amount
          effective_date: $effective_date
        }
      }
    ){
      document {
        id
        claim
        claimed_by
        amount
        root_claim_id
        effective_date
      }
    }
  }
`;

const task = "";
const by = "";
const credit = 0;
const round = "";
var root_claim_id = " ";

async function getTasks() {
  const response = await fetch("/api/taiga-tasks", {
    method: "GET",
    //body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  //console.log(`getTask Response:  ${await response.json()} `);
  return await response.json();
}

async function getClosedUserStories() {
  const response = await fetch("/api/taiga-user-story", {
    method: "GET",
    //body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const userStories = await response.json();
  //console.log(`getClosedUserStories Response:  ${await response.json()} `);
  return userStories;
}

async function createClaim(compose, variables) {
  const response = { message: "", streamID: "" };
  const composeDBResult = await compose.executeQuery(CREATE_CLAIM, variables);
  if (!composeDBResult.errors) {
    response.streamID = composeDBResult.data.createLinkedClaim.document.id;
    response.message = "SUCCESS";
  } else {
    response.message = `Error creating persisting ${composeDBResult.errors}`;
  }
  console.log(`createClaim - RESPONSE MESSAGE = ${response.message}`);
  return response;
}
function handleDistributeClaim(task) {
  console.log("handleDistributeClaim - ENTRY");
}

function getEffectiveDate(round) {
  const monthMap = new Map([
    ["january", 1],
    ["february", 2],
    ["march", 3],
    ["april", 4],
    ["may", 5],
    ["june", 6],
    ["july", 7],
    ["august", 8],
    ["september", 9],
    ["october", 10],
    ["november", 11],
    ["december", 12],
  ]);
  const monthNum = monthMap.get(round);
  var currentDate = new Date();
  currentDate.setMonth(monthNum);
  const effectiveDate =
    String(monthNum) + "-01-" + String(currentDate.getFullYear());
  return effectiveDate;
}

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
  const [projectName, setProjectName] = useState("");

  /* useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.tasks);
      });
  }, []);
  */

  useEffect(() => {
    fetch("/api/taiga-user-story")
      .then((res) => res.json())
      .then((b) => {
        console.log(`*************b = ${JSON.stringify(b)}`);

        setTasks(b.tasks);
      });
  }, []);

  let tasksComponent;
  if (tasks.length > 0) {
    tasksComponent = tasks.map((taskInDB) => {
      const { id, task, claimedBy, subject, amount, effectiveDate } = taskInDB;
      //const acc = claimedBy.slice(0, 4) + "..." + claimedBy.slice(34);
      if (projectName == "") {
        setProjectName(subject);
      }

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
          <div style={{ fontWeight: "300" }}>Project:</div>
          <div style={{ fontWeight: "600" }}>{projectName}</div>
          <div style={{ fontWeight: "300" }}>Task:</div>
          <div style={{ fontWeight: "600" }}>{task}</div>
          <div style={{ fontWeight: "300" }}>Claimant:</div>
          <div style={{ fontWeight: "600" }}>{claimedBy}</div>
          <div style={{ fontWeight: "300" }}>Amount:</div>
          <div style={{ fontWeight: "600" }}>{amount}</div>
          <div style={{ fontWeight: "300" }}>Effective Date:</div>
          <div style={{ fontWeight: "600" }}>{effectiveDate}</div>
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
                const effectiveDate = getEffectiveDate(round);

                console.log(`Effective Date:  ${effectiveDate}`);

                // This is the "Approved" Claim
                const approvedVariables = {
                  claim: task,
                  claimed_by: claimedBy,
                  amount: Number(credit),
                  effective_date: effectiveDate,
                  root_claim_id,
                };
                const approvedResponse = await createClaim(
                  compose,
                  approvedVariables
                );
                if (approvedResponse.message == "SUCCESS") {
                  root_claim_id = approvedResponse.streamID;
                  console.log("ComposeDB Approved executeQuery complete");

                  // This is the "Earned" Claim
                  const earned_variables = {
                    claim: task,
                    claimed_by: by,
                    amount: Number(credit),
                    effective_date: effectiveDate,
                    root_claim_id,
                  };
                  const earnedResponse = await createClaim(
                    compose,
                    earned_variables
                  );
                  if (earnedResponse.message == "SUCCESS") {
                    setMessage(
                      `Approved Stream:  ${approvedResponse.streamID} and Earned Stream: ${earnedResponse.streamID}`
                    );

                    setTasks(() => {
                      deleteTask(id);
                      return tasks.filter((task) => task.id !== id);
                    });
                  } else {
                    setMessage(
                      `Approved Stream:  ${approvedResponse.streamID}. Failed on Earned Stream with error:  ${earnedResponse.message}`
                    );
                  }
                } else {
                  setMessage(approvedResponse.message);
                }

                // Make the claim in composedb
              }}
            >
              Approve
            </button>
          </div>
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
                // Distribute the funds to earned
                const confirmBox = window.confirm(
                  "Do you really want to distribute the claim?"
                );
                if (confirmBox === true) {
                  handleDistributeClaim(task);
                }
              }}
            >
              Distribute
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
            <div>{tasksComponent}</div>
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
