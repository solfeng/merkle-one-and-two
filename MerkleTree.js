const fs = require('fs');
const { MerkleTree } = require('merkletreejs');
const Web3 = require('web3');

const keccak256 = require('keccak256');
const dotenv = require('dotenv');
// Establish web3 provider
dotenv.config();

const url = new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_ID}`)
const web3 = new Web3(url);
// console.log(web3)
// hashing function for solidity keccak256
const hashNode = (account, amount) => {
    let num = account - 0
    return Buffer.from(
        web3.utils
            .soliditySha3(
                { t: "address", v: account },
                { t: "uint256", v: amount }
            )
            .slice(2),
        "hex"
    );
};

// read list, Note: the root path is at cwd
// the json file structure: {"<address>": <amount>, "<address>": <amount>, ...}
const readRawList = (path) => {
    const rawdata = fs.readFileSync(path);
    const data = JSON.parse(rawdata);

    return data;
};

const generateMerkleTree = (data) => {
    const leaves = Object.entries(data).map((node) => hashNode(...node));

    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();
    const hexProof = merkleTree.getHexProof(leaves[1]);
    // console.log(leaves[0])
    console.log(hexProof)
    // console.log(merkleTree.toString())
    return [merkleRoot, merkleTree];
};

const checkTree = (pairs, tree, root) => {
    for (const [key, value] of Object.entries(pairs)) {
        const leaf = hashNode(key, value);

        const proof = tree.getProof(leaf);
        // hex proof for solidity byte32[] input
        // const hexProof = tree.getHexProof(leaf);

        if (!tree.verify(proof, leaf, root)) {
            console.err("Verification failed");
            return false;
        }
    }

    return true;
};

function main(filepath, outputPath) {
    const rawData = readRawList(filepath);
    // console.log(rawData)
    const [merkleRoot, merkleTree] = generateMerkleTree(rawData);
    if (checkTree(rawData, merkleTree, merkleRoot)) {
        fs.writeFileSync(
            outputPath,
            JSON.stringify({
                root: merkleRoot,
                tree: merkleTree,
            })
        );

        console.log(`Successfully generate merkle tree to ${outputPath}.`);
    } else {
        console.err("Generate merkle tree failed.");
    }
}

main("./freeClaimList.json", "./freeClaimMerkle.json");