const { google } = require("googleapis");
const CalendarIntegration = require("../../models/CalendarIntegration");
const { encrypt, decrypt } = require("../../utils/encrypt");

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

function startOfDay(date, timeZone) {
  const d = new Date(date.toLocaleDateString("en-CA", { timeZone }) + "T00:00:00");
  return d.toISOString();
}

function endOfDay(date, timeZone) {
  const d = new Date(date.toLocaleDateString("en-CA", { timeZone }) + "T23:59:59");
  return d.toISOString();
}

class CalendarService {
  async saveIntegration(userId, { googleEmail, accessToken, refreshToken, expiryDate, timeZone }) {
    const encrypted = {
      googleEmail,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : null,
      expiryDate,
      timeZone: timeZone || "UTC",
      connectedAt: new Date(),
    };

    const existing = await CalendarIntegration.findOne({ where: { userId } });
    if (existing) {
      return existing.update(encrypted);
    }
    return CalendarIntegration.create({ userId, ...encrypted });
  }

  async getIntegration(userId) {
    const row = await CalendarIntegration.findOne({ where: { userId } });
    if (!row) return null;
    return {
      googleEmail: row.googleEmail,
      accessToken: decrypt(row.accessToken),
      refreshToken: row.refreshToken ? decrypt(row.refreshToken) : null,
      expiryDate: row.expiryDate,
      timeZone: row.timeZone || "UTC",
    };
  }

  async getAuthClient(userId) {
    const integration = await this.getIntegration(userId);
    if (!integration) return null;

    const auth = getOAuthClient();
    auth.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: integration.expiryDate,
    });

    auth.on("tokens", async (tokens) => {
      const update = {};
      if (tokens.access_token) update.accessToken = encrypt(tokens.access_token);
      if (tokens.expiry_date) update.expiryDate = tokens.expiry_date;
      if (tokens.refresh_token) update.refreshToken = encrypt(tokens.refresh_token);
      if (Object.keys(update).length) {
        await CalendarIntegration.update(update, { where: { userId } });
      }
    });

    return auth;
  }

  async getTodayEvents(userId) {
    return this._getEvents(userId, new Date());
  }

  async getTomorrowEvents(userId) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this._getEvents(userId, tomorrow);
  }

  async getUpcomingEvents(userId, days = 7) {
    const auth = await this.getAuthClient(userId);
    if (!auth) return [];

    const calendar = google.calendar({ version: "v3", auth });
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 20,
    });

    return this._formatEvents(data.items || []);
  }

  async createEvent(userId, { title, startTime, endTime, description = "", timeZone }) {
    const auth = await this.getAuthClient(userId);
    if (!auth) throw new Error("Calendar not connected");

    const tz = timeZone || (await this.getIntegration(userId))?.timeZone || "UTC";
    const calendar = google.calendar({ version: "v3", auth });
    const { data } = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        description,
        start: { dateTime: startTime, timeZone: tz },
        end: { dateTime: endTime, timeZone: tz },
      },
    });
    return data;
  }

  async deleteEvent(userId, eventId) {
    const auth = await this.getAuthClient(userId);
    if (!auth) throw new Error("Calendar not connected");

    const calendar = google.calendar({ version: "v3", auth });
    await calendar.events.delete({ calendarId: "primary", eventId });
  }

  async _getEvents(userId, date) {
    const auth = await this.getAuthClient(userId);
    if (!auth) return [];

    const integration = await this.getIntegration(userId);
    const timeZone = integration?.timeZone || "UTC";

    const calendar = google.calendar({ version: "v3", auth });
    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay(date, timeZone),
      timeMax: endOfDay(date, timeZone),
      singleEvents: true,
      orderBy: "startTime",
      timeZone,
    });

    return this._formatEvents(data.items || []);
  }

  _formatEvents(items) {
    return items.map((e) => ({
      id: e.id,
      title: e.summary || "Untitled",
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      description: e.description || "",
    }));
  }
}

module.exports = new CalendarService();
