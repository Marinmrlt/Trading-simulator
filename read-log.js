const fs = require('fs');
const content = fs.readFileSync('backend_log.txt', 'utf16le');
console.log(content.split('\n').filter(l => l.includes('ERROR') || l.includes('Exception') || l.includes('Error:') || l.includes('    at ')).join('\n'));
