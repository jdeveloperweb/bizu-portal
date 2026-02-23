# 📋 BIZU! PORTAL — Plano de Desenvolvimento

Este arquivo serve para acompanhar o progresso do desenvolvimento do Bizu! Portal, baseado na `especificacao.md`.

## 🚀 Fase 1: Fundação e Setup

- [ ] **1.1 Setup do Ambiente de Desenvolvimento**
    - [x] Configurar `docker-compose.yml` (PostgreSQL 16, Redis, Keycloak, RabbitMQ) - **FEITO**
    - [x] Inicializar projeto Spring Boot 3.4+ (Java 21) - **FEITO**
    - [x] Inicializar projeto Next.js 14+ (App Router, TypeScript) - **FEITO**
- [ ] **1.2 Estrutura Modular (Backend)**
    - [x] Criar pacotes base: `identity`, `content`, `student`, `commerce`, `admin`, `analytics`, `shared` - **FEITO**
    - [x] Configurar Flyway para migrações de banco (schemas separados por módulo) - **FEITO**
- [x] **1.3 Design System (Frontend)**
    - [x] Instalar Tailwind CSS 4 e shadcn/ui - **FEITO**
    - [x] Configurar tokens de cores e tipografia (Inter/Roboto) - **FEITO**
    - [x] Criar layouts base (Aluno e Admin) - **FEITO**
    - [x] **Branding Dinâmico**: Gestão de logo e cores via Admin com aplicação em tempo real. - **FEITO**

## 🔐 Fase 2: Identidade e Controle de Acesso (Identity)

- [x] **2.1 Integração Keycloak**
    - [x] Configurar Realm, Clients e Roles no Keycloak - **ESTRUTURA CONFIGURADA**
    - [x] Implementar `SecurityConfig` no Spring Boot com JWT - **FEITO**
- [ ] **2.2 Gestão de Usuários e Sessões**
    - [x] Implementar entidade `User` e `Device` - **FEITO**
    - [x] Criar lógica de rastreamento de dispositivos (Anti-compartilhamento) - **FEITO**
    - [x] API de perfil do usuário (`/api/v1/users/me`) - **FEITO**

## 📚 Fase 3: Gestão de Conteúdo (CMS / Content)

- [x] **3.1 Estrutura de Cursos**
    - [x] Entidades `Course`, `Module`, `Tag` - **FEITO**
    - [x] CRUD de Cursos no Admin - **FEITO (API)**
- [x] **3.2 Banco de Questões**
    - [x] Entidade `Question` (Suporte a LaTeX/Markdown) - **FEITO**
    - [x] Importação em massa (CSV/Excel) - **FEITO (BACKEND)**
    - [x] Editor rico integrado no Admin (TipTap) - **FEITO (UI + COMPONENT)**
    - [x] **Temas por Curso**: Possibilidade de definir cores exclusivas para cada curso. - **FEITO**
- [x] **3.3 Materiais e Flashcards**
    - [x] Gestão de Apostilas (Entidade e Estrutura) - **FEITO**
    - [x] Criação e versionamento de Flashcards - **FEITO (ESTRUTURA + UI)**

## 🎓 Fase 4: Experiência do Aluno (Student)

- [x] **4.1 Jornada do Usuário**
    - [x] Listagem de cursos (Catálogo) - **FEITO (UI + BACKEND)**
    - [x] Visualização de trilha de estudos e progresso - **FEITO (UI)**
    - [x] Página de Perfil e Configurações - **FEITO (UI)**
- [x] **4.2 Estudo Ativo**
    - [x] Interface de resolução de questões (estudo direcionado) - **FEITO (UI)**
    - [x] Motor de Simulados (Timer e correção automática) - **FEITO (BACKEND)**
    - [x] Visualizador de Apostilas (PDF.js) - **FEITO (UI)**
- [x] **4.3 Gamificação e Retenção**
    - [x] Sistema de XP, Streaks e Badges - **FEITO**
    - [x] Ranking global e por curso - **FEITO**
    - [x] Animação de Level Up (Confetes) - **FEITO (UI COMPONENT)**
    - [x] Lógica de Níveis (Calculadora Exponencial) - **FEITO**
    - [x] **Duelos em Tempo Real**: Ranking separado, premiação e verificação de usuários online. + Fluxo de aceitar/recusar convites. - **FEITO**
- [x] **4.4 Estudo Rápido (Flashcards)**
    - [x] Interface de revisão (Estética 3D) - **FEITO (UI + ANIMATION)**
    - [x] Sistema de classificação pós-estudo (Fácil/Médio/Difícil) - **FEITO**
- [x] **4.5 Treino & Simulados Avançados**
    - [x] **Quiz Personalizado**: Seleção de assuntos, nível e quantidade de questões pelo usuário (Treino Rápido). - **FEITO**
    - [x] **Ciclo de Simulados Semanais**: Simulados oficiais com ranking resetável (Sábados 23:59) e histórico de posições. - **FEITO**
    - [x] **Assinatura em Grupo**: Suporte a planos para até 5 pessoas com acessos individuais e painel de gestão. - **FEITO**

## � Fase 6: Administração, Infra e Mobile (Admin & PWA)

- [x] **6.1 Dashboard Administrativa**
    - [x] Listagem e gestão de usuários (Status, Funções). - **FEITO**
    - [x] Gestão de Planos, Preços e Cupons (CRUD completo via UI). - **FEITO**
    - [x] Métricas de faturamento e engajamento. - **FEITO**
- [x] **6.2 Pagamentos Reais (Stripe/Pagar.me)**
    - [x] Endpoint de Webhook para processamento automático de pagamentos. - **FEITO**
    - [x] Lógica de ativação/renovação de assinatura após confirmação do evento. - **FEITO**
    - [x] Página de Sucesso/Erro de Pagamento. - **PÁGINAS ESTÁTICAS CONFIGURADAS**
- [x] **6.3 App Mobile (PWA)**
    - [x] Configuração de Manifest e Service Workers. - **FEITO**
    - [x] Ícones de alta resolução para iOS/Android. - **CONFIGURADO NO MANIFEST**
    - [x] Suporte a modo Offline básico. - **CONFIGURADO VIA NEXT-METADATA**

## �💰 Fase 5: Comercial e Billing (Commerce)

- [x] **5.1 Catálogo Comercial**
    - [x] Gestão de Planos, Preços e Cupons - **FEITO (ENTIDADES + API + UI)**
    - [x] **Modelo de Assinatura em Grupo**: Preço individual vs Grupo (até 5 acessos) - **FEITO**
- [x] **5.2 Integração de Pagamento**
    - [x] Arquitetura de Strategy para Provedores - **FEITO**
    - [x] Fluxo de Checkout (API + Webhooks foundation) - **FEITO**
    - [x] Integração com Stripe Provider - **FEITO (INFRA)**
    - [x] Integração com Pagar.me Provider (Pix/Boleto) - **FEITO (INFRA)**
    - [x] Tratamento de Webhooks (Ativação automática de acesso) - **FEITO**

## 📊 Fase 6: Administrativo e Analytics

- [x] **6.1 Dashboard Admin**
    - [x] Gráficos de Receita (MRR/Churn) - **FEITO (UI + BACKEND)**
    - [x] Gestão de Cursos (Tabela) - **FEITO (UI)**
    - [x] Métricas de engajamento (DAU/MAU) - **FEITO (BACKEND + UI)**
- [/] **6.2 Logs e Auditoria**
    - [x] Implementar `AdminActionLog` para rastreabilidade imutável - **FEITO (BACKEND)**

## 🚀 Fase 7: Infraestrutura e Prontidão (Deploy)

- [x] **7.1 Dockerização**
    - [x] Dockerfile para Backend (JDK 21) - **FEITO**
    - [x] Dockerfile para Frontend (Multi-stage) - **FEITO**
    - [x] Orquestração com Docker Compose - **FEITO**
- [x] **7.2 Automatização (CI/CD)**
    - [x] Pipeline GitHub Actions (Build & Push) - **FEITO**
    - [x] Script de Deploy automático via SSH - **FEITO**
- [/] **7.3 Observabilidade**
    - [x] Logs estruturados no backend - **FEITO**
    - [ ] Dashboard de Monitoramento (Grafana/Prometheus)

## 💅 Fase 8: SEO e PWA (Mobile Experience)

- [x] **8.1 Configuração Progressiva**
    - [x] Meta Tags Dinâmicas e SEO - **FEITO**
    - [x] Manifest e Service Worker (Offline Support) - **FEITO (MANIFEST + METADATA)**
    - [x] Sitemap Dinâmico e Robots.txt - **FEITO**
- [ ] **7.2 Testes e QA**
    - [ ] Cobertura de testes unitários crítica
    - [ ] Testes de carga em simulados
- [x] **7.3 Deploy Final**
    - [x] Configuração de Pipelines CI/CD - **FEITO (GITHUB ACTIONS)**
    - [x] Guia de implantação Hostinger/Nginx - **FEITO**
    - [ ] Setup do ambiente de Produção (Cloudflare + Cloud)

---
*Atualizado em: 22/02/2026*
