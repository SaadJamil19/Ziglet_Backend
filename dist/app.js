"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const data_source_1 = require("./data-source");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const meme_routes_1 = __importDefault(require("./routes/meme.routes"));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/submissions/meme', meme_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Database & Server Start
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('✅ Data Source has been initialized!');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('❌ Error during Data Source initialization:', err);
});
exports.default = app;
