import { CeramicClient } from "@ceramicnetwork/http-client";
import { NextApiRequest, NextApiResponse } from "next";
const API_URL = process.env.CERAMIC_URL;
const ceramic = new CeramicClient(API_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stream = await ceramic.loadStream(req.body);
  var cids: (string | string)[] = [];
  for (let i = 0; i < stream.state.log.length; i++) {
    cids[i] += { cid: [stream.state.log[i].cid.toString()] };
  }
  const cidStr = stream.state.log[1].cid.toString();
  const cidJson = { cid: cidStr };
  return res.status(200).json(stream.state.log[1].cid.toString());
}
