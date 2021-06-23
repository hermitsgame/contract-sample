// SPDX-License-Identifier: MIT

pragma solidity 0.7.3;

import "./Operatable.sol";
import "./Bank.sol";

contract Pebble is Operatable {
    event DeviceRegistered(string indexed imei, address indexed owner);
    event DeviceDeregistered(string indexed imei, address indexed owner);
    event DeviceData(string indexed imei, address indexed operator, string data, uint256 gas);

    struct Device {
        address owner;
    }

    Bank public bank;
    mapping(string => Device) public devices;

    constructor(Bank _bank) {
        bank = _bank;
    }

    function registerDevice(string memory imei) public {
        require(devices[imei].owner == address(0), "device registered");
        devices[imei] = Device(msg.sender);
        emit DeviceRegistered(imei, msg.sender);
    }

    function deregisterDevice(string memory imei) public {
        address owner = devices[imei].owner;
        require(owner == msg.sender, "not owner");
        delete devices[imei];
        emit DeviceDeregistered(imei, msg.sender);
    }

    function addData(
        string memory imei,
        string memory data,
        uint256 gas
    ) public onlyOperator {
        address owner = devices[imei].owner;
        require(owner != address(0), "device not registered");
        bank.transfer(owner, msg.sender, gas);
        emit DeviceData(imei, msg.sender, data, gas);
    }

    function addData2(
        string memory imei,
        string memory data,
        uint256 gas
    ) public onlyOperator {
        address owner = devices[imei].owner;
        require(owner != address(0), "device not registered");
        bank.pay(owner, msg.sender, gas);
        emit DeviceData(imei, msg.sender, data, gas);
    }
}
