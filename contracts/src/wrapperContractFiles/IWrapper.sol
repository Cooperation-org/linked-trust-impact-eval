// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.7;

interface IWrapper {


    event QuestionSubmitted(); 
    event MerkleRootAccepted();
    //event claim from merkele drop

    function postQuestion() external returns(uint32); // Not usable, will fill parameters later
    function getAnswer() external returns(uint32); // function call to answer question, should be called with question id 
    // A function to hold funds for the smart contract

    //function claimMerkle() external return(uint32);
    //function view address merkle root   


}