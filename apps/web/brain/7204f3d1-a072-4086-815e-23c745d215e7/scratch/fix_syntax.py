import os

file_path = r"e:\localweb\Local-Business-Listing-directory\apps\web\app\(dashboard)\settings\page.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if '                            }}>' in lines[i]:
        lines[i] = lines[i].replace('                            }}>', '                            `}>')
        print(f"Replaced line {i+1}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
