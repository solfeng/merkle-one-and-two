const dotenv = require('dotenv');
dotenv.config()
// const Tx = require('ethereumjs-tx').Transaction;
const ethers = require("ethers");
const Web3 = require('web3');
const url = `https://falling-morning-aura.ethereum-goerli.discover.quiknode.pro/32e2b3c29e7d21e45bfc2eceb0800a6865794b7f/`;
const customHttpProvider = new ethers.providers.JsonRpcProvider(url);
const web3 = new Web3(new Web3.providers.HttpProvider(`https://hardworking-nameless-dream.ethereum-goerli.discover.quiknode.pro/${process.env.QUICKNODE}/`))

const privateKey = process.env.PRIVATE_KEY
// var wallet = new ethers.Wallet(privateKey)
async function main() {
    const wallet = await web3.eth.accounts.wallet.add(privateKey)

    tx = {
        from: wallet.address,
        to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        chainId: 5,
        nonce: 533,
        gas: 2100000,
        // gasLimit: 1223128,
        gasPrice: ethers.utils.parseUnits("1.5", "gwei")
    }
    const signPromise = await wallet.signTransaction(tx)


    // console.log(signPromise.rawTransaction)
    const res = await web3.eth.sendSignedTransaction(
        signPromise.rawTransaction,
        async (err, hash) => {
            if (!err) {
                console.log("The hash of your transaction is: ", hash);
                const transaction = await web3.eth.getTransaction(hash);
                console.log("transaction", transaction);
            } else {
                console.log("error", err);

            }
        }
    );
    console.log(res)
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
