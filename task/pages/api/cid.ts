import { CeramicClient } from "@ceramicnetwork/http-client";
import { NextApiRequest, NextApiResponse } from "next";
const API_URL = process.env.CERAMIC_URL;
const ceramic = new CeramicClient(API_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stream = await ceramic.loadStream(req.body);
  const streamLog = stream.state.log;
  res.status(200).json(streamLog);
}
