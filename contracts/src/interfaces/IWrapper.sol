// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.13;

interface IWrapper {
    function postQuestion(string memory _merkleroot, string[] memory _treeHash) external returns(uint256);
    function checkAnswer(uint _effectiveDate) external;
    function claim(uint256 _amountEx, uint256 effectiveDate, uint256 _position) external;
    function addressConcatLeaf(address _add, uint256 _amount) external returns (string memory);
    function getTreeByDate(uint _effectiveDate) external view returns (string[] memory);
    function getRootByDate(uint _effectiveDate) external view returns (string memory);
    function getQIDByDate(uint _effectiveDate) external view returns (bytes32);
    function getDateByRoot(string memory _root) external view returns (uint256);
    function checkAnswerStatus(uint _effectiveDate) external view returns (bool);
}
