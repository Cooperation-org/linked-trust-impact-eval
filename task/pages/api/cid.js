import { CeramicClient } from "@ceramicnetwork/http-client";
// import { NextApiRequest, NextApiResponse } from "next";
const API_URL = process.env.CERAMIC_URL;
const ceramic = new CeramicClient(API_URL);

export default async function handler(req, res) {
  console.log("This is the handler");
  console.log(JSON.parse(req.body));
  const { streamID } = JSON.parse(req.body);
  console.log(streamID);
  const stream = await ceramic.loadStream(streamID);
  const streamLog = stream.state.log;
  console.log("streamLog", streamLog);
  res.status(200).json(streamLog);
  // console.log("request body", req.body);
  // res.status(200).json({ message: "Hey! we are here" });
}
