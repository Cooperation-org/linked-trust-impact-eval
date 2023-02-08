// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.17;

import './interfaces/IWrapper.sol';
import './interfaces/IRealityETH.sol';
import './MerkleSHA256.sol';
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";


contract Wrapper is IWrapper, MerkleSHA256, Ownable{ // is IWrapper
    uint32 public challengePeriod = 86400; // 1 day
    address public arbitrator = 0x0000000000000000000000000000000000000000; //kleros
    string public space = "-";
    mapping(uint => string) public mapDateRoot;
    mapping(uint => bool) public rootExists;
    mapping(uint => bytes32) public mapDateQuestionID;
    mapping(uint =>  string[]) public mapDateTree;
    mapping(string => uint256) public mapRootToDate;
    mapping(uint => bool) public mapDateToAnswer;
    mapping(uint => mapping(address => bool)) public mapDateAddressPay;


    IRealityETH iRealityETH;  // reality's address
    IERC20 usdc;   // usdc goerli address

    event QuestionSubmitted(string questionSubmitted, bytes32 questionID);
    event AnswerStatus(string answerStatus, bytes32 questionID);
    event Claimed(address _claimer, uint256 _amountClaimed);


    /**
    @notice the constructore takes in the addresses for the reality.eth contracts and USDC
    */
    constructor(address _reality, address _usdc) {
      iRealityETH = IRealityETH(_reality);
      usdc = IERC20(_usdc);
    }

    /**
    @notice postQuestion posts a question on reality and returns its Question ID
    @param _merkleroot is the root in question
    @param _treeHash is an array of strings which are hashes for the merkle tree
    @return is a bytes32 Question ID from reality.eth
   */
    function postQuestion(string memory _merkleroot, string[] memory _treeHash) external onlyOwner returns(uint256){ // returns bytes32 when it shows up
        bytes memory output;
        uint256 effectiveDate = uint256(block.timestamp);
        mapRootToDate[_merkleroot] = effectiveDate;
        mapDateTree[effectiveDate] = _treeHash; // not confirmed, will be confirmed in the next function
        mapDateRoot[effectiveDate] = _merkleroot;
        rootExists[effectiveDate] = true;
        for (uint256 i = 0; i < _treeHash.length; i++) {
            output = (abi.encodePacked(output,"\"", _treeHash[i], "\","));
            string(output);
        }

        string memory question = string(
          abi.encodePacked("The Merkle tree for effective date ",
          Strings.toString(effectiveDate),
          " is [",
          output,
          "]and the merkle root is ",
          _merkleroot
        )
      );
        mapDateQuestionID[effectiveDate] = iRealityETH.askQuestion(
            0,
            question,
            arbitrator,
            challengePeriod,
            0,
            0
            );
        emit QuestionSubmitted("yes", mapDateQuestionID[effectiveDate]);
        return effectiveDate;
    }

    /**
    @notice checkAnswer is a public function used to retrieve the answer from reality.eth
    @param _effectiveDate is the date the merkleroot and tree for a specific question are stored to
    */
    function checkAnswer(uint _effectiveDate) public {
      require(rootExists[_effectiveDate], "No Root Stored for that date");
      require(mapDateToAnswer[_effectiveDate] == false, "Answer has been checked");
        bytes32 answer = iRealityETH.getFinalAnswer(mapDateQuestionID[_effectiveDate]);
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){
            mapDateToAnswer[_effectiveDate] = true;
            emit AnswerStatus("root has been accepted", mapDateQuestionID[_effectiveDate]);
        }
        else {
            mapDateToAnswer[_effectiveDate] = false;
            emit AnswerStatus("root has not been accepted", mapDateQuestionID[_effectiveDate]);
        }


    }


    /**

    @notice claim verifies the user and amount and transfers ERC20 tokens(amount) if the caller matches the leaf position
    @param _amountEx is a uint256 which represents the amount of usdc(or any other ERC20) alloted to the user
    @param _effectiveDate is a uint256 which represents the date in question
    @param _position is the numerical position within the leaves array in which the leaf in question should be found
    */
    function claim(uint256 _amountEx, uint256 _effectiveDate, uint256 _position) external {
      if(mapDateToAnswer[_effectiveDate] == false) {
        checkAnswer(_effectiveDate);
      }
      string[] memory tree = mapDateTree[_effectiveDate];
      string memory root = mapDateRoot[_effectiveDate];
      string memory leaf = addressConcatLeaf(msg.sender, _amountEx);
      require(mapDateAddressPay[_effectiveDate][msg.sender] == false , "Caller already paid");
      bool correct = verify(root, leaf, tree, _position);
      require(correct, "Caller does not match leaf position");
      usdc.transfer(msg.sender, _amountEx);
      mapDateAddressPay[_effectiveDate][msg.sender] = true;
      emit Claimed(msg.sender, _amountEx);
    }


    /** Helper view functions  */

    /**
    @notice addressConcatLeaf is a view function used to construct a leaf string from an address and a uint amount
    @param _add is the input address
    @param _amount is the input amount
    */
    function addressConcatLeaf(address _add, uint256 _amount) public view returns (string memory) {
      string memory senderAddress = Strings.toHexString(msg.sender);
      string memory amountString = Strings.toString(_amount);
      string memory firstHalf = string.concat(senderAddress, space);
      string memory leaf = string.concat(firstHalf, amountString);
      return leaf;
    }

    /**
    @notice getTreeByDate is used to retrieve a specific tree by the Date used to store it
    @param _effectiveDate is the date used to store the tree
    */
    function getTreeByDate(uint _effectiveDate) external view returns (string[] memory) {
      return mapDateTree[_effectiveDate];
    }

    /**
    @notice getRootByDate is used to retrieve a specific root by the Date used to store it
    @param _effectiveDate is the date used to store the tree
    */
    function getRootByDate(uint _effectiveDate) external view returns (string memory) {
      return mapDateRoot[_effectiveDate];
    }

    /**
    @notice getQIDByDate is used to retrieve a specific reality question ID by the Date used to store it
    @param _effectiveDate is the date used to store the tree
    */
    function getQIDByDate(uint _effectiveDate) external view returns (bytes32) {
      return mapDateQuestionID[_effectiveDate];
    }

    /**
    @notice getDateByRoot is used to retrieve a specific Date by the Root used to store it
    @param _root is the root used to store the date
    */
    function getDateByRoot(string memory _root) external view returns (uint256) {
      return mapRootToDate[_root];
    }

    /**
    @notice checkAnswerStatus is used to check the status of an answer
    @param _effectiveDate is the date used to store the question
    */
    function checkAnswerStatus(uint _effectiveDate) external view returns (bool) {
      return mapDateToAnswer[_effectiveDate];
    }
}
