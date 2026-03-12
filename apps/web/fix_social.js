const fs = require('fs');
const glob = require('path');
// Since some tools struggle with [slug], I'll use a relative path from the script
const path = './app/business/[slug]/BusinessDetailClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use a regex that ignores whitespace for the mapping start
const mapRegex = /\{business\.vendor\.socialLinks\.map\(\(link, idx\) => \{[\s\S]*?\}\)/;

const match = content.match(mapRegex);
if (!match) {
    console.error('Regex could not find socialLinks.map block');
    process.exit(1);
}

const originalBlock = match[0];

// Get indentation of the line before the block (687)
const lines = content.substring(0, match.index).split('\n');
const lastLine = lines[lines.length - 1];
const indent = lastLine.match(/^\s*/)[0];
const subIndent = indent + '    ';

const newBlock = `{business.vendor.socialLinks.map((link, idx) => {
${subIndent}if (!link.url) return null;
${subIndent}
${subIndent}let platform = (link.platform || '').toLowerCase();
${subIndent}
${subIndent}// Infer platform from URL if missing
${subIndent}if (!platform) {
${subIndent}    const url = link.url.toLowerCase();
${subIndent}    if (url.includes('facebook')) platform = 'facebook';
${subIndent}    else if (url.includes('twitter') || url.includes('x.com')) platform = 'twitter';
${subIndent}    else if (url.includes('instagram')) platform = 'instagram';
${subIndent}    else if (url.includes('linkedin')) platform = 'linkedin';
${subIndent}    else if (url.includes('youtube')) platform = 'youtube';
${subIndent}    else if (url.includes('wa.me') || url.includes('whatsapp')) platform = 'whatsapp';
${subIndent}    else platform = 'website';
${subIndent}}
${subIndent}
${subIndent}let Icon = LinkIcon;
${subIndent}let colorClass = 'bg-slate-800 hover:bg-slate-700 text-white';
${subIndent}
${subIndent}if (platform.includes('facebook')) {
${subIndent}    Icon = Facebook;
${subIndent}    colorClass = 'bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/30';
${subIndent}} else if (platform.includes('twitter') || platform.includes('x')) {
${subIndent}    Icon = Twitter;
${subIndent}    colorClass = 'bg-slate-800 text-white hover:bg-slate-700';
${subIndent}} else if (platform.includes('instagram')) {
${subIndent}    Icon = Instagram;
${subIndent}    colorClass = 'bg-[#E4405F]/20 text-[#E4405F] hover:bg-[#E4405F]/30';
${subIndent}} else if (platform.includes('linkedin')) {
${subIndent}    Icon = Linkedin;
${subIndent}    colorClass = 'bg-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/30';
${subIndent}} else if (platform.includes('youtube')) {
${subIndent}    Icon = Youtube;
${subIndent}    colorClass = 'bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000]/30';
${subIndent}} else if (platform.includes('whatsapp')) {
${subIndent}    Icon = MessageSquare;
${subIndent}    colorClass = 'bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30';
${subIndent}}
${subIndent}
${subIndent}return (
${subIndent}    <a
${subIndent}        key={idx}
${subIndent}        href={link.url}
${subIndent}        target="_blank"
${subIndent}        rel="noopener noreferrer"
${subIndent}        className={\`p-2.5 rounded-xl transition-all \${colorClass}\`}
${subIndent}        title={link.platform || platform.charAt(0).toUpperCase() + platform.slice(1)}
${subIndent}    >
${subIndent}        <Icon className="w-4 h-4" />
${subIndent}    </a>
${subIndent});
${indent}})}`;

content = content.replace(originalBlock, newBlock);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated BusinessDetailClient.tsx');
