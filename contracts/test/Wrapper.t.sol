// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Wrapper.sol";
import "../src/mocks/RealityMock.sol";
import "../src/mocks/TestERC20.sol";


contract WrapperTest is Test {
  Wrapper public wrapper;
  RealityMock public reality;
  TestERC20 public token;


  string root = "0x1ad4e33c36214418318fdbec70fe465979e606717c353567de235edf1bf98777";
  string[] public tree = ["0x1413862C2B7054CDbfdc181B83962CB0FC11fD92-25","0x7fa9385be102ac3eac297483dd6233d62b3e1496-75"];

  function setUp() public {
      reality = new RealityMock();
      token = new TestERC20();
      wrapper = new Wrapper(address(reality), address(token));
  }

  function testAddressToString() public {
    string memory leaf = wrapper.addressConcatLeaf(msg.sender, 75);
    assertEq(leaf, "0x7fa9385be102ac3eac297483dd6233d62b3e1496-75");
  }

  function testPostQuestion() public {
    uint256 _rootID = wrapper.postQuestion(
      root,
      tree
    );
    uint256 timeStamp = wrapper.mapRootToDate(root);
    string[] memory storedTree = wrapper.getTreeByDate(timeStamp);
    assertEq(reality.nonceCounter(), 1); //check that reality mock was called
    assertEq(storedTree[0], tree[0]); //check that stored tree matches tree
  }

  function testCheckAnswer() public {
    uint256 _rootID = wrapper.postQuestion(
      root,
      tree
    );
    uint256 timeStamp = wrapper.mapRootToDate(root);
    wrapper.checkAnswer(timeStamp);
    assertEq(wrapper.checkAnswerStatus(timeStamp), true);
  }

  function testClaim() public {
    token.transfer(address(wrapper), 100);
    address claimerAdd = 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496;

    uint256 beforeBalanceWrapper = token.balanceOf(address(wrapper));
    uint256 beforeBalanceClaimer = token.balanceOf(claimerAdd);

    uint256 _rootID = wrapper.postQuestion(
      root,
      tree
    );
    uint256 timeStamp = wrapper.mapRootToDate(root);
    wrapper.claim(75, timeStamp, 1);
    uint256 afterBalanceWrapper = token.balanceOf(address(wrapper));
    uint256 afterBalanceClaimer = token.balanceOf(claimerAdd);

    assertEq(beforeBalanceWrapper - afterBalanceWrapper, afterBalanceClaimer - beforeBalanceClaimer);
  }

}
