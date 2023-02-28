const { scanAddress } = require('../scripts/dynamoDB/scan');
const fs = require('fs');
const ethers = require('ethers');

function weiToGwei(params) {
    let spent = ethers.utils.parseUnits(params, "gwei");
    return spent
}

function writeFile(filepath, Rdata) {
    let Ndata = JSON.stringify(Rdata);
    fs.writeFileSync(filepath, Ndata, (err) => {
        if (err) {
            throw err;
        }
    });
}

async function main() {

    let Pending = []
    let NeedWait = []
    let success = []
    let send = []
    const AllStatus = await scanAddress()
    AllStatus.Items.forEach(async ele => {
        if (ele.positions = 'pending') {
            console.log("pending, We are already trying, please be patient.")
            let res = {
                giftRecipient: ele.giftRecipient,
                gas: weiToGwei(ele.gasLimit * ele.gasPrice),
                txHash: ele.txHash
            }
            Pending.push(res)
        }

        if (ele.positions = 'need waiting') {
            console.log("need waiting, The cost is too high, we are not trying, please be patient.")
            let res = {
                giftRecipient: ele.giftRecipient,
                gas: weiToGwei(ele.gasLimit * ele.gasPrice),
                txHash: ele.txHash
            }
            NeedWait.push(res)
        }

        if (ele.positions = 'success') {
            console.log("success, Sent successfully.")
            let res = {
                giftRecipient: ele.giftRecipient,
                gas: weiToGwei(ele.gasLimit * ele.gasPrice),
                txHash: ele.txHash
            }
            success.push(res)
        }

        if (ele.positions = 'sending') {
            console.log("sending, The situation is abnormal, please check the operation.")
            let res = {
                giftRecipient: ele.giftRecipient,
                gas: weiToGwei(ele.gasLimit * ele.gasPrice),
                txHash: ele.txHash
            }
            send.push(res)
        }
        writeFile("./Pending.josn", Pending)
        writeFile("./NeedWait.josn", NeedWait)
        writeFile("./success.josn", success)
        writeFile("./send.josn", send)
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});