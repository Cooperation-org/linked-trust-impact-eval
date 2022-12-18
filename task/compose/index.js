import { ComposeClient } from "@composedb/client";
import { definition } from "../__generated__/definition";

export const getCompose = async (did) => {
  const compose = new ComposeClient({
    ceramic: "http://localhost:7007",
    definition,
  });

  await did.authenticate();
  compose.setDID(did);

  return compose;
};
