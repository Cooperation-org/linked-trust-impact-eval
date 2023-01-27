// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.7;

//import './IWrapper.sol';
import './IRealityETH.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Wrapper{  // is IWrapper
    address private owner;
    using Counters for Counters.Counter;
    Counters.Counter private _roundId;
    uint32 public challengePeriod = 86400; // 1 day 
    address public arbitrator = 0x29F39dE98D750eb77b5FAfb31B2837f079FcE222; //kleros
    address public addressReality = 0xE78996A233895bE74a66F451f1019cA9734205cc;
    bytes32 questionID;
    
    IRealityETH iRealityETH = IRealityETH(addressReality);
    constructor() {
        owner = msg.sender;
        
    }

    /**
  @notice postQuestion converts a bytes16 to bytes32
  @param _merkleroot is the input bytes32 value
  @return questionID is the returned bytes32 result
  */

    function postQuestion(bytes32 _merkleroot) external onlyOwner returns(uint32){
        string memory question= string(abi.encodePacked("The Merkle Root for round", Strings.toString(_roundId), " ", _merkleroot)); // _roundId mechanism need to be fixed.
        questionID = iRealityETH.askQuestion(1, question, arbitrator, challengePeriod, 0, block.timestamp);
        return questionID;
    }

 /**
  @notice getAnswer queries RealityETH to get 
  @param _data need to figure out a way to trigger this function
  @return is the returned bytes32 result. result can be 0, 1 0xfff....f
  */
    // returns 0, 1, 0xf
    function getAnswer() external onlyOwner returns(uint32){
        bytes32 answer = iRealityETH.getFinalAnswer(questionID);
        return answer;
    }

    

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can call this function"); // Replace with error message later 
        _;
    }


}