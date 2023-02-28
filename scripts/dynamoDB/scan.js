const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'eu-west-1' });

async function scanAddress() {
    const params = {
        TableName: 'gfit_send',
        FilterExpression: "#txHash <> :txHash",
        ExpressionAttributeNames: { "#txHash": "txHash" },
        ExpressionAttributeValues: {
            ':txHash': "0"
        }
    }
    // Call DynamoDB to add the item to the table
    return ddb.scan(params).promise();
}

module.exports = {
    scanAddress
}