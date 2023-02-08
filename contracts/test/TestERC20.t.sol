// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/TestERC20.sol";

contract TestERC20Test is Test {
    TestERC20 public token;


    function setUp() public {
        token = new TestERC20();
    }


}
