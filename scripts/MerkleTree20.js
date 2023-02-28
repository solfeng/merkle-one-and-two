const { expect } = require("chai");
const { ethers } = require("hardhat");


async function main() {
    const contactName = "MerkleClaimERC20";
    const [deployer] = await ethers.getSigners()
    console.log(`Deploying contracts to ${network.name} with the account:${deployer.address}`)

    const balance = (await deployer.getBalance()).toString()
    console.log("Account balance:", balance, balance > 0)
    if (balance === 0) {
        throw (`Not enough eth`)
    }


    const MerkleClaimERC20 = await ethers.getContractFactory(contactName);
    const merkleClaimERC20 = await MerkleClaimERC20.deploy("fzl", "FZL", "0x298bf9e3f0468809d9ba563ca8affce841bb639adb9f245e74573be9b4fb6a78")
    await merkleClaimERC20.deployed();
    console.log("MerkleClaimERC20 address:", merkleClaimERC20.address)

    const Contract = await ethers.getContractAt(
        contactName,
        merkleClaimERC20.address,//0x5FbDB2315678afecb367f032d93F642f64180aa3
        // "0xB9541716a13461416e2e3086eDD309Bf105aC3f8",
        deployer
    );


    let num = ethers.utils.parseEther("0.1");
    await Contract.setNumber(100);
    const u = await Contract.getfirstComeFirstServedLength();
    console.log(u)
    // const result = await Contract.claim(
    //     "0x0000000000000000000000000e88888888888888",
    //     num,
    //     [
    //         "0xf5ce9765103f4c1cf036d6efc68aa723481d8ea26a42e5791b021d031758f462",
    //         "0x2ad211bc32cfd403b0f2acf25a6fe65638b4719ca6174ecb555f18a1d1a9cc78",
    //         "0x3a6e2ea4333505378ce5748064484336b7e0769828c14a643b6dadac66f20daf",
    //         "0x3349d8185664da37b3b81bd69aed02e56b9ca36689209767c0c123d44fe1c49c",
    //         "0xe60a7f9405af6e197540b02e04dffa7c199643fd1125131efe59b0b1a67d746c",
    //         "0x6a2ea06ce333dc9e1f36ad1f814ca25a8ae4896e0fc3de2181621118b0c95a26",
    //         "0x91a7ffa3576f74c1471a30a09701dc85f7962707f55a960637df625c2c61fbd0",
    //         "0x345356d48fa44e727f41d0f39527705cc10ca93a433dda0691ebf8abc5837ceb",
    //         "0x422c98fbba15a1de80e49205d9813e5bf277fa6c029c210ade55b4071bc9de16",
    //         "0xe8fdf1b69d457a28ddfef9781fd7328ac1a9f017c085ab543f45993e5d109884",
    //         "0x2ce375e186e4fbb2d2efd5211757f093a7e6b044aeb385d83eee2d8cdc8244e5",
    //         "0x051596515eacee23767be5ea4536e4d3c850e166a48b69ecb7bfc3ff987aecdd",
    //         "0x6e554e1241c6732ee4b63680f8ce509820e5824c87299e3ca3783a25630f9de8",
    //         "0xc43fa6c635a1470fe6b821a073da69a2e116602a0cf37e527633cfb56c958589",
    //         "0xb55103b56d22c658e5d318626a46cd12f4e489491a631c4dded974f1dbadb8e9",
    //         "0x389d9cc73b68c6ed8b9d8d904d3e4cc62d995ea09f204553e5be7cd2e1f49ea5",
    //         "0x0626e86e22233b765ce43f579663e7586476c20265ab1b7c4d98769485aebece",
    //         "0x2569fc385cbcd7f4b9380b7ec25744b234339c6ba1610b96dd02b156c97c3140",
    //         "0x652fbf20c51a02657e5667a2f3ad5165b7c41992bc5c0e86c9e1c9f14074be71",
    //         "0xa69e6a833dffaa23376259327e3ad9fbb31e1587ec306ae6cbc7886c156a9960"
    //     ],
    // );
    // console.log(result)




}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});