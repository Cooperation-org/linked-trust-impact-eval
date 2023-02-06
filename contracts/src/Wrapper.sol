// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.13;

//import './IWrapper.sol';
import './IRealityETH.sol';
import './MerkleSHA256.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Wrapper is IWrapper, merklesha256, Ownable{ // is IWrapper
    uint32 public challengePeriod = 86400; // 1 day
    address public arbitrator = 0x0000000000000000000000000000000000000000; //kleros
    string public space = "-";

    mapping(uint => string) public mapDateRoot;
    mapping(uint => string) public mapDateQuestionID;
    mapping(uint =>  string[]) public mapDateRootTree;
    mapping(uint => mapping(address => bool)) public mapDateAddressPay;


    IRealityETH iRealityETH = IRealityETH(0x5FD6eB55D12E759a21C09eF703fe0CBa1DC9d88D);
    IERC20 usdc = IERC20(0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C);   // usdc goerli address

    event QuestionSubmitted(string questionSubmitted, bytes32 questionID);
    event AnswerStatus(string answerStatus, bytes32 questionID);
    event Claimed(address _claimer, uint256 _amountClaimed);



    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can call this function"); // Replace with error message later
        _;
    }


    constructor() { }


    function postQuestion(string memory _merkleroot, uint256 _effectiveDate, string[] memory _treeHash) external onlyOwner returns(bytes32){ // returns bytes32 when it shows up
        bytes memory output;
        mapDateRootTree[_effectiveDate] = _merkleroot;
        effectiveDate = _effectiveDate;
        treeHash = _treeHash;
        for (uint256 i = 0; i < _treeHash.length; i++) {
            output = (abi.encodePacked(output,"\"", _treeHash[i], "\","));
            string(output);
        }

        string memory question = string(abi.encodePacked("The Merkle tree for effective date ", Strings.toString(_effectiveDate), " is [", output, "]and the merkle root is ", merkleroot));
        mapDateQuestionID[effectiveDate] = iRealityETH.askQuestion(0, question, arbitrator, challengePeriod, 0, 0);
        emit QuestionSubmitted("yes", mapDateQuestionID[effectiveDate]);
        return mapDateQuestionID[effectiveDate];
    }


    function checkAnswer(uint _effectiveDate) external onlyOwner {
        bytes32 answer = iRealityETH.getFinalAnswer(mapDateQuestionID[_effectiveDate]);
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){
            emit AnswerStatus("root has been accepted", mapDateQuestionID[_effectiveDate]);
            // add mapping for date and time, may have to save twice
            mapDateRootTree[effectiveDate] = treeHash;

        }
        else {
            emit AnswerStatus("root has not been accepted", mapDateQuestionID[_effectiveDate]);
        }


    }


    // user will enter their effective date, amount and address
    function claimAmount(uint256 _amountEx, uint256 effectiveDate, uint256 _position) external {
      string memory tree = mapDateRootTree[effectiveDate];
      string memory root = mapDateRoot[effectiveDate];
      string memory senderAddress = bytes20ToLiteralString(
            bytes20(msg.sender)
        );

      string memory amountString = Strings.toString(_amountEx);
      string memory leaf = abi.encodePacked(senderAddress, space, amountString);
      require(verify(root, leaf, tree, _position), "Caller does not match leaf position");
      usdc.transfer(msg.sender, _amountEx);
      emit Claimed(msg.sender, _amountEx);
    }



}
