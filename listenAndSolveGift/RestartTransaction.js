const dotenv = require('dotenv');
dotenv.config()
const { scanAddress } = require('../scripts/dynamoDB/scan');
const { updateAddress, updateTxHash } = require('../scripts/dynamoDB/update');
const { putAddress } = require('../scripts/dynamoDB/putItem');
const Web3 = require('web3');
const JsonAbi = require('../artifacts/contracts/MerkleClaimERC20.sol/MerkleClaimERC20.json');
// const url = new Web3.providers.WebsocketProvider(`wss://responsive-blissful-liquid.ethereum-goerli.discover.quiknode.pro/da750abfdf88ec41fed4693d7d3bc512d78fe240/`)
// const web3 = new Web3(url);
const web3 = new Web3(new Web3.providers.HttpProvider(`https://responsive-blissful-liquid.ethereum-goerli.discover.quiknode.pro/da750abfdf88ec41fed4693d7d3bc512d78fe240/`))
const state = ['sending', 'pending', 'success', "need waiting"]
const privateKey = process.env.PRIVATE_KEY

async function main() {
    const wallet = await web3.eth.accounts.wallet.add(privateKey)
    console.log(wallet)
    const AllStatus = await scanAddress()
    AllStatus.Items.forEach(async ele => {
        // 注意
        if (ele.positions == 'pending') {
            // const contract = new web3.eth.Contract(
            //     JsonAbi.abi,
            //     "0x00931427019f6fc338C49d2AC80052b0Fe31E08c"
            // );
            let gasPrice = await web3.eth.getGasPrice()
            gasPrice = parseInt(gasPrice.toString()) + 1000000000;
            let eleGasLimit = parseInt(ele.gasLimit * 1.2)
            let tx = {
                from: wallet.address,
                chainId: ele.chainId,
                to: ele.to,
                nonce: ele.nonce,
                value: '0',
                input: ele.data,
                gasLimit: eleGasLimit,
                // gasLimit: 1223128,
                gasPrice: gasPrice
            };
            console.log("++++++1")
            const signPromise = await wallet.signTransaction(tx)
            // console.log(signPromise.rawTransaction)
            const res = await web3.eth.sendSignedTransaction(
                signPromise.rawTransaction,
                async (err, hash) => {
                    if (!err) {
                        console.log("The hash of your transaction is: ", hash);
                        const transaction = await web3.eth.getTransaction(hash);
                        console.log("transaction", transaction);
                        await updateTxHash(tx, hash)
                    } else {
                        console.log("error", err);
                    }
                }
            );
            console.log(res)
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