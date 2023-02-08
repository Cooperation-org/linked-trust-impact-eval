//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

/**
@notice RealityMock contract is built to locally test out the calls to reality.eth
        contracts. This contract doesnot implement the full functionality of the
        reality.eth contract set and will always return yes to any question asked of it.
*/
contract RealityMock {

  uint256 public nonceCounter;

  mapping(bytes32 => Question) public questions;

  struct Question {
    uint256 template_id;
    string  question;
    address arbitrator;
    uint32 timeout;
    uint32 opening_ts;
    uint256 nonce;
    bytes32 questionID;
  }

  function askQuestion (
    uint256 template_id,
    string calldata question,
    address arbitrator,
    uint32 timeout,
    uint32 opening_ts,
    uint256 nonce
  ) external payable returns (bytes32){
    nonceCounter++;
    bytes32 id = keccak256(abi.encodePacked(nonceCounter));
    Question memory questionStruct = Question(
      template_id,
      question,
      arbitrator,
      timeout,
      opening_ts,
      nonceCounter,
      id
    );
    questions[id] = questionStruct;
    return id;
  }

  function getFinalAnswer(bytes32 _questionID) external returns(bytes32){
    Question storage question = questions[_questionID];
    return 0x0000000000000000000000000000000000000000000000000000000000000001;
  }

}
