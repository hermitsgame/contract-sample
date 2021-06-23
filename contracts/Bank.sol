// SPDX-License-Identifier: MIT

pragma solidity 0.7.3;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Operatable.sol";

contract Bank is Operatable {
    using SafeMath for uint256;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed sender, address indexed to, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Paid(address indexed from, address indexed to, uint256 amount);

    mapping(address => uint256) public balanceOf;

    function deposit() public payable {
        require(msg.value > 0, "invalid value");
        balanceOf[msg.sender] = balanceOf[msg.sender].add(msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) public {
        require(amount > 0, "invalid amount");
        require(amount <= address(this).balance, "amount exceeds bank balance");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount, "withdraw amount exceeds balance");
        to.transfer(amount);
        emit Withdraw(msg.sender, to, amount);
    }

    function transfer(
        address from,
        address to,
        uint256 amount
    ) public onlyOperator {
        require(amount > 0, "invalid amount");
        balanceOf[from] = balanceOf[from].sub(amount, "amount exceeds balance");
        balanceOf[to] = balanceOf[to].add(amount);
        emit Transfer(from, to, amount);
    }

    function pay(
        address from,
        address payable to,
        uint256 amount
    ) public onlyOperator {
        require(amount > 0, "invalid amount");
        require(amount <= address(this).balance, "amount exceeds bank balance");
        balanceOf[from] = balanceOf[from].sub(amount, "amount exceeds balance");
        to.transfer(amount);
        emit Paid(from, to, amount);
    }
}
