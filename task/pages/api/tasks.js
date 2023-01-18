import { prisma } from "../../db";

export default async function handler(req, res) {
  console.log(req.body);
  if (req.method === "GET") {
    const tasks = await prisma.task.findMany();
    return res.status(200).json({ tasks });
  }
  if (req.method === "POST") {
    const taskData = JSON.parse(req.body);
    const strTaskData = JSON.stringify(taskData);
    console.log(`api:tasks taskData:  ${strTaskData}`);
    const tasks = await prisma.task.findMany();
    await prisma.task.create({
      data: taskData,
    });
    return res.status(200).json({ tasks });
  }
  if (req.method === "DELETE") {
    console.log(`api:tasks:delete - ${req.body}`);
    const taskData = JSON.parse(req.body);
    console.log(
      `api:tasks:delete - DELETE Task Data - ${JSON.stringify(taskData)}`
    );
    const deleteTask = await prisma.task.deleteMany({
      where: {
        id: taskData,
      },
    });
    console.log(`Delete Message:  ${deleteTask}`);
    return res.status(200).json({ taskData });
  }

  /*
  const deleteUser = await prisma.user.delete({
  where: {
    email: 'bert@prisma.io',
  },
})
  */
  res.status(500).json({ message: "Something went wrong!" });
}
