function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = {
  tags: "chapter",
  layout: "layouts/chapter.njk",
  eleventyComputed: {
    permalink: (data) => `/chapters/${slugify(data.title)}/`,
  },
};
