const fs = require('fs');
const path = 'e:\\localweb\\Local-Business-Listing-Directctory\\apps\\web\\app\\business\\[slug]\\BusinessDetailClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// The extra braces are at line 739.
// I'll look for "})}}" and replace with "})}"
const wrongBraces = '})}}';
const correctBraces = '})}';

if (content.includes(wrongBraces)) {
    content = content.replace(wrongBraces, correctBraces);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully fixed extra braces in BusinessDetailClient.tsx');
} else {
    console.error('Could not find sequence "})}}"');
}
