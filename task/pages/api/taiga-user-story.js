import UserStory from "../../models/taiga-model";
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
    console.log(
      `Taiga UserStory Response:  ${JSON.stringify(taigaUserStoryList)} `
    );
    const userStoryList = getModel(taigaUserStoryList);
    return res.status(200).json(userStoryList);
  }
}
function getModel(taigaUserStoryList) {
  console.log(`UserStoryList length:  ${taigaUserStoryList.length.toString()}`);
  var userStoryList = {
    tasks: [],
  };
  const summedPoints = getPoints(taigaUserStoryList[0].points);
  console.log(`Points Calculated:  ${summedPoints}`);
  for (let i = 0; i < taigaUserStoryList.length; i++) {
    userStoryList.tasks[i] = {
      id: taigaUserStoryList[i].id,
      task: taigaUserStoryList[i].subject,
      owner: taigaUserStoryList[i].owner_extra_info.username,
      effectiveDate: String(taigaUserStoryList[i].finish_date).substring(0, 10),
      claimedBy: taigaUserStoryList[i].assigned_to_extra_info.username,
      subject: taigaUserStoryList[i].project_extra_info.name,
      amount: summedPoints,
    };
  }

  console.log(`UserStory subject:   ${taigaUserStoryList[0].subject}`);
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
    console.log(`NewVal:  ${newVal}`);
    points += parseInt(newVal);
  }
  console.log(`Summed Points:  ${points}`);
  return points;
}
