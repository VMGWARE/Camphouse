const { createWriteStream } = require("fs");
const axios = require("axios");
const { SitemapStream, streamToPromise } = require("sitemap");
const path = require("path");

const USERS_SITEMAP_FILE = path.join(__dirname, "../public", "users-sitemap.xml");
const POSTS_SITEMAP_FILE = path.join(__dirname, "../public", "posts-sitemap.xml");

const updateUsersSitemap = async () => {
  try {
    const response = await axios.get(
      "https://camphouse.vmgware.dev/api/v1/users?page=1&limit=1000"
    );
    const userData = response.data;
    const users = userData.data.users;

    const sitemapStream = new SitemapStream({
      hostname: "https://camphouse.vmgware.dev/",
      lastmodDateOnly: false,
    });

    for (const user of users) {
      const userHandle = user.handle;
      const userLink = `https://camphouse.vmgware.dev/@${userHandle}`;

      sitemapStream.write({
        url: userLink,
        changefreq: "weekly",
        lastmod: user.updatedAt,
      });
    }

    sitemapStream.end();
    const sitemapXML = await streamToPromise(sitemapStream);
    const sitemapFile = createWriteStream(USERS_SITEMAP_FILE);
    sitemapFile.write(sitemapXML.toString());
    sitemapFile.end();

    console.log("Users sitemap updated successfully!");
  } catch (error) {
    console.error("Failed to update users sitemap:", error);
  }
};

// Function to update the posts sitemap
const updatePostsSitemap = async () => {
  try {
    const response = await axios.get(
      "https://camphouse.vmgware.dev/api/v1/posts?page=1&limit=1000"
    );
    const postData = response.data;
    const posts = postData.data.posts;

    const sitemapStream = new SitemapStream({
      hostname: "https://camphouse.vmgware.dev/",
      lastmodDateOnly: false,
    });

    for (const post of posts) {
      const postId = post._id;
      const postLink = `https://camphouse.vmgware.dev/post/${postId}`;

      sitemapStream.write({
        url: postLink,
        changefreq: "daily",
        lastmod: post.updatedAt,
      });
    }

    sitemapStream.end();
    const sitemapXML = await streamToPromise(sitemapStream);
    const sitemapFile = createWriteStream(POSTS_SITEMAP_FILE);
    sitemapFile.write(sitemapXML.toString());
    sitemapFile.end();

    console.log("Posts sitemap updated successfully!");
  } catch (error) {
    console.error("Failed to update posts sitemap:", error);
  }
};

module.exports = {
  updateUsersSitemap,
  updatePostsSitemap,
  USERS_SITEMAP_FILE,
  POSTS_SITEMAP_FILE,
};
