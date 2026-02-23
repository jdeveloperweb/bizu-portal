# 🚀 Guia de Deploy — Bizu! Portal (Hostinger VPS)

**Arquitetura de Deploy:**
- 🐳 **Backend (Spring Boot) + Banco (PostgreSQL)** → Docker Compose
- ⚡ **Frontend (Next.js)** → PM2 (direto no servidor, porta **14900**)
- 🌐 **Nginx** → Proxy reverso público para ambos

---

## ✅ Passo 1: Verificar Pré-requisitos no Servidor

```bash
docker --version        # Docker instalado?
docker compose version  # Docker Compose disponível?
git --version           # Git instalado?
nginx -v                # Nginx instalado?
certbot --version       # Certbot instalado?
node --version          # Node.js instalado? (precisa v18+)
npm --version           # NPM disponível?
pm2 --version           # PM2 instalado?
```

**Se o Node.js não estiver instalado:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Se o PM2 não estiver instalado:**
```bash
sudo npm install -g pm2
# Configurar para iniciar com o servidor (importante!)
pm2 startup
# Execute o comando que o PM2 mostrar na tela (começa com 'sudo env PATH=...')
```

**Se o Docker não estiver instalado:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## ✅ Passo 2: Primeiro Clone do Projeto

```bash
# Criar pasta e clonar repositório
mkdir -p ~/bizu-portal && cd ~/bizu-portal
git clone https://github.com/jdeveloperweb/bizu-portal.git .

# Criar arquivo de variáveis de ambiente
cp .env.example .env
nano .env
```

Preencha no `.env`:
```env
DB_PASSWORD=SENHA_FORTE_AQUI
STRIPE_KEY=sk_live_SUA_CHAVE
KEYCLOAK_URL=http://localhost:8180
```

---

## ✅ Passo 3: Subir o Backend com Docker

```bash
cd ~/bizu-portal

# Sobe o banco de dados e o backend (cria as tabelas automaticamente via Flyway)
docker compose up -d --build bizu-db bizu-backend

# Verificar se estão rodando
docker compose ps

# Checar logs do backend (aguardar "Started BizuApplication")
docker compose logs -f bizu-backend
```

---

## ✅ Passo 4: Build e Start do Frontend com PM2

```bash
cd ~/bizu-portal/bizu-frontend

# Instalar dependências
npm install --legacy-peer-deps

# Build de produção do Next.js
NEXT_PUBLIC_API_URL=https://bizu.mjolnix.com.br/api/v1 npm run build

# Voltar para a raiz e iniciar com PM2
cd ~/bizu-portal
pm2 start ecosystem.config.js

# Salvar estado do PM2 (para sobreviver a reboots do servidor)
pm2 save

# Ver status do frontend
pm2 status
pm2 logs bizu-frontend
```

---

## ✅ Passo 5: Configurar o Nginx (Proxy Reverso)

```bash
sudo nano /etc/nginx/sites-available/bizu-portal
```
sudo nano /etc/nginx/conf.d/bizu-portal
Cole o seguinte (configuração **HTTP temporária**, antes do HTTPS):

```nginx
server {
    listen 80;
    server_name bizu.mjolnix.com.br;

    # Frontend (Next.js via PM2) — porta 14900
    location / {
        proxy_pass http://localhost:14900;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend (Spring Boot via Docker) — porta 15500
    location /api {
        proxy_pass http://localhost:15500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ativar o site:
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/conf.d/bizu-portal /etc/nginx/sites-enabled/

# Testar configuração (sem erros = ok)
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## ✅ Passo 6: Gerar Certificado HTTPS com Certbot

```bash
# Gerar certificado SSL para o domínio (o Certbot edita o Nginx automaticamente)
sudo certbot --nginx -d bizu.mjolnix.com.br
```

> O Certbot vai pedir seu e-mail e termos de uso. Após concluir, o HTTPS estará ativo e o HTTP redirecionará automaticamente.

**Verificar renovação automática:**
```bash
sudo certbot renew --dry-run
```

---

## ✅ Passo 7: Configurar CI/CD (Deploy Automático)

No repositório GitHub, acesse: `Settings → Secrets and variables → Actions`

Adicione os seguintes Secrets:

| Secret | Valor |
|---|---|
| `SSH_HOST` | IP do servidor Hostinger |
| `SSH_USER` | Usuário SSH (ex: `root`) |
| `SSH_PRIVATE_KEY` | Conteúdo da sua chave privada SSH (`~/.ssh/id_rsa`) |
| `DB_PASSWORD` | Senha do banco de dados |
| `STRIPE_KEY` | Chave do Stripe |

Após configurar, **qualquer `git push` na branch `main`** fará o deploy automaticamente. O pipeline irá:
1. Puxar o código novo
2. Reiniciar o backend via Docker
3. Recompilar e reiniciar o frontend via PM2

---

## 🔄 Comandos Úteis do Dia a Dia

```bash
# Ver todos os processos PM2
pm2 status

# Ver logs do frontend em tempo real
pm2 logs bizu-frontend

# Reiniciar o frontend manualmente
pm2 reload bizu-frontend

# Ver logs do backend (Docker)
docker compose logs -f bizu-backend

# Reiniciar o backend
docker compose restart bizu-backend

# Parar tudo
docker compose down
pm2 stop bizu-frontend

# Verificar portas em uso
sudo ss -tulpn | grep -E '14900|15500|5432|80|443'

# Atualizar manualmente sem CI/CD
cd ~/bizu-portal
git pull origin main
cd bizu-frontend && npm install --legacy-peer-deps && npm run build && cd ..
pm2 reload ecosystem.config.js --update-env
docker compose up -d --build bizu-backend
docker image prune -f
pm2 save
```

---

## 🛠️ Solução de Problemas

```bash
# Logs de erro do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar status do Nginx
sudo systemctl status nginx

# Forçar renovação do certificado SSL
sudo certbot renew --force-renewal

# Se o PM2 não iniciar com o servidor após reboot
pm2 startup
pm2 save

# Checar memória e CPU dos processos PM2
pm2 monit
```
