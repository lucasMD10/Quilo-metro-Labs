// Conexão com o banco SQLite usando o módulo nativo do Node (node:sqlite).
// Vantagem: não precisa instalar nem compilar driver nenhum, funciona igual
// no Windows, Linux e Mac (exige Node 22.13 ou mais novo).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaAtual = dirname(fileURLToPath(import.meta.url));
const caminhoBanco = process.env.DB_PATH || join(pastaAtual, '..', 'data', 'km.db');
mkdirSync(dirname(caminhoBanco), { recursive: true });

export const db = new DatabaseSync(caminhoBanco);
db.exec('PRAGMA foreign_keys = ON;');

// Cria as tabelas na primeira execução.
db.exec(`
  CREATE TABLE IF NOT EXISTS perfil (
    id                    INTEGER PRIMARY KEY CHECK (id = 1), -- MVP: um motorista por instalação
    nome                  TEXT    NOT NULL,
    apps                  TEXT    NOT NULL DEFAULT 'uber,99',
    meta_diaria           REAL    NOT NULL DEFAULT 0,
    modelo_veiculo        TEXT,
    consumo_km_l          REAL    NOT NULL,  -- quantos km o carro faz com 1 litro
    preco_combustivel     REAL    NOT NULL,  -- R$ por litro
    custos_fixos_mensais  REAL    NOT NULL DEFAULT 0, -- seguro, IPVA, parcela/aluguel, manutenção...
    km_mensal_estimado    REAL    NOT NULL,  -- usado para diluir os custos fixos por km
    atualizado_em         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lancamentos (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    data               TEXT    NOT NULL UNIQUE, -- AAAA-MM-DD, um lançamento por dia
    ganho_uber         REAL    NOT NULL DEFAULT 0,
    ganho_99           REAL    NOT NULL DEFAULT 0,
    ganho_outros       REAL    NOT NULL DEFAULT 0,
    km_rodados         REAL    NOT NULL DEFAULT 0,
    horas_trabalhadas  REAL    NOT NULL DEFAULT 0,
    gastos_extras      REAL    NOT NULL DEFAULT 0, -- lavagem, alimentação, pedágio...
    custo_km_aplicado  REAL    NOT NULL,           -- foto do custo/km no momento do lançamento
    observacao         TEXT,
    criado_em          TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data);
`);
