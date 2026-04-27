# AgroGlobal BR — Deploy em Produção

## Arquitetura
Vercel (Frontend) → Railway (Backend Node + PostgreSQL) → Railway (Price Service Python)

## 1. Backend Node → Railway
1. railway.app → New Project → Deploy from GitHub → root: `server`
2. + New → Database → PostgreSQL (gera DATABASE_URL automaticamente)
3. Variables: DATABASE_URL, JWT_SECRET, NODE_ENV=production, CORS_ORIGIN, STRIPE_*
4. Após deploy → Shell → `npm run db:push`

## 2. Price Service → Railway
1. + New → GitHub Repo → root: `services/price-service`
2. Networking → Add Port → 8765
3. Copiar URL pública WSS

## 3. Frontend → Vercel
1. vercel.com → Add New Project → importa o repo → root: `/`
2. Environment Variables:
   VITE_API_URL=https://agro-global-backend.up.railway.app
   VITE_PRICE_WS_URL=wss://agro-price-service.up.railway.app
3. Deploy automático a cada git push na main

## 4. Gerar JWT_SECRET
openssl rand -base64 32

## 5. Health check
curl https://agro-global-backend.up.railway.app/health
