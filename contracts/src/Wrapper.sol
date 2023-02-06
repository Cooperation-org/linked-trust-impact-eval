// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.13;

//import './IWrapper.sol';
import './IRealityETH.sol';
import './MerkleSHA256.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Wrapper{ // is IWrapper
    address private owner;
    uint32 public challengePeriod = 86400; // 1 day 
    address public arbitrator = 0x0000000000000000000000000000000000000000; //kleros
    address public addressReality = 0x5FD6eB55D12E759a21C09eF703fe0CBa1DC9d88D;  // local reality deployment
    bytes32 public questionID;
    string public merkleroot;
    uint256 public effectiveDate;
    string[] public treeHash;


    mapping(uint => mapping(string => string[])) public mapDateRootTree;
    mapping(uint => mapping(address => bool)) public mapDateAddressPay;



    event QuestionSubmitted(string questionSubmitted, bytes32 questionID);
    event AnswerStatus(string answerStatus, bytes32 questionID);

    IRealityETH iRealityETH = IRealityETH(addressReality);
    IERC20 usdc = IERC20(0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C);   // usdc goerli address
    
    MerkleSHA256 merklesha256 = new MerkleSHA256();
     
    

    constructor() {
        owner = msg.sender;
        //USDC = 0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C;
    }


    function postQuestion(string memory _merkleroot, uint256 _effectiveDate, string[] memory _treeHash) external /*onlyOwner*/ returns(bytes32){ // returns bytes32 when it shows up
        bytes memory output;
        merkleroot = _merkleroot;
        effectiveDate = _effectiveDate;
        treeHash = _treeHash;
        for (uint256 i = 0; i < _treeHash.length; i++) {
            output = (abi.encodePacked(output,"\"", _treeHash[i], "\","));
            string(output);
        }

        string memory question = string(abi.encodePacked("The Merkle tree for effective date ", Strings.toString(_effectiveDate), " is [", output, "]and the merkle root is ", merkleroot));
        questionID = iRealityETH.askQuestion(0, question, arbitrator, challengePeriod, 0, 0);
        emit QuestionSubmitted("yes", questionID);
        return questionID;
    }


    function checkAnswer() external onlyOwner {
        bytes32 answer = iRealityETH.getFinalAnswer(questionID);
        if (answer == 0x0000000000000000000000000000000000000000000000000000000000000001){
            emit AnswerStatus("root has been accepted", questionID);
            // add mapping for date and time, may have to save twice
            mapDateRootTree[effectiveDate][merkleroot] = treeHash; 

        }
        else {
            emit AnswerStatus("root has not been accepted", questionID);
        }


    }

    

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can call this function"); // Replace with error message later 
        _;
    }
    
    // user will enter their effective date, amount and address
    function claimAmount(address _addressClaimer, uint256 _amountEx, uint256 effectiveDate, uint256 _position) external view returns(uint){ 
        require(msg.sender == _addressClaimer, "You can only claim amount for this wallet!");
            
        /*
        
        
        
        
        */
        return usdc.balanceOf(address(this));
    

    }

    

}
