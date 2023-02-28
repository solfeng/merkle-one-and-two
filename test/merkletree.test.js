const { expect } = require("chai");
const { ethers } = require("hardhat");
describe('merkletree', function () {

    let adressfordeployed;
    let res;
    const contactName = "PrimitiveWhiteList";
    beforeEach(async function () {
        // Get the ContractFactories and Signers here.
        const WhiteListMerkle = await ethers.getContractFactory(contactName);
        const Greeter = await WhiteListMerkle.deploy();
        await Greeter.deployed();
        adressfordeployed = Greeter.address;
        // console.log(adressfordeployed)
    });

    describe('verfityforleaf', function () {
        it(' verfity', async function () {
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
            // const result = await counter.whitelistSale(
            //     [
            //         '0x2e7def95f3f5d0ff01c13d1b5541b36fffbceae495e644294dbe016a25e174be',
            //         '0xffc52c29feab638b94bc1935c6af9ca38b1de8b937143c124ebd6877d2c60ed7',
            //         '0xcf43c183eae2e3d14c349ef1394993ace808decb8a34f08667b5b6fa44b14ea8'
            //     ],
            //     245
            // );
            //注意排序
            const result2 = await counter.whitelistSaleAll(
                "asobcab",
                [
                    '0x0c0adf64c6cb4bdb6057a70eee423614e7c1450d96f41c08b2d78f80df34b2b0',
                    '0xf735b7c896963b9bda6e0a2004596e3bc3a3d17c4cc964c0d6f65d6097ee8b07',
                    '0x663c22acec346f234125e2e42e6b37fff4e2efedd5670bf265c965ff1f8630a5'
                ],
                2
            );
            const abi = await counter.getabiKeccak256(
                "sadiaDo",
                245
            )

            // // // res = result;
            // console.log(result2)
            console.log(abi)
            // console.log(res);
        })


    });




});