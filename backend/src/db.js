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
    -- consumo_km_l e preco_combustivel são sempre os do combustível padrão (cópia das colunas abaixo)
    combustiveis          TEXT    NOT NULL DEFAULT 'gasolina', -- 'gasolina', 'etanol' ou 'gasolina,etanol'
    combustivel_padrao    TEXT    NOT NULL DEFAULT 'gasolina', -- com qual está abastecendo agora
    preco_gasolina        REAL,
    consumo_gasolina      REAL,
    preco_etanol          REAL,
    consumo_etanol        REAL,
    custos_fixos_mensais  REAL    NOT NULL DEFAULT 0, -- seguro, IPVA, parcela/aluguel, manutenção...
    km_mensal_estimado    REAL    NOT NULL,  -- usado para diluir os custos fixos por km
    km_por_dia            REAL,              -- km num dia normal de trabalho
    dias_por_semana       REAL,              -- dias trabalhados por semana
    custo_parcela         REAL,              -- detalhamento dos custos fixos (R$ por mês)
    custo_seguro          REAL,              -- valor como o motorista informou (ver custo_seguro_periodo)
    custo_seguro_periodo  TEXT    NOT NULL DEFAULT 'mes', -- 'mes' ou 'ano'
    custo_ipva            REAL,              -- R$ por ano (IPVA + licenciamento)
    custo_manutencao      REAL,
    custo_manutencao_periodo TEXT NOT NULL DEFAULT 'mes', -- 'mes' ou 'ano'
    custo_depreciacao     REAL,
    custo_outros          REAL,
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
    combustivel_km_aplicado REAL,                  -- as duas partes dessa foto (nulas em dias antigos)
    fixo_km_aplicado        REAL,
    combustivel_tipo        TEXT,                  -- combustível usado no dia (gasolina ou etanol)
    preco_litro_aplicado    REAL,                  -- preço do litro usado no dia
    consumo_aplicado        REAL,                  -- km por litro usado no dia
    observacao         TEXT,
    criado_em          TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data);
`);

// Bancos criados antes do detalhamento dos custos ganham as colunas novas.
const colunasNovas = ['km_por_dia', 'dias_por_semana', 'custo_parcela', 'custo_seguro', 'custo_ipva', 'custo_manutencao', 'custo_depreciacao', 'custo_outros'];
const colunasPerfil = db.prepare('PRAGMA table_info(perfil)').all().map((c) => c.name);
for (const coluna of colunasNovas) {
  if (!colunasPerfil.includes(coluna)) db.exec(`ALTER TABLE perfil ADD COLUMN ${coluna} REAL`);
}
// Gasolina e etanol: cada um com preço e consumo. Perfis antigos viram "só gasolina" com os valores que já tinham.
for (const [coluna, tipo] of [['combustiveis', "TEXT NOT NULL DEFAULT 'gasolina'"], ['combustivel_padrao', "TEXT NOT NULL DEFAULT 'gasolina'"],
  ['preco_gasolina', 'REAL'], ['consumo_gasolina', 'REAL'], ['preco_etanol', 'REAL'], ['consumo_etanol', 'REAL']]) {
  if (!colunasPerfil.includes(coluna)) db.exec(`ALTER TABLE perfil ADD COLUMN ${coluna} ${tipo}`);
}
db.exec(`UPDATE perfil SET preco_gasolina = preco_combustivel, consumo_gasolina = consumo_km_l
         WHERE preco_gasolina IS NULL AND preco_etanol IS NULL`);

// Seguro e manutenção podem ser informados por mês ou por ano.
for (const coluna of ['custo_seguro_periodo', 'custo_manutencao_periodo']) {
  if (!colunasPerfil.includes(coluna)) db.exec(`ALTER TABLE perfil ADD COLUMN ${coluna} TEXT NOT NULL DEFAULT 'mes'`);
}

const colunasLancamentos = db.prepare('PRAGMA table_info(lancamentos)').all().map((c) => c.name);
for (const coluna of ['combustivel_km_aplicado', 'fixo_km_aplicado', 'preco_litro_aplicado', 'consumo_aplicado']) {
  if (!colunasLancamentos.includes(coluna)) db.exec(`ALTER TABLE lancamentos ADD COLUMN ${coluna} REAL`);
}
// Dias lançados antes disso ficam sem tipo/preço/consumo: só o custo por km congelado vale para eles.
if (!colunasLancamentos.includes('combustivel_tipo')) db.exec('ALTER TABLE lancamentos ADD COLUMN combustivel_tipo TEXT');
