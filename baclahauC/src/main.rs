use std::env;
use std::process;
use std::fs;
use std::str;
use std::fs::File;
use std::io::Read;
use std::error::Error;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};
use hex::encode;



// Record matches expected json format of compose entry
#[derive(Serialize, Deserialize, Debug)]
struct Claim {
      subject: String, //Wallet address
      claim: String,  // verb "earned" or "authorized" can be either one
      statement: String, // full text
      credit: String,  // need units?
      source: String,  // uri to orig source
    }


// run function does the heavy lifting of the program as it loops through all jsons,
// adds their amounts to check if they exceed the maximum and if not it
//builds the merkle tree and produces the merkle root
fn run() -> Result<(), Box<dyn Error>> {
// declare variables
    let mut total: u64 = 0;
    let mut leaves = vec![];
    // collect all input values
    let args: Vec<String> = env::args().collect();
    // have the user input the total maximum amount for the round(method will need updating before bacalhau ready)
    let max: u64 = args[1].parse::<u64>().unwrap();
    // loop through input variables
    for arg in args.iter().skip(2) {
        let mut file = File::open(arg).unwrap();
        let mut buff = String::new();
        file.read_to_string(&mut buff).unwrap();
        // pull json from path
        let record: Claim = serde_json::from_str(&buff).unwrap();
        // pull amount from record and add it to total
        total = total + record.credit.parse::<u64>().unwrap();
        // construct leaf from values stored in json
        let mut leaf_string: String = record.subject.to_owned();
        let amount: String = record.credit.to_owned();
        leaf_string.push_str(&amount);
        //add leaf to array
        leaves.push(leaf_string);
        // print total amount parsed from jsons so far
        }
    // check if the total of all claims exceeds the allowed maximum
    if max < total {
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
