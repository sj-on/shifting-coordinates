module.exports = function (eleventyConfig) {
  // House style: everything on the site is lowercase. Warn (don't block) on
  // every dev/build pass so a stray capital gets noticed immediately; the
  // strict, build-breaking check lives in `npm run lint`.
  eleventyConfig.on("beforeBuild", () => {
    try {
      require("child_process").execSync("node scripts/check-lowercase.js --warn", {
        cwd: __dirname,
        stdio: "inherit",
      });
    } catch (e) {
      // never let the lint step itself break a build
    }
  });

  // Static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  // Sorted chapter collection (by front-matter "order", not filename)
  eleventyConfig.addCollection("chapters", (collectionApi) => {
    return collectionApi
      .getFilteredByTag("chapter")
      .sort((a, b) => a.data.order - b.data.order);
  });

  // Find an item's index inside a collection by URL — used for prev/next nav
  eleventyConfig.addFilter("findIndexByUrl", (arr, url) => {
    return arr.findIndex((item) => item.url === url);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
