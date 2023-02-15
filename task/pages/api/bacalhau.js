import path from "path";
import { promises as fs, existsSync, mkdirSync } from "fs";
import { Web3Storage, getFilesFromPath } from "web3.storage";

const token = process.env.WEB3STORAGE_API_KEY;
const storage = new Web3Storage({ token });

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { claims, limit } = req.body;

    for (const claim of claims) {
      if (!claim["rootClaimId"]) {
        claim["rootClaimId"] = "";
      }
    }

    const fileContent = JSON.stringify({ limit, claims });

    const targetDirectory = path.join(process.cwd(), "claims");
    if (!existsSync(targetDirectory)) {
      mkdirSync(targetDirectory);
    }
    const pathToFile = targetDirectory + "/claims.json";
    let cid;
    try {
      await fs.writeFile(pathToFile, fileContent);
      const file = await getFilesFromPath(pathToFile);
      cid = await storage.put(file);
    } catch (err) {
      return res.status(500).json({ message: "Something went wrong!" });
    }

    return res.status(200).json({ cid });
  }
  res.status(500).json({ message: "Something went wrong!" });
}
