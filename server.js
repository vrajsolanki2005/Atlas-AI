require("dotenv").config();

const app = require("./src/app");
const { syncDb } = require("./src/models");
const { startBot } = require("./src/bot/bot");

const PORT = process.env.PORT || 5000;
(async () => {
    await syncDb();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    
        startBot();
    })

})();