const fs = require('fs');

const filePath = 'src/api/v1/controllers/user/team.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Remove all @ts-expect-error comments
content = content.replace(/\s*\/\/ @ts-expect-error - paginate method exists but not in types\n/g, '');

fs.writeFileSync(filePath, content);
console.log('Fixed team.ts - removed all @ts-expect-error directives');