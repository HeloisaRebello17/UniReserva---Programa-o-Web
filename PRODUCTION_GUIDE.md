# 🚀 Guia de Produção - UniReserva

## 📊 Checklist Pré-Deploy

Antes de fazer o deploy, verifique:

```bash
# 1. Todos os testes passando
npm test
# ✅ Expected: pass 23 | fail 0

# 2. Linting sem erros
npm run lint
# ✅ Expected: zero warnings/errors

# 3. Código commitado
git status
# ✅ Expected: nothing to commit, working tree clean

# 4. Último commit ok
git log -1 --oneline
```

---

## 🌐 Opção 1: Railway (Recomendado ⭐⭐⭐⭐⭐)

**Vantagens:**
- ✅ Mais simples (5 minutos)
- ✅ Integração nativa com GitHub
- ✅ Banco de dados PostgreSQL incluído
- ✅ SSL automático
- ✅ Plano gratuito generoso

### Passo 1: Preparar Repositório GitHub

```bash
# Confirmar que tudo está commitado
git status

# Se houver mudanças, fazer commit
git add .
git commit -m "feat: prepare for production deployment"

# Fazer push para main
git push origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse https://railway.app
2. Clique em **"Create New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize Railway a acessar GitHub
5. Selecione repositório **UniReserva-main**
6. Railway detectará `Dockerfile` automaticamente ✨

### Passo 3: Configurar Variáveis de Ambiente

No dashboard do Railway, vá para **Variables**:

```
NODE_ENV=production
JWT_SECRET=<gere-com-comando-abaixo>
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
LOG_LEVEL=info
```

### Gerar JWT_SECRET Seguro

Execute localmente:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`.

### Passo 4: Provisionar PostgreSQL

No Railway:
1. Clique em **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway criará automaticamente
3. As variáveis `${{Postgres.*}}` ficarão disponíveis

### Passo 5: Deploy

1. Railway fará deploy automaticamente
2. Aguarde 3-5 minutos
3. Clique em **"View Live"**
4. 🎉 Pronto! Sua app está online

**URL Produção**: `https://seu-projeto.railway.app`

### Passo 6: Testar em Produção

```bash
# Testar health check
curl https://seu-projeto.railway.app/api/health

# Testar login
curl -X POST https://seu-projeto.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@unireserva.com","password":"prof123"}'
```

---

## 🎯 Opção 2: Render

**Vantagens:**
- ✅ Interface simples
- ✅ Plano gratuito
- ✅ Suporte a Docker

### Passo 1: Criar Conta

Acesse https://render.com e crie conta com GitHub.

### Passo 2: Conectar Repositório

1. Clique em **"New +"** → **"Web Service"**
2. Selecione repositório
3. Configure:
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

### Passo 3: Adicionar PostgreSQL

1. Clique em **"New +"** → **"PostgreSQL"**
2. Render fornecerá `DATABASE_URL`

### Passo 4: Configurar Variáveis

```
NODE_ENV=production
JWT_SECRET=<sua-chave-segura>
DATABASE_URL=<fornecido-pelo-render>
LOG_LEVEL=info
```

### Passo 5: Deploy

Clique em **"Create Web Service"** e aguarde.

---

## 🐳 Opção 3: Docker em VPS (Controle Total)

Para usar em servidor próprio (AWS EC2, DigitalOcean, Linode, etc).

### Passo 1: Preparar Servidor

```bash
# SSH no servidor
ssh user@seu-servidor.com

# Instalar Docker e Docker Compose
sudo apt-get update
sudo apt-get install docker.io docker-compose git -y

# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### Passo 2: Clonar Repositório

```bash
cd ~
git clone https://github.com/seu-usuario/UniReserva.git
cd UniReserva
```

### Passo 3: Configurar Variáveis

```bash
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 24)
DB_NAME=unireserva
LOG_LEVEL=info
EOF

# Mostrar valores para referência
cat .env
```

### Passo 4: Deploy com Docker Compose

```bash
# Iniciar containers
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Passo 5: Configurar Nginx + SSL

```bash
# Instalar Nginx
sudo apt-get install nginx certbot python3-certbot-nginx -y

# Configurar Nginx como reverse proxy
sudo cat > /etc/nginx/sites-available/unireserva << 'NGINX'
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Ativar site
sudo ln -s /etc/nginx/sites-available/unireserva /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Adicionar SSL com Let's Encrypt
sudo certbot --nginx -d seu-dominio.com
```

### Passo 6: Atualizar Aplicação

```bash
# Pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## 📊 Monitoramento em Produção

### Railway/Render Dashboard

Ambas oferecem dashboards nativos:
- Logs em tempo real
- Métricas de CPU/Memória
- Status de deploy
- Histórico de builds

### Via SSH (VPS)

```bash
# Ver logs
tail -f logs/app.log

# Filtrar por nível
tail -f logs/app.log | grep ERROR
tail -f logs/app.log | grep WARN

# Ver recursos
docker stats
```

### Alertas Recomendados

Configure alertas para:
- ❌ Taxa de erro > 5%
- 🐢 Tempo de resposta > 2s
- 💾 Memória > 80%
- ⚠️ Banco de dados indisponível
- 🔴 Aplicação down

---

## 🔐 Segurança em Produção

### Checklist

- ✅ `JWT_SECRET` deve ter 32+ caracteres aleatórios
- ✅ Variáveis sensíveis NUNCA no código (apenas em `.env`)
- ✅ `.env` no `.gitignore` (já está)
- ✅ HTTPS/SSL ativado (Railway/Render fazem automático)
- ✅ `NODE_ENV=production` ativado
- ✅ CORS configurado corretamente
- ✅ Senhas temporárias alteradas após primeiro login

### Gerar Credenciais Seguras

```bash
# JWT Secret (32 caracteres aleatórios)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Senha de banco (24 caracteres)
openssl rand -base64 24

# Gerar múltiplos valores de uma vez
node -e "
const crypto = require('crypto');
console.log('JWT_SECRET:', crypto.randomBytes(32).toString('hex'));
console.log('DB_PASSWORD:', crypto.randomBytes(24).toString('hex'));
"
```

---

## 🐛 Troubleshooting em Produção

### "Database connection refused"

```bash
# Verificar conexão
psql postgresql://user:pass@host:5432/dbname

# Verificar firewall
sudo ufw status
sudo ufw allow 5432/tcp
```

### "Application not responding"

```bash
# Verificar health check
curl https://seu-app.com/api/health

# Ver logs
docker-compose -f docker-compose.prod.yml logs app | tail -50

# Reiniciar
docker-compose -f docker-compose.prod.yml restart app
```

### "Disk space full"

```bash
# Ver uso de disco
df -h

# Limpar images Docker antigas
docker image prune -a

# Limpar logs
docker container prune
```

---

## 📈 Escalar Aplicação

### Quando escalar?

- 📊 > 1000 requisições/minuto
- 👥 > 10.000 usuários simultâneos
- 📦 > 80% de CPU/Memória

### Opções de Escalabilidade

1. **Railway Pro** - Aumentar recursos automático
2. **Kubernetes** - Escalabilidade horizontal
3. **Load Balancer** - Distribuir tráfego
4. **Cache** - Redis para sessões
5. **CDN** - CloudFlare para assets estáticos

---

## 📋 Checklist Pós-Deploy

Após fazer deploy, verifique:

- [ ] App acessível via URL público
- [ ] Health check respondendo: `/api/health`
- [ ] Login funciona
- [ ] Pode listar salas
- [ ] Pode criar reservas
- [ ] Logs aparecem no dashboard
- [ ] SSL/HTTPS ativo
- [ ] Email de backup configurado
- [ ] Monitoramento ligado
- [ ] Alertas configurados

---

## 🆘 Suporte e Documentação

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Docker Docs**: https://docs.docker.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Node.js Docs**: https://nodejs.org/docs

---

## 📞 Próximos Passos

1. ✅ Escolher plataforma (Railway recomendado)
2. ✅ Fazer deploy
3. ✅ Testar em produção
4. ✅ Configurar backup automático
5. ✅ Implementar logging centralizado
6. ✅ Adicionar monitoramento
7. ✅ Setup de CI/CD avançado (staging/production)

**Estimativa de tempo**: 30 minutos com Railway ou Render

---

**Status**: 🎉 Pronto para produção!
