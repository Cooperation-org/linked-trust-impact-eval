import { CeramicClient } from "@ceramicnetwork/http-client";
import { writeEncodedCompositeRuntime } from "@composedb/devtools-node";

const ceramic = new CeramicClient("http://localhost:7007");
try {
  await writeEncodedCompositeRuntime(
    ceramic,
    "claim-composite.json",
    "__generated__/definition.js"
  );
  console.log(
    "Successfully created runtime definition file at __generated__/definition.js"
  );
} catch (err) {
  console.error(err);
  process.exit(1);
}
