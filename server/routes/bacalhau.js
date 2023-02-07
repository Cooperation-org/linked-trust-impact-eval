var express = require("express");
var router = express.Router();
const { execSync } = require("node:child_process");

router.post("/", function (req, res, next) {
  const body = req.body;
  const cid = body.cid;

  try {
    const cmd = "bash bacalhau.sh " + cid;
    execSync(cmd);
  } catch (err) {
    console.error(`error: ${err.message}`);
    return res.status(500).json({ message: "Something went wrong!" });
  }

  let root = require("../wasm_results/combined_results/outputs/root.json");
  res.status(200).send({ root });
});

module.exports = router;
