import re
import os
import sys

def remove_comments(text, ext):
    if ext in ['.js', '.jsx']:
        # Step 1: Remove JSX context comments {/* ... */}
        pattern_jsx = r'\{\s*/\*[\s\S]*?\*/\s*\}'
        text = re.sub(pattern_jsx, "", text, flags=re.MULTILINE)

        # Step 2: Regular JS strings/comments
        pattern = r'("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`)|(/\*[\s\S]*?\*/|\/\/.*$)'
        def replacer(match):
            if match.group(1): # It's a string
                return match.group(1)
            else: # It's a comment
                return ""
        return re.sub(pattern, replacer, text, flags=re.MULTILINE)
    elif ext == '.css':
        # CSS only has /* */ comments
        pattern = r"((['\"])(?:(?!\2).|\\.)*\2)|(/\*[\s\S]*?\*/)"
        def replacer(match):
            if match.group(1):
                return match.group(1)
            else:
                return ""
        return re.sub(pattern, replacer, text, flags=re.MULTILINE)
    return text

def process_file(filepath):
    _, ext = os.path.splitext(filepath)
    if ext not in ['.js', '.jsx', '.css']:
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = remove_comments(content, ext)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Processed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_comments.py <directory_or_file>")
        sys.exit(1)

    target = sys.argv[1]
    if os.path.isfile(target):
        process_file(target)
    elif os.path.isdir(target):
        for root, dirs, files in os.walk(target):
            for file in files:
                process_file(os.path.join(root, file))
