const TOKEN = process.env.TAIGA_TOKEN;
const PROJECT_ID = process.env.TAIGA_PROJECT_ID;

export default async function handler(req, res) {
  if (req.method == "GET") {
    const userStoryList = await getTaigaUserStory();
    //console.log(`UserStoryList: ${JSON.stringify(userStoryList)}`);
    const projectDetail = await getTaigaProject();
    //console.log(
    //  `taiga-user-story:handler - projectDetail length:  ${projectDetail.users.length}`
    //);
    const reviewDetail = { projectDetail, userStoryList };
    //console.log(`reviewDetail:  ${JSON.stringify(reviewDetail)}`);
    return res.status(200).json(reviewDetail);
  } else {
    return res.status(500).json("{message: not supported");
  }
}

// Call the Taiga API to retrieve closed user stories for the project
async function getTaigaUserStory() {
  const response = await fetch(
    `https://taiga.whatscookin.us/api/v1/userstories?project=${PROJECT_ID}&status__is_closed=true`,

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
  const userStoryList = getTaskModel(taigaUserStoryList);
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
  console.log(
    `taiga-user-story:getTaigaProject - project name: ${projectDetail.name}`
  );
  console.log(
    `taiga-user-story:getTaigaProject - member length: ${projectDetail.users.length}`
  );
  return projectDetail;
}

function getTaskModel(taigaUserStoryList) {
  var userStoryList = {
    tasks: [],
  };

  for (let i = 0; i < taigaUserStoryList.length; i++) {
    const summedPoints = getPoints(taigaUserStoryList[i].points);
    const pointsFactor = process.env.TAIGA_POINTS_FACTOR;
    const claimAmount = (pointsFactor * summedPoints).toFixed(2);

    console.log(`Task ID:  ${taigaUserStoryList[i].id}`);

    userStoryList.tasks[i] = {
      id: taigaUserStoryList[i].id,
      task: taigaUserStoryList[i].subject,
      owner: taigaUserStoryList[i].owner_extra_info.username,
      effectiveDate: String(taigaUserStoryList[i].finish_date).substring(0, 10),
      claimedBy: taigaUserStoryList[i].assigned_to_extra_info.username,
      project: taigaUserStoryList[i].project_extra_info.name,
      amount: claimAmount,
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
    projectDetail.users[i] = {
      id: taigaMemberList[i].id,
      roleName: taigaMemberList[i].role_name,
      fullName: taigaMemberList[i].full_name,
      fullNameDisplay: taigaMemberList[i].full_name_display,
      userName: taigaMemberList[i].username,
      photo: taigaMemberList[i].photo,
      walletAddress: "",
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
