# Railway: configuração no painel

Desde 01/12/2026 a Railway não lê mais `railway.json` / `railway.toml` (Config as Code).
A configuração de deploy deste repositório vive nas **Settings de cada serviço no painel da Railway**.
Este arquivo só registra os valores, para não se perderem junto com o arquivo removido.
Se mudar algo no painel, atualize esta tabela.

| Serviço | Root Directory | Builder | Dockerfile Path | Start Command | Healthcheck (timeout) | Restart |
|---|---|---|---|---|---|---|
| server | `/server` | Dockerfile | `Dockerfile` | `node dist/index.js` (igual ao CMD do estágio final) | `/health` (30 s) | On Failure, 3 tentativas |
| price-service | `/services/price-service` | Dockerfile | `Dockerfile` | `python price_service.py` (igual ao CMD) | — (timeout 30 s) | On Failure, 3 tentativas |
