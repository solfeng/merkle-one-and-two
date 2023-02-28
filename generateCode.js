const fs = require('fs');
function randomString(length) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i)
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}


async function main() {
    let res = {}
    let codeA = new Set()
    for (let index = 0; index < 100; index++) {
        let code = randomString(20);
        // console.log(res)
        if (!codeA.has(code)) {
            res = {
                ...res,
                [code]: 3
            }
        }
        codeA.add(code)
        let count = Object.keys(res).length;
        console.log(count)
        if (count == 20) break
    }
    fs.writeFileSync('./CodeTreeList.json', JSON.stringify(res))

}

main()