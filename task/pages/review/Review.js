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
  });
  //const [approvedAmount, setApprovedAmt] = useState(0);
  const [approved, setApproved] = useState(false);
  //const [submitted, setSubmitted] = useState(false);
  //const [statusMessage, setTaskStatus] = useState("Needs Approval");
  const [distributedAmount, setDistributedAmt] = useState(0.0);
  const [inputFields, setInputFields] = useState([
    {
      member: "",
      amount: 0,
      streamId: "",
      submitted: false,
      wallet: "<wallet>",
    },
  ]);
  const [connection] = useViewerConnection();
  const [message, setMessage] = useState("");
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

    setInputFields(data);
    // Update the distributed amount
    let newTasks;
    let i = tasks.findIndex((task) => task.id === activeTask.id);
    if (i <= 0) {
      newTasks = tasks;
      newTasks[i].distributedAmount = summedAmt;
      setTasks(newTasks);
      //setDistributedAmt(summedAmt);
    }
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
        for (let i = 0; i < inputFields.length; i++) {
          console.log(`submit: member:  ${inputFields[i].member}`);
          if (inputFields[i].member === "" || inputFields[i].amount <= 0) {
            return alert(`Please select a user and provide a non-zero amount`);
          }
          const compose = await getCompose(connection.selfID.did);
          // Create an "Earned" Claim for each member
          const earned_variables = {
            claim: activeTask.task,
            subject: inputFields[i].wallet,
            amount: parseInt(inputFields[i].amount),
            effective_date: activeTask.effectiveDate,
            rootClaimID,
          };
          const earnedResponse = await createClaim(compose, earned_variables);
          if (earnedResponse.message == "SUCCESS") {
            console.log("submit: Review Earned - Success!");

            console.log(
              `submit: Index:  ${index}, activeTaskId:  ${activeTask.id}`
            );

            newTasks[
              index
            ].message += `\r\n Earned Stream ID for ${inputFields[i].member}: ${earnedResponse.streamID}`;
            newTasks[index].taskStatus = "Submitted";

            //setTasks(newTasks);
          } else {
            // There was an error creating the Earned claim
            newTasks[
              index
            ].message = `Approved Stream:  ${rootClaimID}. Failed to create Earned Claim for  with error:  ${earnedResponse.message}`;
            newTasks[index].taskStatus = "Failed";
            //setTasks(newTasks);
          }
        }
      }
      console.log(`Submit Task Status:  ${newTasks[index].taskStatus}`);
      setTasks(newTasks);
      let newInputFields = inputFields;
      setInputFields(newInputFields);
    }
  };

  if (tasks.length > 0) {
    console.log(`Approved value:  ${approved}`);
    for (let i = 0; i < tasks.length; i++) {
      console.log(
        `Task ${tasks[i].task} and task Status ${tasks[i].taskStatus}`
      );
    }
    tasksComponent = tasks.map((taskInDB) => {
      const {
        id,
        task,
        claimedBy,
        project,
        amount,
        effectiveDate,
        taskStatus,
        approvedAmount,
        distributedAmount,
        message,
      } = taskInDB;
      //const acc = claimedBy.slice(0, 4) + "..." + claimedBy.slice(34);

      if (projectName == "") {
        setProjectName(project);
      }
      distributeComponents = <p></p>;
      var subject = "<wallet address>";

      // Show the AmountsComponents
      if (id === activeTask.id) {
        console.log(`activeTaskId:  ${activeTask.id} and id is ${id}`);
        amountsComponents = (
          <div>
            <div>
              <span
                style={{
                  fontWeight: "bold",
                  padding: "0px 2px 2px 500px",
                }}
              >
                Approved Amount:
              </span>
              <span
                style={{
                  fontWeight: 600,
                  padding: "0px 2px 200px 0px",
                }}
              >
                {approvedAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontWeight: "bold",
                  padding: "0px 2px 2px 500px",
                }}
              >
                Distributed Amount:
              </span>
              <span
                style={{
                  fontWeight: 600,
                  padding: "0px 2px 200px 0px",
                }}
              >
                {" "}
                {distributedAmount.toFixed(2)}
              </span>
            </div>

            <div>
              <span
                style={{
                  fontWeight: "bold",
                  padding: "0px 2px 2px 500px",
                }}
              >
                Available Amount:
              </span>
              <span
                style={{
                  fontWeight: 600,
                  padding: "0px 2px 200px 0px",
                }}
              >
                {" "}
                {(amount - distributedAmount).toFixed(2)}
              </span>
            </div>
          </div>
        );
      } else {
        console.log(`activeTaskId:  ${activeTask.id} and id is ${id}`);
        // don't show the amountsComponents
        amountsComponents = <div></div>;
      }

      // Show the DistributeTo components
      if (id === showDistributeTo) {
        console.log(`id:  ${id} and showDistributeTo:  ${showDistributeTo}`);
        console.log(
          `Line297 tasks.map cb Status for task ${task}:  ${taskStatus}`
        );
        // build the option element for each user
        let optionsArray = [];
        optionsArray[0] = (
          <option key={0} value={`<Select User>`}>
            {`<Select User>`}
          </option>
        );

        for (let i = 0; i < users.length; i++) {
          optionsArray[i + 1] = (
            <option key={i + 1} value={users[i].fullNameDisplay}>
              {users[i].fullNameDisplay}
            </option>
          );
        }
        if (inputFields.length !== 0) {
          let memberDistributionRow = (
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
                //style={{ backgroundColor: approved ? "#3498db;" : "#5d6062" }}
                //className={!approved ? "styles.btn" : "style.btn"}
                className={styles.btn}
                onClick={async () => {
                  if (approved) {
                    let index = tasks.findIndex(
                      (task) => task.id === activeTask.id
                    );
                    console.log(
                      `Index:  ${index}, activeTaskId:  ${activeTask.id}`
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
                        //setTaskStatus("Approved and Ready to Distribute");
                        setApproved(true);
                        //setApprovedAmt(Number(amount));
                        console.log("ComposeDB Approved executeQuery complete");
                      } else {
                        console.log(
                          `onClick bad response: ${approvedResponse.errors}`
                        );

                        let index = tasks.findIndex((item) => item.id === id);
                        console.log(`Index value:  ${index}`);
                        if (index >= 0) {
                          tasks[index].message = `approvedResponse.message`;
                        }
                        setTasks(tasks);

                        //setMessage(approvedResponse.message);
                        setApproved(false);
                      }
                    }
                  }
                }}
              >
                Approve
              </button>
            </span>
            <span style={{ padding: "25px 2px 25px 0px" }}>
              <button
                className={styles.btn}
                onClick={async () => {
                  if (!approved) {
                    setMessage("Task Amount must first be approved");
                  } else {
                    setShowDistributeTo(id);
                  }
                }}
              >
                Distribute
              </button>
            </span>
          </div>
        );
      }
      console.log(
        `Line545 tasks.map cb Status for task ${task}:  ${taskStatus}`
      );
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
                padding: "0px 2px 2px 0px",
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
                padding: "0px 2px 2px 400px",
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
          {amountsComponents}
          <div>
            <span
              style={{
                fontWeight: "bold",
                padding: "0px 2px 2px 500px",
              }}
            >
              Status:
            </span>
            <span
              style={{
                color: "red",
                fontWeight: 600,
                padding: "0px 2px 200px 0px",
              }}
            >
              {" "}
              {taskStatus}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "small", fontWeight: "bold" }}>
              {"Project:   "}
            </span>
            <span style={{ fontSize: "small" }}>{projectName}</span>
          </div>

          <div style={{ padding: "0px 2px 3px 0px" }}>
            <span style={{ fontWeight: "bold" }}>Claimant:</span>
            <span style={{ fontWeight: 600 }}> {claimedBy}</span>
          </div>

          <div style={{ padding: "0px 2px 3px 0px" }}>
            <span style={{ fontWeight: "bold" }}>Wallet:</span>
            <span style={{ fontWeight: 600 }}> {`<wallet address>`}</span>
          </div>

          <div style={{ padding: "5px 2px 5px 0px" }}>
            <span style={{ fontWeight: "bold" }}>Effective Date:</span>
            <span style={{ fontWeight: 600 }}> {effectiveDate}</span>
          </div>

          <div style={{ padding: "25px 2px 5px 0px" }}>{buttonRow}</div>
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
