import { CeramicClient } from "@ceramicnetwork/http-client";
import { readEncodedComposite } from "@composedb/devtools-node";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

const compositeFileName = "claim-composite.json";
const privateKey = fromString(
  "59e83c249b8947d1524a3f5f66326c78759c86d75573027e7bef571c3fddfb90",
  "base16"
);

const did = new DID({
  resolver: getResolver(),
  provider: new Ed25519Provider(privateKey),
});

try {
  await did.authenticate();
} catch (err) {
  console.error(`Failed to authenticate did - ${err?.message}`);
  process.exit(1);
}

const ceramic = new CeramicClient("http://localhost:7007");
ceramic.did = did;

let composite;
try {
  composite = await readEncodedComposite(ceramic, compositeFileName);
} catch (err) {
  console.error(
    `Error while trying to read encoded composite - ${err?.message}`
  );
  process.exit(1);
}

try {
  await composite.startIndexingOn(ceramic);
} catch (err) {
  console.error(
    `Error while trying to notify the node to index the models - ${err?.message}`
  );
  process.exit(1);
}
