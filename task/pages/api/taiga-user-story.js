const TOKEN = process.env.TAIGA_TOKEN;
const PROJECT_ID = process.env.TAIGA_PROJECT_ID;

export default async function handler(req, res) {
  if (req.method == "GET") {
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
    const userStoryList = getModel(taigaUserStoryList);
    return res.status(200).json(userStoryList);
  } else {
    return res.status(500).json("{message: not supported");
  }
}
function getModel(taigaUserStoryList) {
  var userStoryList = {
    tasks: [],
  };

  for (let i = 0; i < taigaUserStoryList.length; i++) {
    const summedPoints = getPoints(taigaUserStoryList[i].points);
    const pointsFactor = process.env.TAIGA_POINTS_FACTOR;
    const claimAmount = (pointsFactor * summedPoints).toFixed(2);

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
