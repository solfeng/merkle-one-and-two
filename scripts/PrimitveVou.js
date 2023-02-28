const { expect } = require("chai");
const { ethers } = require("hardhat");


async function main() {
    const contactName = "PrimitiveWhiteListVou";
    const [deployer] = await ethers.getSigners()
    console.log(`Deploying contracts to ${network.name} with the account:${deployer.address}`)

    const balance = (await deployer.getBalance()).toString()
    console.log("Account balance:", balance, balance > 0)
    if (balance === 0) {
        throw (`Not enough eth`)
    }


    const MerkleClaimERC20 = await ethers.getContractFactory(contactName);
    const merkleClaimERC20 = await MerkleClaimERC20.deploy()
    await merkleClaimERC20.deployed();
    console.log("MerkleClaimERC20 address:", merkleClaimERC20.address)

    const Contract = await ethers.getContractAt(
        contactName,
        "0xce7137eeb8bc2c11790e87ec36427f0c6ce06257",
        // merkleClaimERC20.address,//0x5FbDB2315678afecb367f032d93F642f64180aa3
        // "0xB9541716a13461416e2e3086eDD309Bf105aC3f8",
        deployer
    );

    await Contract.setWhitelistMerkleRoot("0xe8cd2010f77fd17d3c3f83ab12b5e7f81f04677c0ce00d06ea77c2f1e33bcd3f")
    const code = "klNyMTYRgALyElLwwHG3"
    const aomunt = 3
    const proof = [
        '0x21fefa039509912461913e605492c200064de3acb34837360096b83edb4a0a33',
        '0xf3d9602ef24355278a6bcdb3bb16a0eebbdcb17523763a3805bd11a21f3f1953',
        '0x5bb6246edc54f52c3e040be4b7012734c0bb7183490e8460d078fb778daa363a',
        '0xee4a21d26248318a637a932612bc937065e76c8575681e599b47d0a0854d737d',
        '0xdc2ca38c3de29812b9da571b3d401a8ab265246e23b52e4d4772512c6518555a'
    ]
    const res = await Contract.whitelistSaleAll(code, proof, aomunt)
    console.log(res)




}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});