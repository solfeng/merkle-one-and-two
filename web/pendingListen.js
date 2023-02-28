
const { scanAddress } = require('../scripts/dynamoDB/scan');
const { updateAddress } = require('../scripts/dynamoDB/update');
const ethers = require("ethers");
const dotenv = require('dotenv');
dotenv.config()
const state = ['sending', 'pending', 'success']
// const Contractaddress = '0x77D9C1fc82Ecb6450A6714F9fE63811E70b97730'
// const url = new Web3.providers.HttpProvider(`https://hardworking-nameless-dream.ethereum-goerli.discover.quiknode.pro/91c60b6b0c8bf50a78c82622f16c5833975fb18c/`)
const myset = new Set()
const isPendingEle = []
async function main() {
    const provider = new ethers.providers.JsonRpcProvider("https://hardworking-nameless-dream.ethereum-goerli.discover.quiknode.pro/91c60b6b0c8bf50a78c82622f16c5833975fb18c/");
    const filterId = await provider.send("eth_newPendingTransactionFilter");
    const logs = await provider.send("eth_getFilterChanges", [filterId]);
    console.log(logs);
    const txhashSet = await scanAddress();
    txhashSet.Items.forEach(ele => {
        myset.add(ele.txHash)
    })


    for (let i = 0; i < logs.length; i++) {
        const element = logs[i];
        if (myset.has(element)) {
            //update
            isPendingEle.push(element)
            await updateAddress(element, state[1])
        }
    }
    for (let index = 0; index < isPendingEle.length; index++) {
        const element = isPendingEle[index];
        if (!myset.has(element)) {
            await updateAddress(element, state[2])
        }
    }
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});