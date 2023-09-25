const crypto = require("crypto");
const chalk = require("chalk");

// Generate a random secret for the session
const secret = crypto.randomBytes(16).toString("hex");

console.log(chalk.green(`✅ Your session secret is: ${secret}`));

return;
