# 📚 BIZU! PORTAL — DOCUMENTAÇÃO TÉCNICA COMPLETA
**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Classificação:** Confidencial — Uso Interno  
**Stack:** Spring Boot · Next.js · PostgreSQL · Docker · CI/CD

---

## ÍNDICE

- [0. Sumário Executivo](#0-sumário-executivo)
- [A. Objetivos e Requisitos](#a-objetivos-e-requisitos)
- [B. Arquitetura](#b-arquitetura)
- [C. Módulos e Domínios](#c-módulos-e-domínios)
- [D. UI/UX e Responsividade](#d-uiux-e-responsividade)
- [E. Modelo de Dados](#e-modelo-de-dados)
- [F. APIs e Contratos](#f-apis-e-contratos)
- [G. Pagamentos, Assinaturas e Receita](#g-pagamentos-assinaturas-e-receita)
- [H. Anti-Compartilhamento de Login](#h-anti-compartilhamento-de-login)
- [I. Backoffice / CMS Admin](#i-backoffice--cms-admin)
- [J. Observabilidade e Operação](#j-observabilidade-e-operação)
- [K. Infraestrutura e Deploy](#k-infraestrutura-e-deploy)
- [L. Migração Flutter → Portal](#l-migração-flutter--portal)
- [M. Roadmap](#m-roadmap)
- [N. Recursos Premium (Add-on)](#n-recursos-premium-add-on)

---

## 0. Sumário Executivo

### Visão Geral do Sistema

O **Bizu! Portal** é a evolução do app Flutter/Dart atual para um portal web moderno e escalável. A plataforma serve como hub central de preparação para concursos e exames, suportando múltiplos cursos, monetização por assinatura/avulso, e gestão completa via backoffice.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BIZU! PORTAL                             │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐  │
│  │   ÁREA DO ALUNO      │    │   ÁREA ADMINISTRATIVA         │  │
│  │   (Next.js)          │    │   (Next.js — Admin App)       │  │
│  │   Mobile-first       │    │   Desktop-first               │  │
│  │   PWA                │    │   RBAC completo               │  │
│  └──────────┬───────────┘    └─────────────┬────────────────┘  │
│             │                              │                    │
│  ┌──────────▼──────────────────────────────▼────────────────┐  │
│  │              API GATEWAY / BFF Layer                      │  │
│  │              (Spring Cloud Gateway ou Nginx)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│             │                                                   │
│  ┌──────────▼──────────────────────────────────────────────┐   │
│  │           BACKEND (Spring Boot — Módulos)                │   │
│  │                                                         │   │
│  │  identity  │  content  │  student  │  commerce  │ admin │   │
│  └─────────────────────────────────────────────────────────┘   │
│             │                                                   │
│  ┌──────────▼──────────────────────────────────────────────┐   │
│  │  PostgreSQL │ Redis │ S3/Storage │ Fila │ CDN            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Principais Decisões Arquiteturais

| Decisão | Escolha | Justificativa |
|---|---|---|
| Arquitetura backend | **Monólito Modular** no MVP | Menor custo operacional, time pequeno, evolução gradual |
| Frontend | **Next.js 14+ App Router** | SSR/SSG nativo, performance, SEO, ecosystem React |
| Auth | **Keycloak (self-hosted)** | Controle total, LGPD, sem lock-in, RBAC nativo |
| Banco | **PostgreSQL 16** | Confiável, JSONB para flexibilidade, open source |
| Cache | **Redis** | Sessões, rate limiting, cache de queries pesadas |
| Fila | **RabbitMQ** no MVP | Simples, suficiente para o volume inicial |
| Gateway de pagamento | **Stripe (principal) + Pagar.me (backup BR)** | Stripe tem SDK superior, Pagar.me para Pix/boleto |
| Storage | **AWS S3 ou Cloudflare R2** | Apostilas, imagens, assets |
| CDN | **Cloudflare** | Performance, DDoS, WAF, edge caching |

### Principais Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Experiência mobile inferior ao app nativo | Alta | Alto | Design system rigoroso, testes em dispositivos reais |
| Falsos positivos no anti-compartilhamento | Média | Alto | Regras graduais, override manual admin |
| Churn na migração Flutter → Web | Alta | Alto | Migração por fases, app coexiste |
| Complexidade de billing | Média | Alto | Stripe SDK + testes extensivos de webhook |
| LGPD não conformidade | Baixa | Alto | DPO envolvido desde o início, auditoria embutida |

---

## A. Objetivos e Requisitos

### A.1 Objetivos de Negócio

1. **Multi-curso:** Suportar N cursos (concursos, certificações, OAB, ENEM, etc.) com gestão centralizada
2. **Monetização:** Assinaturas recorrentes (mensal/anual), compras avulsas, add-ons Premium+
3. **Controle de acesso:** Evitar compartilhamento de login, proteger receita
4. **Operação eficiente:** Backoffice completo para equipe pequena operar sem dev
5. **Escala:** Suportar de 100 a 50.000 alunos sem refatoração estrutural
6. **Dados:** Dashboard com KPIs financeiros e de engajamento em tempo (quase) real

### A.2 Personas

#### 🎓 Aluno
- Prepara para concurso/exame
- Usa principalmente celular, às vezes tablet/desktop
- Sessões curtas (10-20min) e longas (1-2h nos fins de semana)
- Precisa de feedback instantâneo e motivação (gamificação)
- Pode ter conexão instável (metrô, trabalho)

#### 🔧 Admin / Dono do Produto
- Quer visão geral do negócio em segundos
- Precisa agir em situações críticas (reembolso, bloqueio de usuário)
- Não é necessariamente técnico
- Usa desktop na maioria das vezes

#### ✍️ Autor / Editor de Conteúdo
- Cria e revisa questões, apostilas, cursos
- Precisa de editor rico (rich text, LaTeX para matemática)
- Workflow de revisão antes de publicar
- Pode trabalhar remotamente

#### 💰 Financeiro / Suporte
- Analisa transações, processa reembolsos
- Responde disputas de chargeback
- Acesso limitado (não vê conteúdo, só financeiro + suporte ao usuário)

---

### A.3 Requisitos Funcionais — Área do Aluno

#### RF-01 Catálogo de Cursos
- Listagem de cursos disponíveis com thumbnail, descrição, número de questões/apostilas
- Preview de conteúdo gratuito (demo sem login)
- Filtro por área (Direito, TI, Saúde, etc.)
- Indicador de acesso ativo (comprado vs. bloqueado)

#### RF-02 Trilhas de Estudo
- Organização por assunto/módulo dentro de um curso
- Progresso visual por trilha (% concluído)
- Sugestão de próximo passo
- Bookmarks de onde parou

#### RF-03 Banco de Questões
- Filtro por: banca, ano, disciplina, assunto, dificuldade, tipo (múltipla escolha, CERTO/ERRADO)
- Modo treino (sem tempo, gabarito imediato)
- Histórico de tentativas por questão (quantas vezes acertou/errou)
- Favoritar questões
- Ver resolução detalhada/comentário

#### RF-04 Simulados
- Simulados semanais automáticos (gerados pelo sistema)
- Simulados personalizados (aluno escolhe parâmetros)
- Timer configurável
- Revisão pós-simulado com análise por disciplina
- Comparativo com média da turma

#### RF-05 Quiz e Modos de Estudo
- Modo flash (uma questão por vez, rápido)
- Modo disciplina (foco em uma área)
- Modo dificuldade (fácil → difícil progressivo)
- Feedback sonoro/visual opcional

#### RF-06 Flashcards
- Criação pelo sistema (baseado em conteúdo de apostilas)
- Aluno pode criar próprios
- Modo revisão básico (sabe / não sabe)
- Repetição espaçada (Premium+)

#### RF-07 Apostilas
- Leitura in-browser (PDF viewer ou HTML formatado)
- Download controlado (somente para planos que permitem)
- Controle de versão (aluno vê versão vigente)
- Highlights e anotações pessoais
- Busca dentro da apostila

#### RF-08 Desempenho e Métricas
- Taxa de acerto global e por disciplina
- Evolução ao longo do tempo (gráfico)
- Pontos fortes e fracos
- Tempo médio por questão
- Comparativo com meta definida pelo aluno

#### RF-09 Ranking e Gamificação
- Ranking geral do curso
- Ranking por período (semana/mês)
- Badges por conquistas (100 questões, 7 dias seguidos, etc.)
- Pontos XP por atividade
- Streaks de dias consecutivos

#### RF-10 Notificações e Lembretes
- Push notification (PWA)
- E-mail (simulado disponível, meta diária não atingida)
- In-app (novidade de conteúdo, simulado novo)

---

### A.4 Requisitos Funcionais — Área Administrativa

#### RF-A01 Dashboard Principal
- KPIs em tempo real: MRR, novos assinantes, churn, ticket médio
- Gráfico de receita (diário/semanal/mensal)
- Usuários ativos (DAU/MAU)
- Alertas operacionais

#### RF-A02 Gestão de Usuários
- Busca por nome/e-mail/CPF
- Ver histórico de acesso, assinatura, pagamentos
- Bloquear/desbloquear conta
- Resetar sessões (forçar logout em todos os dispositivos)
- Enviar e-mail manualmente
- Ver logs de atividade (questões respondidas, simulados)
- Suporte: histórico de tickets (integração básica)

#### RF-A03 Gestão de Conteúdo (CMS)
- CRUD completo de cursos, módulos, questões
- Editor rico (TipTap ou Quill) com suporte a LaTeX
- Upload de imagens e arquivos
- Tags e categorias
- Workflow: Rascunho → Em Revisão → Publicado → Arquivado
- Importação em massa: CSV/Excel para questões
- Exportação de banco de questões
- Versionamento de apostilas

#### RF-A04 Comercial
- Criar/editar planos (nome, descrição, preço, intervalo, entitlements)
- Criar add-ons (Premium+, etc.)
- Criar cupons (% ou valor fixo, validade, limite de usos, cursos específicos)
- Criar campanhas com período de vigência
- Simulador de preço com cupom

#### RF-A05 Pagamentos e Assinaturas
- Listar transações com filtros (data, status, gateway, valor)
- Detalhe de transação
- Listar assinaturas (ativas, canceladas, pausadas, inadimplentes)
- Cancelar assinatura manualmente
- Processar reembolso (total ou parcial)
- Ver webhooks recebidos do gateway
- Conciliação manual

#### RF-A06 Financeiro / KPIs
- MRR / ARR
- Churn rate (mensal)
- LTV estimado
- Novos assinantes vs. cancelamentos
- Receita por plano / curso
- Taxa de conversão (visitantes → trial/pago)
- Exportação CSV dos relatórios

#### RF-A07 Logs e Auditoria
- Toda ação admin registrada: quem, o quê, quando, IP, antes/depois
- Filtro por usuário admin, entidade, período
- Imutabilidade (append-only)

#### RF-A08 Permissões (RBAC)
- Perfis: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `FINANCIAL`, `SUPPORT`
- Granularidade por recurso (ex: FINANCIAL só vê pagamentos, não edita conteúdo)

---

### A.5 Requisitos Não Funcionais

| Categoria | Requisito |
|---|---|
| Performance | LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals) |
| Disponibilidade | 99.5% uptime (SLA), downtime planejado fora do horário de pico |
| Segurança | HTTPS obrigatório, OWASP Top 10, headers de segurança, rate limiting |
| LGPD | Consentimento explícito, direito ao esquecimento, minimização de dados |
| Escalabilidade | Suportar 10x usuários sem mudança arquitetural (horizontal scaling) |
| Observabilidade | Logs estruturados, métricas, tracing, alertas |
| Acessibilidade | WCAG 2.1 AA |
| Auditoria | Todas ações sensíveis rastreadas e imutáveis |

---

## B. Arquitetura

### B.1 Opção 1 — Monólito Modular

```
┌──────────────────────────────────────────────────────────────┐
│                   SPRING BOOT MONOLITH                       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ identity │ │ content  │ │ commerce │ │   student    │   │
│  │  module  │ │  module  │ │  module  │ │   module     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐                                  │
│  │  admin   │ │analytics │                                  │
│  │  module  │ │  module  │                                  │
│  └──────────┘ └──────────┘                                  │
│                                                              │
│  Comunicação: chamadas diretas entre módulos (interfaces)   │
│  Eventos internos: Spring ApplicationEvents                 │
└──────────────────────────────────────────────────────────────┘
```

**Prós:**
- Deploy simples (1 JAR / 1 container)
- Debug e rastreabilidade triviais
- Sem latência de rede entre módulos
- Time pequeno consegue operar sem DevOps dedicado
- Transações distribuídas não são problema

**Contras:**
- Deploy de um módulo afeta todos
- Acoplamento acidental mais fácil de acontecer (requer disciplina)
- Escalar horizontalmente escala tudo junto

**Custo operacional:** 1-2 instâncias EC2/GKE node. Barato no MVP.

---

### B.2 Opção 2 — Microserviços

```
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY                              │
│              (Spring Cloud Gateway)                         │
└──────┬──────────┬──────────┬──────────┬────────────────────┘
       │          │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
  │identity│ │content │ │commerce│ │student │
  │service │ │service │ │service │ │service │ ...
  └────────┘ └────────┘ └────────┘ └────────┘
  
  Comunicação: HTTP/gRPC + Kafka para eventos assíncronos
```

**Prós:**
- Escala independente por serviço
- Deploy independente
- Isolamento de falhas

**Contras:**
- Complexidade operacional muito maior (service discovery, circuit breaker, distributed tracing)
- Latência de rede entre serviços
- Transações distribuídas (SAGA pattern necessário)
- Time precisa ter maturidade DevOps

---

### ✅ Recomendação: Monólito Modular com Deploy Evoluível

**Fase MVP/V1:** Monólito modular. Boundaries claros permitem extrair serviços depois.

**Fase V2+ (quando necessário):** Extrair módulos de maior carga (ex: `student` se tiver pico de simulados, `analytics` para não impactar latência).

**Regra de ouro para o monólito modular:**
```
- Módulos NÃO importam classes uns dos outros diretamente
- Comunicação entre módulos: via interfaces/ports (DDD Hexagonal)
- Banco: schema separado por módulo (mesmo PostgreSQL, schemas diferentes)
- Eventos: Spring ApplicationEventPublisher para comunicação assíncrona interna
```

---

### B.3 Ambientes e Deploy

```
DEV → STAGING → PRODUCTION

DEV:
  - Docker Compose local
  - Banco local (PG em container)
  - Keycloak em container
  - Hot reload (Spring DevTools + Next.js HMR)

STAGING:
  - Mirror da produção em escala menor
  - Dados anonimizados de produção
  - Testes E2E automatizados rodam aqui
  - Preview de PRs (Vercel Preview / Railway)

PRODUCTION:
  - Multi-AZ (se cloud provider suportar)
  - Auto-scaling
  - Blue/Green ou Rolling Deploy
  - Banco com replica de leitura
```

---

## C. Módulos e Domínios

### C.1 Mapa de Domínios

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIZU! — DOMAIN MAP                           │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │  IDENTITY &     │     │      CONTENT DOMAIN             │   │
│  │  ACCESS DOMAIN  │     │                                 │   │
│  │                 │     │  Course, Module, Question,      │   │
│  │  User, Role,    │     │  Material, Tag, Version,        │   │
│  │  Session,       │     │  Flashcard                      │   │
│  │  Device,        │     │                                 │   │
│  │  RiskSignal     │     └─────────────────────────────────┘   │
│  └─────────────────┘                                           │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │ STUDENT         │     │   COMMERCE / BILLING DOMAIN     │   │
│  │ EXPERIENCE      │     │                                 │   │
│  │ DOMAIN          │     │  Plan, Price, AddOn,            │   │
│  │                 │     │  Subscription, Payment,         │   │
│  │  Attempt,       │     │  Invoice, Refund,               │   │
│  │  Progress,      │     │  Coupon, Entitlement            │   │
│  │  Ranking,       │     │                                 │   │
│  │  Gamification   │     └─────────────────────────────────┘   │
│  └─────────────────┘                                           │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │  ADMIN /        │     │   ANALYTICS DOMAIN              │   │
│  │  BACKOFFICE     │     │                                 │   │
│  │  DOMAIN         │     │  DailyMetrics, RevenueReport,   │   │
│  │                 │     │  UserEngagement, ChurnEvent,    │   │
│  │  AdminActionLog,│     │  ConversionFunnel               │   │
│  │  Workflow,      │     │                                 │   │
│  │  ImportJob      │     └─────────────────────────────────┘   │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

### C.2 Como os Domínios se Comunicam

```
FLUXO: Aluno responde questão

Student Domain
  → salva Attempt (direto no banco)
  → publica evento: QuestionAnswered{userId, questionId, correct, timeSpent}

Analytics Domain (listener)
  → atualiza DailyEngagementMetrics

Gamification (dentro de Student Domain)
  → verifica badges, XP, streaks

FLUXO: Pagamento confirmado

Commerce Domain
  → recebe webhook do Stripe
  → cria/atualiza Subscription
  → publica evento: SubscriptionActivated{userId, planId, entitlements}

Identity Domain (listener)
  → atualiza entitlements do usuário no cache (Redis)

Admin Domain (listener)
  → cria log financeiro para conciliação
```

### C.3 Estrutura de Pacotes (Spring Boot)

```
com.bizu/
├── BizuApplication.java
├── shared/                          # Código compartilhado (sem regras de negócio)
│   ├── audit/                       # AuditLog entity + listener
│   ├── exception/                   # GlobalExceptionHandler
│   ├── pagination/                  # PageRequest/Response padrão
│   ├── security/                    # JWT filter, SecurityConfig base
│   └── events/                      # DomainEvent base class
│
├── identity/                        # Identity & Access Domain
│   ├── api/                         # Controllers REST
│   ├── application/                 # Use cases / Application Services
│   ├── domain/                      # Entities, Value Objects, Domain Services
│   │   ├── User.java
│   │   ├── Session.java
│   │   ├── Device.java
│   │   └── RiskSignal.java
│   ├── infrastructure/              # Repos JPA, adapters externos
│   └── events/                      # UserRegistered, SessionCreated, etc.
│
├── content/                         # Content Domain
│   ├── api/
│   ├── application/
│   ├── domain/
│   │   ├── Course.java
│   │   ├── Module.java
│   │   ├── Question.java
│   │   ├── Material.java
│   │   └── Flashcard.java
│   ├── infrastructure/
│   └── events/
│
├── student/                         # Student Experience Domain
│   ├── api/
│   ├── application/
│   ├── domain/
│   │   ├── Attempt.java
│   │   ├── SimulationSession.java
│   │   ├── Progress.java
│   │   ├── RankingEntry.java
│   │   └── GamificationEvent.java
│   └── infrastructure/
│
├── commerce/                        # Commerce / Billing Domain
│   ├── api/
│   ├── application/
│   ├── domain/
│   │   ├── Plan.java
│   │   ├── Subscription.java
│   │   ├── Payment.java
│   │   ├── Refund.java
│   │   └── Coupon.java
│   ├── infrastructure/
│   │   ├── stripe/                  # Stripe SDK adapter
│   │   └── pagarme/                 # Pagar.me adapter
│   └── webhooks/                    # Webhook handlers
│
├── admin/                           # Admin / Backoffice Domain
│   ├── api/
│   ├── application/
│   └── domain/
│       ├── AdminActionLog.java
│       └── ImportJob.java
│
└── analytics/                       # Analytics Domain
    ├── api/
    ├── application/
    └── domain/
        ├── DailyMetrics.java
        └── RevenueReport.java
```

---

## D. UI/UX e Responsividade

### D.1 Princípios Fundamentais

```
ÁREA DO ALUNO: Mobile-First, App-Like
  - Touch targets mínimos de 44x44px
  - Gestos: swipe para próxima questão, pull-to-refresh
  - Feedback haptico simulado (vibration API)
  - Animações: 60fps, prefer-reduced-motion respeitado
  - Navegação: bottom nav bar no mobile, sidebar no desktop
  - Offline: questões e flashcards disponíveis offline (cache local)

ÁREA ADMIN: Desktop-First, Funcional
  - Tabelas densas de dados, filtros avançados
  - Responsivo para tablet (admin pode revisar conteúdo em iPad)
  - Atalhos de teclado para operações frequentes
  - Confirmações explícitas para ações destrutivas
```

### D.2 Design System (Next.js / Tailwind)

```
Stack recomendada:
  - Tailwind CSS 4.x (utility-first, tree-shaking)
  - shadcn/ui (componentes acessíveis, customizáveis)
  - Radix UI (primitivos headless para dialogs, tooltips, etc.)
  - Framer Motion (animações da área do aluno)
  - Recharts (gráficos — área admin e desempenho)
  - TipTap (editor rico no admin CMS)
  - react-pdf ou PDF.js (visualizador de apostilas)

Design Tokens (exemplo):
  --color-primary: #2563EB      /* Azul Bizu */
  --color-primary-dark: #1D4ED8
  --color-accent: #F59E0B       /* Amarelo/dourado para gamificação */
  --color-success: #10B981
  --color-danger: #EF4444
  --color-surface: #F8FAFC
  --radius-card: 16px
  --shadow-card: 0 2px 8px rgba(0,0,0,0.08)
  --transition-fast: 150ms ease-out
```

### D.3 Componentes Principais — Área do Aluno

```typescript
// Estrutura de componentes (Next.js App Router)

app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (student)/                        # Layout com bottom nav
│   ├── layout.tsx                    # Bottom nav + header
│   ├── dashboard/page.tsx            # Home do aluno
│   ├── cursos/
│   │   ├── page.tsx                  # Catálogo
│   │   └── [slug]/
│   │       ├── page.tsx              # Detalhe do curso
│   │       └── trilha/page.tsx       # Trilha de estudo
│   ├── questoes/
│   │   ├── page.tsx                  # Banco de questões
│   │   └── treino/page.tsx           # Modo treino (CSR)
│   ├── simulados/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx              # Simulado em andamento
│   │       └── resultado/page.tsx
│   ├── flashcards/page.tsx
│   ├── apostilas/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx             # Leitor
│   ├── desempenho/page.tsx
│   └── ranking/page.tsx
└── (admin)/                          # Layout admin separado
    └── ...
```

### D.4 Estratégia SSR/SSG/CSR

| Página | Estratégia | Motivo |
|---|---|---|
| Landing page / Catálogo público | SSG + ISR | SEO, performance, conteúdo muda pouco |
| Dashboard do aluno | SSR | Dados personalizados, auth necessária |
| Banco de questões (listagem) | SSR com cache | Filtros dinâmicos, dados frequentes |
| Modo treino / Simulado | CSR | Interação intensiva, estado local |
| Apostila (leitor) | CSR | Interação, highlights, anotações |
| Desempenho / Ranking | SSR | Dados personalizados |
| Admin Dashboard | CSR | Tempo real, polling/SSE |
| CMS — listagem | SSR | Tabelas de dados, sem SEO |

### D.5 Caching

```
CDN (Cloudflare):
  - Assets estáticos: cache-control: public, max-age=31536000, immutable
  - Páginas SSG: cache-control: s-maxage=3600, stale-while-revalidate=86400
  - APIs públicas (catálogo): cache-control: s-maxage=300

React Query / SWR (client):
  - useQuery com staleTime adequado por recurso:
    - Banco de questões: staleTime: 5 * 60 * 1000  (5 min)
    - Desempenho: staleTime: 60 * 1000             (1 min)
    - Ranking: staleTime: 30 * 1000                (30s)
    - Simulado em andamento: staleTime: 0          (sempre fresh)

Redis (servidor):
  - Entitlements do usuário: TTL 15 min
  - Ranking compilado: TTL 5 min
  - Rate limit counters: TTL 1 min
  - Session data: TTL = duração da sessão
```

### D.6 Performance — Core Web Vitals

```
Estratégias obrigatórias:

1. IMAGES:
   - next/image com lazy loading automático
   - WebP/AVIF com fallback
   - Placeholders blur com baixa qualidade

2. FONTS:
   - next/font com font-display: swap
   - Subset apenas os caracteres necessários
   - Preload das fontes críticas

3. BUNDLE:
   - Dynamic imports para componentes pesados:
     const PDFViewer = dynamic(() => import('../PDFViewer'), { ssr: false })
     const MathRenderer = dynamic(() => import('../MathRenderer'))
   - Bundle analyzer no CI (alerta se > threshold)
   - Separação de chunks por rota

4. PREFETCH:
   - next/link prefetch automático para rotas adjacentes
   - Prefetch de dados da próxima questão durante resposta atual
   - Resource hints: <link rel="preconnect"> para domínios externos

5. PERCEIVED PERFORMANCE:
   - Skeleton screens para todos os estados de loading
   - Optimistic UI para ações do usuário (marcar favorito, etc.)
   - Transições de página suaves (Framer Motion)
   - Progress indicators em ações assíncronas

Metas de bundle (gzipped):
  - First Load JS (route compartilhada): < 80KB
  - Página individual: < 50KB adicional
  - Total (com hydration): < 200KB
```

### D.7 PWA

```
Implementar no MVP:
  ✅ Web App Manifest (nome, ícones, theme_color, display: standalone)
  ✅ Service Worker (Next.js com next-pwa ou Workbox manual)
  ✅ Cache de assets estáticos
  ✅ Offline fallback page

Implementar no V1:
  ✅ Cache de banco de questões (para modo treino offline)
  ✅ Cache de flashcards
  ✅ Background sync para respostas offline
  ✅ Push notifications (com permissão explícita)

NÃO implementar:
  ❌ Cache de apostilas inteiras offline (risco de copyright e storage)
  
Limitações do PWA vs app nativo:
  - iOS Safari: notificações push limitadas (iOS 16.4+ com restrições)
  - Câmera, Bluetooth: não necessário para o produto
  - Instalação: iOS exige "Adicionar à tela inicial" manual
  → Mostrar banner de instalação apenas para Android Chrome
```

### D.8 Acessibilidade (WCAG 2.1 AA)

```
Checklist obrigatório:
  □ Contraste de texto: mínimo 4.5:1 (normal), 3:1 (grande)
  □ Focus visible: todos elementos interativos com outline claro
  □ ARIA labels: em todos ícones sem texto e elementos complexos
  □ Navegação por teclado: modais trap focus, ESC fecha
  □ Screen readers: ordem lógica do DOM, headings hierárquicos
  □ Alt text: todas imagens com significado
  □ Form labels: todos inputs com label associado
  □ Error messages: claros, associados ao campo via aria-describedby
  □ Animações: prefers-reduced-motion no CSS e JavaScript
  □ Zoom: layout funcional até 200% de zoom
```

### D.9 Estados de Loading (padrão obrigatório)

```typescript
// Padrão: sempre mostrar skeleton, nunca spinner girando no vazio

// Skeleton do card de questão
function QuestionCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      {[1,2,3,4].map(i => (
        <div key={i} className="h-10 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

// Error states com ação de retry:
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center p-8">
      <p>Algo deu errado. Tente novamente.</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}

// Regra: toda rota tem loading.tsx e error.tsx (Next.js App Router)
```

---

## E. Modelo de Dados

### E.1 Schema — Identity & Access

```sql
-- Schema: identity

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  cpf_hash    VARCHAR(64),            -- SHA-256 do CPF (nunca em plain text)
  phone       VARCHAR(20),
  avatar_url  VARCHAR(500),
  status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, SUSPENDED, DELETED
  email_verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,            -- LGPD: soft delete, hard delete agendado
  metadata    JSONB DEFAULT '{}'      -- dados extras não estruturados
);

CREATE TABLE roles (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(50) UNIQUE NOT NULL   -- STUDENT, ADMIN, EDITOR, FINANCIAL, SUPPORT
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id    UUID REFERENCES devices(id),
  token_hash   VARCHAR(64) NOT NULL,       -- hash do refresh token
  ip_address   INET,
  user_agent   TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  revoke_reason VARCHAR(100),              -- USER_LOGOUT, ADMIN_FORCED, SHARING_DETECTED
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_token ON sessions(token_hash);

CREATE TABLE devices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint  VARCHAR(128) NOT NULL,     -- hash do device fingerprint
  name         VARCHAR(100),              -- "iPhone de João", "Chrome no PC do trabalho"
  device_type  VARCHAR(50),               -- MOBILE, DESKTOP, TABLET
  trusted      BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_devices_user_fp ON devices(user_id, fingerprint);

CREATE TABLE risk_signals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  signal_type VARCHAR(50) NOT NULL,       -- MULTIPLE_IPS, GEO_DISTANCE, CONCURRENT_SESSIONS
  severity    VARCHAR(20) NOT NULL,       -- LOW, MEDIUM, HIGH, CRITICAL
  details     JSONB NOT NULL,             -- dados do sinal (IPs, localização, etc.)
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_risk_signals_user ON risk_signals(user_id, created_at DESC);
```

### E.2 Schema — Content

```sql
-- Schema: content

CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  area        VARCHAR(100),               -- Direito, TI, Saúde, etc.
  status      VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES identity.users(id)
);

CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'DRAFT',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_modules_course ON modules(course_id, order_index);

CREATE TABLE questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id),
  module_id    UUID REFERENCES modules(id),
  banca        VARCHAR(100),
  year         INTEGER,
  subject      VARCHAR(255),
  topic        VARCHAR(255),
  difficulty   VARCHAR(20),               -- EASY, MEDIUM, HARD
  type         VARCHAR(30) NOT NULL,      -- MULTIPLE_CHOICE, TRUE_FALSE, ESSAY
  statement    TEXT NOT NULL,             -- HTML/Markdown com suporte a LaTeX
  explanation  TEXT,
  status       VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, REVIEW, PUBLISHED, ARCHIVED
  tags         TEXT[],
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES identity.users(id),
  reviewed_by  UUID REFERENCES identity.users(id),
  reviewed_at  TIMESTAMPTZ,
  version      INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_questions_course ON questions(course_id) WHERE status = 'PUBLISHED';
CREATE INDEX idx_questions_filters ON questions(banca, year, subject, difficulty) WHERE status = 'PUBLISHED';
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

CREATE TABLE question_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label       CHAR(1) NOT NULL,           -- A, B, C, D, E
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE materials (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id),
  module_id    UUID REFERENCES modules(id),
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  type         VARCHAR(30) NOT NULL,      -- PDF, HTML, VIDEO_LINK
  status       VARCHAR(20) DEFAULT 'DRAFT',
  allow_download BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES identity.users(id)
);

CREATE TABLE material_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id  UUID NOT NULL REFERENCES materials(id),
  version_num  INTEGER NOT NULL,
  storage_key  VARCHAR(500) NOT NULL,     -- S3 key
  file_size    BIGINT,
  checksum     VARCHAR(64),
  notes        TEXT,                      -- changelog desta versão
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES identity.users(id),
  UNIQUE(material_id, version_num)
);

CREATE TABLE flashcards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID REFERENCES courses(id),
  module_id   UUID REFERENCES modules(id),
  question_id UUID REFERENCES questions(id), -- se gerado de questão
  front       TEXT NOT NULL,
  back        TEXT NOT NULL,
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### E.3 Schema — Student Experience

```sql
-- Schema: student

CREATE TABLE attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES identity.users(id),
  question_id  UUID NOT NULL REFERENCES content.questions(id),
  session_id   UUID,                      -- da simulation_session, se em simulado
  selected_option CHAR(1),               -- A, B, C, D, E (NULL se TRUE_FALSE)
  true_false_answer BOOLEAN,
  is_correct   BOOLEAN NOT NULL,
  time_spent   INTEGER,                  -- em segundos
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_attempts_user_question ON attempts(user_id, question_id);
CREATE INDEX idx_attempts_user_date ON attempts(user_id, attempted_at DESC);

CREATE TABLE simulation_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES identity.users(id),
  course_id    UUID NOT NULL REFERENCES content.courses(id),
  type         VARCHAR(30) NOT NULL,      -- WEEKLY, CUSTOM, PRACTICE
  config       JSONB NOT NULL,            -- {questionCount, timeLimit, subjects, etc.}
  status       VARCHAR(20) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
  score        DECIMAL(5,2),
  total_time   INTEGER,                  -- segundos
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  result_data  JSONB                     -- análise completa pós-simulado
);

CREATE TABLE progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES identity.users(id),
  course_id         UUID NOT NULL REFERENCES content.courses(id),
  module_id         UUID REFERENCES content.modules(id),
  questions_answered INTEGER DEFAULT 0,
  questions_correct  INTEGER DEFAULT 0,
  total_time_spent   INTEGER DEFAULT 0,  -- segundos
  last_activity_at   TIMESTAMPTZ,
  UNIQUE(user_id, course_id, module_id)
);
CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);

CREATE TABLE ranking_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES identity.users(id),
  course_id  UUID NOT NULL REFERENCES content.courses(id),
  period     VARCHAR(20) NOT NULL,       -- WEEKLY, MONTHLY, ALL_TIME
  period_key VARCHAR(20) NOT NULL,       -- "2026-W08", "2026-02", "all"
  xp_points  INTEGER NOT NULL DEFAULT 0,
  position   INTEGER,                    -- calculado periodicamente
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, period, period_key)
);
CREATE INDEX idx_ranking_course_period ON ranking_entries(course_id, period, period_key, xp_points DESC);

CREATE TABLE gamification_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES identity.users(id),
  event_type VARCHAR(50) NOT NULL,       -- QUESTION_ANSWERED, BADGE_EARNED, STREAK_MAINTAINED, etc.
  xp_delta   INTEGER NOT NULL DEFAULT 0,
  metadata   JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url    VARCHAR(500),
  xp_reward   INTEGER DEFAULT 0
);

CREATE TABLE user_badges (
  user_id    UUID REFERENCES identity.users(id),
  badge_id   UUID REFERENCES badges(id),
  earned_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE user_flashcard_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES identity.users(id),
  flashcard_id UUID NOT NULL REFERENCES content.flashcards(id),
  interval_days INTEGER DEFAULT 1,       -- repetição espaçada (SM-2)
  ease_factor   DECIMAL(4,2) DEFAULT 2.5,
  next_review   DATE,
  repetitions   INTEGER DEFAULT 0,
  UNIQUE(user_id, flashcard_id)
);
```

### E.4 Schema — Commerce / Billing

```sql
-- Schema: commerce

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  type        VARCHAR(30) NOT NULL,      -- SUBSCRIPTION, ONE_TIME, ADD_ON
  course_ids  UUID[],                    -- cursos incluídos (empty = todos)
  status      VARCHAR(20) DEFAULT 'ACTIVE',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id),
  name            VARCHAR(255) NOT NULL,
  billing_interval VARCHAR(20) NOT NULL, -- MONTHLY, YEARLY, ONE_TIME
  price_cents     INTEGER NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'BRL',
  trial_days      INTEGER DEFAULT 0,
  stripe_price_id VARCHAR(100),
  pagarme_plan_id VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  entitlements    JSONB NOT NULL DEFAULT '[]', -- ["ACCESS_COURSE_X", "PREMIUM_PLUS", etc.]
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE add_ons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50) UNIQUE NOT NULL,    -- PREMIUM_PLUS
  price_cents     INTEGER NOT NULL,
  billing_interval VARCHAR(20) NOT NULL,
  entitlements    JSONB NOT NULL DEFAULT '[]',
  stripe_price_id VARCHAR(100),
  status          VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES identity.users(id),
  plan_id             UUID REFERENCES plans(id),
  status              VARCHAR(30) NOT NULL,    -- TRIALING, ACTIVE, PAST_DUE, CANCELED, PAUSED
  gateway             VARCHAR(20) NOT NULL,    -- STRIPE, PAGARME
  gateway_subscription_id VARCHAR(100) UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at           TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  cancel_reason       TEXT,
  trial_end           TIMESTAMPTZ,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);

CREATE TABLE subscription_add_ons (
  subscription_id UUID REFERENCES subscriptions(id),
  add_on_id       UUID REFERENCES add_ons(id),
  activated_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  PRIMARY KEY (subscription_id, add_on_id)
);

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES identity.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  gateway         VARCHAR(20) NOT NULL,
  gateway_payment_id VARCHAR(100) UNIQUE,
  amount_cents    INTEGER NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'BRL',
  status          VARCHAR(30) NOT NULL,    -- PENDING, SUCCEEDED, FAILED, REFUNDED
  payment_method  VARCHAR(30),             -- CARD, PIX, BOLETO
  description     TEXT,
  invoice_url     VARCHAR(500),
  refunded_at     TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_payment_id);

CREATE TABLE refunds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES payments(id),
  amount_cents    INTEGER NOT NULL,
  reason          VARCHAR(100) NOT NULL,   -- CUSTOMER_REQUEST, DUPLICATE, FRAUD, CHARGEBACK
  status          VARCHAR(20) NOT NULL,    -- PENDING, APPROVED, REJECTED, PROCESSED
  gateway_refund_id VARCHAR(100),
  notes           TEXT,
  requested_by    UUID REFERENCES identity.users(id),  -- pode ser o próprio usuário
  approved_by     UUID REFERENCES identity.users(id),
  requested_at    TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  idempotency_key VARCHAR(100) UNIQUE      -- evitar reembolsos duplicados
);

CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(20) NOT NULL,    -- PERCENT, FIXED
  value           DECIMAL(10,2) NOT NULL,  -- % ou valor em reais
  currency        CHAR(3) DEFAULT 'BRL',
  max_uses        INTEGER,                 -- NULL = ilimitado
  current_uses    INTEGER DEFAULT 0,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  plan_ids        UUID[],                  -- NULL = todos os planos
  status          VARCHAR(20) DEFAULT 'ACTIVE',
  stripe_coupon_id VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway         VARCHAR(20) NOT NULL,
  event_type      VARCHAR(100) NOT NULL,
  gateway_event_id VARCHAR(100) UNIQUE,
  payload         JSONB NOT NULL,
  processed_at    TIMESTAMPTZ,
  processing_error TEXT,
  attempts        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_webhooks_unprocessed ON webhook_events(created_at) WHERE processed_at IS NULL;
```

### E.5 Schema — Admin / Audit

```sql
-- Schema: admin

CREATE TABLE admin_action_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES identity.users(id),
  action        VARCHAR(100) NOT NULL,    -- USER_BLOCKED, REFUND_APPROVED, QUESTION_PUBLISHED, etc.
  entity_type   VARCHAR(50) NOT NULL,     -- User, Question, Payment, etc.
  entity_id     UUID NOT NULL,
  before_state  JSONB,                    -- estado anterior (sanitizado)
  after_state   JSONB,                    -- estado posterior
  ip_address    INET,
  user_agent    TEXT,
  reason        TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Imutável: sem UPDATE ou DELETE nesta tabela
CREATE INDEX idx_admin_logs_entity ON admin_action_logs(entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_admin_logs_admin ON admin_action_logs(admin_user_id, occurred_at DESC);

CREATE TABLE import_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(50) NOT NULL,       -- QUESTIONS_CSV, QUESTIONS_EXCEL
  status      VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PROCESSING, DONE, FAILED
  file_key    VARCHAR(500) NOT NULL,      -- S3 key do arquivo enviado
  total_rows  INTEGER,
  processed   INTEGER DEFAULT 0,
  errors      JSONB DEFAULT '[]',         -- lista de erros por linha
  created_by  UUID REFERENCES identity.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### E.6 Estratégia de Índices e Busca

```sql
-- Busca de questões com múltiplos filtros: índice parcial composto
CREATE INDEX idx_questions_published_filters 
  ON content.questions(course_id, banca, year, difficulty, subject)
  WHERE status = 'PUBLISHED';

-- Full-text search no statement da questão
ALTER TABLE content.questions ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_questions_fts ON content.questions USING GIN(search_vector);

-- Trigger para manter search_vector atualizado
CREATE FUNCTION update_question_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese', 
    COALESCE(NEW.statement, '') || ' ' || 
    COALESCE(NEW.subject, '') || ' ' ||
    COALESCE(NEW.topic, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Busca de usuários por admin
CREATE INDEX idx_users_email ON identity.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_name_search ON identity.users USING GIN(to_tsvector('portuguese', name));
```

### E.7 Retenção de Dados (LGPD)

```
Dados pessoais e retenção:

Email, nome, CPF_hash: 
  → Manter enquanto conta ativa
  → Após exclusão: anonimizar em 30 dias (manter uuid para integridade referencial)
  
Histórico de respostas (attempts):
  → Manter por 5 anos (legítimo interesse: desempenho educacional)
  → Após: agregar em estatísticas anônimas, deletar registros individuais

Logs de auditoria admin:
  → Manter por 5 anos (obrigação legal)

Dados de pagamento:
  → Manter por 5 anos (obrigação fiscal/tributária)
  → Números de cartão: NUNCA armazenar, usar tokens do gateway

Sessions/Devices:
  → Sessões expiradas: deletar após 90 dias
  → Dispositivos inativos: deletar após 1 ano

RiskSignals:
  → Manter por 6 meses, depois deletar ou anonimizar

Processo de "direito ao esquecimento":
  → User.status = DELETION_REQUESTED
  → Job assíncrono em 30 dias: anonimiza todos dados pessoais
  → Mantém registros financeiros (obrigação legal) com user_id mas sem PII
```

---

## F. APIs e Contratos

### F.1 Padrões Gerais

```
REST vs GraphQL:
  → REST para todas as APIs (admin e aluno)
  → Motivo: mais simples, melhor para cache HTTP, equipe menor, tooling (Swagger/OpenAPI)
  → GraphQL apenas se surgir necessidade de queries flexíveis no admin (V2)

Padrões REST obrigatórios:

VERSIONAMENTO:
  /api/v1/... (versão no path, não no header — mais visível)

PAGINAÇÃO (padrão cursor-based para listas longas):
  GET /api/v1/questions?cursor=<base64>&limit=20
  Response: { data: [], pagination: { nextCursor, hasMore, total? } }
  
  Alternativa offset para admin (interfaces com "página X"):
  GET /api/v1/admin/users?page=1&size=20
  Response: { data: [], pagination: { page, size, total, totalPages } }

FILTROS:
  Query params: ?status=PUBLISHED&banca=CESPE&year=2024&difficulty=HARD
  
ERROS:
  {
    "error": {
      "code": "QUESTION_NOT_FOUND",
      "message": "Questão não encontrada",
      "details": {},
      "requestId": "uuid",
      "timestamp": "ISO8601"
    }
  }

IDEMPOTÊNCIA:
  Header: Idempotency-Key: <uuid> (obrigatório para POST de pagamento, reembolso)
  
AUTENTICAÇÃO:
  Authorization: Bearer <jwt_access_token>
  Refresh via: POST /api/v1/auth/refresh (cookie httpOnly com refresh token)
```

### F.2 Endpoints — Área do Aluno

```yaml
# Auth
POST   /api/v1/auth/login
  body: { email, password }
  response: { accessToken, expiresIn, user: { id, name, email, roles } }

POST   /api/v1/auth/refresh
  cookie: refresh_token (httpOnly)
  response: { accessToken, expiresIn }

POST   /api/v1/auth/logout
  → invalida sessão atual

POST   /api/v1/auth/register
  body: { name, email, password, cpf? }

POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# Perfil do Aluno
GET    /api/v1/me
PATCH  /api/v1/me
  body: { name, phone, avatar }

GET    /api/v1/me/devices
DELETE /api/v1/me/devices/{deviceId}          # revogar dispositivo próprio

GET    /api/v1/me/entitlements               # o que o aluno tem acesso

# Catálogo
GET    /api/v1/courses                       # lista pública
GET    /api/v1/courses/{slug}                # detalhe do curso
GET    /api/v1/courses/{slug}/modules        # módulos

# Banco de Questões (requer auth + entitlement)
GET    /api/v1/questions
  query: courseId, moduleId, banca, year, subject, difficulty, tags, status(answered/unanswered/wrong)
  cursor paginação

GET    /api/v1/questions/{id}
  response: { id, statement, options, type, banca, year, difficulty, tags }
  # NÃO retorna is_correct — apenas após tentativa

POST   /api/v1/questions/{id}/attempt
  body: { selectedOption?, trueFalseAnswer?, timeSpent }
  response: { isCorrect, correctOption, explanation, xpGained, streak }

GET    /api/v1/questions/{id}/my-history     # histórico do aluno nessa questão

POST   /api/v1/questions/{id}/favorite
DELETE /api/v1/questions/{id}/favorite

# Simulados
GET    /api/v1/simulations                   # listagem dos simulados do aluno
POST   /api/v1/simulations
  body: { courseId, type: "CUSTOM", config: { questionCount, timeLimit, subjects, difficulties } }
  response: { simulationId, questions: [{ id, statement, options, type }] }

POST   /api/v1/simulations/weekly/{courseId}  # pegar simulado semanal atual

GET    /api/v1/simulations/{id}
  # se IN_PROGRESS: retorna questões sem gabarito
  # se COMPLETED: retorna resultado completo

POST   /api/v1/simulations/{id}/submit
  body: { answers: [{ questionId, selectedOption?, trueFalseAnswer?, timeSpent }] }
  response: { score, totalCorrect, totalQuestions, breakdown: [{subject, correct, total}], ranking }

POST   /api/v1/simulations/{id}/abandon

# Flashcards
GET    /api/v1/flashcards?courseId=&moduleId=&reviewMode=true
POST   /api/v1/flashcards/{id}/review         # Premium+ — SM-2
  body: { rating: 0-5 }                       # 0=esqueceu, 5=perfeito

# Apostilas
GET    /api/v1/materials?courseId=&moduleId=
GET    /api/v1/materials/{id}
GET    /api/v1/materials/{id}/access          # URL temporária assinada (S3 presigned)
  # verifica entitlement, gera URL com TTL de 1h
  # log de acesso para auditoria

POST   /api/v1/materials/{id}/highlight       # salvar highlight
GET    /api/v1/materials/{id}/my-highlights

# Desempenho
GET    /api/v1/me/performance?courseId=&period=LAST_30_DAYS
  response: {
    accuracy: 72.5,
    totalQuestions: 340,
    bySubject: [{subject, accuracy, count}],
    byDifficulty: [{difficulty, accuracy}],
    timeline: [{date, accuracy, count}],
    strongSubjects: [],
    weakSubjects: []
  }

# Ranking
GET    /api/v1/courses/{courseId}/ranking?period=WEEKLY&limit=50
GET    /api/v1/courses/{courseId}/ranking/me    # posição do aluno atual

# Notificações
GET    /api/v1/me/notifications?unreadOnly=true
POST   /api/v1/me/notifications/{id}/read
POST   /api/v1/me/push-token                   # registrar token PWA
```

### F.3 Endpoints — Área Administrativa

```yaml
# Prefixo: /api/v1/admin/
# Todos requerem role ADMIN ou superior

# Dashboard
GET    /api/v1/admin/dashboard
  response: {
    mrr: { value, growth },
    activeSubscriptions: { value, growth },
    newSubscriptions: { today, week, month },
    churnRate: { value, period },
    dau: value,
    mau: value,
    alerts: []
  }

# Usuários
GET    /api/v1/admin/users?search=&status=&plan=&page=&size=
GET    /api/v1/admin/users/{id}
PATCH  /api/v1/admin/users/{id}/status
  body: { status: ACTIVE|SUSPENDED, reason }
  # registra audit log

POST   /api/v1/admin/users/{id}/revoke-sessions
  # força logout de todos os dispositivos

GET    /api/v1/admin/users/{id}/risk-signals
GET    /api/v1/admin/users/{id}/payments
GET    /api/v1/admin/users/{id}/subscriptions
GET    /api/v1/admin/users/{id}/activity

# Questões
GET    /api/v1/admin/questions?status=&courseId=&page=
POST   /api/v1/admin/questions
PATCH  /api/v1/admin/questions/{id}
DELETE /api/v1/admin/questions/{id}           # soft delete

POST   /api/v1/admin/questions/{id}/publish
POST   /api/v1/admin/questions/{id}/archive
POST   /api/v1/admin/questions/{id}/submit-review  # editor submete para revisão

GET    /api/v1/admin/questions/{id}/versions    # histórico de versões

# Importação em massa
POST   /api/v1/admin/import/questions
  body: multipart/form-data (arquivo CSV/Excel)
  response: { jobId }

GET    /api/v1/admin/import/{jobId}/status
  response: { status, total, processed, errors: [{row, error}] }

GET    /api/v1/admin/import/{jobId}/error-report  # download CSV com erros

# Apostilas
GET    /api/v1/admin/materials?courseId=&status=&page=
POST   /api/v1/admin/materials
POST   /api/v1/admin/materials/{id}/version
  body: multipart/form-data (PDF)
  response: { versionId }

# Planos e Comercial
GET    /api/v1/admin/plans
POST   /api/v1/admin/plans
PATCH  /api/v1/admin/plans/{id}

GET    /api/v1/admin/coupons?page=
POST   /api/v1/admin/coupons
PATCH  /api/v1/admin/coupons/{id}/status

# Pagamentos
GET    /api/v1/admin/payments?userId=&status=&gateway=&from=&to=&page=
GET    /api/v1/admin/payments/{id}

GET    /api/v1/admin/subscriptions?status=&page=
PATCH  /api/v1/admin/subscriptions/{id}/cancel
  body: { reason }

# Reembolsos
GET    /api/v1/admin/refunds?status=&page=
POST   /api/v1/admin/refunds
  body: { paymentId, amountCents?, reason, notes }
  headers: Idempotency-Key: <uuid>
  # verifica: pagamento existe, não foi reembolsado, valor <= pago
  # cria refund com status PENDING

PATCH  /api/v1/admin/refunds/{id}/approve
  # requer role FINANCIAL ou ADMIN
  # chama gateway para processar
  # registra audit log

PATCH  /api/v1/admin/refunds/{id}/reject
  body: { reason }

# KPIs / Financeiro
GET    /api/v1/admin/reports/revenue?period=MONTHLY&from=&to=
GET    /api/v1/admin/reports/mrr-history?months=12
GET    /api/v1/admin/reports/churn?period=MONTHLY
GET    /api/v1/admin/reports/conversion
GET    /api/v1/admin/reports/subscriptions-by-plan

# Auditoria
GET    /api/v1/admin/audit-logs?adminId=&entityType=&entityId=&from=&to=&page=

# Anti-compartilhamento
GET    /api/v1/admin/security/risk-incidents?severity=&status=&page=
POST   /api/v1/admin/security/risk-incidents/{id}/resolve
  body: { action: WARN|FORCE_LOGOUT|SUSPEND, notes }
```

---

## G. Pagamentos, Assinaturas e Receita

### G.1 Gateway de Pagamento

```
COMPARATIVO:

┌────────────────┬───────────────────┬──────────────────────┬──────────────────────┐
│                │ STRIPE            │ PAGAR.ME             │ IUGU                 │
├────────────────┼───────────────────┼──────────────────────┼──────────────────────┤
│ Cartão BR      │ ✅ Excelente       │ ✅ Excelente          │ ✅ Excelente          │
│ Pix            │ ✅ Nativo          │ ✅ Nativo             │ ✅ Nativo             │
│ Boleto         │ ✅ Nativo          │ ✅ Nativo             │ ✅ Nativo             │
│ Assinaturas    │ ✅ Melhor do mundo │ ✅ Bom                │ ✅ Bom                │
│ SDK qualidade  │ ✅ Excelente       │ 🟡 Bom               │ 🟡 Médio             │
│ Webhooks       │ ✅ Confiáveis      │ ✅ Bons               │ 🟡 Médio             │
│ Taxa (aprox.)  │ 3.4% + R$0,40     │ 3.99%                │ 2.9% + R$0,30        │
│ Taxa Pix       │ 0.4%              │ 0.99%                │ 1%                   │
│ Suporte PT-BR  │ 🟡 Parcial        │ ✅ Nativo             │ ✅ Nativo             │
│ Antifraude     │ ✅ Radar (embutido)│ ✅ Score              │ 🟡 Básico            │
└────────────────┴───────────────────┴──────────────────────┴──────────────────────┘

RECOMENDAÇÃO:
  Primário: Stripe
    → SDK superior, customer portal embutido, gestão de assinaturas automática
    → Radar (antifraude) embutido sem custo extra no início
    → Webhooks mais confiáveis (idempotência nativa)
    
  Backup/Alternativa BR: Pagar.me
    → Para clientes que preferem Pix como método principal
    → Integrar no futuro se Pix for relevante no produto

ABSTRAÇÃO:
  Criar GatewayPort (interface) com implementações StripeGateway e PagarmeGateway
  Commerce domain usa apenas a interface, nunca o SDK diretamente
```

### G.2 Modelo de Assinaturas

```
Tipos de planos:
  1. Mensal (MONTHLY): renovação a cada 30 dias
  2. Anual (YEARLY): renovação anual, desconto (ex: 2 meses grátis)
  3. Avulso (ONE_TIME): acesso a curso específico, sem renovação

Add-ons:
  Premium+ mensal: sobreposto à assinatura base

Trial:
  7 dias grátis (cartão obrigatório — reduz inadimplência de ativação)

Upgrades/Downgrades:
  Usar proration do Stripe:
  - Upgrade: cobra diferença proporcional imediatamente
  - Downgrade: crédita diferença no próximo ciclo

Inadimplência:
  → Stripe tenta cobrar novamente: D+1, D+3, D+7
  → Se falhar: status PAST_DUE
  → Email automatizado de cada tentativa (Stripe envia ou via webhook)
  → Após período de graça configurável (ex: 7 dias): acesso suspenso
  → Status: CANCELED (Stripe cancela) ou admin pode manter manualmente
```

### G.3 Fluxo de Reembolso

```
┌──────────────────────────────────────────────────────────────────┐
│                    FLUXO DE REEMBOLSO                            │
│                                                                  │
│  Aluno solicita (portal)  →  ticket criado                       │
│       OU                                                         │
│  Admin inicia diretamente                                        │
│                │                                                 │
│                ▼                                                 │
│  POST /admin/refunds                                             │
│  { paymentId, amountCents, reason, notes }                       │
│  + Idempotency-Key header                                        │
│                │                                                 │
│                ▼                                                 │
│  Validações:                                                     │
│  ✓ Pagamento existe e pertence ao usuário                       │
│  ✓ Status do pagamento = SUCCEEDED                              │
│  ✓ Valor solicitado ≤ valor pago - já reembolsado               │
│  ✓ Dentro do prazo (configurável, ex: 90 dias)                  │
│  ✓ Idempotency-Key não foi usado antes                          │
│                │                                                 │
│                ▼                                                 │
│  Refund criado com status PENDING                                │
│                │                                                 │
│                ▼                                                 │
│  PATCH /admin/refunds/{id}/approve                               │
│  (requer role FINANCIAL ou ADMIN)                                │
│                │                                                 │
│                ▼                                                 │
│  Chama gateway.refund(gatewayPaymentId, amountCents)             │
│                │                                                 │
│        ┌───────┴────────┐                                        │
│    SUCCESS           FAILURE                                     │
│        │                 │                                       │
│  status=PROCESSED   status=FAILED                                │
│  audit log          audit log + alerta                           │
│        │                                                         │
│  webhook Stripe confirma (assíncrono)                            │
│  → Payment.status = REFUNDED                                     │
│  → Subscription cancelada (se reembolso total)                  │
│  → Email para aluno                                              │
└──────────────────────────────────────────────────────────────────┘

CONCILIAÇÃO:
  Job diário que compara:
  - Payments com status SUCCEEDED no banco
  - vs. transações do Stripe/Pagar.me
  Diferenças → alerta para financeiro
```

### G.4 Painel Financeiro — KPIs

```
MRR (Monthly Recurring Revenue):
  = Σ (subscription.plan.price_cents / billing_interval_months) 
    para todas subscriptions com status IN (ACTIVE, TRIALING)
  
ARR = MRR × 12

CHURN RATE mensal:
  = (assinantes_cancelados_no_mês / assinantes_início_do_mês) × 100

NET REVENUE CHURN:
  = (MRR_perdido - MRR_expansão) / MRR_início × 100

LTV (estimado):
  = ticket_médio / churn_rate_mensal

NPS: Calculado separadamente (via formulário externo, ex: Typeform)

Fonte de verdade: banco de dados próprio, NÃO o dashboard do Stripe
  → Job de reconciliação diária compara os dois
```

### G.5 Webhooks — Processamento Seguro

```java
// WebhookController.java (Commerce module)

@PostMapping("/webhooks/stripe")
public ResponseEntity<Void> handleStripeWebhook(
    @RequestBody String payload,
    @RequestHeader("Stripe-Signature") String signature
) {
    // 1. Verificar assinatura ANTES de qualquer processamento
    Event event;
    try {
        event = Webhook.constructEvent(payload, signature, stripeWebhookSecret);
    } catch (SignatureVerificationException e) {
        log.warn("Invalid Stripe signature");
        return ResponseEntity.status(400).build();
    }
    
    // 2. Verificar idempotência (já processamos este evento?)
    if (webhookEventRepository.existsByGatewayEventId(event.getId())) {
        return ResponseEntity.ok().build(); // 200 OK, não reprocessar
    }
    
    // 3. Salvar evento ANTES de processar (garante rastreabilidade)
    webhookEventRepository.save(new WebhookEvent(event));
    
    // 4. Processar assincronamente (não bloquear resposta ao Stripe)
    eventPublisher.publishEvent(new StripeWebhookReceived(event));
    
    return ResponseEntity.ok().build();
}

// StripeWebhookHandler.java — ouve o evento assíncrono
@EventListener
@Transactional
public void handleSubscriptionUpdated(StripeWebhookReceived event) {
    switch (event.getType()) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
            syncSubscription(event.getData());
            break;
        case "invoice.payment_succeeded":
            recordPayment(event.getData());
            break;
        case "invoice.payment_failed":
            handlePaymentFailed(event.getData());
            break;
        case "charge.refunded":
            recordRefund(event.getData());
            break;
    }
    // Marca webhook como processado
    webhookEventRepository.markProcessed(event.getGatewayEventId());
}
```

---

## H. Anti-Compartilhamento de Login

### H.1 Estratégia e Componentes

```
OBJETIVO: Detectar e impedir uso simultâneo em múltiplos locais/dispositivos
SEM: ferrar a UX de usuários legítimos (ex: trocar de celular, usar em casa e no trabalho)

COMPONENTES:
  1. Device Fingerprinting (lado client — leve e transparente)
  2. Limite de sessões ativas por conta
  3. Detecção de anomalia (IP, localização, horário)
  4. Resposta gradual (alerta → challenge → logout → bloqueio)
  5. Painel admin para análise e ação
```

### H.2 Device Fingerprinting

```typescript
// client/lib/device-fingerprint.ts
// Leve, sem bibliotecas pesadas — apenas dados disponíveis no browser

export async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() || '',
    // Canvas fingerprint (leve)
    await getCanvasFingerprint(),
  ];
  
  const raw = components.join('|');
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getCanvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillText('Bizu!🎓', 10, 10);
  return canvas.toDataURL().substring(0, 100);
}

// Enviado em TODOS os requests de auth como header:
// X-Device-Fingerprint: <hash>
```

### H.3 Limites e Regras

```
CONFIGURAÇÃO (por plano, configurável pelo admin):

Plano Básico:
  - max_devices: 2          (dispositivos confiáveis cadastrados)
  - max_concurrent_sessions: 1  (apenas 1 sessão ativa por vez)

Plano Premium:
  - max_devices: 3
  - max_concurrent_sessions: 2

Plano Institucional:
  - max_devices: 5
  - max_concurrent_sessions: 3

REGRAS DE DETECÇÃO DE ANOMALIA:

Sinal 1 — Sessões simultâneas além do limite:
  Verificação a cada request autenticado:
  SELECT COUNT(*) FROM sessions 
  WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
  
  Se > max_concurrent_sessions: alerta gerado

Sinal 2 — Mudança geográfica impossível:
  Calcular distância entre IP atual e IP da última sessão
  Se distância > 500km em < 30 minutos: sinal HIGH

Sinal 3 — IPs muito distintos em curto período:
  Se 3+ IPs de ASNs diferentes em 1h: sinal MEDIUM

Sinal 4 — Fingerprint desconhecido em conta com muitos dispositivos:
  Novo fingerprint + já está no limite de devices: sinal MEDIUM

Sinal 5 — Padrão de VPN/proxy:
  Verificar ASN contra lista de VPNs conhecidas: sinal LOW
  (não bloquear automaticamente — estudantes usam VPN legitimamente)
```

### H.4 Resposta Gradual

```
PSEUDOCÓDIGO — SessionMiddleware (executado em cada request autenticado):

function checkSessionSecurity(user, currentSession, request):
  
  signals = detectAnomalies(user, currentSession, request)
  maxSeverity = max(signals.map(s => s.severity))
  
  if maxSeverity == NONE:
    allow()
    return
  
  if maxSeverity == LOW:
    # Logar, não agir
    logSignal(signals)
    allow()
    return
    
  if maxSeverity == MEDIUM:
    # Na primeira vez: mostrar alerta, pedir confirmação
    if not user.hasAcknowledgedWarning(within=24h):
      sendInAppAlert(user, "Detectamos acesso de um novo local. É você?")
      allow() # ainda permite, mas registra
    else:
      allow()
    return
  
  if maxSeverity == HIGH:
    # Criar incidente + revogar sessão mais antiga
    incident = createIncident(user, signals)
    oldestSession = getOldestActiveSessions(user, limit=overLimit)
    revokeSession(oldestSession, reason="SHARING_DETECTED")
    # Usuário na sessão mais antiga vai receber 401 no próximo request
    notifyUser(user, channel=EMAIL, template="security_alert")
    allow() # sessão atual continua
    return
    
  if maxSeverity == CRITICAL:
    # Revogar TODAS as sessões exceto a atual
    revokeAllSessions(user, except=currentSession)
    notifyUser(user, channel=EMAIL, template="account_locked")
    createIncident(user, signals, status=REQUIRES_ADMIN_REVIEW)
    allow() # corrente ainda vai... mas as outras não
```

### H.5 UX do Aluno — Minimizando Falsos Positivos

```
REGRAS ANTI-FALSO-POSITIVO:

1. Período de graça de dispositivo:
   Se aluno troca de celular → novo fingerprint NÃO é bloqueado automaticamente
   → É registrado como "dispositivo não confiável" por 24h
   → Se não houver outros sinais de anomalia: promovido a "confiável"

2. Viagem / mudança de cidade:
   Não bloquear apenas por mudança de IP
   Só agir se MÚLTIPLOS sinais simultâneos

3. Usuário pode gerenciar dispositivos:
   → Interface em "Minha conta > Dispositivos"
   → Ver todos os dispositivos confiáveis
   → Remover dispositivos antigos
   → "Sair de todos os outros dispositivos"

4. Antes de bloquear: sempre e-mail de aviso com link para acesso emergencial

5. Admin pode whitelist um usuário manualmente (ex: está em workshop, múltiplos IPs)

INTERFACE DO ALUNO (Minha conta > Segurança):

  Dispositivos conhecidos:
  [📱] iPhone de Maria — São Paulo, SP — Ativo agora
  [💻] Chrome no Mac — Rio de Janeiro, RJ — Há 3 dias
  [🗑️] Remover dispositivo

  Sessões ativas:
  [🔒] Sair de todos os outros dispositivos

  Alertas recentes:
  ⚠️ Acesso de novo dispositivo em 15/02 — [Fui eu]  [Não fui eu]
```

### H.6 Painel Admin — Anti-Compartilhamento

```
Tela: Admin > Segurança > Incidentes

Filtros: severidade, status (aberto/resolvido), período

Lista de incidentes:
  ID   | Usuário       | Severidade | Sinais                    | Data       | Status
  #123 | maria@...     | HIGH       | 3 IPs em 30min, 4 sessions| 15/02/2026 | ABERTO

Detalhe do incidente:
  Usuário: Maria Silva (ID: uuid)
  Sinais detectados:
    - CONCURRENT_SESSIONS: 4 sessões (limite: 2)
    - MULTIPLE_IPS: IPs de SP, RJ, BH em 2h
    - GEO_DISTANCE: 700km em 25 minutos
  
  Sessões ativas:
    Session A - iPhone - SP - ativa há 3h
    Session B - Chrome - RJ - ativa há 1h
    Session C - Firefox - BH - ativa há 30min
    Session D - Mobile - POA - ativa há 10min
  
  Histórico de incidentes anteriores: 2 nos últimos 30 dias
  
  Ações disponíveis:
  [Revogar sessões excedentes]  [Suspender conta]  [Marcar como falso positivo]  [Resolver]
  
  Notas internas: _______________
```

---

## I. Backoffice / CMS Admin

### I.1 Estrutura do Frontend Admin

```
/admin (Next.js app separado ou same app com route group)

Layout:
  - Sidebar fixa no desktop (ícones + labels)
  - Topbar com: nome do admin logado, notificações, atalhos rápidos
  - Colapsável para telas médias
  
Rotas:
  /admin/dashboard              → KPIs e overview
  /admin/users                  → Listagem de usuários
  /admin/users/[id]             → Perfil detalhado
  /admin/content/courses        → Cursos
  /admin/content/courses/[id]   → Editar curso
  /admin/content/questions      → Banco de questões
  /admin/content/questions/[id] → Editar questão
  /admin/content/materials      → Apostilas
  /admin/content/import         → Importação em massa
  /admin/commercial/plans       → Planos e preços
  /admin/commercial/coupons     → Cupons
  /admin/payments               → Transações
  /admin/payments/subscriptions → Assinaturas
  /admin/payments/refunds       → Reembolsos
  /admin/reports                → Relatórios financeiros
  /admin/security               → Incidentes de segurança
  /admin/audit                  → Logs de auditoria
  /admin/settings               → Configurações gerais
```

### I.2 Dashboard KPIs

```
┌──────────────────────────────────────────────────────────────────┐
│  BIZU! ADMIN                            🔔 Admin ▼              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
│  │ MRR        │  │ Assinantes │  │ Churn      │  │ Trial→   │  │
│  │ R$ 28.450  │  │ 1.240      │  │ 2,3%       │  │ Paid 34% │  │
│  │ ↑ 12% mês  │  │ ↑ 87 hoje  │  │ ↓ 0.2%     │  │ ↑ 5%     │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘  │
│                                                                  │
│  Receita mensal (12 meses)         Novos vs. Cancelamentos      │
│  ┌─────────────────────────────┐   ┌──────────────────────────┐ │
│  │   📈                        │   │  ■ Novos  ■ Cancelados   │ │
│  │       ▁▃▅▇█▇▆▅▆▇█           │   │  ████ ██                 │ │
│  └─────────────────────────────┘   └──────────────────────────┘ │
│                                                                  │
│  Alertas operacionais                                            │
│  ⚠️  3 reembolsos pendentes de aprovação                        │
│  ⚠️  2 incidentes de segurança HIGH não resolvidos               │
│  ℹ️  Importação de questões concluída: 234 questões adicionadas  │
└──────────────────────────────────────────────────────────────────┘
```

### I.3 CMS — Editor de Questões

```
Campos obrigatórios:
  - Curso (select)
  - Módulo (select, filho do curso)
  - Banca (text/select com autocomplete)
  - Ano (number)
  - Disciplina / Assunto / Tópico (text)
  - Dificuldade (EASY/MEDIUM/HARD)
  - Tipo (MULTIPLE_CHOICE / TRUE_FALSE)
  - Enunciado (TipTap rich editor — suporte a LaTeX via extensão)
  - Opções A-E (se múltipla escolha) — cada uma com editor rico
  - Resposta correta (radio)
  - Explicação/Gabarito (TipTap — obrigatório para publicar)
  - Tags (multi-select com autocomplete)

Suporte a LaTeX:
  → Extensão TipTap para KaTeX
  → Preview em tempo real ao digitar $formula$
  → Atalho: Ctrl+M para inserir bloco de fórmula

Imagens:
  → Upload direto para S3 via presigned URL
  → Resize automático (máx 1200px, WebP)
  → Referenciadas por URL absoluta

Workflow de status:
  RASCUNHO → [Enviar para revisão] → EM_REVISÃO → [Aprovar] → PUBLICADO
                                                → [Rejeitar] → RASCUNHO

Permissões por status:
  EDITOR: pode criar/editar RASCUNHO, pode submeter para revisão
  ADMIN: pode aprovar/rejeitar/publicar diretamente
  SUPER_ADMIN: tudo
```

### I.4 Importação em Massa de Questões

```
FORMATOS SUPORTADOS: CSV e Excel (.xlsx)

TEMPLATE CSV (colunas obrigatórias):
  banca, year, course_slug, subject, topic, difficulty, type, 
  statement, option_a, option_b, option_c, option_d, option_e,
  correct_option, explanation, tags

VALIDAÇÕES POR LINHA:
  - course_slug deve existir
  - difficulty: EASY/MEDIUM/HARD (case-insensitive)
  - type: MULTIPLE_CHOICE/TRUE_FALSE
  - correct_option: A/B/C/D/E (obrigatório se MULTIPLE_CHOICE)
  - statement: não vazio
  - year: 4 dígitos, entre 1990 e ano atual

PROCESSAMENTO:
  1. Upload do arquivo → S3
  2. Job criado (ImportJob) → retorna jobId
  3. Worker processa linha a linha
     - Erros: registra linha + motivo, continua
     - Sucessos: insere como DRAFT (para revisão antes de publicar)
  4. Relatório disponível no painel
  5. Notificação ao admin quando concluído

INTERFACE:
  [Baixar template CSV]  [Baixar template Excel]
  
  Arrastar arquivo ou clicar para fazer upload
  
  Progresso: ████████░░ 80% (320/400 linhas)
  ✅ 310 questões importadas
  ❌ 10 erros — [Baixar relatório de erros]
  
  Erros:
  Linha 5: Course 'minha-banca' não encontrado
  Linha 23: 'correct_option' deve ser A, B, C, D ou E
  ...
```

### I.5 RBAC — Permissões Detalhadas

```
Perfis e permissões:

┌───────────────────────────┬─────────────┬───────┬────────┬──────────┬─────────┐
│ Recurso / Ação            │ SUPER_ADMIN │ ADMIN │ EDITOR │ FINANCIAL│ SUPPORT │
├───────────────────────────┼─────────────┼───────┼────────┼──────────┼─────────┤
│ Dashboard KPIs            │ ✅          │ ✅    │ ❌     │ ✅       │ ❌      │
│ Listar usuários           │ ✅          │ ✅    │ ❌     │ ❌       │ ✅      │
│ Bloquear usuário          │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
│ Criar/editar questão      │ ✅          │ ✅    │ ✅     │ ❌       │ ❌      │
│ Publicar questão          │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
│ Criar/editar apostila     │ ✅          │ ✅    │ ✅     │ ❌       │ ❌      │
│ Importar questões         │ ✅          │ ✅    │ ✅     │ ❌       │ ❌      │
│ Criar/editar planos       │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
│ Criar cupons              │ ✅          │ ✅    │ ❌     │ ✅       │ ❌      │
│ Ver transações            │ ✅          │ ✅    │ ❌     │ ✅       │ ✅*     │
│ Processar reembolso       │ ✅          │ ✅    │ ❌     │ ✅       │ ❌      │
│ Ver audit logs            │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
│ Gerenciar admins          │ ✅          │ ❌    │ ❌     │ ❌       │ ❌      │
│ Configurações do sistema  │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
│ Resolver incidentes sec.  │ ✅          │ ✅    │ ❌     │ ❌       │ ❌      │
└───────────────────────────┴─────────────┴───────┴────────┴──────────┴─────────┘
* SUPPORT vê apenas valor total, não dados de cartão

Implementação no Spring Boot:
  @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
  @PreAuthorize("hasRole('FINANCIAL') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  
  Ou via anotação customizada:
  @RequiresPermission(Permission.QUESTION_PUBLISH)
```

---

## J. Observabilidade e Operação

### J.1 Stack de Observabilidade

```
Logs:
  Framework: SLF4J + Logback
  Formato: JSON estruturado (nunca texto livre em produção)
  Destino: stdout → coletor (Loki ou CloudWatch Logs)
  
Métricas:
  Framework: Spring Boot Actuator + Micrometer
  Destino: Prometheus → Grafana
  
Tracing:
  Framework: OpenTelemetry (OTEL) Java Agent
  Destino: Jaeger ou Tempo (Grafana)
  
Alertas:
  Grafana Alerting ou PagerDuty (se orçamento permitir)
  
Health Checks:
  /actuator/health (Spring Boot Actuator)
  /actuator/health/liveness
  /actuator/health/readiness
```

### J.2 Logs Estruturados (padrão)

```java
// Cada log deve ter campos consistentes

// Log de request (via filter):
{
  "timestamp": "2026-02-15T10:30:00Z",
  "level": "INFO",
  "service": "bizu-backend",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "uuid",        // quando autenticado
  "requestId": "uuid",     // gerado por request
  "method": "POST",
  "path": "/api/v1/questions/abc/attempt",
  "statusCode": 200,
  "durationMs": 45,
  "message": "Request completed"
}

// Log de domínio (dentro do serviço):
log.info("Question attempt recorded",
  kv("questionId", questionId),
  kv("userId", userId),
  kv("isCorrect", isCorrect),
  kv("timeSpent", timeSpent)
);

// Log de erro:
{
  "level": "ERROR",
  "errorCode": "GATEWAY_TIMEOUT",
  "errorMessage": "Stripe API timeout after 5000ms",
  "operation": "stripe.createSubscription",
  "userId": "uuid",
  "traceId": "abc123"
}

// NUNCA logar: senhas, tokens, números de cartão, CPF em plain text
```

### J.3 Métricas Essenciais

```
Métricas de negócio (custom via Micrometer):
  bizu.subscriptions.active{plan="monthly"}
  bizu.attempts.total{correct="true"}
  bizu.simulations.completed.total
  bizu.payment.succeeded.total{gateway="stripe"}
  bizu.payment.failed.total{reason="card_declined"}
  bizu.refund.processed.total

Métricas de sistema (Micrometer automático):
  http.server.requests (latência por endpoint)
  jvm.memory.used
  hikaricp.connections.active (pool de conexões)
  cache.gets{result="miss"} (Redis cache hits/misses)

Alertas configurados:
  🔴 CRÍTICO: API p95 latência > 2s por 5 minutos
  🔴 CRÍTICO: Taxa de erro 5xx > 1% por 3 minutos
  🔴 CRÍTICO: Conexões DB > 90% do pool
  🟡 ALERTA: Webhook do Stripe não recebido em 1h (espera evento periódico)
  🟡 ALERTA: Fila de importação parada > 10 minutos
  🟡 ALERTA: 5+ incidentes de segurança HIGH em 1h
```

### J.4 Tracing Distribuído

```java
// Configuração OTEL (application.yml):
management:
  tracing:
    enabled: true
    sampling:
      probability: 0.1  # 10% em prod (ajustar conforme volume)
  otlp:
    tracing:
      endpoint: http://otel-collector:4318/v1/traces

// Todos os requests ganham traceId automaticamente
// Propagar para chamadas externas (Stripe, Pagar.me):
// → OTEL propaga automaticamente via headers HTTP

// Log correlation:
// traceId e spanId são automaticamente adicionados aos logs (MDC)
// → Permite rastrear request completo nos logs a partir do traceId
```

### J.5 Health Checks e Runbooks

```yaml
# /actuator/health response:
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "redis": { "status": "UP" },
    "stripe": { "status": "UP" },
    "diskSpace": { "status": "UP", "details": { "free": "10GB" } },
    "rabbit": { "status": "UP" }
  }
}

# Runbooks (exemplos):

INCIDENTE: Alta latência na API de questões
  1. Verificar métricas: http.server.requests para /api/v1/questions
  2. Verificar pool de conexões do banco (hikari metrics)
  3. Verificar query explain para a query mais lenta (pg_stat_statements)
  4. Se índice faltando: CREATE INDEX CONCURRENTLY (sem downtime)
  5. Se pool esgotado: aumentar pool size ou escalar instância

INCIDENTE: Webhook do Stripe não processando
  1. Verificar tabela webhook_events: SELECT * WHERE processed_at IS NULL ORDER BY created_at
  2. Verificar logs do worker de webhooks (traceId do evento)
  3. Se erro de parsing: verificar se Stripe mudou formato (changelog Stripe)
  4. Se deadlock no banco: analisar pg_locks, reprocessar manualmente
  5. Stripe retenta por 3 dias — não há urgência extrema

INCIDENTE: Usuário bloqueado erroneamente (falso positivo segurança)
  1. Admin > Usuário > Histórico de incidentes
  2. Verificar sinais que geraram o bloqueio
  3. Se claramente falso positivo: resolver incidente + revogar bloqueio
  4. Documentar caso para ajustar regras se recorrente
```

---

## K. Infraestrutura e Deploy

### K.1 Docker e Containers

```dockerfile
# Dockerfile — Backend (Spring Boot)
FROM eclipse-temurin:21-jre-alpine AS base
WORKDIR /app

FROM base AS builder
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

FROM base AS final
COPY --from=builder /app/dependencies/ ./
COPY --from=builder /app/spring-boot-loader/ ./
COPY --from=builder /app/snapshot-dependencies/ ./
COPY --from=builder /app/application/ ./

# Usuário não-root (segurança)
RUN addgroup -S bizu && adduser -S bizu -G bizu
USER bizu

EXPOSE 8080
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=75", \
  "-XX:+UseContainerSupport", \
  "org.springframework.boot.loader.launch.JarLauncher"]
```

```dockerfile
# Dockerfile — Frontend (Next.js)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -S bizu && adduser -S bizu -G bizu

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER bizu
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml (desenvolvimento)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: bizu
      POSTGRES_USER: bizu
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: bizu
      RABBITMQ_DEFAULT_PASS: ${RABBIT_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KC_ADMIN_PASSWORD}
    volumes:
      - ./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm.json
    ports:
      - "8180:8080"

  backend:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_URL: jdbc:postgresql://postgres:5432/bizu
      DB_USERNAME: bizu
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      KEYCLOAK_URL: http://keycloak:8080
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
      - keycloak
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
      NEXT_PUBLIC_KEYCLOAK_URL: http://localhost:8180
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### K.2 Autenticação — Keycloak vs Cognito vs Auth0

```
COMPARATIVO:

┌──────────────────┬───────────────────┬──────────────────┬──────────────────┐
│                  │ KEYCLOAK          │ AWS COGNITO      │ AUTH0            │
├──────────────────┼───────────────────┼──────────────────┼──────────────────┤
│ Custo            │ Free (self-hosted) │ Free até 50k MAU │ Pago após 7k MAU │
│ RBAC             │ ✅ Nativo e rico   │ 🟡 Básico        │ ✅ Rico           │
│ Lock-in          │ ❌ Sem lock-in     │ ⚠️ AWS lock-in   │ ⚠️ Auth0 lock-in  │
│ LGPD             │ ✅ On-premise      │ 🟡 Dados na AWS  │ ⚠️ Dados no EUA   │
│ Customização     │ ✅ Total           │ 🟡 Limitada      │ ✅ Rica           │
│ Complexidade ops │ ⚠️ Alta            │ ✅ Gerenciada    │ ✅ Gerenciada    │
│ Social login     │ ✅ OIDC/SAML      │ ✅               │ ✅               │
│ MFA              │ ✅                 │ ✅               │ ✅               │
│ Documentação     │ ✅ Boa            │ ✅ Boa           │ ✅ Excelente     │
└──────────────────┴───────────────────┴──────────────────┴──────────────────┘

RECOMENDAÇÃO MVP: Keycloak (self-hosted, containerizado)
  → Zero custo por usuário
  → LGPD: dados ficam no seu infrastructure
  → RBAC nativo e poderoso
  → Custodiar: adicionar na responsabilidade de ops (backup, updates)
  
  Configurar em container dedicado (não no mesmo pod do backend)
  Usar realm separado para alunos vs. admins
  Backup diário do banco H2/PostgreSQL do Keycloak

MIGRAÇÃO FUTURA:
  Se ops virar problema: migrar para Cognito (AWS) ou Auth0
  Keycloak usa OIDC padrão — migração possível sem mudar o frontend

CONFIGURAÇÃO SPRING BOOT:
  spring:
    security:
      oauth2:
        resourceserver:
          jwt:
            issuer-uri: ${KEYCLOAK_URL}/realms/bizu
```

### K.3 CI/CD Pipeline

```yaml
# .github/workflows/main.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: bizu_test
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: temurin
          cache: maven
      - run: ./mvnw test -Dspring.profiles.active=test
      - run: ./mvnw verify (integration tests)
      - uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: target/surefire-reports

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - run: npm run build  # verifica se compila

  e2e:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npx playwright test
      - run: docker compose -f docker-compose.test.yml down

  deploy-staging:
    needs: [e2e]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Build and push Docker image
        run: |
          docker build -t registry/bizu-backend:${{ github.sha }} ./backend
          docker push registry/bizu-backend:${{ github.sha }}
      - name: Deploy to staging
        run: |
          # kubectl set image ou docker pull no VPS de staging
          
  deploy-production:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    environment: production  # requer aprovação manual
    runs-on: ubuntu-latest
    steps:
      - name: Deploy with zero downtime (rolling)
        run: |
          # Estratégia: scale up nova versão, aguardar health, scale down antiga
```

### K.4 Hosting — Opções para MVP

```
OPÇÃO A: VPS simples (recomendado para MVP)
  → Railway, Render, ou Fly.io para backend + banco
  → Vercel para frontend Next.js (otimizado, CDN global)
  → Cloudflare para CDN e DNS
  → Estimativa: ~R$ 400-800/mês para 1.000 usuários
  → Prós: simples, automático, sem DevOps
  → Contras: menos controle, possível vendor lock-in
  
OPÇÃO B: Cloud gerenciada (AWS / GCP)
  → ECS Fargate ou Cloud Run para containers
  → RDS para PostgreSQL
  → ElastiCache para Redis
  → S3 para storage
  → Vercel ou CloudFront para frontend
  → Estimativa: ~R$ 800-2.000/mês para 1.000 usuários
  → Prós: escalável, serviços gerenciados, SLA
  → Contras: custo maior, mais complexo

RECOMENDAÇÃO MVP: Railway (backend) + Vercel (frontend) + Cloudflare R2 (storage)
  → Deploy em 1 click, PostgreSQL e Redis incluídos
  → Migrar para AWS quando atingir R$ 2.000+/mês em infra ou 10.000+ usuários

BANCO DE DADOS — ESTRATÉGIA DE MIGRAÇÃO:
  Usar Flyway (integrado ao Spring Boot):
  
  resources/db/migration/
    V1__create_identity_schema.sql
    V2__create_content_schema.sql
    V3__create_student_schema.sql
    V4__create_commerce_schema.sql
    V5__create_admin_schema.sql
    V6__add_indexes.sql
    ...

  Configuração:
  spring:
    flyway:
      enabled: true
      locations: classpath:db/migration
      baseline-on-migrate: false
      validate-on-migrate: true
```

### K.5 Gerenciamento de Secrets

```
NÃO fazer:
  ❌ Secrets em código ou repositório
  ❌ Secrets em variáveis de ambiente hardcoded no Dockerfile
  ❌ .env commitado no git

FAZER:
  ✅ .env.example no repositório (sem valores reais)
  ✅ Variáveis de ambiente injetadas em runtime (CI/CD secrets)
  ✅ Para produção: AWS Secrets Manager ou Vault (HashiCorp)
  ✅ Para Railway/Render: usar painel de environment variables

Segredos necessários:
  DB_URL, DB_USERNAME, DB_PASSWORD
  REDIS_URL, REDIS_PASSWORD
  JWT_SECRET (para tokens)
  KEYCLOAK_CLIENT_SECRET
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  STRIPE_PUBLISHABLE_KEY (pode ser público)
  PAGARME_API_KEY
  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET
  SENDGRID_API_KEY (ou outro provider de e-mail)
  RABBITMQ_URL
  SENTRY_DSN (error tracking)
```

---

## L. Migração Flutter → Portal

### L.1 Estratégia por Fases (Coexistência)

```
FASE 0 — Preparação (1-2 meses):
  ✅ Construir backend API (Spring Boot) — fonte de verdade
  ✅ App Flutter apontando para a nova API (se ainda usa backend próprio)
  ✅ Definir design system do portal
  ✅ Implementar autenticação (Keycloak) com suporte a OAuth2/PKCE para o Flutter

FASE 1 — Portal MVP (2-3 meses):
  ✅ Portal web com área do aluno básica (dashboard, banco de questões, simulados)
  ✅ App Flutter CONTINUA funcionando (mesma API)
  ✅ Novos usuários: incentivados a usar o portal
  ✅ Usuários existentes: podem usar ambos
  → Comunicar: "Nosso novo portal web chegou!"

FASE 2 — Paridade de features (2-3 meses):
  ✅ Flashcards, apostilas, ranking, gamificação no portal
  ✅ Portal supera o app em features
  ✅ Comunicação: "Portal tem mais recursos que o app"
  ✅ App ainda mantido mas sem novas features

FASE 3 — Descontinuação do app (1-2 meses):
  ✅ Aviso com 60 dias de antecedência
  ✅ E-mail para todos os usuários com link para o portal
  ✅ Dentro do app: banner permanente pedindo migração
  ✅ App leave as public na store mas sem atualizações
  ✅ Final: app fora das stores (ou mantido como client-only)
```

### L.2 Compatibilidade de Auth

```
SITUAÇÃO ATUAL:
  - App Flutter provavelmente usa autenticação própria (email/senha no backend)
  
ESTRATÉGIA:
  1. Ao criar o novo backend, importar todos os usuários para o Keycloak
     - Migrar hashes de senha (se bcrypt: importar e Keycloak verifica na primeira entrada)
     - Ou: enviar e-mail de "primeiro acesso" pedindo para criar nova senha no portal
  
  2. Flutter app:
     - Implementar OAuth2/PKCE com Keycloak (flutter_appauth package)
     - Usuários fazem login único e funciona em ambos
  
  3. SSO:
     - Mesmo Keycloak realm serve Flutter (OAuth2 + PKCE) e portal (Next.js com NextAuth/Keycloak)
```

### L.3 Migração de Dados

```
INVENTÁRIO DE DADOS DO APP ATUAL:
  ✓ Usuários (email, nome, senha hash)
  ✓ Histórico de respostas (attempts)
  ✓ Progresso por módulo
  ✓ Flashcards criados pelo aluno
  ✓ Favoritos
  ✓ Pontuação/ranking

SCRIPT DE MIGRAÇÃO (execução única + validação):

1. Exportar dados do banco do app atual (dump ou scripts)
2. Transformar para o novo schema (ETL script)
3. Importar em ambiente staging → validar
4. Migrar em produção (janela de manutenção de 30min)
5. Validar: contar registros antes e depois

Dados de questões/conteúdo:
  → Migrar para o novo schema de content
  → Revisar e republicar (workflow editorial)
  → Não apressar — melhor qualidade do que velocidade
```

### L.4 Riscos e Mitigação

| Risco | Mitigação |
|---|---|
| Alunos resistem a migrar para web | Manter app por 6 meses mínimo, mostrar vantagens do portal |
| UX mobile inferior ao app nativo | Design system rigoroso, testes em dispositivos reais, feedback dos usuários |
| Perda de dados na migração | ETL testado em staging, backup pré-migração, rollback planejado |
| Performance inferior | Core Web Vitals como critério de aceite, monitorar RUM |
| Funcionalidades faltando no MVP | Roadmap claro, comunicar o que vem |

---

## M. Roadmap

### M.1 MVP — "Versão para vender e entregar valor"

**Critério de sucesso:** Aluno consegue comprar um plano, acessar questões, fazer simulado e ver seu desempenho. Admin consegue gerenciar questões e ver receita.

**Duração estimada:** 3-4 meses

```
Backend (Spring Boot):
  ✅ Identity module: auth via Keycloak, sessões, dispositivos básico
  ✅ Content module: CRUD de cursos, questões, publicação básica
  ✅ Student module: attempts, progresso básico, simulado simples
  ✅ Commerce module: planos, assinatura Stripe (mensal/anual), webhook básico
  ✅ Admin module: logs básicos de auditoria

Frontend — Área do Aluno (Next.js):
  ✅ Login/registro
  ✅ Catálogo de cursos
  ✅ Banco de questões (filtros básicos)
  ✅ Modo treino de questões
  ✅ Simulado semanal
  ✅ Desempenho básico (gráfico de acerto)
  ✅ Checkout Stripe (subscription)
  ✅ Área de conta (dados + assinatura)

Frontend — Admin:
  ✅ Dashboard com KPIs básicos (MRR, assinantes)
  ✅ CRUD de questões (sem workflow editorial)
  ✅ Lista de usuários
  ✅ Lista de transações
  ✅ Reembolso simples

Infra:
  ✅ Deploy em Railway + Vercel
  ✅ CI básico (testes + build)
  ✅ Backup diário do banco
```

**O que NÃO está no MVP:**
- Flashcards
- Apostilas
- Ranking / gamificação
- Anti-compartilhamento avançado (apenas limite de sessões básico)
- Importação em massa
- Workflow editorial
- Add-ons Premium+
- PWA / offline

---

### M.2 V1 — "Estabilidade e completude"

**Critério de sucesso:** Todos os recursos do app Flutter funcionando no portal. NPS > 40.

**Duração estimada:** 3-4 meses após MVP

```
  ✅ Flashcards (modo básico, sem SM-2)
  ✅ Apostilas (leitor in-browser, sem download)
  ✅ Ranking e gamificação (XP, badges, streaks)
  ✅ Anti-compartilhamento completo
  ✅ Workflow editorial (rascunho → revisão → publicado)
  ✅ Importação em massa de questões (CSV/Excel)
  ✅ CMS completo (editor rico, LaTeX)
  ✅ Cupons e campanhas
  ✅ Painel financeiro completo (MRR, churn, conversão)
  ✅ PWA básico (manifest, offline page)
  ✅ Push notifications básicas
  ✅ Simulados personalizados
  ✅ RBAC completo no admin
  ✅ Logs de auditoria completos
  ✅ LGPD: consentimento, direito ao esquecimento
```

---

### M.3 V2 — "Escala e premium"

**Critério de sucesso:** 5.000+ alunos pagantes. LTV crescendo. Operação sem dev na maioria das situações.

**Duração estimada:** 4-6 meses após V1

```
  ✅ Add-on Premium+ (trilha adaptativa, estatísticas avançadas, SM-2)
  ✅ Multi-idioma (português inicial, inglês futuro)
  ✅ API pública para parceiros
  ✅ Integração com LMS externos (Moodle, etc.)
  ✅ App nativo (React Native reaproveitando lógica) — opcional
  ✅ Automações de marketing (sequências de e-mail, Drip campaigns)
  ✅ A/B testing de preços e landing pages
  ✅ Extração de microserviços de alta carga (se necessário)
  ✅ Relatórios avançados com drill-down
  ✅ Simulados com inteligência (identifica fraquezas e gera simulado adaptativo)
  ✅ Certificado de conclusão de curso
  ✅ Fórum ou comunidade básica
```

---

## N. Recursos Premium (Add-on)

### N.1 Premium+ — Módulo de Upsell

```
POSICIONAMENTO:
  Plano base: acesso ao banco de questões, simulados, apostilas
  Premium+: camada inteligente por cima do plano base
  
FEATURES PREMIUM+:

1. TRILHA ADAPTATIVA POR FRAQUEZAS
   → Algoritmo analisa histórico de erros do aluno
   → Gera trilha de estudo priorizada pelos tópicos mais fracos
   → "Você erra muito Direito Constitucional — comece por aqui"
   → Atualizada semanalmente

2. ESTATÍSTICAS AVANÇADAS
   → Comparativo detalhado com a média da turma por tópico
   → Projeção de desempenho (se manter ritmo, atinge X% em Y semanas)
   → Análise de evolução por banca, disciplina, dificuldade
   → Export em PDF

3. SIMULADOS PERSONALIZADOS ILIMITADOS
   → Plano base: 3 simulados personalizados/mês
   → Premium+: ilimitados + configurações avançadas
   → Gerar simulado clonado de prova real (por banca + ano)

4. FLASHCARDS COM REPETIÇÃO ESPAÇADA (SM-2)
   → Algoritmo SM-2 para agendamento de revisão
   → Plano base: flashcards sem agendamento inteligente
   → Premium+: "Revisar hoje" com fila inteligente

5. FILTROS AVANÇADOS DO BANCO DE QUESTÕES
   → Filtros combinados: banca + ano + tópico + dificuldade + apenas erradas
   → Excluir questões já respondidas X vezes
   → Questões similares à que errei
```

### N.2 Feature Flags e Entitlements

```java
// Enum de entitlements
public enum Entitlement {
  // Base
  ACCESS_COURSES,
  QUESTION_BANK_BASIC,
  SIMULATIONS_WEEKLY,
  APOSTILAS_READ,
  
  // Premium+
  ADAPTIVE_TRAIL,
  ADVANCED_STATISTICS,
  SIMULATIONS_UNLIMITED,
  FLASHCARDS_SPACED_REPETITION,
  QUESTION_BANK_ADVANCED_FILTERS,
  APOSTILAS_DOWNLOAD,
}

// Verificação no backend
@Service
public class EntitlementService {
  
  public boolean hasEntitlement(UUID userId, Entitlement entitlement) {
    // 1. Verificar no cache Redis (TTL: 15 min)
    String cacheKey = "entitlements:" + userId;
    Set<String> cached = redisTemplate.opsForSet().members(cacheKey);
    
    if (cached != null) {
      return cached.contains(entitlement.name());
    }
    
    // 2. Buscar assinatura ativa + add-ons
    List<String> entitlements = subscriptionRepository.findActiveEntitlements(userId);
    
    // 3. Cachear
    redisTemplate.opsForSet().add(cacheKey, entitlements.toArray());
    redisTemplate.expire(cacheKey, Duration.ofMinutes(15));
    
    return entitlements.contains(entitlement.name());
  }
}

// Uso em controller:
@GetMapping("/flashcards/review-queue")
public ResponseEntity<List<FlashcardDTO>> getReviewQueue(@AuthenticationPrincipal JwtUser user) {
  if (!entitlementService.hasEntitlement(user.getId(), Entitlement.FLASHCARDS_SPACED_REPETITION)) {
    return ResponseEntity.status(403).body(null);
    // Frontend mostra: "Recurso exclusivo Premium+ — [Fazer upgrade]"
  }
  return ResponseEntity.ok(flashcardService.getReviewQueue(user.getId()));
}
```

### N.3 Precificação

```
MODELO RECOMENDADO:

Plano Base Mensal:     R$ 49,90/mês
Plano Base Anual:      R$ 39,90/mês (equivalente) = R$ 478,80/ano
                       Economia de 20% vs mensal

Premium+ (add-on):     R$ 19,90/mês (sobre qualquer plano base)
                       Ou R$ 14,90/mês se anual

Bundle (Base + Premium+ Mensal): R$ 64,90/mês  
Bundle (Base + Premium+ Anual):  R$ 499,90/ano (maior valor percebido)

Multi-curso (+50% questões, +premium content): R$ 79,90/mês

ESTRATÉGIA:
  → Trial de 7 dias do Premium+ após ativação do plano base
  → Após trial: banner persistente "Você usou X flashcards inteligentes nesta semana"
  → E-mail D+3 do trial: case de sucesso de aluno
  → E-mail D+6: "Último dia do seu Premium+ gratuito"
  → Upsell in-app: ao tentar usar feature Premium+, mostrar preview + CTA de upgrade
  
FEATURE GATES (no frontend):
  → Features bloqueadas mostram ícone de cadeado + tooltip
  → Clicar no cadeado: modal com benefícios + botão "Ver plano Premium+"
  → Não bloquear com popup intrusivo — deve ser informativo e convidativo
```

---

## APÊNDICE — Filas/Eventos: RabbitMQ vs Kafka

```
COMPARATIVO PARA O BIZU!:

RabbitMQ:
  ✅ Simples de operar
  ✅ Suficiente para volume inicial (< 1M mensagens/dia)
  ✅ Bom suporte Spring (spring-amqp)
  ✅ Retry e dead-letter queue nativos
  ❌ Não é adequado para event sourcing ou replay de eventos históricos

Kafka:
  ✅ Alta throughput (bilhões de mensagens/dia)
  ✅ Replay de eventos (consumer groups, offsets)
  ✅ Event sourcing
  ❌ Complexidade operacional muito maior
  ❌ Overkill para o MVP/V1 do Bizu!

RECOMENDAÇÃO: RabbitMQ no MVP/V1

Casos de uso no Bizu!:
  queue: bizu.payments.webhook        → processar webhooks do Stripe
  queue: bizu.import.questions        → processar importações em massa
  queue: bizu.notifications.email     → enviar e-mails de forma assíncrona
  queue: bizu.analytics.events        → fila de eventos para o analytics domain
  queue: bizu.gamification.events     → calcular XP, badges, streaks

Usar Kafka somente se atingir > 100k usuários ativos e precisar de 
replay de eventos para analytics histórico.
```

---

## APÊNDICE — Checklist de Segurança (OWASP)

```
□ A01 — Broken Access Control:
  RBAC em todos endpoints admin
  Verificar ownership em recursos do aluno (attempt pertence ao userId do token)
  
□ A02 — Cryptographic Failures:
  HTTPS obrigatório (redirect HTTP → HTTPS)
  Senhas: Keycloak usa bcrypt
  CPF: armazenar apenas SHA-256 (nunca plain text)
  Tokens: JWT com expiração curta (15min access, 7 dias refresh)
  
□ A03 — Injection:
  Spring Data JPA com queries parametrizadas (sem concatenação de SQL)
  Sanitizar HTML no CMS (DOMPurify no frontend, sanitização no backend)
  
□ A04 — Insecure Design:
  Rate limiting: /api/v1/auth/login max 10 req/min por IP
  Rate limiting: /api/v1/questions max 60 req/min por usuário
  
□ A05 — Security Misconfiguration:
  Headers HTTP: Strict-Transport-Security, X-Frame-Options, CSP, X-Content-Type-Options
  Swagger/actuator: desabilitados em produção ou protegidos por auth
  
□ A07 — Identification Failures:
  Anti-brute force: lockout após 10 tentativas de senha
  E-mail de alerta para tentativas suspeitas
  
□ A09 — Logging Failures:
  Não logar: senhas, tokens, CPF, número de cartão
  Logar: todas as tentativas de auth (sucesso e falha)
  
□ A10 — Server-Side Request Forgery:
  Validar URLs de webhook (apenas domínios Stripe/Pagar.me)
  Não aceitar URLs arbitrárias em inputs
```

---

*Documentação gerada para o projeto Bizu! Portal — Versão 1.0.0*  
*Para dúvidas de implementação, consultar o Claude Code com este documento como contexto.*
