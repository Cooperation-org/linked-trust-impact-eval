// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/MerkleSHA256.sol";

contract MerkleSHA256Test is Test {
    MerkleSHA256 public merkleSHA;

    bytes32 public root = 0xb6a5508696541a52a1d2ab60952234050efc34e49c68e19f4389d10dca9e4c46;
    string[] public tree =    [
        "0x8584e54df79d9ea3216195ce034977968f01457c100",
        "0x624ec4a3ffa86bcef4d06706034d1fddbc9f56b4100",
        "0x7ff8b020c2ecd40613063ae1d2ee6a2a383793fa100"
      ];

    function setUp() public {
        merkleSHA = new MerkleSHA256();
    }

    function testVerifyFirstPosition() public {
        assertEq(merkleSHA.verify(
          root,
          "0x8584e54df79d9ea3216195ce034977968f01457c100",
          tree,
          0
        ), true);
    }

    function testVerifySecondPosition() public {
        assertEq(merkleSHA.verify(
          root,
          "0x624ec4a3ffa86bcef4d06706034d1fddbc9f56b4100",
          tree,
          1
        ), true);
    }

    function testVerifyThirdPosition() public {
        assertEq(merkleSHA.verify(
          root,
          "0x7ff8b020c2ecd40613063ae1d2ee6a2a383793fa100",
          tree,
          2
        ), true);
    }

    function testVerifyFailCondition() public {
        assertEq(merkleSHA.verify(
          root,
          "0x8E7871F9CD7Ff6fC49c9812377c462572c3c7f80100",
          tree,
          2
        ), false);
    }

}
