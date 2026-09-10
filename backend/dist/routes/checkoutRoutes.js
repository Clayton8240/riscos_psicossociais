"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutRoutes = void 0;
const express_1 = require("express");
const CheckoutController_1 = require("../controllers/CheckoutController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const checkoutRoutes = (0, express_1.Router)();
exports.checkoutRoutes = checkoutRoutes;
const checkoutController = new CheckoutController_1.CheckoutController();
// Público: pegar configs de pagamento disponíveis
checkoutRoutes.get('/config', checkoutController.getConfig);
// Público: Webhook para o Stripe
checkoutRoutes.post('/webhook', checkoutController.stripeWebhook);
// Privado: Criar Sessão do Stripe
checkoutRoutes.post('/stripe-session', authMiddleware_1.authMiddleware, checkoutController.createStripeSession);
// Privado: processar o pagamento fallback (usuário logado após criar conta)
checkoutRoutes.post('/process', authMiddleware_1.authMiddleware, checkoutController.processPayment);
