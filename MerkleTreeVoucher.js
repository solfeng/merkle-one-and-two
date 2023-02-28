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
    return Buffer.from(
        web3.utils
            .soliditySha3(
                { t: "string", v: account },
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
    console.log(leaves)
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();
    console.log(merkleRoot);
    const hexProof = merkleTree.getHexProof(leaves[0]);
    console.log(hexProof)
    // console.log(merkleTree.toString())
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

main("./CodeTreeList.json", "./CodeTreeListOut.json");

// 48e2b3bd5f66dfd6e6211622d88642769fe34fa1a5fc86083a13d3f8043c15f3
//    ├─ 1ed330f62230fabbb79dbc91f3f18c4036cad610d12717e47be0e84a8210217d
//    │  ├─ ce29609a8fd9aff592a6a91cda5c6707d9779c29bfa8871317c3ac253acbc3a3
//    │  │  ├─ 0c0adf64c6cb4bdb6057a70eee423614e7c1450d96f41c08b2d78f80df34b2b0
//    │  │  └─ 3e2e8dcffd42cb8e50e3bbbabf1ed3baad9a04c563ef838f78e9797b32a0879c
//    │  └─ f735b7c896963b9bda6e0a2004596e3bc3a3d17c4cc964c0d6f65d6097ee8b07
//    │     ├─ 107a5364d5e6a2a09fc9c446fad1433007d991937dd088bf32e7f1899c7c6619
//    │     └─ 17d6bd93e35da9aebe13ecb00bc3165edf2d36e58f5305f061c0204a7c4a2d63
//    └─ 663c22acec346f234125e2e42e6b37fff4e2efedd5670bf265c965ff1f8630a5
//       ├─ b6ca0d1a3992c784bf911b5140a6b13bb17e6f74594fdffca980bc466e51916e
//       │  ├─ b6050cfe80c9007bf30744121d8a3613fc31d267663564f6107f3cd9a4617bda
//       │  └─ d36bbb21b25ccd42a07a18d5a08bc27b437fa4c7311d0e71171e2ed4b007cf26
//       └─ fc3031eda0574545b2e70b6998d9fe93453fbba0b2af656b8a885794e29b8975
//          ├─ 3d3c56d2a2197b1e23063a5cb5bac7074fdf736d956f3aea6db9251884d4fb0e
//          └─ a7eab0a1c9555a5745f8618ef760c18e6c7086ab4c8ba6ae843666560d27621d
