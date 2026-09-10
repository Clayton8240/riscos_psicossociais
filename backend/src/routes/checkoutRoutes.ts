import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { authMiddleware } from '../middlewares/authMiddleware';

const checkoutRoutes = Router();
const checkoutController = new CheckoutController();

// Público: pegar configs de pagamento disponíveis
checkoutRoutes.get('/config', checkoutController.getConfig);

// Público: Webhook para o Stripe
checkoutRoutes.post('/webhook', checkoutController.stripeWebhook);

// Privado: Criar Sessão do Stripe
checkoutRoutes.post('/stripe-session', authMiddleware, checkoutController.createStripeSession);

// Privado: processar o pagamento fallback (usuário logado após criar conta)
checkoutRoutes.post('/process', authMiddleware, checkoutController.processPayment);

export { checkoutRoutes };
