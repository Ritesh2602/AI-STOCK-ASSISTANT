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
var generative_ai_1 = require("@google/generative-ai");
var cohere_ai_1 = require("cohere-ai");
// 🔑 Load env
require("dotenv/config");
function testGemini() {
    return __awaiter(this, void 0, void 0, function () {
        var genAI, model, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    return [4 /*yield*/, model.generateContent("Say hello from Gemini")];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.response.text()];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, "\u274C Gemini Error: ".concat(err_1.message)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testCohere() {
    return __awaiter(this, void 0, void 0, function () {
        var cohere, res, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    cohere = new cohere_ai_1.CohereClient({ token: process.env.COHERE_API_KEY });
                    return [4 /*yield*/, cohere.generate({
                            model: "command",
                            prompt: "Say hello from Cohere",
                        })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, res.generations[0].text];
                case 2:
                    err_2 = _a.sent();
                    return [2 /*return*/, "\u274C Cohere Error: ".concat(err_2.message)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testHF() {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, err_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://api-inference.huggingface.co/models/gpt2", {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer ".concat(process.env.HF_API_KEY),
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ inputs: "Say hello from Hugging Face" }),
                        })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _b.sent();
                    if (data.error)
                        throw new Error(data.error);
                    return [2 /*return*/, ((_a = data[0]) === null || _a === void 0 ? void 0 : _a.generated_text) || JSON.stringify(data)];
                case 3:
                    err_3 = _b.sent();
                    return [2 /*return*/, "\u274C HuggingFace Error: ".concat(err_3.message)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function runAll() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log("🔎 Testing AI Providers...\n");
                    _b = (_a = console).log;
                    _c = ["🟢 Gemini:"];
                    return [4 /*yield*/, testGemini()];
                case 1:
                    _b.apply(_a, _c.concat([_k.sent()]));
                    _e = (_d = console).log;
                    _f = ["🟢 Cohere:"];
                    return [4 /*yield*/, testCohere()];
                case 2:
                    _e.apply(_d, _f.concat([_k.sent()]));
                    _h = (_g = console).log;
                    _j = ["🟢 Hugging Face:"];
                    return [4 /*yield*/, testHF()];
                case 3:
                    _h.apply(_g, _j.concat([_k.sent()]));
                    console.log("\n✅ Done!");
                    return [2 /*return*/];
            }
        });
    });
}
runAll();
