// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    Claim: {
      id: "kjzl6hvfrbw6c5pfgu3i3gwnw9ml34806mbdgdvuxnduy5dlo5ft34eix8nkr2m",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    Claim: {
      by: { type: "string", required: true },
      claim: { type: "string", required: true },
      round: { type: "string", required: true },
      credit: { type: "integer", required: true },
      signed_by: { type: "view", viewType: "documentAccount" },
    },
  },
  enums: {},
  accountData: { claimList: { type: "connection", name: "Claim" } },
};