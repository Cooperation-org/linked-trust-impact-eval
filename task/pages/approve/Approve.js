import { useEffect, useState } from "react";
import styles from "../../styles/Approve.module.css";
import { Inter } from "@next/font/google";
import Head from "next/head";
import { useViewerConnection } from "@self.id/framework";
import { getCompose } from "../../compose";
import { getUnixTime } from "../../helpers";

const inter = Inter({ subsets: ["latin"] });

export const CREATE_CLAIM = `
  mutation (
    $claim: String!
    $subject: String!
    $rootClaimId: String
    $amount: Int
    $source: String
    $effectiveDate: Int!
  ){
    createIEClaim(
      input: {
        content: {
          claim: $claim
          subject: $subject
          rootClaimId: $rootClaimId
          amount: $amount
          source: $source
          effectiveDate: $effectiveDate
        }
      }
    ){
      document {
        id
        claim
        subject
        amount
        source
        rootClaimId
        effectiveDate
      }
    }
  }
`;

const credit = 0;
var rootClaimId = " ";

async function createClaim(compose, variables) {
  const response = { message: "", streamID: "" };
  const composeDBResult = await compose.executeQuery(CREATE_CLAIM, variables);
  if (!composeDBResult.errors) {
    response.streamID = composeDBResult.data.createIEClaim.document.id;
    response.message = "SUCCESS";
  } else {
    response.message = `Error creating persisting ${composeDBResult.errors}`;
    console.error(`approve.js:createClaim - ERROR ${composeDBResult.errors}`);
  }
  return response;
}

export default function Approve() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDistributeTo, setShowDistributeTo] = useState(0.0);
  const [rootClaimID, setRootClaimID] = useState("");
  const [activeTask, setActiveTask] = useState({
    task: "",
    id: 0,
    effectiveDate: "",
    source: "",
  });
  const [approved, setApproved] = useState(false);
  const [totalDistributedAmt, setTotalDistributedAmt] = useState(0.0);
  const [totalApprovedAmt, setTotalApprovedAmt] = useState(0.0);

  const [connection] = useViewerConnection();

  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetch("/api/taiga-user-story?status=ready")
      .then((res) => res.json())
      .then((b) => {
        setTasks(b.userStoryList.tasks);
        setUsers(b.projectDetail.users);
      });
  }, []);

  let tasksComponent;
  let distributeComponents;
  let amountsComponents;

  let buttonRow;

  if (tasks.length > 0) {
    tasksComponent = tasks.map((taskInDB) => {
      const {
        id,
        task,
        claimedBy,
        owner,
        project,
        source,
        amount,
        effectiveDate,
        taskStatus,
        approvedAmount,
        distributedAmount,
        message,
        subject,
      } = taskInDB;

      if (projectName == "") {
        setProjectName(project);
      }
      distributeComponents = <p></p>;

      // Build the StatusComponent
      let statusComponents = (
        <div>
          <span
            style={{
              fontWeight: "bold",
              padding: "0px 0px 0px 120px",
            }}
          >
            Status:
          </span>
          <span
            style={{
              padding: "0px 0px 0px 8px",
            }}
          >
            {"  "}
          </span>
          <span
            style={{
              color: "red",
              fontWeight: 600,
              padding: "0px 0px 0px 0px",
            }}
          >
            {taskStatus}
          </span>
        </div>
      );

      // Build the Project Summary Components
      let projectSummaryComponents = (
        <div>
          <div style={{ padding: "0px 0px 0px 70px" }}>
            <span style={{ fontWeight: "bold" }}>{"Project:   "}</span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span>{projectName}</span>
          </div>

          <div style={{ padding: "0px 0px 0px 60px" }}>
            <span style={{ fontWeight: "bold" }}>Owner:</span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span> {owner}</span>
          </div>

          <div style={{ padding: "0px 0px 0px 20px" }}>
            <span style={{ fontWeight: "bold" }}>Effective Date:</span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span> {effectiveDate}</span>
          </div>
        </div>
      );

      // Build the AmountsComponents
      amountsComponents = (
        <div>
          <div>
            <span style={{ fontWeight: "bold", padding: "0px 5px 0px 32px" }}>
              Approved Amount (USDC):
            </span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span
              style={{
                padding: "0px 5px 0px 2px",
                textAlign: "right",
              }}
            >
              {approvedAmount.toFixed(2)}
            </span>
          </div>

          <div>
            <span style={{ fontWeight: "bold", padding: "0px 0px 0px 36px" }}>
              Available Amount (USDC):
            </span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span
              style={{
                padding: "0px 0px 0px 4px",
              }}
            >
              {(amount - distributedAmount).toFixed(2)}
            </span>
          </div>
        </div>
      );

      // Show the DistributeTo components
      if (id !== showDistributeTo) {
        //} else {
        //if (taskStatus !== "Submitted") {
        // Add button row
        buttonRow = (
          <div
            style={{
              paddingTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span style={{ padding: "0px 2px 25px 0px" }}>
              <button
                className={styles.btn}
                onClick={async () => {
                  const confirmBox = window.confirm(
                    `Confirm approval of full amount ${amount}`
                  );
                  if (confirmBox === true) {
                    const compose = await getCompose(connection.selfID.did);

                    // Create the "Approved" Claim
                    const approvedVariables = {
                      claim: task,
                      subject: "<wallet>",
                      amount: Number(credit),
                      amountUnits: "USDC",
                      source: source,
                      effectiveDate: getUnixTime(effectiveDate),
                      rootClaimId,
                    };

                    const approvedResponse = await createClaim(
                      compose,
                      approvedVariables
                    );
                    if (approvedResponse.message == "SUCCESS") {
                      rootClaimId = approvedResponse.streamID;
                      setRootClaimID(approvedResponse.streamID);
                      setActiveTask({
                        task,
                        id,
                        effectiveDate,
                        source: source,
                      });

                      let index = tasks.findIndex((item) => item.id === id);
                      if (index >= 0) {
                        tasks[index].taskStatus = "Approved";
                        tasks[index].approvedAmount = Number(amount);
                        tasks[
                          index
                        ].message = `Approved Stream ID:  ${approvedResponse.streamID}`;
                      }
                      let newTotalApprovedAmt = totalApprovedAmt;
                      newTotalApprovedAmt += Number(amount);
                      setTotalApprovedAmt(newTotalApprovedAmt);
                      setTasks(tasks);
                      setApproved(true);
                      setShowDistributeTo(id);
                    } else {
                      // There was an error created the Approved Claim
                      console.error(
                        `onClick bad response: ${approvedResponse.errors}`
                      );
                      let index = tasks.findIndex((item) => item.id === id);
                      if (index >= 0) {
                        tasks[index].message = `approvedResponse.message`;
                      }

                      setTasks(tasks);
                      setApproved(false);
                    }
                  }
                }}
              >
                Approve
              </button>
            </span>
          </div>
        );
      }

      return (
        <div
          key={id}
          style={{
            padding: "5px",
            background: "white",
            borderRadius: "5px",
            border: "1px solid rgba(0, 0, 0, 5)",
            fontSize: "small",
            margin: "15px 0px 0px 100px",
            boxShadow: "1px 1px 2px rgba(0, 0, 0, .25)",
            width: "800px",
          }}
        >
          <div
            style={{
              fontSize: "large",
              fontWeight: 600,
              padding: "0px 2px 30px 0px",
            }}
          >
            <span
              style={{
                fontSize: "large",
                fontWeight: "bold",
                padding: "0px 2px 2px 20px",
              }}
            >
              {"Task:  "}
            </span>
            <span
              style={{
                fontSize: "large",
                fontWeight: 600,
                padding: "0px 2px 2px 0px",
              }}
            >
              {" "}
              {task}
            </span>

            <span
              style={{
                fontSize: "large",
                fontWeight: "bold",
                padding: "0px 2px 2px 300px",
              }}
            >
              Task Amount:
            </span>
            <span
              style={{
                fontSize: "large",
                fontWeight: 600,
                padding: "0px 2px 200px 0px",
              }}
            >
              {" "}
              {amount}
            </span>
          </div>
          <div className={styles.gridcontainer}>
            <div className={styles.griditem}>{projectSummaryComponents}</div>
            <div className={styles.griditem}>
              {amountsComponents}
              {statusComponents}
            </div>
          </div>

          <div style={{ padding: "0px 2px 5px 20px" }}>{buttonRow}</div>
          <div
            style={{
              padding: "0px 2px 20px 20px",
              color: "red",
              whiteSpace: "pre",
            }}
          >
            {message}
          </div>
          <div>
            <div>{distributeComponents}</div>
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
        <h1 className={styles.title}> Approve Tasks </h1>
      </div>

      <main>
        {connection.status === "connected" && (
          <div>
            <div
              style={{
                fontWeight: "bold",
                padding: "0px 2px 2px 350px",
              }}
            >
              <span>Total Approved Amount: </span>
              <span>{totalApprovedAmt.toFixed(2)}</span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "small",
                  fontStyle: "italic",
                  padding: "100px 5px 2px 370px",
                }}
              >
                (All amounts are in USDC)
              </span>
            </div>
            <div>{tasksComponent}</div>
            <div
              style={{
                margin: 0.0,
                padding: 10.0,
              }}
            ></div>
          </div>
        )}
      </main>
    </>
  );

  return myLayout;
}
