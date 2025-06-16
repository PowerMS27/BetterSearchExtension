import { describe, it, expect, beforeEach } from "vitest";
import { highlightText } from "@/utils/search-logic";

describe("highlightText", () => {
  let container;
  beforeEach(() => {
    document.body.innerHTML = ""; // clear DOM
    container = document.createElement("div");
    document.body.appendChild(container);

    // style for inline (span etc)
    const style = document.createElement("style");
    style.innerHTML = `
      span {
        display: inline;
      }
    `;
    document.head.appendChild(style);
  });

  /**
   * @param testHtml html to test on
   * @param expectedHtml expected result of search
   * @param searchInput text to search for
   * @param isToBeNull should result be found or not
   */
  const testFunction = (testHtml, expectedHtml, searchInput, isToBeNull) => {
    container.innerHTML = testHtml.trim();
    highlightText(searchInput);
    const highlightedText = container.querySelector(".better-search-highlight");
    isToBeNull
      ? expect(highlightedText).toBeNull()
      : expect(highlightedText).not.toBeNull();
    expect(container.innerHTML.trim()).toBe(expectedHtml);
  };

  // Single div with multiple words test
  it("search in single div", () => {
    testFunction(
      `<div>just a div</div>`,
      `<div><span class="better-search-highlight">just a</span> div</div>`,
      "just a",
      false
    );
  });

  // Should find text inside opacity 0
  it("search in opacity 0", () => {
    testFunction(
      `<div style="opacity: 0;">div without opacity</div>`,
      `<div style="opacity: 0;"><span class="better-search-highlight">div without opacity</span></div>`,
      "div without opacity",
      false
    );
  });

  // Last character of the first div and the first character of the second div in adjacent divs
  it("no results in adjacent divs", () => {
    testFunction(
      `<div>
        <div>div ends with A</div>
        <div>Div starts with d</div>
      </div>`,
      `<div>
        <div>div ends with A</div>
        <div>Div starts with d</div>
      </div>`,
      "ad",
      true
    );
  });

  // Should return no results inside visibility:hidden, display: none and opacity: 0 no matter how deep nesting is
  it("no results inside visibility hidden and display none", () => {
    testFunction(
      `<div style="display: none;">
        parent display none
        <div>
          child display none
          <div>child in child display none</div>
        </div>
      </div>`,
      `<div style="display: none;">
        parent display none
        <div>
          child display none
          <div>child in child display none</div>
        </div>
      </div>`,
      "display none",
      true
    );
    testFunction(
      `<div style="visibility: hidden;">
        parent visibility hidden
        <div>
          child visibility hidden
          <div>child in child visibility hidden</div>
        </div>
      </div>`,
      `<div style="visibility: hidden;">
        parent visibility hidden
        <div>
          child visibility hidden
          <div>child in child visibility hidden</div>
        </div>
      </div>`,
      "visibility hidden",
      true
    );
  });

  // Should return no results inside script tag
  it("no results inside script", () => {
    testFunction(
      `<script>
        const x = 'please don't find me'
      </script>`,
      `<script>
        const x = 'please don't find me'
      </script>`,
      "const x",
      true
    );
  });

  // Case sensitivity check
  it("case sensitivity", () => {
    testFunction(
      `<div>
        dIv WiTh EmO CaSe
      </div>`,
      `<div>
        dIv WiTh <span class="better-search-highlight">EmO CaSe</span>
      </div>`,
      "emo case",
      false
    );
  });

  // Test with double space between words, test searching for space
  it("space tests", () => {
    testFunction(
      `<div>double  space</div>`,
      `<div>double  space</div>`,
      "double space",
      true
    );
    testFunction(
      `<div>double  space</div>`,
      `<div><span class="better-search-highlight">double  space</span></div>`,
      "double  space",
      false
    );
    testFunction(
      `<div>single space</div>`,
      `<div>single<span class="better-search-highlight"> </span>space</div>`,
      " ",
      false
    );
  });

  // Special chars should be found
  it("special characters search", () => {
    testFunction(
      `<div>~!@#$%^&*()_+-_={}[]</div>`,
      `<div><span class="better-search-highlight">~!@#$%^&amp;*()_+-_={}[]</span></div>`,
      "~!@#$%^&*()_+-_={}[]",
      false
    );
  });

  // Search with nested elements
  it("search with nested elements", () => {
    testFunction(
      `<div>div<span>span</span></div>`,
      `<div><span class="better-search-highlight">div<span>spa</span></span><span>n</span></div>`,
      "divspa",
      false
    );
    testFunction(
      `<div>div <span>span<span> span in span</span></span></div>`,
      `<div><span class="better-search-highlight">div <span>span<span> span in</span></span></span><span><span> span</span></span></div>`,
      "div span span in",
      false
    );
  });
});
