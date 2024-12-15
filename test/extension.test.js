const { describe, it } = require("node:test");
const assert = require("assert");

const { regexBuilder } = require("../src/utils/regexBuilder");

describe("regexBuilder", () => {
  it("generates a regex for en-US", () => {
    // No locale
    const regex = regexBuilder();
    const testString = "[Example](/en-US/docs/example-page)";

    const match = testString.match(regex);

    assert.ok(match);
    assert.strictEqual(match[1], "/en-US/docs/example-page");
    assert.strictEqual(match[2], "example-page");
    assert.strictEqual(match[3], undefined);
  });

  it("handles complex slugs", () => {
    const regex = regexBuilder();
    const longSlug =
      "[Example](/en-US/docs/example-page/one-two/Capital-Letters)";
    const match = longSlug.match(regex);

    assert.ok(match);
    assert.strictEqual(
      match[1],
      "/en-US/docs/example-page/one-two/Capital-Letters",
    );
    assert.strictEqual(match[2], "example-page/one-two/Capital-Letters");
    assert.strictEqual(match[3], undefined);
  });

  it("should match slugs with fragments", () => {
    const regex = regexBuilder("en-US");
    const testString = "[Example](/en-US/docs/example#section)";
    const match = testString.match(regex);

    assert.ok(match);
    assert.strictEqual(match[1], "/en-US/docs/example#section");
    assert.strictEqual(match[2], "example");
    assert.strictEqual(match[3], "#section");
  });

  describe("testing invalid cases", () => {
    it("should handle edge cases", () => {
      const regex = regexBuilder("en-US");
      const emptyString = "";
      const noMarkdownLink = "This is not a link";
      const brokenLink = "[Broken Link]/en-US/dos)";
      const noSlug = "[Link](/en-US/docs)";

      assert.strictEqual(null, emptyString.match(regex));
      assert.strictEqual(null, noMarkdownLink.match(regex));
      assert.strictEqual(null, brokenLink.match(regex));
      assert.strictEqual(null, noSlug.match(regex));
    });
  });
});
