"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var node_fetch_1 = require("node-fetch");
var wss = new ws_1.WebSocketServer({ port: 4000 }); // custom WS server
function broadcast(message) {
    wss.clients.forEach(function (client) {
        if (client.readyState === 1) {
            client.send(JSON.stringify(message));
        }
    });
}
// Fetch market news
function fetchMarketNews() {
    return __awaiter(this, void 0, void 0, function () {
        var res, news, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://finnhub.io/api/v1/news?category=general&token=".concat(process.env.FINNHUB_API_KEY))];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    news = _a.sent();
                    broadcast({ type: "news", data: news.slice(0, 5) });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("⚠️ WS News Fetch Error:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Fetch live indices (NIFTY, S&P500, NASDAQ, DOW)
function fetchMarketIndices() {
    return __awaiter(this, void 0, void 0, function () {
        var symbols, results, _i, symbols_1, symbol, res, data, quote, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    symbols = ["^GSPC", "^IXIC", "^DJI", "^NSEI"];
                    results = [];
                    _i = 0, symbols_1 = symbols;
                    _a.label = 1;
                case 1:
                    if (!(_i < symbols_1.length)) return [3 /*break*/, 5];
                    symbol = symbols_1[_i];
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://query1.finance.yahoo.com/v7/finance/quote?symbols=".concat(symbol))];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    quote = data.quoteResponse.result[0];
                    results.push({
                        symbol: quote.symbol,
                        name: quote.shortName,
                        price: quote.regularMarketPrice,
                        change: quote.regularMarketChange.toFixed(2),
                        percent: quote.regularMarketChangePercent.toFixed(2),
                    });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    broadcast({ type: "indices", data: results });
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    console.error("⚠️ WS Indices Fetch Error:", err_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Fetch every 10s
setInterval(function () {
    fetchMarketNews();
    fetchMarketIndices();
}, 10000);
wss.on("connection", function (socket) {
    console.log("🔌 Client connected");
    socket.send(JSON.stringify({ type: "welcome", message: "Connected to Market WS" }));
    socket.on("close", function () {
        console.log("❌ Client disconnected");
    });
});
console.log("✅ WebSocket server running on ws://localhost:4000");
