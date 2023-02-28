const { expect } = require("chai");
const { ethers } = require("hardhat");
const { any } = require("hardhat/internal/core/params/argumentTypes");
const Address = require('./json/gift.json');
const { putAddress } = require('./dynamoDB/putItem.js');



const state = ['sending', 'pending', 'success', "need waiting"]
//getPendingTransactions
async function main() {
    // const address = '0x8553D3285015953dDa406fb062634D6B5dd498a2'//fuji
    // const address = '0x4e0D26A62C9cbaC15d20EDAd8c94203CeCD0C513'
    const address = '0x929c8d4A00bcE359C5AE25e581e8EB352f5322bD'
    Merkle = await ethers.getContractFactory("MerkleClaimERC20");
    merkle = await Merkle.attach(address)
    let num = ethers.utils.parseEther("0.1");
    // const result = await merkle.mint("0x5cAE4969B17eF2C81838622217DDFF26AC3A35ef", num)
    // console.log(result)
    let resArr = []
    for (let index = 0; index < Address.length; index++) {
        const element = Address[index];
        const result = await merkle.mint(element, num)
        // console.log(result)
        resArr.push(result)
        // await sleep(5000)
    }

    for (let index = 0; index < Address.length; index++) {
        const element = Address[index];
        console.log(resArr[0])

        await putAddress(element, resArr[index], state[0])
    }





}
function sleep(millisecond) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, millisecond)
    })
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});