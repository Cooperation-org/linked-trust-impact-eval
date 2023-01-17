use std::env;
use std::process;
use std::fs;
use std::fs::File;
use std::io::Read;
use std::error::Error;
use serde::{Serialize, Deserialize};
use rs_merkle::{algorithms::Sha256, Hasher, MerkleTree};


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
    let mut leafs = vec![];
    let mut merkle_tree = MerkleTree::<Sha256>::new();
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
        let mut leaf:  Vec<[u8; 32]> =  [Sha256::hash(record.subject.as_bytes()), Sha256::hash(record.credit.as_bytes())].to_vec();
        //add leaf to tree
        merkle_tree.append(&mut leaf);
        merkle_tree.commit();
        leafs.push([record.subject.to_string(), record.credit.to_string()]);
        // print total amount parsed from jsons so far
        }
    // check if the total of all claims exceeds the allowed maximum
    if max < total {
        //if it does warn user of the amount exceeded and end the program
        process::exit(0);
    } else {
        // fs::write("./outputs/tree.json",  merkle_tree);
        let tree_json = serde_json::to_string(&leafs).unwrap();
        fs::write("./outputs/root.json", merkle_tree.root_hex().expect("ROOT DERIVATION FAILED").to_string()).unwrap();
        fs::write("./outputs/tree.json", tree_json).unwrap();

    }
    Ok(())
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
