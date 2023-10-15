const chalk = require("chalk");
const BlockedEmailDomain = require("../models/BlockedEmailDomain");

// Load environment variables
require("dotenv").config();

// fetch the blocked email domains from https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf
const fetchBlockedEmailDomains = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf"
  );
  const text = await response.text();
  const blockedEmailDomains = text
    .split("\n")
    .filter((domain) => domain.length > 0 && !domain.startsWith("#"));
  return blockedEmailDomains;
};

// Seed the blocked email domains
const seedBlockedEmailDomains = async () => {
  // Check if the admin user already exists
  const blockedEmailDomainsExist = await BlockedEmailDomain.exists();

  // If the admin user already exists, return
  if (blockedEmailDomainsExist) {
    console.log(chalk.yellow("Blocked email domains already exist"));
    return;
  }

  // Fetch the blocked email domains
  const blockedEmailDomains = await fetchBlockedEmailDomains();

  // Create the blocked email domains
  try {
    await BlockedEmailDomain.insertMany(
      blockedEmailDomains.map((domain) => ({ domain }))
    );
    console.log(chalk.green("Blocked email domains created successfully"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = { seedBlockedEmailDomains };
