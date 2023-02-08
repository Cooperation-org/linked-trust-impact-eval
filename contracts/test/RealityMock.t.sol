// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/RealityMock.sol";

contract RealityMockTest is Test {
    RealityMock public rm;


    function setUp() public {
        rm = new RealityMock();
    }


}
