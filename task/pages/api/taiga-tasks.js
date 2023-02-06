const TOKEN = process.env.TAIGA_TOKEN;
const TASK_ID = 26;
const PROJECT_SLUG = "grant-impact-evaluator-project";

export default async function handler(req, res) {
  if (req.method == "GET") {
    const response = await fetch(
      `https://taiga.whatscookin.us/api/v1/tasks/by_ref?ref=${TASK_ID}\&project__slug=${PROJECT_SLUG}`,
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
    const taskList = await response.json();

    return res.status(200).json(taskList);
  }
}
