const dotenv = require('dotenv');
dotenv.config()
const ethers = require('ethers');
const { scanAddress } = require('./scripts/dynamoDB/scan');
const { updateAddress, updateTxHash } = require('./scripts/dynamoDB/update');
const { putAddress } = require('./scripts/dynamoDB/putItem');
const Web3 = require('web3');
// const JsonAbi = require('./artifacts/contracts/MerkleClaimERC20.sol/MerkleClaimERC20.json');
var url = 'https://responsive-blissful-liquid.ethereum-goerli.discover.quiknode.pro/da750abfdf88ec41fed4693d7d3bc512d78fe240/';
var customHttpProvider = new ethers.providers.JsonRpcProvider(url);
var privateKey = "0x0111111111111111111122222222222222222223333333333333333333344445";
async function main() {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Address: " + wallet.address);
    const AllStatus = await scanAddress()
    AllStatus.Items.forEach(async ele => {
        if (ele.positions == 'pending') {
            let tx = {
                from: wallet.address,
                chainId: ele.chainId,
                to: ele.to,
                nonce: ele.nonce,
                value: '0',
                input: ele.data,
                // gasLimit: 1223128,
                gasPrice: gasPrice.toString()
            };
            customHttpProvider.estimateGas(tx).then(function (estimate) {
                tx.gasLimit = estimate;
                // tx.gasPrice = ethers.utils.parseUnits("0.14085197", "gwei");
                wallet.signTransaction(tx).then((signedTX) => {
                    customHttpProvider.sendTransaction(signedTX).then(console.log);
                });
            });
        }
    })


}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// tx = {
//     from: wallet.address,
//     to: ele.to,
//     chainId: ele.chainId,
//     nonce: ele.nonce
// }
// customHttpProvider.estimateGas(tx).then(function (estimate) {
//     tx.gasLimit = Math.ceil(estimate * 1.2);
//     tx.gasPrice = Math.ceil(ele.gasPrice * 1.2)
//     console.log(tx)
//     wallet.signTransaction(tx).then((signedTX) => {
//         customHttpProvider.sendTransaction(signedTX).then(
//             //更新 
//             console.log
//         );
//     });
// });