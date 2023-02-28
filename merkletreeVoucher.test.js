const { expect } = require("chai");
const { ethers } = require("hardhat");
describe('merkletreeVou', function () {

    let adressfordeployed;
    const contactName = "PrimitiveWhiteListVou";
    beforeEach(async function () {
        // Get the ContractFactories and Signers here.
        const WhiteListMerkle = await ethers.getContractFactory(contactName);
        const Greeter = await WhiteListMerkle.deploy();
        await Greeter.deployed();
        adressfordeployed = Greeter.address;
        // console.log(adressfordeployed)
    });

    describe('verfityforVou', function () {
        it(' verfityVou', async function () {
            // verify
            //设置root hash
            const [owner] = await ethers.getSigners();
            const counter = await ethers.getContractAt(
                contactName,
                adressfordeployed,//0x5FbDB2315678afecb367f032d93F642f64180aa3
                owner
            );
            // console.log(counter)

            await counter.setWhitelistMerkleRoot("0x48e2b3bd5f66dfd6e6211622d88642769fe34fa1a5fc86083a13d3f8043c15f3");
            // console.log(await counter.getMerkleRoot())
            // //数组里的是获取leaf的验证路径，第二个参数是要验证的内容
            // // //特殊情况，你只有一个leaf，那要传空数组
            const result2 = await counter.whitelistSaleAll(
                "sadiaDo",
                [
                    '0x0c0adf64c6cb4bdb6057a70eee423614e7c1450d96f41c08b2d78f80df34b2b0',
                    '0xf735b7c896963b9bda6e0a2004596e3bc3a3d17c4cc964c0d6f65d6097ee8b07',
                    '0x663c22acec346f234125e2e42e6b37fff4e2efedd5670bf265c965ff1f8630a5'
                ],
                245
            );

            // // // res = result;
            // console.log(result)
            console.log(result2)
            // console.log(res);
        })


    });




});