use std::env;
use std::process;
use std::fs;
use std::str;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::error::Error;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};
use hex::encode;

// Claim matches expected general claim format
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Claim {
      claim: String,  // describes type of claim(I.E root or earned)
      amount: u64,  // amount earned OR total amount claim is worth
      subject: String, //Wallet address
      amountUnits: String, // full text
      rootClaimId: String, // full text
      effectiveDate: u64,  // unix timestamp of the effective date for payment
      claimSatisfactionStatus: String,  // unsure
      id: String,  // compoiseDB associated ID for the claim ?
    }

// InputJson matches expected json format of compose entry
#[derive(Serialize, Deserialize, Debug)]
struct InputJson {
    limit: u64,
    claims: Vec<Claim>,
}

// run function does the heavy lifting of the program as it loops through all jsons,
// adds their amounts to check if they exceed the maximum and if not it
//builds the merkle tree and produces the merkle root
fn run() -> Result<(), Box<dyn Error>> {
    // declare variables
    let mut total_root: u64 = 0;
    let mut leaves: Vec<String> = vec![];
    let mut root_earned = HashMap::new();
    let mut accounts = HashMap::new();
    // grab the input json from input volume
    let args: Vec<String> = env::args().collect();
    //turn CID into string
    let mut cid: String = args[1].clone().to_owned();
    //create file name
    let mut fileName: String = "/claims.json".to_string();
    //concat CID and file name
    cid.push_str(&fileName);
    // create input path
    let input_path = Path::new(&cid);
    // open it and turn it into a string
    let mut file = File::open(input_path).unwrap();
    //create buffer
    let mut buff = String::new();
    // read to string
    file.read_to_string(&mut buff).unwrap();
    // instantiate json as usable object
    let claims_jsons: InputJson = serde_json::from_str(&buff).unwrap();
    // set max to limit
    let max: u64 = claims_jsons.limit;
    //instantiate claims array from json
    let claims = claims_jsons.claims;
    // loop through claims and grab the root
    for claim in claims.iter() {
        //check if claim is a root claim
        if claim.rootClaimId == "Root" {
            // add the root claim amount to the total root amount
            total_root = total_root + claim.amount;
            // grab the root ID
            let root_id = claim.id.clone();
            // grab roots max
            let root_max = claim.amount;
            // loop through claims to find all earned claims that match
            for e_claim in claims.clone().iter() {
                // if claim is earned claim that belongs to current root
                if e_claim.rootClaimId == root_id.clone() {
                    // // get earned claims address
                    let add: String = e_claim.subject.clone();
                     // check if the address is an empty string signifying the claim is a root claim
                    if add != "" {
                    // get earned claims value amount
                    let val: u64 = e_claim.amount;
                    // get previously stored eaned root amount for the specific root ID
                    let prev_root_amount = root_earned.get(&root_id).copied().unwrap_or(0);
                    // add stored amount to new amount
                    let new_root_amount = prev_root_amount + val;
                    // map new amount to root ID
                    root_earned.insert(root_id.clone(), new_root_amount);
                    // grab previously stored amount for the earned account
                    let prev_val = accounts.get(&add).copied().unwrap_or(0);
                    // add previous amount to new amount
                    let new_val = prev_val + val;
                    //map new amount to the claiments address
                    accounts.insert(add, new_val);
                    }
                 }
            }
            //grab root total after looping through all claims for a root
            let root_total = root_earned.get(&root_id).copied().unwrap_or(0);
            // if the root calculated total exceeds the roots alloted max
                if root_total < root_max {
                    //end the program
                    process::exit(1);
                }
            //add this roots calculated total to the global root total
            total_root = total_root + root_total;
            }
        }
    //loop over accounts hashmap and retreive the account and its amount value
    for (address, amount) in &accounts {
        println!("{} has {} tokens alloted to them", address, amount);
        // construct leaf from values stored in accounts hash map
        let mut leaf_string: String = address.to_owned();
        //grab amount
        let amount: String = amount.to_string().to_owned();
        // create dash
        let spacer: String = "-".to_string();
        // smush them words
        leaf_string.push_str(&spacer);
        leaf_string.push_str(&amount);
        //add leaf to array
        leaves.push(leaf_string);
    }
    // check if the total of all claims exceeds the allowed maximum set by limit
    if max < total_root {
        //if it does warn user of the amount exceeded and end the program
        process::exit(1);
    } else {
        // establish tree
        let mut tree: Vec<String> = vec![];
        //loop through leaves
        for leaf in leaves.iter() {
            let previous_hash: String;
            //if tree is empty
            if tree.is_empty() {//previous hash is empty
                previous_hash = "".to_string();
                // encode first leaf
                let new_leaf = encode_and_hash(&previous_hash, leaf);
                // 0x the hash
                let mut ox: String = "0x".to_owned();
                let adjusted_leaf: String = new_leaf.to_owned();
                ox.push_str(&adjusted_leaf);
                //push the 0x'ed hash to tree array
                tree.push(ox);
            } else {// if tree isnt empty grab previous hash
                previous_hash = tree[tree.len() -1].clone();
                // establish empty filler
                let filler: String = "".to_string();
                //encode next leaf
                let hashed_leaf = encode_and_hash(&filler, leaf);
                // add 0x to hash
                let mut ox1: String = "0x".to_owned();
                let adjusted_leaf1: String = hashed_leaf.to_owned();
                ox1.push_str(&adjusted_leaf1);
                //hash together previous hash and current leaf
                let new_leaf = encode_and_hash(&previous_hash, &ox1);
                //add the 0x to that hash
                let mut ox: String = "0x".to_owned();
                let adjusted_leaf: String = new_leaf.to_owned();
                ox.push_str(&adjusted_leaf);
                //push the 0x'ed hash to tree array
                tree.push(ox);
            }
        }
        // grab root
        let root: String = tree[tree.len() -1].clone();
        //jsonify root and tree
        let tree_json = serde_json::to_string(&leaves).unwrap();
        let root_json = serde_json::to_string(&root).unwrap();
        //save jsons to outputs folder
        fs::write("./outputs/root.json", root_json).unwrap();
        fs::write("./outputs/treehashed.json", tree_json).unwrap();
    }
    // OK
    Ok(())
}

// simulate solidities abi.encodePacked() function
fn abi_encode_packed(input1: &str, input2: &str) -> Vec<u8> {
    //serialize strings to bytes
    let serialized_string1 = input1.as_bytes();
    let serialized_string2 = input2.as_bytes();
    //concat the serialized bytes
    let concatenated_bytes = [&serialized_string1[..], &serialized_string2[..]].concat();
    // return concat
    concatenated_bytes
}

// simulate solidities sha256(abi.encodePacked()) functionality
fn encode_and_hash(input1: &str, input2: &str) -> String {
    // abi.encodePacked() input strings
    let packed_encoding = abi_encode_packed(input1, input2);
    // establish hasher instance
    let mut hasher = Sha256::new();
    // hash encoded/ concated strings
    hasher.update(&packed_encoding);
    // finalize hashing
    let output = hasher.finalize();
    // return as hex
    encode(output)
}


// Main function. Start program here.
fn main() {
      //run code to parse jsons and build merkle tree/produce root
      if let Err(err) = run() {
          eprintln!("{}", err);
          process::exit(1);
      }
  process::exit(0);
}
