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
    $subject: String!
    $rootClaimId: String
    $amount: Int
    $amountUnits: String
    $effectiveDate: Int!
    $claimSatisfactionStatus: String!
  ){
    createIEClaim(
      input: {
        content: {
          claim: $claim
          subject: $subject
          rootClaimId: $rootClaimId
          amount: $amount
          amountUnits: $amountUnits
          effectiveDate: $effectiveDate
          claimSatisfactionStatus: $claimSatisfactionStatus
        }
      }
    ){
      document {
        id
        claim
        subject
        amount
        amountUnits
        rootClaimId
        effectiveDate
        claimSatisfactionStatus
      }
    }
  }
`;

const task = "";
const by = "";
const credit = 0;
const round = "";
// var root_claim_id = " ";

async function updateUserStory(id) {
  /*
  const response = await fetch("/api/taiga-user-story", {
    method: "PATCH",
    //body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const userStories = await response.json();
  return userStories;
  */
  return "SUCCESS";
}

async function createClaim(compose, variables) {
  const response = { message: "", streamID: "" };
  const composeDBResult = await compose.executeQuery(CREATE_CLAIM, variables);
  if (!composeDBResult.errors) {
    response.streamID = composeDBResult.data.createIEClaim.document.id;
    response.message = "SUCCESS";
  } else {
    response.message = `Error creating persisting ${composeDBResult.errors}`;
  }
  return response;
}
function handleDistributeClaim(task) {
  // TODO Implment this.  It should launch a new page to handle splitting
  // a claim distribution.
  console.log("handleDistributeClaim - ENTRY");
}

export default function Review() {
  const [tasks, setTasks] = useState([]);
  const [connection] = useViewerConnection();
  const [message, setMessage] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetch("/api/taiga-user-story")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.tasks);
      });
  }, []);

  let tasksComponent;
  if (tasks.length > 0) {
    tasksComponent = tasks.map((taskInDB) => {
      const {
        subject,
        id,
        task,
        claimedBy,
        project,
        rootClaimId,
        amount,
        amountUnits,
        effectiveDate,
        claimSatisfactionStatus,
      } = taskInDB;

      //const acc = claimedBy.slice(0, 4) + "..." + claimedBy.slice(34);
      if (projectName == "") {
        setProjectName(project);
      }
      // var subject = "<wallet address>";

      return (
        <div
          key={id}
          className={inter.className}
          style={{
            padding: "5px",
            background: "white",
            borderRadius: "5px",
            margin: "10px 10px 0 0",
            boxShadow: "1px 1px 2px rgba(0, 0, 0, .25)",
            width: "200px",
          }}
        >
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Project:
          </div>
          <div style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}>
            {projectName}
          </div>
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Task:
          </div>
          <div style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}>
            {task}
          </div>
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Claimant:
          </div>
          <div style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}>
            {claimedBy}
          </div>
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Amount:
          </div>
          <div style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}>
            {amount}
          </div>
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Wallet:
          </div>
          <div
            style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}
          >{`<wallet address>`}</div>
          <div style={{ padding: "0px 2px 3px 0px", fontWeight: "300" }}>
            Effective Date:
          </div>
          <div style={{ padding: "0px 2px 10px 0px", fontWeight: "600" }}>
            {effectiveDate}
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
                const confirmBox = window.confirm(
                  `Confirm approval of full amount ${amount}`
                );
                if (confirmBox === true) {
                  const compose = await getCompose(connection.selfID.did);
                  //const effectiveDate = getEffectiveDate(round);

                  // This is the "Approved" Claim
                  let approvedVariables = {
                    claim: task,
                    subject,
                    amount: Number(amount),
                    amountUnits,
                    effectiveDate,
                    claimSatisfactionStatus,
                  };
                  if (rootClaimId) {
                    approvedVariables = { ...approvedVariables, rootClaimId };
                  }
                  const approvedResponse = await createClaim(
                    compose,
                    approvedVariables
                  );
                  // if (approvedResponse.message == "SUCCESS") {
                  //   root_claim_id = approvedResponse.streamID;
                  //   console.log("ComposeDB Approved executeQuery complete");

                  //   // This is the "Earned" Claim
                  //   const earned_variables = {
                  //     claim: task,
                  //     subject: subject,
                  //     amount: Number(credit),
                  //     effective_date: effectiveDate,
                  //     root_claim_id,
                  //     claim_satisfaction_status,
                  //   };
                  //   const earnedResponse = await createClaim(
                  //     compose,
                  //     earned_variables
                  //   );
                  //   if (earnedResponse.message == "SUCCESS") {
                  //     setMessage(
                  //       `Approved Stream:  ${approvedResponse.streamID} and Earned Stream: ${earnedResponse.streamID}`
                  //     );

                  //     setTasks(() => {
                  //       updateUserStory(id);
                  //       return tasks.filter((task) => task.id !== id);
                  //     });
                  //   } else {
                  //     setMessage(
                  //       `Approved Stream:  ${approvedResponse.streamID}. Failed on Earned Stream with error:  ${earnedResponse.message}`
                  //     );
                  //   }
                  // } else {
                  //   setMessage(approvedResponse.message);
                  // }
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
