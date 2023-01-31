import { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import { Inter } from "@next/font/google";
import Head from "next/head";
import { useViewerConnection } from "@self.id/framework";
import { getCompose } from "../../compose";

const inter = Inter({ subsets: ["latin"] });

export const CREATE_CLAIM = `
  mutation (
    $claim: String!
    $subject: String!
    $root_claim_id: String
    $amount: Int
    $effective_date: String!
  ){
    createIEClaim(
      input: {
        content: {
          claim: $claim
          subject: $subject
          root_claim_id: $root_claim_id
          amount: $amount
          effective_date: $effective_date
        }
      }
    ){
      document {
        id
        claim
        subject
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
    console.log(`review.js:createClaim - ERROR ${composeDBResult.errors}`);
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
  const [users, setUsers] = useState([]);
  const [connection] = useViewerConnection();
  const [message, setMessage] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetch("/api/taiga-user-story")
      .then((res) => res.json())
      .then((b) => {
        //setTasks(b.tasks);
        setTasks(b.userStoryList.tasks);
        setUsers(b.projectDetail.users);
      });
  }, []);

  let tasksComponent;
  console.log(`Review() - ENTRY`);
  if (tasks.length > 0) {
    console.log("Tasks Entry >0");
    tasksComponent = tasks.map((taskInDB) => {
      const { id, task, claimedBy, project, amount, effectiveDate } = taskInDB;
      //const acc = claimedBy.slice(0, 4) + "..." + claimedBy.slice(34);
      if (projectName == "") {
        setProjectName(project);
      }
      var subject = "<wallet address>";

      return (
        <div
          key={id}
          className={inter.className}
          style={{
            padding: "5px",
            background: "white",
            borderRadius: "5px",
            margin: "15px 10px 100px 100px",
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

                  console.log(`Effective Date:  ${effectiveDate}`);
                  console.log("onClick setting approvedVariables");

                  // This is the "Approved" Claim
                  const approvedVariables = {
                    claim: task,
                    subject: subject,
                    amount: Number(credit),
                    effective_date: effectiveDate,
                    root_claim_id,
                  };
                  console.log("onClick 1");
                  const approvedResponse = await createClaim(
                    compose,
                    approvedVariables
                  );
                  if (approvedResponse.message == "SUCCESS") {
                    console.log("Approved Review - Success!");
                    root_claim_id = approvedResponse.streamID;
                    console.log("ComposeDB Approved executeQuery complete");

                    // This is the "Earned" Claim
                    const earned_variables = {
                      claim: task,
                      subject: subject,
                      amount: Number(credit),
                      effective_date: effectiveDate,
                      root_claim_id,
                    };
                    const earnedResponse = await createClaim(
                      compose,
                      earned_variables
                    );
                    if (earnedResponse.message == "SUCCESS") {
                      console.log("Review Earned - Success!");
                      setMessage(
                        `Approved Stream:  ${approvedResponse.streamID} and Earned Stream: ${earnedResponse.streamID}`
                      );

                      setTasks(() => {
                        updateUserStory(id);
                        return tasks.filter((task) => task.id !== id);
                      });
                    } else {
                      setMessage(
                        `Approved Stream:  ${approvedResponse.streamID}. Failed on Earned Stream with error:  ${earnedResponse.message}`
                      );
                    }
                  } else {
                    console.log(
                      `onClick bad response: ${approvedResponse.errors}`
                    );
                    setMessage(approvedResponse.message);
                  }
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
              Pay Earned
            </button>
          </div>
        </div>
      );
    });
  }

  var myLayout = (
    <>
      <Head>
        <title>Impact Evaluator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </Head>
      <div className={styles.grid}>
        <h1 className={styles.title}> Review page </h1>
      </div>

      <main className={styles.main}>
        {connection.status === "connected" && (
          <div className="grid grid-cols-3 gap-4 p-5">
            <div>{tasksComponent}</div>
            <div
              style={{
                margin: 0.0,
                padding: 10.0,
              }}
              className={inter.className}
            >
              <p></p>
              <p>{message}</p>
            </div>
          </div>
        )}
      </main>
    </>
  );

  return myLayout;
}
