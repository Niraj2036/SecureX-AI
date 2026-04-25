
let fs = require("fs");
let f = "src/mail/mail.module.ts";
let c = fs.readFileSync(f, "utf8");
c = c.replace(
  "const accessToken = await oAuth2Client.getAccessToken();",
  `let accessTokenToken = "";
        try {
          if (process.env.REFRESH_TOKEN) {
            const accessToken = await oAuth2Client.getAccessToken();
            accessTokenToken = accessToken.token;
          } else {
            console.warn("⚠️ Warning: REFRESH_TOKEN not set in .env. Email features are disabled/mocked.");
          }
        } catch (e) {
          console.warn("⚠️ Warning: Failed to authenticate with Google OAuth. Email features disabled. Error:", e.message);
        }`
);
c = c.replace("accessToken: accessToken.token,", "accessToken: accessTokenToken,");
fs.writeFileSync(f, c);

