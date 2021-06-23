// SPDX-License-Identifier: MIT

pragma solidity 0.7.3;

import "./Operatable.sol";

contract Application is Operatable {
    event FirmwareUpdated(string indexed name, string version, string uri);

    struct Firmware {
        string version;
        string uri;
    }

    mapping(string => Firmware) public firmwares;

    function updateFirmware(
        string memory name,
        string memory version,
        string memory uri
    ) public onlyOperator {
        Firmware storage fw = firmwares[name];
        if (
            keccak256(bytes(fw.version)) != keccak256(bytes(version)) ||
            keccak256(bytes(fw.uri)) != keccak256(bytes(uri))
        ) {
            firmwares[name] = Firmware(version, uri);
            emit FirmwareUpdated(name, version, uri);
        }
    }
}
