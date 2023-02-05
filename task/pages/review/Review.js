import { useEffect, useState } from "react";
import styles from "../../styles/Review.module.css";
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
const memberVal = "";
var root_claim_id = " ";

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

export default function Review() {
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
  const [inputFields, setInputFields] = useState([
    {
      member: "",
      amount: 0,
      streamId: "",
      submitted: false,
      subject: "<wallet>",
    },
  ]);
  const [connection] = useViewerConnection();

  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetch("/api/taiga-user-story")
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
  let commitButton;

  const handleFormChange = (index, event) => {
    let data = [...inputFields];
    data[index][event.target.name] = event.target.value;
    let summedAmt = 0;
    for (let i = 0; i < data.length; i++) {
      summedAmt += Number(data[i].amount);
      console.log(`summedAmount:  ${summedAmt}`);
    }

    // Update the distributed amount
    let newTasks;
    let i = tasks.findIndex((task) => task.id === activeTask.id);
    if (i >= 0) {
      newTasks = tasks;
      newTasks[i].distributedAmount = summedAmt;
      setTasks(newTasks);
    } else {
      console.log(
        `Did not finding matching task for activeTask.id:  ${activeTask.id}.  Index = ${i}`
      );
      for (let i = 0; i < tasks.length; i++) {
        console.log(`Task id:  ${tasks[i].id}`);
      }
    }
    // Update State Fields
    setInputFields(data);
  };

  const addFields = () => {
    let newfield = { member: "", amount: 0 };
    setInputFields([...inputFields, newfield]);
  };
  const removeFields = (index) => {
    let data = [...inputFields];
    data.splice(index, 1);
    setInputFields(data);
  };
  const submit = async (e) => {
    e.preventDefault();

    console.log(inputFields);
    console.log(
      `submit: Creating earned claim for ${inputFields.length} members`
    );
    // Identify the task we are actively working on
    let index = tasks.findIndex((task) => task.id === activeTask.id);
    let newTasks = tasks;
    if (index >= 0) {
      console.log(
        `submitted:  Found Task for index ${index} and TaskID:  ${newTasks[index].id}`
      );
      // We don't want to process the same task twice...so confirm
      if (tasks[index].taskStatus === "Submitted") {
        return alert(`This task has already been submitted`);
      } else {
        let newTotalDistributeAmt = totalDistributedAmt;
        for (let i = 0; i < inputFields.length; i++) {
          console.log(`submit: member:  ${inputFields[i].member}`);
          if (inputFields[i].member === "" || inputFields[i].amount <= 0) {
            return alert(`Please select a user and provide a non-zero amount`);
          }
          const compose = await getCompose(connection.selfID.did);
          // Create an "Earned" Claim for each member
          const earned_variables = {
            claim: activeTask.task,
            subject: "<wallet address>",
            amount: parseInt(inputFields[i].amount),
            amountUnits: "ETH",
            source: activeTask.source,
            effective_date: activeTask.effectiveDate,
            rootClaimID,
          };
          const earnedResponse = await createClaim(compose, earned_variables);
          if (earnedResponse.message == "SUCCESS") {
            newTasks[
              index
            ].message += `\r\nEarned Stream ID for ${inputFields[i].member}: ${earnedResponse.streamID}`;
            newTasks[index].taskStatus = "Submitted";
            newTotalDistributeAmt += Number(inputFields[i].amount);
          } else {
            // There was an error creating the Earned claim
            console.log(
              `submit:ERROR creating earned claim:  ${earnedResponse.message} `
            );
            newTasks[
              index
            ].message = `Approved Stream:  ${rootClaimID}. Failed to create Earned Claim for  with error:  ${earnedResponse.message}`;
            newTasks[index].taskStatus = "Failed";
          }
        }
        setTotalDistributedAmt(newTotalDistributeAmt);
        setApproved(false);
      }
      setTasks(newTasks);
      let newInputFields = [
        {
          member: "",
          amount: 0,
          streamId: "",
          submitted: false,
          subject: "<wallet>",
        },
      ];
      setInputFields(newInputFields);
    }
  };

  if (tasks.length > 0) {
    tasksComponent = tasks.map((taskInDB) => {
      const {
        id,
        task,
        claimedBy,
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
            <span style={{ fontWeight: "bold" }}>Claimant:</span>
            <span
              style={{
                padding: "0px 0px 0px 8px",
              }}
            >
              {"  "}
            </span>
            <span> {claimedBy}</span>
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
              Approved Amount:
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
            <span style={{ fontWeight: "bold", padding: "0px 0px 0px 23px" }}>
              Distributed Amount:
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
                padding: "0px 100px 0px 4px",
              }}
            >
              {distributedAmount.toFixed(2)}
            </span>
          </div>

          <div>
            <span style={{ fontWeight: "bold", padding: "0px 0px 0px 36px" }}>
              Available Amount:
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
      if (id === showDistributeTo) {
        // build the option element for each user
        let optionsArray = [];
        optionsArray[0] = (
          <option key={0} value={`<Select User>`}>
            {`<Select User>`}
          </option>
        );
        let memberDistributionRow = <div></div>;

        // Build the Member Distribution Row if the task has a submitted status
        if (taskStatus !== "Submitted") {
          for (let i = 0; i < users.length; i++) {
            optionsArray[i + 1] = (
              <option key={i + 1} value={users[i].fullNameDisplay}>
                {users[i].fullNameDisplay}
              </option>
            );
          }
          memberDistributionRow = (
            <div>
              <form onSubmit={submit}>
                {inputFields.map((input, index) => {
                  return (
                    <div key={index}>
                      <span
                        style={{
                          fontSize: "small",
                          fontWeight: "bold",
                          padding: "20px 20px 2px 20px",
                        }}
                      >
                        <select
                          name="member"
                          value={input.member}
                          onChange={(event) => handleFormChange(index, event)}
                        >
                          <>{optionsArray}</>
                        </select>
                      </span>
                      <span
                        style={{
                          fontSize: "small",
                          fontWeight: "bold",
                          padding: "0px 2px 2px 100px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Amount"
                          name="amount"
                          value={input.amount}
                          onChange={(event) => handleFormChange(index, event)}
                        />
                      </span>
                      <span
                        style={{
                          fontSize: "small",
                          fontWeight: "bold",
                          padding: "0px 2px 2px 100px",
                        }}
                      >
                        <button onClick={() => removeFields(index)}>
                          Remove
                        </button>
                      </span>
                    </div>
                  );
                })}
              </form>
              <div style={{ padding: "25px 2px 25px 250px" }}>
                <span style={{ padding: "0px 2px 3px 0px" }}>
                  <button className={styles.btn} onClick={addFields}>
                    Add
                  </button>
                </span>
                <span style={{ padding: "25px 2px 25px 0px" }}>
                  <button className={styles.btn} onClick={submit}>
                    Submit
                  </button>
                </span>
              </div>
            </div>
          );
          //}

          // build distribute components
          distributeComponents = (
            <div>
              <div
                style={{
                  fontSize: "medium",
                  fontWeight: "bold",
                  padding: "0px 2px 15px 100px",
                }}
              >
                <span
                  style={{
                    fontSize: "medium",
                    fontWeight: "bold",
                    padding: "0px 2px 20px 0px",
                  }}
                >
                  Remaining funds to be distributed:
                </span>
                <span
                  style={{
                    fontSize: "medium",
                    fontWeight: "bold",
                    padding: "0px 2px 20px 20px",
                  }}
                >
                  {(approvedAmount - distributedAmount).toFixed(2)}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "large",
                    fontWeight: "bold",
                    padding: "0px 2px 15px 50px",
                  }}
                >
                  Member
                </span>
                <span
                  style={{
                    fontSize: "large",
                    fontWeight: "bold",
                    padding: "0px 2px 2px 200px",
                  }}
                >
                  Amount
                </span>
              </div>
              {memberDistributionRow}
            </div>
          );
        }
      } else {
        if (taskStatus !== "Submitted") {
          // Add button row
          buttonRow = (
            <div
              style={{
                paddingTop: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span style={{ padding: "25px 2px 25px 0px" }}>
                <button
                  className={styles.btn}
                  onClick={async () => {
                    if (approved) {
                      let index = tasks.findIndex(
                        (task) => task.id === activeTask.id
                      );

                      if (index >= 0) {
                        tasks[index].message = "Task has already been approved";
                      }
                      setTasks(tasks);
                    } else {
                      const confirmBox = window.confirm(
                        `Confirm approval of full amount ${amount}`
                      );
                      if (confirmBox === true) {
                        const compose = await getCompose(connection.selfID.did);

                        // Create the "Approved" Claim
                        const approvedVariables = {
                          claim: task,
                          subject: subject,
                          amount: Number(credit),
                          amountUnits: "ETH",
                          source: source,
                          effective_date: effectiveDate,
                          root_claim_id,
                        };

                        const approvedResponse = await createClaim(
                          compose,
                          approvedVariables
                        );
                        if (approvedResponse.message == "SUCCESS") {
                          console.log("Approved Review - Success!");
                          root_claim_id = approvedResponse.streamID;
                          setRootClaimID(approvedResponse.streamID);
                          setActiveTask({
                            task: task,
                            id: id,
                            effectiveDate: effectiveDate,
                            source: source,
                          });

                          console.log(`Active Task ID:  ${id}`);
                          let index = tasks.findIndex((item) => item.id === id);
                          console.log(`Index value:  ${index}`);
                          if (index >= 0) {
                            console.log("setting task status to Approved");
                            tasks[index].taskStatus =
                              "Approved and Ready to Distribute";
                            tasks[index].approvedAmount = Number(amount);
                            tasks[
                              index
                            ].message = `Approved Stream ID:  ${approvedResponse.streamID}`;
                          }
                          setTasks(tasks);
                          setApproved(true);
                          setShowDistributeTo(id);
                        } else {
                          // There was an error created the Approved Claim
                          console.log(
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
                    }
                  }}
                >
                  Approve
                </button>
              </span>
            </div>
          );
        }
      }

      return (
        <div
          key={id}
          style={{
            padding: "5px",
            background: "white",
            borderRadius: "5px",
            fontSize: "small",
            margin: "15px 10px 100px 100px",
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
              {task} {" - "}
              {id}
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

          <div style={{ padding: "25px 2px 5px 20px" }}>{buttonRow}</div>
          <div
            style={{
              padding: "25px 2px 25px 20px",
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
        <h1 className={styles.title}> Review page </h1>
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
              <span>Total Distributed Amount: </span>
              <span>{totalDistributedAmt}</span>
            </div>
            <div>{tasksComponent}</div>
            <div
              style={{
                margin: 0.0,
                padding: 10.0,
              }}
            >
              <p></p>
            </div>
          </div>
        )}
      </main>
    </>
  );

  return myLayout;
}
