# ZeusAI — AI Chat

Interface web de chat com IA feita em **Angular 21**. O front-end conversa com uma API REST (backend separado, rodando em `http://localhost:8080`) e oferece dois modos de uso: perguntas rápidas e conversas com memória.

## Funcionalidades

### Pergunta rápida (`/simple-chat`)

- Cada pergunta é independente, sem histórico: enviar uma nova pergunta substitui a anterior e sua resposta.
- Tela de boas-vindas com 4 sugestões de perguntas sorteadas a partir de uma lista de 40.

### Conversas (`/chat-memory`)

- As conversas ficam salvas e a IA lembra o contexto das mensagens anteriores.
- Barra lateral com a lista de conversas, que vira um menu gaveta (drawer) no celular.
- Criar, continuar, **renomear** e **excluir** conversas.
- Cada conversa tem sua própria URL (`/chat-memory/:chatId`).

### Na janela de chat

- Respostas da IA renderizadas em **Markdown**, com estilo para blocos de código (com rótulo da linguagem).
- Ações nas respostas: **copiar** o texto e **tentar novamente** (gera de novo a última resposta).
- Indicador de "digitando" enquanto a resposta é gerada.

### Interface

- **Tema claro e escuro**: segue a preferência do sistema, com botão para alternar (a escolha fica salva).
- **Três idiomas**: português, inglês e espanhol, via [Transloco](https://jsverse.gitbook.io/transloco). O idioma inicial vem do navegador e a escolha fica salva.
- Layout responsivo e foco em acessibilidade (WCAG AA, atributos ARIA, gerenciamento de foco).

## Tecnologias

- [Angular 21](https://angular.dev) com componentes standalone, signals, detecção de mudanças `OnPush` e rotas com lazy loading
- [Angular Material](https://material.angular.dev) e CDK
- [Transloco](https://jsverse.gitbook.io/transloco) para internacionalização
- [marked](https://marked.js.org) para renderizar Markdown
- [Vitest](https://vitest.dev) para testes unitários

## Estrutura do projeto

```
src/app/
├── chat/
│   ├── chat-service.ts        # chamadas à API REST
│   ├── chat-models.ts         # tipos das requisições e respostas
│   ├── chat-window/           # janela de chat reutilizada pelos dois modos
│   ├── simple-chat/           # modo "Pergunta rápida" e sugestões
│   ├── chat-memory/           # modo "Conversas", com diálogos de renomear e excluir
│   └── markdown/              # pipe e estilos de Markdown
├── i18n/                      # serviço de idioma, loader e seletor de idioma
├── theme/                     # serviço de tema claro/escuro
└── shared/                    # componentes compartilhados (ícone da marca)
public/i18n/                   # traduções: pt.json, en.json, es.json
```

## API esperada

As chamadas para `/api` são redirecionadas pelo proxy de desenvolvimento (`proxy.config.js`) para `http://localhost:8080`.

| Método   | Endpoint                        | Descrição                              |
| -------- | ------------------------------- | -------------------------------------- |
| `POST`   | `/api/v1/chat/simple`           | Envia uma pergunta avulsa              |
| `GET`    | `/api/v1/chat/memory`           | Lista as conversas salvas              |
| `POST`   | `/api/v1/chat/memory/new`       | Inicia uma nova conversa               |
| `GET`    | `/api/v1/chat/memory/:chatId`   | Busca o histórico de uma conversa      |
| `POST`   | `/api/v1/chat/memory/:chatId`   | Envia uma mensagem em uma conversa     |
| `PATCH`  | `/api/v1/chat/memory/:chatId`   | Renomeia uma conversa                  |
| `DELETE` | `/api/v1/chat/memory/:chatId`   | Exclui uma conversa                    |

Todas as requisições de mensagem enviam um corpo `{ "message": "..." }`; a renomeação envia `{ "description": "..." }`.

## Como rodar

Pré-requisitos: Node.js e npm, e o backend da API rodando em `http://localhost:8080`.

```bash
npm install
npm start
```

`npm start` roda `ng serve` com o proxy configurado. Depois, abra `http://localhost:4200/`. A aplicação recarrega automaticamente quando os arquivos são alterados.

> Rodar `ng serve` direto não usa o proxy, e as chamadas à API vão falhar. Use `npm start`.

## Outros comandos

```bash
npm run build   # build de produção em dist/
npm run watch   # build de desenvolvimento em modo watch
npm test        # testes unitários com Vitest
```
