const Web3 = require("web3");

let web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://hardworking-nameless-dream.ethereum-goerli.discover.quiknode.pro/91c60b6b0c8bf50a78c82622f16c5833975fb18c/`));

var subscription = web3.eth.subscribe('newPendingTransactions', function (error, result) { })
    .on("data", function (transaction) {
        console.log(transaction);
        web3.eth.getTransaction(transaction).then(response => console.log(`${transaction}`));
    });