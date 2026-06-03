"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
dotenv_1.default.config();
const DEFAULT_PORT = 3000;
function resolvePort(value) {
    if (!value) {
        return DEFAULT_PORT;
    }
    const port = Number(value);
    if (!Number.isInteger(port) || port <= 0) {
        return DEFAULT_PORT;
    }
    return port;
}
const port = resolvePort(process.env.PORT);
app_1.app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
