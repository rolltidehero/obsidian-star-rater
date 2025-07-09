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
    trimFilenameExt 
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
