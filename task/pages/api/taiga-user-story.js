let wallets = require("../../data/user_wallets.json");
const TOKEN = process.env.TAIGA_TOKEN;
const PROJECT_ID = process.env.TAIGA_PROJECT_ID;

export default async function handler(req, res) {
  if (req.method == "GET") {
    let userStoryList = [];
    let projectDetail = [];

    if (req.query.status === "ready") {
      userStoryList = await getReadyTaigaUserStory();
    } else if (req.query.status === "closed") {
      userStoryList = await getClosedTaigaUserStory();
    }
    projectDetail = await getTaigaProject();
    const reviewDetail = { projectDetail, userStoryList };
    return res.status(200).json(reviewDetail);
  } else {
    return res.status(500).json("{message: not supported");
  }
}

// Call the Taiga API to retrieve closed user stories for the project
async function getClosedTaigaUserStory() {
  let url = `https://taiga.whatscookin.us/api/v1/userstories`;
  const response = await fetch(
    `${url}?project=${PROJECT_ID}&status__is_closed=true`,

    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const taigaUserStoryList = await response.json();
  const userStoryList = getTaskModel(taigaUserStoryList, url, "Task Complete");
  return userStoryList;
}
// Call the Taiga API to retrieve closed user stories for the project
async function getReadyTaigaUserStory() {
  let url = `https://taiga.whatscookin.us/api/v1/userstories`;
  const response = await fetch(
    `${url}?project=${PROJECT_ID}&status__is_closed=false`,

    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const taigaUserStoryList = await response.json();
  const userStoryList = getTaskModel(taigaUserStoryList, url, "Needs Approval");
  return userStoryList;
}

// Call the Taiga API to retrieve closed user stories for the project
async function getTaigaProject() {
  const response = await fetch(
    `https://taiga.whatscookin.us/api/v1/projects/${PROJECT_ID}`,

    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const taigaUserProject = await response.json();
  const projectDetail = getProjectModel(taigaUserProject);
  return projectDetail;
}

function getTaskModel(taigaUserStoryList, url, status) {
  var userStoryList = {
    tasks: [],
  };

  for (let i = 0; i < taigaUserStoryList.length; i++) {
    const summedPoints = getPoints(taigaUserStoryList[i].points);
    const pointsFactor = process.env.TAIGA_POINTS_FACTOR;
    const claimAmount = (pointsFactor * summedPoints).toFixed(2);

    let source = `${url}/${taigaUserStoryList[i].id}`;

    let claimedBy = "NONE";
    if (taigaUserStoryList[i].assigned_to_extra_info != null) {
      if (taigaUserStoryList[i].assigned_to_extra_info.username != null) {
        claimedBy = taigaUserStoryList[i].assigned_to_extra_info.username;
      }
    }

    let owner = "NONE";
    if (taigaUserStoryList[i].owner_extra_info != null) {
      if (taigaUserStoryList[i].owner_extra_info.username != null) {
        owner = taigaUserStoryList[i].owner_extra_info.username;
      }
    }

    userStoryList.tasks[i] = {
      id: taigaUserStoryList[i].id,
      task: taigaUserStoryList[i].subject,
      owner: taigaUserStoryList[i].owner_extra_info.username,
      effectiveDate: String(taigaUserStoryList[i].finish_date).substring(0, 10),
      claimedBy: claimedBy,
      owner: owner,
      project: taigaUserStoryList[i].project_extra_info.name,
      source: source,
      amount: claimAmount,
      taskStatus: status,
      approvedAmount: 0,
      distributedAmount: 0,
      message: "",
      subject: "",
    };
  }

  return userStoryList;
}

function getProjectModel(taigaProjectDetail) {
  var projectDetail = {
    users: [],
  };

  projectDetail.name = taigaProjectDetail.name;

  // Get the members for this project
  var taigaMemberList = taigaProjectDetail.members;

  for (let i = 0; i < taigaMemberList.length; i++) {
    let walletAddress = getUserWallets(taigaMemberList[i].full_name_display);

    projectDetail.users[i] = {
      id: taigaMemberList[i].id,
      roleName: taigaMemberList[i].role_name,
      fullName: taigaMemberList[i].full_name,
      fullNameDisplay: taigaMemberList[i].full_name_display,
      userName: taigaMemberList[i].username,
      photo: taigaMemberList[i].photo,
      walletAddress: walletAddress,
    };
  }

  return projectDetail;
}

function getPoints(pointsList) {
  var keys = [];

  Object.keys(pointsList).forEach(function (key) {
    if (keys.indexOf(key) == -1) {
      keys.push(key);
    }
  });

  var points = 0;
  for (let i = 0; i < keys.length; i++) {
    var newVal = pointsList[keys[i]];
    points += parseInt(newVal);
  }

  return points;
}
function getUserWallets(userName) {
  return wallets[userName].wallet;
}
