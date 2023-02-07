// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    IEClaim: {
      id: "kjzl6hvfrbw6c66jh4zydcz4cli1309rpvji20gr6kzqnm0raohx3c6oj120qec",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    IEClaim: {
      claim: { type: "string", required: false },
      amount: { type: "integer", required: false },
      aspect: { type: "string", required: false },
      object: { type: "string", required: false },
      rating: { type: "float", required: false },
      source: { type: "string", required: false },
      subject: { type: "string", required: false },
      respondAt: { type: "string", required: false },
      statement: { type: "string", required: false },
      confidence: { type: "float", required: false },
      amountUnits: { type: "string", required: false },
      rootClaimId: { type: "string", required: false },
      effectiveDate: { type: "integer", required: true },
      digestMultibase: { type: "string", required: false },
      intendedAudience: { type: "string", required: false },
      claimSatisfactionStatus: { type: "string", required: false },
    },
  },
  enums: {},
  accountData: { ieClaimList: { type: "connection", name: "IEClaim" } },
};
