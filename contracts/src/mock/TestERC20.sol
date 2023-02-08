//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {ERC20} from 'openzeppelin-contracts/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20("Test", "TST") {
    constructor() {
        _mint(msg.sender, 100000000000000000000000);
    }

}
