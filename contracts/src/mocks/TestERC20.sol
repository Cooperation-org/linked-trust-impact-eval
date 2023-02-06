//SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {ERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';

contract TestERC20 is ERC20Upgradeable {
    function initialize() public initializer {
        _mint(_msgSender(), 100000000000000000000000);
    }
}
