var AWS = require("aws-sdk");
let awsConfig = {
    "region": "eu-west-1",
    "accessKeyId": "AKIATKVC3WRY3DGN2MUN",
    "secretAccessKey": "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"
};
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();

async function queryAddress(rdata) {
    const params3 = {
        TableName: "gfit_send",
        IndexName: "giftRecipient-index",
        KeyConditionExpression: "#giftRecipient = :giftRecipient",
        ExpressionAttributeNames: {
            "#giftRecipient": "giftRecipient",

        },
        ExpressionAttributeValues: {
            ":giftRecipient": rdata
        }
    }
    return docClient.query(params3).promise();

}
async function main() {
    const re = await queryAddress("0x65b5cBeF0b61b099F783a6aE899436CD3B49d55a")
    console.log(re.Items[0].positions != 'success')
}
main()

