"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const [, token] = authorization.split(' ');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'supersecret_key_change_in_production');
        const { id, tenantId, role } = decoded;
        req.user = {
            id,
            tenantId,
            role,
            iat: decoded.iat,
            exp: decoded.exp
        };
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
