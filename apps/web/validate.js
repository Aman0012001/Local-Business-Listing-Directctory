const fs = require('fs');
const content = fs.readFileSync('apps/web/app/(dashboard)/offers/page.tsx', 'utf8');

function checkBalanced(str) {
    let stack = [];
    let pairs = { '{': '}', '(': ')', '[': ']' };
    let lines = str.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (pairs[char]) {
                stack.push({ char, line: i + 1, col: j + 1 });
            } else if (char === '}' || char === ')' || char === ']') {
                if (stack.length === 0) {
                    console.log(`Unmatched ${char} at line ${i + 1}, col ${j + 1}`);
                    return false;
                }
                let top = stack.pop();
                if (pairs[top.char] !== char) {
                    console.log(`Mismatch: ${top.char} at line ${top.line} closed by ${char} at line ${i + 1}`);
                    return false;
                }
            }
        }
    }
    
    if (stack.length > 0) {
        let top = stack.pop();
        console.log(`Unclosed ${top.char} at line ${top.line}`);
        return false;
    }
    
    console.log("All braces and parentheses are balanced!");
    return true;
}

checkBalanced(content);
