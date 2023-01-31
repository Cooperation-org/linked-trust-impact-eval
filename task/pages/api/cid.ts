import { CeramicClient } from "@ceramicnetwork/http-client";
import { NextApiRequest, NextApiResponse } from "next";
const API_URL = process.env.CERAMIC_URL;
const ceramic = new CeramicClient(API_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stream = await ceramic.loadStream(req.body);
  //console.log(`CID:  ${stream.state.log[0].cid} `);
  var cids: (string | string)[] = [];
  console.log(`stream log length:  ${stream.state.log.length}`);
  for (let i = 0; i < stream.state.log.length; i++) {
    cids[i] += { cid: [stream.state.log[i].cid.toString()] };
  }
  console.log(JSON.stringify(cids));
  const cidStr = stream.state.log[1].cid.toString();
  const cidJson = { cid: cidStr };
  console.log(`CID JSON:  ${JSON.stringify(cidJson)}`);
  return res.status(200).json(stream.state.log[1].cid.toString());
}
