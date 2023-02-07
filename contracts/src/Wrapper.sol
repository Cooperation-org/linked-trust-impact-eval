// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.13;

import './IWrapper.sol';
import './IRealityETH.sol';
import './MerkleSHA256.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Wrapper is IWrapper, MerkleSHA256, Ownable{ // is IWrapper
    uint32 public challengePeriod = 86400; // 1 day
    address public arbitrator = 0x0000000000000000000000000000000000000000; //kleros
    string public space = "-";
    string[] treeHash;
    mapping(uint => string) public mapDateRoot;
    mapping(uint => string) public mapDateQuestionID;
    mapping(uint =>  string[]) public mapDateTree;
    mapping(uint => mapping(address => bool)) public mapDateAddressPay;


    IRealityETH iRealityETH = IRealityETH();  // reality's address 
    IERC20 usdc = IERC20(0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C);   // usdc goerli address

    event QuestionSubmitted(string questionSubmitted, bytes32 questionID);
    event AnswerStatus(string answerStatus, bytes32 questionID);
    event Claimed(address _claimer, uint256 _amountClaimed);



    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can call this function"); // Replace with error message later
        _;
    }


    constructor() { }

    /**
    @notice postQuestion posts a question on reality and returns its Question ID
    @param _merkleroot is the root in question
    @param _effectiveDate is a uint256 which represents date
    @param _treeHash is an array of strings which are hashes for the merkle tree
    @return is a bytes32 Question ID from reality.eth 
   */
    function postQuestion(string memory _merkleroot, uint256 _effectiveDate, string[] memory _treeHash) external onlyOwner returns(bytes32){ // returns bytes32 when it shows up
        bytes memory output;
        _treeHash = treeHash; // not confirmed, will be confirmed in the next function 
        for (uint256 i = 0; i < _treeHash.length; i++) {
            output = (abi.encodePacked(output,"\"", _treeHash[i], "\","));
            string(output);
        }

        string memory question = string(abi.encodePacked("The Merkle tree for effective date ", Strings.toString(_effectiveDate), " is [", output, "]and the merkle root is ", _merkleroot));
        mapDateQuestionID[_effectiveDate] = iRealityETH.askQuestion(0, question, arbitrator, challengePeriod, 0, 0);
        emit QuestionSubmitted("yes", mapDateQuestionID[_effectiveDate]);
        return mapDateQuestionID[_effectiveDate];
    }


    function checkAnswer(uint _effectiveDate) external onlyOwner {
        bytes32 answer = iRealityETH.getFinalAnswer(mapDateQuestionID[_effectiveDate]);
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){
            emit AnswerStatus("root has been accepted", mapDateQuestionID[_effectiveDate]);
            // add mapping for date and time, may have to save twice
            mapDateTree[_effectiveDate] = treeHash;

        }
        else {
            emit AnswerStatus("root has not been accepted", mapDateQuestionID[_effectiveDate]);
        }


    }


    /**

    @notice claimAmount verifies the user and amount and transfers ERC20 tokens(amount) if the caller matches the leaf position
    @param _amountEx is a uint256 which represents the amount of usdc(or any other ERC20) alloted to the user
    @param _effectiveDate is a uint256 which represents the date in question
    @param _position is the numerical position within the leaves array in which the leaf in question should be found
    */
    function claimAmount(uint256 _amountEx, uint256 _effectiveDate, uint256 _position) external {
      string memory tree = mapDateTree[_effectiveDate];
      string memory root = mapDateRoot[_effectiveDate];
      string memory senderAddress = bytes20ToLiteralString(
            bytes20(msg.sender)
        );

      string memory amountString = Strings.toString(_amountEx);
      string memory leaf = abi.encodePacked(senderAddress, space, amountString);
      require(mapDateAddressPay[_effectiveDate][msg.sender] != 1 , "Caller already paid"); 
      require(verify(root, leaf, tree, _position), "Caller does not match leaf position");
      usdc.transfer(msg.sender, _amountEx);
      mapDateAddressPay[_effectiveDate][msg.sender] = 1;   
      emit Claimed(msg.sender, _amountEx);
    }



}

