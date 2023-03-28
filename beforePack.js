const fs = require('fs');
const { execSync } = require('child_process');

exports.default = function (context) {
    const commit = execSync('git rev-parse --short HEAD').toString().trim();
    const pjson = JSON.parse(fs.readFileSync('./package.json'));
    fs.writeFileSync('./package.json', JSON.stringify({ ...pjson, commit }));
    console.log("\t> injected commit=" + commit);
}