// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import "forge-std/console.sol";


contract MerkleSHA256 {

  /**
  @notice toHex16 converts a bytes16 to bytes32
  @param _data is the input bytes16 value
  */
  function toHex16 (bytes16 _data) internal pure returns (bytes32 result) {
      result = bytes32 (_data) & 0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000 |
            (bytes32 (_data) & 0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >> 64;
      result = result & 0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000 |
            (result & 0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >> 32;
      result = result & 0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000 |
            (result & 0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >> 16;
      result = result & 0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000 |
            (result & 0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >> 8;
      result = (result & 0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >> 4 |
            (result & 0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >> 8;
      result = bytes32 (0x3030303030303030303030303030303030303030303030303030303030303030 +
             uint256 (result) +
             (uint256 (result) + 0x0606060606060606060606060606060606060606060606060606060606060606 >> 4 &
             0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) * 39);
  }

  /**
  @notice toHex converts a bytes32 to a string
  @param _data is the input bytes32 data
  @return is the converted string value
  */
  function toHex (bytes32 _data) public pure returns (string memory) {
      return string (abi.encodePacked ("0x", toHex16 (bytes16 (_data)), toHex16 (bytes16 (_data << 128))));
  }

  /**
  @notice stringToHash is a helper function that abi.encodePackeds to strings
          sha256 hashes them and then converts that back into a useable string
  @param _input1 is the first input string value
  @param _input2 is the second input string value
  @return is the bytes32 value as a string
  */
  function stringToHash(string memory _input1, string memory _input2) public pure returns (string memory){
    return toHex(sha256(abi.encodePacked(_input1, _input2)));
  }

  /**
  @notice verify is used to check whether or not a leaf value exists within a given root
  @param root is the root in question
  @param leaf is the string value being checked
  @param leaves is the array of leaves used to construct the original root
  @param position is the numerical position within the leaves array in which the leaf in question should be found
  @return bool whether or not the leaf exists in the root
  */
  function verify(
    bytes32 root,
    string memory leaf,
    string[] memory leaves,
    uint256 position
  )
  public
  view
  returns(bool) {
      //set computed hash to initial hash for first position
    string memory computedHash = stringToHash("", leaves[0]);

    for (uint256 i = 0; i < leaves.length; i++) {

      string memory proofElement = stringToHash("", leaves[i]);
      string memory hashedLeaf = stringToHash("", leaf);

      if (i == position && i == 0) {
         computedHash = hashedLeaf;
      }else if(i == 0){
         computedHash = stringToHash("", leaves[0]);
      } else if(i == position) {
        computedHash = stringToHash(computedHash, hashedLeaf);
      } else {
        computedHash = stringToHash(computedHash, proofElement);
      }
    }
  return sha256(abi.encodePacked(computedHash)) == sha256(abi.encodePacked(toHex(root)));
  }
}
