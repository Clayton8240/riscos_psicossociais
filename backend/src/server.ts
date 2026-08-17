import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { routes } from './routes';

dotenv.config();

const app = express();

// Configuração de CORS permissiva para desenvolvimento
app.use(cors({
  origin: '*', // Em produção, altere para os domínios do Frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configuração do Rate Limiter para impedir robôs e spam
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP por janela de 15 min
  message: { error: 'Muitas requisições originadas deste IP, por favor tente novamente após 15 minutos.' },
  standardHeaders: true, // Retorna os headers `RateLimit-*`
  legacyHeaders: false, // Desabilita o cabeçalho `X-RateLimit-*`
});

// Aplica o rate limiter em todas as rotas (pode ser restrito às rotas públicas se desejado)
app.use(limiter);

app.use(routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
