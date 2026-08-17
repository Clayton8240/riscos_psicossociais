"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = tenantMiddleware;
function tenantMiddleware(req, res, next) {
    // Esse middleware garante que a requisição tenha informações do tenant,
    // útil para endpoints em que apenas usuários de um mesmo tenant podem acessar.
    if (!req.user || !req.user.tenantId) {
        return res.status(403).json({ error: 'Acesso negado. Informação de Tenant ausente.' });
    }
    // Você pode adicionar lógicas extras aqui, por exemplo, verificar
    // se o tenantId ainda está ativo no banco, se for necessário.
    return next();
}
