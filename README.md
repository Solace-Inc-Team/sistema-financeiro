# Caixa Simples — Sistema financeiro simples

Controle financeiro com **receitas**, **despesas** e **relatórios**. Por escolha de escopo, **não faz contabilidade nem controle fiscal** (sem plano de contas, impostos ou notas).

## Funcionalidades

- **Lançamentos** de receitas e despesas com categoria, data e situação (pendente ou pago/recebido); filtros por mês, tipo, situação e texto; exportação em CSV.
- **Categorias** separadas por tipo; não é possível excluir categoria em uso nem duplicar nomes.
- **Resumo do mês**: receitas recebidas e a receber, despesas pagas e a pagar, **saldo realizado** (só o que foi pago/recebido) e **saldo previsto** (incluindo pendentes).
- **Relatórios**: distribuição por categoria com percentual e fluxo dos últimos meses.

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) **22.9 ou superior**.

```bash
npm install
cp .env.example .env     # opcional: ajuste a porta e o caminho do banco
npm run seed             # opcional: popula o banco com dados de exemplo
npm run dev              # servidor com recarga automática
```

Abra **http://localhost:3003**. Para rodar sem recarga automática, use `npm start`.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os testes de integração da API (`node:test`, banco em memória) |
| `npm run seed` | Cria dados de exemplo (só se o banco estiver vazio) |

No VS Code, a configuração em `.vscode/launch.json` permite iniciar e depurar o servidor com **F5**.

## Estrutura de pastas

```
sistema-financeiro/
├── data/                       # banco SQLite (criado ao rodar; fora do Git)
├── public/                     # frontend estático
│   ├── css/
│   ├── js/
│   │   └── views/              # resumo, lançamentos, categorias
│   └── index.html
├── src/
│   ├── config/
│   ├── database/               # conexão, schema.sql e seed
│   ├── middlewares/
│   ├── modules/
│   │   ├── categorias/         # routes, controller, service, repository, schemas
│   │   ├── lancamentos/
│   │   └── relatorios/
│   ├── utils/                  # AppError, meses, schemas comuns
│   ├── app.js
│   ├── routes.js               # composição das dependências
│   └── server.js
├── tests/
├── .env.example
└── package.json
```

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET · POST | `/api/categorias` | Lista / cria categoria |
| PATCH · DELETE | `/api/categorias/:id` | Renomeia / exclui (se não houver lançamentos) |
| GET | `/api/lancamentos?mes=AAAA-MM&tipo=&status=&categoria_id=&q=` | Lista lançamentos |
| POST | `/api/lancamentos` | Cria lançamento (o tipo vem da categoria) |
| GET · PATCH · DELETE | `/api/lancamentos/:id` | Consulta / atualiza / exclui |
| PATCH | `/api/lancamentos/:id/status` | Marca como `PAGO` ou `PENDENTE` |
| GET | `/api/relatorios/resumo?mes=AAAA-MM` | Resumo do mês (realizado e previsto) |
| GET | `/api/relatorios/por-categoria?mes=&tipo=` | Total por categoria com percentual |
| GET | `/api/relatorios/fluxo?mes=&meses=6` | Receitas, despesas e saldo por mês |

Exemplo:

```bash
curl -X POST http://localhost:3003/api/lancamentos \
  -H "Content-Type: application/json" \
  -d '{"descricao":"Conta de energia","categoria_id":5,"valor_centavos":78000,"data":"2026-11-22"}'
```

## Arquitetura

- **API REST** em Node.js + Express 5, com o banco **SQLite** (`better-sqlite3`) em arquivo local — nenhum serviço externo para instalar.
- **Camadas por módulo**: `routes` (rotas e validação) → `controller` (HTTP) → `service` (regras de negócio) → `repository` (SQL). Cada camada só conhece a de baixo.
- **Injeção de dependências simples**: `src/routes.js` monta repositórios e serviços; o banco e o relógio são passados por parâmetro, o que permite testar com banco em memória.
- **Validação de entrada** com [Zod](https://zod.dev) (mensagens em português) e **tratamento centralizado de erros** (`AppError` + `errorHandler`), sempre no formato `{ "error": { "code", "message", "details" } }`.
- **Frontend** em HTML/CSS/JavaScript puro (ES Modules), servido pelo próprio Express. Os elementos são criados via DOM (sem `innerHTML`), evitando XSS.
- **SQL parametrizado** em todas as consultas (sem concatenação de valores).

## Decisões e limites

- Valores em **centavos (inteiros)**; o frontend converte de/para reais.
- O tipo do lançamento (receita/despesa) deriva sempre da categoria, o que impede inconsistências.
- A data do lançamento é a de competência/vencimento; o relatório mensal agrupa por ela.
- Uma única conta e moeda (BRL), sem autenticação.

## Próximos passos possíveis

Várias contas e transferências, lançamentos recorrentes e parcelados, metas por categoria, importação de extrato e autenticação.
