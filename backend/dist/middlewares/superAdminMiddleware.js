"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminMiddleware = superAdminMiddleware;
function superAdminMiddleware(req, res, next) {
    var _a;
    const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (role !== 'SUPERADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Requer privilégios de Super Admin.' });
    }
    return next();
}
