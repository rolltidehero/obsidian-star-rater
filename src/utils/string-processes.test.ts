import { describe, expect, test } from "@jest/globals";
import { 
    singleOrPlural, 
    sanitizeFileFolderName, 
    sanitizeInternalLinkName, 
    folderPathSanitize, 
    getFileExtension, 
    removeExtension, 
    getNameAndExt, 
    toSentenceCase, 
    parseFilepath, 
    trimFilenameExt,
    removeFrontmatter,
    removeCodeBlocks,
    removeXmlTags,
    simplifyWhiteSpace,
    removeMarkdownCharacters
} from "./string-processes";

////////////
////////////

describe(`singleOrPlural tests`, () => {

    test(`0 = plural`, () => {
        const result = singleOrPlural(0, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

    test(`1 = single`, () => {
        const result = singleOrPlural(1, 'daisy', 'daisies');
        expect(result).toEqual('daisy');
    })

    test(`2 = plural`, () => {
        const result = singleOrPlural(2, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

    test(`100 = plural`, () => {
        const result = singleOrPlural(100, 'daisy', 'daisies');
        expect(result).toEqual('daisies');
    })

    test(`-1 = single`, () => {
        const result = singleOrPlural(-1, 'daisy', 'daisies');
        expect(result).toEqual('daisy');
    })

    test(`uses default plural when no custom plural provided`, () => {
        const result = singleOrPlural(2, 'daisy');
        expect(result).toEqual('daisys');
    })

    test(`uses custom plural when provided`, () => {
        const result = singleOrPlural(2, 'person', 'people');
        expect(result).toEqual('people');
    })

});

describe(`sanitizeFileFolderName tests`, () => {

    test(`removes illegal characters`, () => {
        const result = sanitizeFileFolderName('file/name?with<illegal>chars');
        expect(result).toEqual('filenamewithillegalchars');
    })

    test(`removes control characters`, () => {
        const result = sanitizeFileFolderName('file\x00name\x1fwith\x80control\x9fchars');
        expect(result).toEqual('filenamewithcontrolchars');
    })

    test(`removes reserved names`, () => {
        const result = sanitizeFileFolderName('con.txt');
        expect(result).toEqual('');
    })

    test(`removes windows reserved names`, () => {
        const result = sanitizeFileFolderName('prn');
        expect(result).toEqual('');
    })

    test(`removes trailing dots and spaces`, () => {
        const result = sanitizeFileFolderName('filename. . ');
        expect(result).toEqual('filename');
    })

    test(`removes dots only names`, () => {
        const result = sanitizeFileFolderName('...');
        expect(result).toEqual('');
    })

    test(`keeps valid filenames unchanged`, () => {
        const result = sanitizeFileFolderName('valid-filename_123');
        expect(result).toEqual('valid-filename_123');
    })

});

describe(`sanitizeInternalLinkName tests`, () => {

    test(`removes link brackets`, () => {
        const result = sanitizeInternalLinkName('[[link name]]');
        expect(result).toEqual('link name');
    })

    test(`removes illegal characters and brackets`, () => {
        const result = sanitizeInternalLinkName('[[file/name?with<illegal>chars]]');
        expect(result).toEqual('filenamewithillegalchars');
    })

    test(`handles nested brackets`, () => {
        const result = sanitizeInternalLinkName('[[outer [inner] brackets]]');
        expect(result).toEqual('outer inner brackets');
    })

    test(`keeps valid link names unchanged`, () => {
        const result = sanitizeInternalLinkName('valid-link-name');
        expect(result).toEqual('valid-link-name');
    })

});

describe(`folderPathSanitize tests`, () => {

    test(`sanitizes each folder in path`, () => {
        const result = folderPathSanitize('folder1/filename?with<illegal>chars');
        expect(result).toEqual('folder1/filenamewithillegalchars');
    })

    test(`handles root path`, () => {
        const result = folderPathSanitize('/folder1/folder2');
        expect(result).toEqual('/folder1/folder2');
    })

    test(`handles empty path`, () => {
        const result = folderPathSanitize('');
        expect(result).toEqual('');
    })

    test(`handles single folder with illegal chars`, () => {
        const result = folderPathSanitize('foldername?with<illegal>chars');
        expect(result).toEqual('foldernamewithillegalchars');
    })

    test(`keeps valid paths unchanged`, () => {
        const result = folderPathSanitize('valid/folder/path');
        expect(result).toEqual('valid/folder/path');
    })

});

describe(`getFileExtension tests`, () => {

    test(`returns extension for simple filename`, () => {
        const result = getFileExtension('file.txt');
        expect(result).toEqual('txt');
    })

    test(`returns empty string for filename without extension`, () => {
        const result = getFileExtension('filename');
        expect(result).toEqual('');
    })

    test(`returns empty string for filename ending with dot`, () => {
        const result = getFileExtension('filename.');
        expect(result).toEqual('');
    })

    test(`returns last extension for multiple dots`, () => {
        const result = getFileExtension('file.name.txt');
        expect(result).toEqual('txt');
    })

    test(`converts extension to lowercase`, () => {
        const result = getFileExtension('file.TXT');
        expect(result).toEqual('txt');
    })

    test(`handles empty string`, () => {
        const result = getFileExtension('');
        expect(result).toEqual('');
    })

});

describe(`removeExtension tests`, () => {

    test(`removes extension from simple filename`, () => {
        const result = removeExtension('file.txt');
        expect(result).toEqual('file');
    })

    test(`keeps filename without extension unchanged`, () => {
        const result = removeExtension('filename');
        expect(result).toEqual('filename');
    })

    test(`removes extension from full path`, () => {
        const result = removeExtension('/path/to/file.txt');
        expect(result).toEqual('/path/to/file');
    })

    test(`handles filename ending with dot`, () => {
        const result = removeExtension('filename.');
        expect(result).toEqual('filename');
    })

    test(`removes last extension from multiple dots`, () => {
        const result = removeExtension('file.name.txt');
        expect(result).toEqual('file.name');
    })

    test(`handles empty string`, () => {
        const result = removeExtension('');
        expect(result).toEqual('');
    })

    test(`handles root path`, () => {
        const result = removeExtension('/');
        expect(result).toEqual('/');
    })

});

describe(`getNameAndExt tests`, () => {

    test(`splits filename with extension`, () => {
        const result = getNameAndExt('file.txt');
        expect(result).toEqual({ name: 'file', ext: 'txt' });
    })

    test(`handles filename without extension`, () => {
        const result = getNameAndExt('filename');
        expect(result).toEqual({ name: 'filename', ext: '' });
    })

    test(`handles filename ending with dot`, () => {
        const result = getNameAndExt('filename.');
        expect(result).toEqual({ name: 'filename', ext: '' });
    })

    test(`handles multiple dots`, () => {
        const result = getNameAndExt('file.name.txt');
        expect(result).toEqual({ name: 'file.name', ext: 'txt' });
    })

    test(`handles empty string`, () => {
        const result = getNameAndExt('');
        expect(result).toEqual({ name: '', ext: '' });
    })

    test(`handles dot only`, () => {
        const result = getNameAndExt('.');
        expect(result).toEqual({ name: '', ext: '' });
    })

});

describe(`toSentenceCase tests`, () => {

    test(`capitalizes first letter and lowercases rest`, () => {
        const result = toSentenceCase('hello world');
        expect(result).toEqual('Hello world');
    })

    test(`handles all uppercase`, () => {
        const result = toSentenceCase('HELLO WORLD');
        expect(result).toEqual('Hello world');
    })

    test(`handles all lowercase`, () => {
        const result = toSentenceCase('hello world');
        expect(result).toEqual('Hello world');
    })

    test(`handles mixed case`, () => {
        const result = toSentenceCase('hElLo WoRlD');
        expect(result).toEqual('Hello world');
    })

    test(`handles single character`, () => {
        const result = toSentenceCase('a');
        expect(result).toEqual('A');
    })

    test(`handles empty string`, () => {
        const result = toSentenceCase('');
        expect(result).toEqual('');
    })

});

describe(`parseFilepath tests`, () => {

    test(`parses simple filename`, () => {
        const result = parseFilepath('file.txt');
        expect(result).toEqual({ folderpath: '', basename: 'file', ext: 'txt' });
    })

    test(`parses filepath with folder`, () => {
        const result = parseFilepath('/path/to/file.txt');
        expect(result).toEqual({ folderpath: '/path/to', basename: 'file', ext: 'txt' });
    })

    test(`handles filename without extension`, () => {
        const result = parseFilepath('/path/to/filename');
        expect(result).toEqual({ folderpath: '/path/to', basename: 'filename', ext: '' });
    })

    test(`handles root directory`, () => {
        const result = parseFilepath('/');
        expect(result).toEqual({ folderpath: '/', basename: '', ext: '' });
    })

    test(`handles filename ending with dot`, () => {
        const result = parseFilepath('file.');
        expect(result).toEqual({ folderpath: '', basename: 'file', ext: '' });
    })

    test(`handles multiple dots in filename`, () => {
        const result = parseFilepath('file.name.txt');
        expect(result).toEqual({ folderpath: '', basename: 'file.name', ext: 'txt' });
    })

    test(`handles empty string`, () => {
        const result = parseFilepath('');
        expect(result).toEqual({ folderpath: '', basename: '', ext: '' });
    })

});

describe(`trimFilenameExt tests`, () => {

    test(`removes extension from filename`, () => {
        const result = trimFilenameExt('file.txt');
        expect(result).toEqual('file');
    })

    test(`removes last extension from multiple dots`, () => {
        const result = trimFilenameExt('file.name.txt');
        expect(result).toEqual('file.name');
    })

    test(`handles filename without extension`, () => {
        const result = trimFilenameExt('filename');
        expect(result).toEqual('filename');
    })

    test(`handles filename ending with dot`, () => {
        const result = trimFilenameExt('filename.');
        expect(result).toEqual('filename');
    })

    test(`handles empty string`, () => {
        const result = trimFilenameExt('');
        expect(result).toEqual('');
    })

    test(`handles dot only`, () => {
        const result = trimFilenameExt('.');
        expect(result).toEqual('');
    })

});

describe(`removeFrontmatter tests`, () => {

    test(`removes simple frontmatter`, () => {
        const input = `---
title: My Note
tags: [note, important]
---

This is the content.`;
        const result = removeFrontmatter(input);
        expect(result).toEqual('This is the content.');
    })

    test(`removes frontmatter with complex content`, () => {
        const input = `---
title: "Complex Note"
date: 2023-01-01
tags: 
  - note
  - important
aliases: [alias1, alias2]
---

Content here.`;
        const result = removeFrontmatter(input);
        expect(result).toEqual('Content here.');
    })

    test(`handles multiple frontmatter blocks`, () => {
        const input = `---
title: First
---

Some content.

---
title: Second
---

More content.`;
        const result = removeFrontmatter(input);
        expect(result).toEqual('Some content.\n\nMore content.');
    })

    test(`handles text without frontmatter`, () => {
        const input = 'This is just regular content without frontmatter.';
        const result = removeFrontmatter(input);
        expect(result).toEqual(input);
    })

    test(`handles empty string`, () => {
        const result = removeFrontmatter('');
        expect(result).toEqual('');
    })

    test(`handles only frontmatter`, () => {
        const input = `---
title: Note
---`;
        const result = removeFrontmatter(input);
        expect(result).toEqual('');
    })

});

describe(`removeCodeBlocks tests`, () => {

    test(`removes simple code block`, () => {
        const input = `Some text.

\`\`\`
const code = "example";
console.log(code);
\`\`\`

More text.`;
        const result = removeCodeBlocks(input);
        expect(result).toEqual('Some text.\n\nMore text.');
    })

    test(`removes code block with language specification`, () => {
        const input = `Text before.

\`\`\`javascript
const x = 1;
const y = 2;
\`\`\`

Text after.`;
        const result = removeCodeBlocks(input);
        expect(result).toEqual('Text before.\n\nText after.');
    })

    test(`removes multiple code blocks`, () => {
        const input = `Start.

\`\`\`js
const a = 1;
\`\`\`

Middle.

\`\`\`python
def func():
    pass
\`\`\`

End.`;
        const result = removeCodeBlocks(input);
        expect(result).toEqual('Start.\n\nMiddle.\n\nEnd.');
    })

    test(`handles text without code blocks`, () => {
        const input = 'This is just regular text without any code blocks.';
        const result = removeCodeBlocks(input);
        expect(result).toEqual(input);
    })

    test(`handles empty string`, () => {
        const result = removeCodeBlocks('');
        expect(result).toEqual('');
    })

    test(`handles only code block`, () => {
        const input = `\`\`\`
const code = "example";
\`\`\``;
        const result = removeCodeBlocks(input);
        expect(result).toEqual('');
    })

    test(`handles code block with backticks inside`, () => {
        const input = `Text.

\`\`\`
const template = \`Hello \${name}\`;
\`\`\`

More text.`;
        const result = removeCodeBlocks(input);
        expect(result).toEqual('Text.\n\nMore text.');
    })

});

describe(`removeXmlTags tests`, () => {

    test(`removes simple XML tags`, () => {
        const input = 'Text with <tag>content</tag> inside.';
        const result = removeXmlTags(input);
        expect(result).toEqual('Text with content inside.');
    })

    test(`removes self-closing tags`, () => {
        const input = 'Text with <br/> and <img src="test.jpg" /> tags.';
        const result = removeXmlTags(input);
        expect(result).toEqual('Text with  and  tags.');
    })

    test(`removes multiple tags`, () => {
        const input = '<div>Content with <span>nested</span> tags.</div>';
        const result = removeXmlTags(input);
        expect(result).toEqual('Content with nested tags.');
    })

    test(`handles text without XML tags`, () => {
        const input = 'This is just regular text without any XML tags.';
        const result = removeXmlTags(input);
        expect(result).toEqual(input);
    })

    test(`handles empty string`, () => {
        const result = removeXmlTags('');
        expect(result).toEqual('');
    })

    test(`handles only XML tags`, () => {
        const input = '<div>Content</div>';
        const result = removeXmlTags(input);
        expect(result).toEqual('Content');
    })

    test(`handles malformed tags`, () => {
        const input = 'Text with <unclosed> and <tag>content';
        const result = removeXmlTags(input);
        expect(result).toEqual('Text with  and content');
    })

});

describe(`simplifyWhiteSpace tests`, () => {

    test(`replaces escaped newlines with periods`, () => {
        const input = 'Line 1\\nLine 2\\nLine 3';
        const result = simplifyWhiteSpace(input);
        expect(result).toEqual('Line 1. Line 2. Line 3');
    })

    test(`handles escaped newlines with spaces`, () => {
        const input = 'Line 1\\n  Line 2  \\n  Line 3';
        const result = simplifyWhiteSpace(input);
        expect(result).toEqual('Line 1. Line 2. Line 3');
    })

    test(`handles multiple consecutive escaped newlines`, () => {
        const input = 'Line 1\\n\\n\\nLine 2';
        const result = simplifyWhiteSpace(input);
        expect(result).toEqual('Line 1. Line 2');
    })

    test(`handles text without escaped newlines`, () => {
        const input = 'This is just regular text without escaped newlines.';
        const result = simplifyWhiteSpace(input);
        expect(result).toEqual(input);
    })

    test(`handles empty string`, () => {
        const result = simplifyWhiteSpace('');
        expect(result).toEqual('');
    })

    test(`handles only escaped newlines`, () => {
        const input = '\\n\\n\\n';
        const result = simplifyWhiteSpace(input);
        expect(result).toEqual('. ');
    })

});

describe(`removeMarkdownCharacters tests`, () => {

    test(`removes headers`, () => {
        const input = `# Header 1
## Header 2
### Header 3
Content here.`;
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Header 1\nHeader 2\nHeader 3\nContent here.');
    })

    test(`removes bold formatting`, () => {
        const input = 'Text with **bold** and __bold__ formatting.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with bold and bold formatting.');
    })

    test(`removes italic formatting`, () => {
        const input = 'Text with *italic* and _italic_ formatting.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with italic and italic formatting.');
    })

    test(`removes strikethrough`, () => {
        const input = 'Text with ~~strikethrough~~ formatting.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with strikethrough formatting.');
    })

    test(`removes inline code`, () => {
        const input = 'Text with `code` formatting.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with code formatting.');
    })

    test(`removes links`, () => {
        const input = 'Text with [link text](https://example.com) and [another link](https://test.com).';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with link text and another link.');
    })

    test(`removes images`, () => {
        const input = 'Text with ![alt text](image.jpg) image.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with alt text image.');
    })

    test(`removes blockquotes`, () => {
        const input = `Regular text.
> This is a blockquote.
> Another line.
More text.`;
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Regular text.\nThis is a blockquote.\nAnother line.\nMore text.');
    })

    test(`removes lists`, () => {
        const input = `Text before.
- List item 1
- List item 2
* Another list item
+ Yet another item
1. Numbered item
2. Another numbered item
Text after.`;
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text before.\nList item 1\nList item 2\nAnother list item\nYet another item\nNumbered item\nAnother numbered item\nText after.');
    })

    test(`removes horizontal rules`, () => {
        const input = `Text before.\n---\nText after.\n***\nMore text.\n___\nFinal text.\n_\nFinal text.`;
        const result = removeMarkdownCharacters(input);
        console.log('Horizontal rules actual output:', JSON.stringify(result));
        expect(result).toEqual('Text before.\nText after.\nMore text.\nFinal text.\n_\nFinal text.');
    })

    test(`removes Obsidian internal links`, () => {
        const input = 'Text with [[filename]] and [[filename|display text]] links.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with filename and display text links.');
    })

    test(`removes Obsidian callouts`, () => {
        const input = `Regular text.
> [!NOTE] This is a note callout.
> [!WARNING] This is a warning callout.
More text.`;
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Regular text.\nMore text.');
    })

    test(`removes tags`, () => {
        const input = 'Text with #tag1 and #another-tag tags.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with tag1 and another-tag tags.');
    })

    test(`removes highlighting`, () => {
        const input = 'Text with ==highlighted== content.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with highlighted content.');
    })

    test(`removes comments`, () => {
        const input = `Regular text.
% This is a comment
More text.
% Another comment`;
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Regular text.\nMore text.');
    })

    test(`removes escape characters`, () => {
        const input = 'Text with \\*escaped\\* and \\#characters\\.';
        const result = removeMarkdownCharacters(input);
        console.log('Escape characters actual output:', JSON.stringify(result));
        expect(result).toEqual('Text with *escaped* and #characters.');
    })

    test(`handles complex markdown`, () => {
        const input = `# Main Header\n\nThis is a **bold** paragraph with *italic* text and \`code\`.\n\n> [!NOTE] Important note\n> This is a callout.\n\n- List item 1\n- List item 2\n\n[[Internal Link]] and [External Link](https://example.com)\n\n==Highlighted== text with #tags.`;
        const result = removeMarkdownCharacters(input);
        console.log('Complex markdown actual output:', JSON.stringify(result));
        expect(result).toEqual(`Main Header\n\nThis is a bold paragraph with italic text and code.\n\nImportant note\nThis is a callout.\n\nList item 1\nList item 2\n\nInternal Link and External Link\n\nHighlighted text with tags.`);
    })

    test(`handles text without markdown`, () => {
        const input = 'This is just plain text without any markdown formatting.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual(input);
    })

    test(`handles empty string`, () => {
        const result = removeMarkdownCharacters('');
        expect(result).toEqual('');
    })

    test(`handles nested formatting`, () => {
        const input = 'Text with **bold *italic* text** and `code with **formatting**`.';
        const result = removeMarkdownCharacters(input);
        expect(result).toEqual('Text with bold italic text and code with formatting.');
    })

});
