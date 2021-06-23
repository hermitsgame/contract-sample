import _ from "lodash"
import { ethers } from "hardhat"
import { expect } from "chai"
import { Contract } from "@ethersproject/contracts"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

const imei0 = "00000000000000000000000000000000"
const imei1 = "00000000000000000000000000000001"
const data0 = '{"Temperature:30"}'

describe("Pebble unit test", () => {
  let pebble: Contract
  let bank: Contract

  let owner: SignerWithAddress
  let holder1: SignerWithAddress
  let holder2: SignerWithAddress
  let holder3: SignerWithAddress
  let operator: SignerWithAddress
  let attacker: SignerWithAddress

  beforeEach(async () => {
    ;[owner, holder1, holder2, holder3, operator, attacker] = await ethers.getSigners()

    const Bank = await ethers.getContractFactory("Bank")
    bank = await Bank.deploy()
    await bank.deployed()

    const Pebble = await ethers.getContractFactory("Pebble")
    pebble = await Pebble.deploy(bank.address)
    await pebble.deployed()

    await expect(bank.grant(pebble.address)).to.emit(bank, "OperatorGranted").withArgs(pebble.address)

    await expect(pebble.grant(operator.address)).to.emit(pebble, "OperatorGranted").withArgs(operator.address)

    const value = 1000000
    await expect(bank.connect(holder1).deposit({ value })).to.emit(bank, "Deposit").withArgs(holder1.address, value)

    await expect(pebble.connect(holder1).registerDevice(imei0))
      .to.emit(pebble, "DeviceRegistered")
      .withArgs(imei0, holder1.address)
  })

  describe("grant", () => {
    it("onlyOwner", async () => {
      await expect(pebble.connect(attacker).grant(holder1.address)).to.be.revertedWith("caller is not the owner")
    })

    it("success", async () => {
      await expect(pebble.grant(holder1.address)).to.emit(pebble, "OperatorGranted").withArgs(holder1.address)

      expect(await pebble.operators(holder1.address)).to.equal(true)
    })
  })

  describe("revoke", () => {
    it("onlyOwner", async () => {
      await expect(pebble.connect(attacker).revoke(operator.address)).to.be.revertedWith("caller is not the owner")
    })

    it("success", async () => {
      await expect(pebble.revoke(operator.address)).to.emit(pebble, "OperatorRevoked").withArgs(operator.address)

      expect(await pebble.operators(operator.address)).to.equal(false)
    })
  })

  describe("registerDevice", () => {
    it("success", async () => {
      await expect(pebble.connect(holder3).registerDevice(imei1))
        .to.emit(pebble, "DeviceRegistered")
        .withArgs(imei1, holder3.address)

      expect(await pebble.devices(imei1)).to.equal(holder3.address)
    })

    it("device registered", async () => {
      await expect(pebble.connect(holder3).registerDevice(imei0)).to.be.revertedWith("device registered")
    })
  })

  describe("deregisterDevice", () => {
    it("not owner", async () => {
      await expect(pebble.deregisterDevice(imei1)).to.be.revertedWith("not owner")

      await expect(pebble.connect(holder2).deregisterDevice(imei0)).to.be.revertedWith("not owner")
    })

    it("success", async () => {
      await expect(pebble.connect(holder1).deregisterDevice(imei0))
        .to.emit(pebble, "DeviceDeregistered")
        .withArgs(imei0, holder1.address)
    })
  })

  describe("addData", () => {
    it("onlyOperator", async () => {
      await expect(pebble.connect(attacker).addData(imei0, data0, 10000)).to.be.revertedWith(
        "caller is not the operator",
      )
    })

    it("device not registered", async () => {
      await expect(pebble.connect(operator).addData(imei1, data0, 10000)).to.be.revertedWith("device not registered")
    })

    it("amount exceeds balance", async () => {
      await expect(pebble.connect(operator).addData(imei0, data0, 100000000)).to.be.revertedWith(
        "amount exceeds balance",
      )
    })

    it("success", async () => {
      const amount = 10000
      await expect(pebble.connect(operator).addData(imei0, data0, amount))
        .to.emit(pebble, "DeviceData")
        .withArgs(imei0, operator.address, data0, amount)
        .to.emit(bank, "Transfer")
        .withArgs(holder1.address, operator.address, amount)
    })
  })

  describe("addData2", () => {
    it("onlyOperator", async () => {
      await expect(pebble.connect(attacker).addData2(imei0, data0, 10000)).to.be.revertedWith(
        "caller is not the operator",
      )
    })

    it("device not registered", async () => {
      await expect(pebble.connect(operator).addData2(imei1, data0, 10000)).to.be.revertedWith("device not registered")
    })

    it("amount exceeds bank balance", async () => {
      await expect(pebble.connect(operator).addData2(imei0, data0, 100000000)).to.be.revertedWith(
        "amount exceeds bank balance",
      )
    })

    it("success", async () => {
      const amount = 10000
      await expect(pebble.connect(operator).addData2(imei0, data0, amount))
        .to.emit(pebble, "DeviceData")
        .withArgs(imei0, operator.address, data0, amount)
        .to.emit(bank, "Paid")
        .withArgs(holder1.address, operator.address, amount)
    })
  })
})
