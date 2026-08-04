const { Op } = require("sequelize");
const Agenda = require("../../models/Agenda");

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

class AgendaService {
  async addEvent(userId, title, time, date = todayDate()) {
    return Agenda.create({ userId, title, time, date });
  }

  async getTodayEvents(userId) {
    return Agenda.findAll({
      where: { userId, date: todayDate() },
      order: [["time", "ASC"]],
    });
  }

  async getNextEvent(userId) {
    const events = await Agenda.findAll({
      where: {
        userId,
        date: todayDate(),
        time: { [Op.gte]: currentTime() },
      },
      order: [["time", "ASC"]],
      limit: 1,
    });
    return events[0] || null;
  }

  async deleteEvent(userId, eventId) {
    return Agenda.destroy({ where: { id: eventId, userId } });
  }
}

module.exports = new AgendaService();
