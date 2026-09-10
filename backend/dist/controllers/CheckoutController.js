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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutController = void 0;
const prismaClient_1 = require("../prismaClient");
const stripe_1 = __importDefault(require("stripe"));
class CheckoutController {
    // Retorna métodos de pagamento disponíveis para o front-end
    getConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const config = yield prismaClient_1.prisma.systemConfig.findUnique({
                    where: { key: 'payment_methods' }
                });
                let methods = [];
                if (config) {
                    try {
                        methods = JSON.parse(config.value).filter((m) => m.enabled);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
                else {
                    // Fallback default (Stripe centraliza Cartão, Boleto e Pix dependendo da conta)
                    methods = [
                        { id: 'credit_card', name: 'Cartão de Crédito', enabled: true, gateway: 'Stripe' },
                        { id: 'boleto', name: 'Boleto / Pix', enabled: true, gateway: 'Stripe' }
                    ];
                }
                return res.json({ methods });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao buscar configurações de pagamento' });
            }
        });
    }
    // Processa o pagamento (Simulação + Criação no Banco)
    processPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { planId, paymentMethod, cardInfo } = req.body;
            // user ID é extraído do token se ele estiver logado, ou pode ser um fluxo deslogado
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                if (!userId) {
                    return res.status(401).json({ error: 'Usuário não autenticado.' });
                }
                // Buscar o usuário e sua assinatura atual
                const user = yield prismaClient_1.prisma.user.findUnique({
                    where: { id: userId },
                    include: { tenant: true }
                });
                if (!user || !user.tenant) {
                    return res.status(400).json({ error: 'Empresa do usuário não encontrada.' });
                }
                const tenant = user.tenant;
                if (!tenant.subscriptionId) {
                    return res.status(400).json({ error: 'Empresa não possui assinatura vinculada para renovação.' });
                }
                let amount = 250;
                let planType = 'SMALL';
                let maxSubmissions = 30;
                let validityDays = 30;
                if (planId === 'small') {
                    amount = 250;
                    planType = 'SMALL';
                    maxSubmissions = 30;
                    validityDays = 30;
                }
                else if (planId === 'medium') {
                    amount = 450;
                    planType = 'MEDIUM';
                    maxSubmissions = 100;
                    validityDays = 45;
                }
                else if (planId === 'large') {
                    amount = 750;
                    planType = 'LARGE';
                    maxSubmissions = 300;
                    validityDays = 60;
                }
                else if (planId === 'custom') {
                    amount = 750;
                    planType = 'CUSTOM';
                    maxSubmissions = 99999;
                    validityDays = 90;
                }
                else if (planId === 'consultant_start') {
                    amount = 450;
                    planType = 'CONSULTANT_START';
                    maxSubmissions = 150;
                    validityDays = 30;
                }
                else if (planId === 'consultant_pro') {
                    amount = 750;
                    planType = 'CONSULTANT_PRO';
                    maxSubmissions = 600;
                    validityDays = 30;
                }
                else if (planId === 'consultant_enterprise') {
                    amount = 1400;
                    planType = 'CONSULTANT_ENTERPRISE';
                    maxSubmissions = 2000;
                    validityDays = 30;
                }
                const nextDueDate = new Date();
                nextDueDate.setDate(nextDueDate.getDate() + validityDays);
                const transaction = yield prismaClient_1.prisma.transaction.create({
                    data: {
                        subscriptionId: tenant.subscriptionId,
                        amount: amount,
                        gateway: 'MOCK_GATEWAY', // Stripe, Asaas, etc.
                        status: 'PAID',
                        paymentMethod: paymentMethod || 'CREDIT_CARD',
                        gatewayTransactionId: `mock_${Date.now()}`
                    }
                });
                // Atualiza a subscription com a "Next Due Date" (+validityDays)
                yield prismaClient_1.prisma.subscription.update({
                    where: { id: tenant.subscriptionId },
                    data: {
                        status: 'ACTIVE',
                        nextDueDate: nextDueDate,
                        planType: planType,
                        maxSubmissions: maxSubmissions
                    }
                });
                return res.json({ success: true, transaction });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Erro ao processar pagamento.' });
            }
        });
    }
    // Criar Sessão do Stripe
    createStripeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { planId } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                if (!userId)
                    return res.status(401).json({ error: 'Não autenticado' });
                // Buscar a secret do Stripe do BD
                const stripeConfig = yield prismaClient_1.prisma.systemConfig.findUnique({ where: { key: 'stripe_key' } });
                const stripeSecret = (stripeConfig === null || stripeConfig === void 0 ? void 0 : stripeConfig.value) || process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
                const stripe = new stripe_1.default(stripeSecret, {
                    apiVersion: '2026-08-26.dahlia',
                });
                const user = yield prismaClient_1.prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } });
                if (!user || !user.tenant || !user.tenant.subscriptionId) {
                    return res.status(400).json({ error: 'Assinatura inválida.' });
                }
                let amount = 250;
                let planType = 'SMALL';
                let maxSubmissions = 30;
                let validityDays = 30;
                if (planId === 'small') {
                    amount = 250;
                    planType = 'SMALL';
                    maxSubmissions = 30;
                    validityDays = 30;
                }
                else if (planId === 'medium') {
                    amount = 450;
                    planType = 'MEDIUM';
                    maxSubmissions = 100;
                    validityDays = 45;
                }
                else if (planId === 'large') {
                    amount = 750;
                    planType = 'LARGE';
                    maxSubmissions = 300;
                    validityDays = 60;
                }
                else if (planId === 'custom') {
                    amount = 750;
                    planType = 'CUSTOM';
                    maxSubmissions = 99999;
                    validityDays = 90;
                }
                else if (planId === 'consultant_start') {
                    amount = 450;
                    planType = 'CONSULTANT_START';
                    maxSubmissions = 150;
                    validityDays = 30;
                }
                else if (planId === 'consultant_pro') {
                    amount = 750;
                    planType = 'CONSULTANT_PRO';
                    maxSubmissions = 600;
                    validityDays = 30;
                }
                else if (planId === 'consultant_enterprise') {
                    amount = 1400;
                    planType = 'CONSULTANT_ENTERPRISE';
                    maxSubmissions = 2000;
                    validityDays = 30;
                }
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const session = yield stripe.checkout.sessions.create({
                    payment_method_types: ['card', 'boleto', 'pix'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'brl',
                                product_data: { name: `Plano ${planType}` },
                                unit_amount: amount * 100,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${frontendUrl}/dashboard?payment_success=true`,
                    cancel_url: `${frontendUrl}/payment`,
                    client_reference_id: user.tenant.subscriptionId,
                    metadata: {
                        planId,
                        planType,
                        maxSubmissions: maxSubmissions.toString(),
                        validityDays: validityDays.toString()
                    }
                });
                return res.json({ checkoutUrl: session.url });
            }
            catch (error) {
                console.error('Erro Stripe Session:', error);
                return res.status(500).json({ error: 'Erro ao gerar pagamento com Stripe' });
            }
        });
    }
    // Webhook do Stripe
    stripeWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const sig = req.headers['stripe-signature'];
            let event;
            try {
                const stripeConfig = yield prismaClient_1.prisma.systemConfig.findUnique({ where: { key: 'stripe_key' } });
                const webhookConfig = yield prismaClient_1.prisma.systemConfig.findUnique({ where: { key: 'stripe_webhook_secret' } });
                const stripeSecret = (stripeConfig === null || stripeConfig === void 0 ? void 0 : stripeConfig.value) || process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
                const endpointSecret = (webhookConfig === null || webhookConfig === void 0 ? void 0 : webhookConfig.value) || process.env.STRIPE_WEBHOOK_SECRET || '';
                const stripe = new stripe_1.default(stripeSecret, {
                    apiVersion: '2026-08-26.dahlia',
                });
                if (endpointSecret) {
                    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
                }
                else {
                    event = req.body;
                }
            }
            catch (err) {
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const subscriptionId = session.client_reference_id;
                if (subscriptionId && session.payment_status === 'paid') {
                    const metadata = session.metadata || {};
                    const validityDays = parseInt(metadata.validityDays || '30', 10);
                    const nextDueDate = new Date();
                    nextDueDate.setDate(nextDueDate.getDate() + validityDays);
                    yield prismaClient_1.prisma.transaction.create({
                        data: {
                            subscriptionId: subscriptionId,
                            amount: (session.amount_total || 0) / 100,
                            gateway: 'STRIPE',
                            status: 'PAID',
                            gatewayTransactionId: session.id
                        }
                    });
                    yield prismaClient_1.prisma.subscription.update({
                        where: { id: subscriptionId },
                        data: {
                            status: 'ACTIVE',
                            nextDueDate: nextDueDate,
                            planType: metadata.planType || 'SMALL',
                            maxSubmissions: parseInt(metadata.maxSubmissions || '30', 10)
                        }
                    });
                }
            }
            res.json({ received: true });
        });
    }
}
exports.CheckoutController = CheckoutController;
