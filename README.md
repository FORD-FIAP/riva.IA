<div align="center">

# RIVA.IA

![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/IA-Gemini%20Flash-4285F4?logo=googlegemini&logoColor=white)
![FIPE](https://img.shields.io/badge/Dados-Tabela%20FIPE-00A859)

</div>

---

RIVA é uma assistente de IA para exploração, comparação e descoberta de veículos.

 O app combina um chat conversacional (Gemini Flash, via backend próprio) com catálogo real da tabela FIPE, comparativo lado a lado e um feed de notícias automotivas — pensado tanto para um possível comprador quanto para um consultor explorando o mercado.

---
| Camada | Tecnologia |
|---|---|
| Framework | React Native 0.86 + Expo 57 |
| Linguagem | TypeScript 6.0 |
| Fontes | Sora (Google Fonts via Expo) |
| Ícones | Expo Vector Icons (Feather + MaterialCommunity) |
| Persistência | AsyncStorage |
| Estado Global | React Context API |
| Backend | Funções serverless (Vercel) em `/api`, proxy pro Gemini e pra API de notícias |
| Dados de veículo | Tabela FIPE real, via BrasilAPI (marca, modelo e preço oficial) |
| Notícias | APITube (filtro por tópico automotivo) |
| Web | React Native Web com frame de dispositivo |

---

## Como rodar

**Pré-requisitos:** Node.js 18+, npm, app **Expo Go** no celular (para testar sem instalar nada).

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npx expo start
```

Escaneie o QR Code com o **Expo Go** (Android) ou a câmera (iOS).

**Alternativa:** a extensão do VS Code `Mobile Preview: Show` também funciona para pré-visualizar sem celular.

### Backend (chat com IA)

| Variável | Onde | Descrição |
|---|---|---|
| `GEMINI_API_KEY` | Vercel (projeto do backend) | Chave gratuita gerada em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `APITUBE_API_KEY` | Vercel (projeto do backend) | Chave da [APITube](https://apitube.io) pra buscar notícias automotivas |
| `EXPO_PUBLIC_API_BASE_URL` | App (`.env` local ou EAS) | URL do backend deployado (ex: `https://riva-ia.vercel.app`) |

Sem `EXPO_PUBLIC_API_BASE_URL` configurada, o chat cai automaticamente numa mensagem de placeholder e as notícias caem no mock local — o app nunca quebra por falta de backend.

### Build final (APK)

```bash
eas login
eas init
eas build --platform android --profile production
```

Gera um `.apk` instalável direto em dispositivo físico ou emulador, sem depender do Expo Go.

---

## Arquitetura

```
src/
├── screens/          # Início, Veículos, Comparar, Notícias, Perfil, Login
├── components/
│   ├── home/          # Chat (ChatInput, ChatThread), Sidebar, Header
│   ├── veiculos/       # FilterFlow (filtro), VeiculoFicha, VeiculoResultCard
│   └── shared/         # FilterChips — peças de filtro reusadas por Veículos e Comparar
├── context/           # AuthContext, ChatContext, FavoritesContext, RecentlyViewedContext,
│                       # ConversasRecentesContext, NavigationContext
├── hooks/             # useFavorites, useFipePrice, useRecentlyViewed, useConversasRecentes
├── services/          # fipeApi (BrasilAPI), rivaChatApi (backend de chat), newsApi (backend de notícias)
├── mock/              # Fallback de notícias, usado só se a API estiver fora do ar
├── theme/             # Design tokens (cores, border-radius)
└── types/             # Interface Vehicle

api/
├── chat.ts            # Proxy serverless pro Gemini Flash
└── news.ts            # Proxy serverless pra APITube
```

---

## Integrações reais

- **[Tabela FIPE](https://brasilapi.com.br/docs#tag/FIPE)** (via BrasilAPI) — marca, modelo e preço oficial dos veículos, ao vivo.
- **[Gemini Flash](https://ai.google.dev/)** (Google) — respostas reais no chat, via backend próprio que protege a chave de API.

---

## Equipe

- Beatriz Vieira de Novais — RM554746
- Guilherme Abe — RM554743
- Gustavo Ruiz Vieira Paulino — RM554779
- Mariana Neugebauer Dourado — RM550494
- Victor Pacífico Dias — RM558017

Desenvolvido como desafio técnico para a **Riva**.
