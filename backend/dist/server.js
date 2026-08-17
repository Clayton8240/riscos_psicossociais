"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configuração de CORS permissiva para desenvolvimento
app.use((0, cors_1.default)({
    origin: '*', // Em produção, altere para os domínios do Frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Configuração do Rate Limiter para impedir robôs e spam
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP por janela de 15 min
    message: { error: 'Muitas requisições originadas deste IP, por favor tente novamente após 15 minutos.' },
    standardHeaders: true, // Retorna os headers `RateLimit-*`
    legacyHeaders: false, // Desabilita o cabeçalho `X-RateLimit-*`
});
// Aplica o rate limiter em todas as rotas (pode ser restrito às rotas públicas se desejado)
app.use(limiter);
app.use(routes_1.routes);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
