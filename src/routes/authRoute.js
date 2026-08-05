const router = require("express").Router();
const { google } = require("googleapis");
const User = require("../models/User");
const calendarService = require("../services/calendar/calendarService");

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

// GET /auth/google?telegramId=xxx
router.get("/auth/google", (req, res) => {
  const { telegramId } = req.query;
  if (!telegramId) return res.status(400).send("Missing telegramId");

  const auth = getOAuthClient();
  const url = auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",  // add this
    ],
    state: telegramId,
  });

  res.redirect(url);
});

// GET /auth/google/callback

router.get("/auth/google/callback", async (req, res) => {
  const { code, state: telegramId } = req.query;
  if (!code || !telegramId) return res.status(400).send("Invalid callback");

  try {
    const auth = getOAuthClient();
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth });
    const { data: profile } = await oauth2.userinfo.get();

    // Fetch the user's primary calendar timezone
    const calendar = google.calendar({ version: "v3", auth });
    const { data: calData } = await calendar.calendars.get({ calendarId: "primary" });
    const timeZone = calData.timeZone || "UTC";

    const user = await User.findOne({ where: { telegramId: String(telegramId) } });
    if (!user) return res.status(404).send("User not found");

    await calendarService.saveIntegration(user.id, {
      googleEmail: profile.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      timeZone,
    });

    res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>✅ Google Calendar connected!</h2>
        <p>You can close this tab and return to Telegram.</p>
      </body></html>
    `);
  } catch (err) {
    console.error("OAuth callback error:", err.message);
    console.error("OAuth error details:", err.response?.data || err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});


module.exports = router;
