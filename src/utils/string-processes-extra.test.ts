import { describe, expect, test } from "@jest/globals";
import { simplifyWhiteSpace, parseFilepath } from "./string-processes";

describe("simplifyWhiteSpace", () => {
  test("collapses escaped newlines and spaces into '. ' and trims", () => {
    const input = "Line one\\n  \\nLine two  \\n\\nLine three";
    const out = simplifyWhiteSpace(input);
    expect(out).toBe("Line one. Line two. Line three");
  });

  test("handles sequences of periods and spaces", () => {
    const input = "Hello .  .world";
    const out = simplifyWhiteSpace(input);
    expect(out).toBe("Hello. world");
  });
});

describe("parseFilepath edge cases", () => {
  test("handles filenames with multiple dots and no ext (last dot is part of name)", () => {
    // Based on implementation, last dot splits name/ext. So here ext is 'name'.
    const res = parseFilepath("/a/b/file.name");
    expect(res.folderpath).toBe("/a/b");
    expect(res.basename).toBe("file");
    expect(res.ext).toBe("name");
  });

  test("handles hidden files and extensions", () => {
    const res = parseFilepath("/a/.env.local");
    expect(res.folderpath).toBe("/a");
    expect(res.basename).toBe(".env");
    expect(res.ext).toBe("local");
  });
});


