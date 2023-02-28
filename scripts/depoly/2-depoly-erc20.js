// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, artifacts, network } = require("hardhat");

async function main() {
    const contactName = "MerkleClaimERC20";
    const WhiteListMerkle = await ethers.getContractFactory(contactName);
    const Greeter = await WhiteListMerkle.deploy("fzl", "FZL", "0xe098d9f04429a9885b1e81153a59809d1c741879df13b8183523cd58c2e6266d");
    await Greeter.deployed();
    console.log(Greeter.address);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
