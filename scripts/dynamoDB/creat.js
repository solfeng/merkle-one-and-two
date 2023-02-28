var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'eu-west-1' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var params = {
    AttributeDefinitions: [
        {
            AttributeName: 'nonce',
            AttributeType: 'N'
        },
        {
            AttributeName: 'to',
            AttributeType: 'S'
        }

    ],
    KeySchema: [
        {
            AttributeName: 'nonce',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'to',
            KeyType: 'RANGE'
        }

    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    },
    TableName: 'gfit_send',
    StreamSpecification: {
        StreamEnabled: false
    }
};

// Call DynamoDB to create the table
ddb.createTable(params, function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Table Created", data);
    }
});