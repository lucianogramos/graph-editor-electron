const fs = require('fs');
const path = require('path');

const configFileName = path.join(__dirname, process.argv[2]);

if (!configFileName.endsWith(".json")) {
    throw new Error(`the '${configFileName}' file must have the .json extension`);
}
if (!fs.existsSync(configFileName)) {
    throw new Error('The specified path does not exist');
}

const data = JSON.parse(fs.readFileSync(configFileName, 'utf-8'));

const files = data['files'];
if (files === undefined) {
    console.log('No files copied');
    process.exit(0);
}

const dest = data['dest'];
if (dest === undefined || typeof dest !== 'string') {
    throw new Error("property 'dest' has not been defined or its type is incorrect. It must be of type string");
}
const destDir = path.join(__dirname, dest);
fs.mkdirSync(destDir, { recursive: true });

console.log()

for (const fileName of files) {
    if (typeof fileName !== 'string') {
        console.log(`The '${fileName}' file was ignored because it is not a string`)
        continue;
    }
    fs.copyFileSync(path.join(__dirname, fileName), path.join(destDir, fileName.split('/').at(-1)));
}

console.log('Files copied successfully');
