// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

// const Address = require('../json/ensAddress.json');

async function putAddress(element, result, positions) {
    const params = {
        TableName: 'gfit_send',
        Item: {
            'nonce': result.nonce,
            'to': result.to,
            'txHash': result.hash,
            'positions': positions,
            'gasPrice': result.gasPrice.toString() - 0,
            'gasLimit': result.gasLimit.toString() - 0,
            'data': result.data,
            'value': result.value,
            'chainId': result.chainId,
            'giftRecipient': element
        }
    };
    // Call DynamoDB to add the item to the table
    return ddb.put(params).promise();
}

module.exports = {
    putAddress
}
// async function main() {
//     for (let index = 0; index < Address.length; index++) {
//         const element = Address[index];
//         // console.log(typeof (element))
//         await putAddress(index, element)
//     }

// }

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });

