const Watchlist = require("../../models/Watchlist");

class WatchlistService{
    async add(userId,company){
        return Watchlist.findOrCreate({
            where:{userId,company}
        })
    }

    async remove(userId, company){
        return Watchlist.destroy({
            where:{userId, company}
        })
    }

    async getAll(userId){
        return Watchlist.findAll({
            where:{userId}
        })
    }
}
module.exports = WatchlistService;