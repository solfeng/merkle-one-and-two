
const { scanAddress } = require('../scripts/dynamoDB/scan');
const { updatePositions } = require('../scripts/dynamoDB/update');
const ethers = require("ethers");
const dotenv = require('dotenv');
const Web3 = require('web3');
dotenv.config()
const state = ['sending', 'pending', 'success', "need waiting"]
const url = new Web3.providers.WebsocketProvider(`wss://responsive-blissful-liquid.ethereum-goerli.discover.quiknode.pro/da750abfdf88ec41fed4693d7d3bc512d78fe240/`)
// const url = new Web3.providers.HttpProvider(`https://proportionate-young-bridge.matic-testnet.discover.quiknode.pro/e9532681a54c59d29a216d13e1289ced4ca437f7/`)
//https://goerli.infura.io/v3/b82f5e1edd6e4643a5bcf219337e3cb5
// url: `https://proportionate-young-bridge.matic-testnet.discover.quiknode.pro/e9532681a54c59d29a216d13e1289ced4ca437f7/`,
const web3 = new Web3(url);
const MAX_GASPRICE = ethers.utils.parseUnits("300.0", "gwei");
async function main() {
    const txhashSet = await scanAddress();
    txhashSet.Items.forEach(async ele => {
        if (ele.gasPrice * ele.gasLimit >= MAX_GASPRICE) {
            await updatePositions(ele.nonce, ele.to, state[3])
        }
        if (ele.positions != state[3]) {
            const res = await isPending(ele.txHash)
            if (res) {
                //update
                await updatePositions(ele.nonce, ele.to, state[1])
            } else {
                await updatePositions(ele.nonce, ele.to, state[2])
            }
        }

    })

}
// async function main() {
//     const txhashSet = await scanAddress();
//     txhashSet.Items.forEach(async ele => {
//         if (ele.gasPrice >= MAX_GASPRICE) {
//             await updateAddress(ele.nonce, ele.txHash, state[3])
//         }
//         const res = await isPending(ele.txHash)
//         if (res && ele.positions != state[3]) {
//             //update
//             await updateAddress(ele.nonce, ele.txHash, state[1])
//         } else {
//             await updateAddress(ele.nonce, ele.txHash, state[2])
//         }

//     })

// }

async function isPending(txHash) {
    const res = await web3.eth.getTransactionReceipt(txHash)
    // console.log(res)
    return res == null;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});