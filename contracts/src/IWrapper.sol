// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

interface IWrapper {
    event QuestionSubmitted(string questionSubmitted, bytes32 questionID);
    event AnswerStatus(string answerStatus, bytes32 questionID);
    event Claimed(address _claimer, uint256 _amountClaimed);

    function postQuestion(string memory _merkleroot, uint256 _effectiveDate, string[] memory _treeHash) external returns(bytes32);
    function checkAnswer(uint _effectiveDate) external;
    function claimAmount(uint256 _amountEx, uint256 effectiveDate, uint256 _position) external; 

}