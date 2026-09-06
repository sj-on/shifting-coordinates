module.exports = function (eleventyConfig) {
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
