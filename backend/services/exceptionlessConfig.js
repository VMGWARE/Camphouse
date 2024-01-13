// Load environment variables
require("dotenv").config();

let Exceptionless;

async function initializeExceptionless() {
	if (!Exceptionless) {
		Exceptionless = (await import("@exceptionless/node")).Exceptionless;

		await Exceptionless.startup((c) => {
			c.apiKey = process.env.EXCEPTIONLESS_API_KEY;
			c.serverUrl = process.env.EXCEPTIONLESS_SERVER_URL;
		});
	}
	return Exceptionless;
}

module.exports = initializeExceptionless;
