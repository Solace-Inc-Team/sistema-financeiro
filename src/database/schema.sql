CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
  UNIQUE (nome, tipo)
);

-- Valores em centavos (inteiros) para evitar erros de arredondamento.
-- "data" é a data de competência/vencimento do lançamento.
CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL CHECK (valor_centavos > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
  categoria_id INTEGER NOT NULL REFERENCES categorias (id),
  data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria ON lancamentos (categoria_id);
