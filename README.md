# KM Real

**Quanto sobra de verdade a cada quilômetro que você roda.**

Aplicativo de gestão financeira para motoristas de aplicativo (Uber e 99), desenvolvido pela **Quilômetro Labs** como Projeto Integrador da disciplina de Design Profissional (Universidade Positivo).

---

## O problema

O motorista vê o valor bruto de cada corrida no app, mas esse número não desconta combustível, seguro, IPVA, parcela ou aluguel do carro, manutenção e gastos do dia. Muitos acham que estão lucrando bem e, na prática, rodam perto do prejuízo.

O segmento "Gestão Financeira para Uber/99" apareceu com **92% de necessidade** na pesquisa de mercado do Prof. Sedenilso Machado (mais de 40 mil entrevistados), o maior índice entre os 15 segmentos estudados.

## A solução

O KM Real calcula o **custo real por quilômetro** do carro do motorista e, a cada dia lançado, mostra o **lucro líquido**, o progresso da **meta diária** e a evolução da semana.

## Funcionalidades do MVP

- **Cadastro inicial** em duas etapas: dados do motorista (nome, apps, meta diária) e do veículo (combustível, km por dia e dias por semana, custos fixos separados).
- **Custo real por km**, separado entre combustível e custos fixos.
- **Lançamento do dia** com ganhos por app, km rodados, horas online e gastos extras, com prévia do lucro enquanto digita.
- **Dashboard** com o lucro de hoje, o progresso da meta diária, indicadores rápidos (com "Entender o cálculo" do custo por km) e gráfico dos últimos 7 dias.
- **Layout para celular e computador**: barra de navegação inferior no celular, menu lateral e telas em duas colunas no computador.
- **Histórico** com edição e exclusão de dias lançados, e o registro de **abastecimentos** (só controle do que foi pago no posto).
- **Perfil e veículo** editáveis, com recálculo automático do custo por km para os próximos lançamentos.

## Design

| Wireframe | Protótipo e app |
|---|---|
| ![Wireframe do início](docs/wireframes/03-inicio.png) | ![Início no app](docs/telas/cel-03-inicio.png) |

- **[Protótipo navegável no Figma](https://www.figma.com/design/WvEst2KBErrDpuNFzeXu67)**: componentes, 6 telas do celular e fluxos "Primeiro acesso" e "Uso diário".
- [Pesquisa com motoristas](docs/pesquisa.md): relatos, matriz de dores, persona e jornada.
- [Wireframes de baixa fidelidade](docs/wireframes/): estrutura das 6 telas.
- [Guia de estilo](docs/guia-de-estilo/): marca, cores, tipografia, ícones e componentes.
- [Telas em alta fidelidade](docs/telas/): prints do app no celular e no computador.
- [Requisitos](docs/requisitos.md): funcionais, não funcionais e regras de negócio.
- [Relatório final em PDF](docs/relatorio/KM-Real-Relatorio-Final.pdf): as 6 seções pedidas no enunciado.
- [Pitch](docs/pitch/): slides em PDF e roteiro de fala da apresentação final.
- [Teste de usabilidade](docs/teste-de-usabilidade.md): roteiro curto com 1 ou 2 motoristas.

## Equipe

| Integrante | Função | Responsabilidades |
|---|---|---|
| Rafael e Vinicius | Product Owner | Visão do produto, prioridades, pesquisa com motoristas e pitch |
| Lucas | Desenvolvedor full-stack | Arquitetura, back-end, front-end, banco de dados e repositório |
| Lucas e Rafael | UI/UX Designer | Wireframes, identidade visual, guia de estilo e protótipo no Figma |
| Vinicius | Testador | Teste de usabilidade com motoristas e testes do app antes da entrega |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + Vite 6 (JavaScript), CSS puro |
| Back-end | Node.js 22+ com Express 4 (API REST) |
| Banco de dados | SQLite, via módulo nativo `node:sqlite` |
| Orquestração | npm workspaces + concurrently |

O banco usa o SQLite embutido no próprio Node, então **não é preciso instalar nem compilar nenhum driver**. Isso evita os erros de build comuns no Windows.

## Arquitetura

```mermaid
flowchart LR
  U[Motorista<br/>navegador] -->|HTTP| F[Front-end<br/>React + Vite<br/>porta 5173]
  F -->|/api via proxy| B[Back-end<br/>Node + Express<br/>porta 3001]
  B --> C[calculos.js<br/>regras de negócio]
  B -->|SQL| D[(SQLite<br/>backend/data/km.db)]
```

O front-end nunca acessa o banco diretamente. Ele chama a API REST, que valida os dados, aplica as regras de cálculo e grava no SQLite. As regras ficam isoladas em `backend/src/calculos.js`, como funções puras.

### Estrutura de pastas

```
.
├── backend/
│   ├── data/               # arquivo km.db (criado automaticamente)
│   └── src/
│       ├── server.js       # inicializa o Express e as rotas
│       ├── db.js           # conexão e criação das tabelas
│       ├── calculos.js     # custo por km, lucro do dia, totais
│       ├── validacao.js    # validação dos dados recebidos
│       ├── seed.js         # dados de exemplo para demonstração
│       └── routes/         # perfil, lancamentos, resumo
├── frontend/
│   ├── index.html
│   ├── vite.config.js      # proxy /api -> backend
│   └── src/
│       ├── App.jsx         # navegação entre as telas
│       ├── api.js          # chamadas à API
│       ├── util.js         # formatação e prévias de cálculo
│       ├── styles.css      # identidade visual (cores, layout celular e computador)
│       ├── assets/         # logo em SVG
│       ├── components/     # KmIcon, ValorAnimado, FaixaMeta, GraficoSemana, Campo, CamposVeiculo, NavInferior
│       └── pages/          # BoasVindas, Inicio, LancarDia, Historico, Veiculo
├── docs/                   # materiais de apoio e pendências do projeto
└── package.json            # scripts da raiz (workspaces)
```

---

## Testar sem instalar nada

**https://lucasmd10.github.io/Quil-metro-Labs/**

Versão do app que roda inteira no navegador, publicada no GitHub Pages a cada push na `main` (`.github/workflows/pages.yml`). Abre no celular ou no computador, sem Node e sem servidor. As regras de cálculo são as mesmas do backend; a diferença é que os dados ficam salvos no próprio aparelho (localStorage), então cada pessoa vê só os dela. Na primeira tela, **Ver com dados de exemplo** abre direto com o motorista de demonstração.

Para gerar essa versão localmente: `npm run build:pages -w frontend` (sai em `frontend/dist-pages`).

## Como rodar localmente

### Pré-requisitos

- **Node.js 22.13 ou mais novo** (recomendado: a versão LTS mais recente em [nodejs.org](https://nodejs.org)). Confira com `node -v`.
- Git

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/lucasMD10/Quil-metro-Labs.git
cd Quil-metro-Labs

# 2. Instalar as dependências (front e back de uma vez)
npm install

# 3. (Opcional) Popular o banco com um motorista e 2 semanas de exemplo
npm run seed

# 4. Subir front-end e back-end juntos
npm run dev
```

Depois, abra **http://localhost:5173** no navegador. A API fica em http://localhost:3001.

Sem o passo 3, o app abre na tela de cadastro inicial. Para recomeçar do zero, apague o arquivo `backend/data/km.db`.

### Abrir no celular

Por segurança, `npm start` e `npm run dev` só atendem o próprio computador. Para abrir no celular, a rede local precisa ser liberada de propósito:

1. Ligue o computador e o celular **na mesma rede Wi-Fi** (ou no hotspot do celular).
2. Rode `npm run start:celular`. O terminal mostra uma linha como `No celular (mesmo Wi-Fi): http://192.168.0.10:3001`. Em desenvolvimento, use `npm run dev:celular` e o endereço "Network" que o Vite mostra (porta 5173).
3. Digite esse endereço no navegador do celular.
4. Na primeira vez, o Windows pode perguntar se o Node.js pode usar a rede: escolha **Permitir** em redes privadas.

Com a rede liberada, qualquer pessoa conectada ao mesmo Wi-Fi consegue abrir o app e ver ou alterar os dados, porque não há login. Use só em rede de confiança.

Dica: no Chrome do celular, menu ⋮ → **Adicionar à tela inicial** cria um atalho com cara de app.

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe API (3001) e front (5173) juntos |
| `npm run dev:celular` | Igual ao `dev`, liberando o front na rede local para abrir no celular |
| `npm start` | Compila o front e sobe tudo numa porta só (http://localhost:3001), sem o Vite |
| `npm run start:celular` | Igual ao `start`, liberando a rede local para abrir no celular |
| `npm run seed` | Recria o banco com dados de exemplo |
| `npm run build` | Gera a versão de produção do front em `frontend/dist` |

---

## Regras de cálculo

**Lucro, no KM Real, é a sobra no bolso:** ganhos menos tudo o que sai do bolso por causa do carro (combustível, parcela ou aluguel, seguro, IPVA, manutenção, reserva para troca do carro e outros). É uma **estimativa**: os custos fixos do mês são divididos pelos km que o motorista prevê rodar. Num mês em que ele roda menos que o previsto, o custo real de cada km é maior que o estimado.

```
custos fixos do mês = parcela/aluguel + seguro + IPVA ÷ 12 + manutenção + reserva para troca + outros
                      (seguro e manutenção podem ser informados por ano: entram ÷ 12)
km rodados por mês  = km por dia × dias por semana × 4,33 (52 semanas ÷ 12 meses)

combustível por km = preço do litro ÷ consumo (km/l), do combustível que ele está usando agora
fixo por km        = custos fixos do mês ÷ km rodados por mês
custo real por km  = combustível por km + fixo por km

ganho bruto do dia = Uber + 99 + outros
custo do dia       = km rodados × custo real por km + gastos extras
lucro real do dia  = ganho bruto − custo do dia
```

O motorista informa cada custo fixo separado e quantos km roda num dia normal; o backend calcula o total do mês e os km do mês (`calculos.js`). O carro pode usar **gasolina, etanol ou os dois**, cada um com o próprio preço e consumo (o app não estima o consumo do etanol a partir da gasolina: o motorista informa). Com os dois, ele diz com qual está abastecendo agora; esse é o combustível da conta, e o backend avisa qual sai mais barato por km. Seguro e manutenção têm um seletor **Mês | Ano**: o motorista digita do jeito que paga e o backend divide por 12 quando é anual, guardando o valor e a escolha como foram informados. Bancos criados antes desse detalhamento ganham as colunas novas automaticamente ao iniciar.

**Fechamento do mês.** Como os custos fixos são rateados pelos km previstos, o fechamento compara o que os dias lançados já descontaram com o que os custos fixos custaram no período (proporcional aos dias, contando a partir do primeiro dia lançado no app):

```
custos fixos do período = custos fixos do mês × dias do período ÷ dias do mês
diferença               = fixos descontados nos dias − custos fixos do período
lucro do mês, ajustado  = lucro estimado dos dias + diferença
```

Diferença negativa: o motorista rodou menos que o previsto e parte dos custos fixos ainda sai do lucro. Positiva: rodou mais e os dias descontaram a mais.

Cada lançamento guarda o custo por km vigente no momento (`custo_km_aplicado`, mais as partes `combustivel_km_aplicado` e `fixo_km_aplicado`). Se o preço do combustível mudar, os dias antigos não são recalculados, nem quando editados. Para usar o custo atual num dia antigo, o motorista marca "Recalcular com o custo de hoje" (a API recebe `recalcular_custo: true`).

**Combustível do dia.** Na tela de lançar, logo abaixo dos km, aparece o combustível estimado com os valores usados (ex.: "Gasolina · R$ 6,29/l · 12 km/l"). Em **Ajustar**, o motorista troca o tipo, o preço do litro e o consumo só daquele dia; com **Usar nos próximos dias** (marcado por padrão no dia de hoje, desmarcado ao corrigir um dia antigo), o backend grava esses valores como o novo padrão do perfil junto com o dia, na mesma transação. Cada dia guarda `combustivel_tipo`, `preco_litro_aplicado` e `consumo_aplicado`; ajustar um dia antigo muda só a parte do combustível dele, e os custos fixos congelados continuam.

**Abastecimentos.** No Histórico, em **Dias | Abastecimentos**, o motorista registra o que pagou no posto: data, valor, combustível e, se quiser, os litros. É só controle: o abastecimento **não entra no lucro**, porque o combustível do trabalho já é descontado pelos km rodados (descontar os dois seria contar o mesmo combustível duas vezes), e um abastecimento pode ser usado em vários dias. Também não calcula consumo: litros colocados não são litros gastos desde o último abastecimento.

## Modelo de dados

```mermaid
erDiagram
  PERFIL {
    int id PK "sempre 1 no MVP"
    text nome
    text apps "ex.: uber,99"
    real meta_diaria
    text modelo_veiculo
    real consumo_km_l "do combustível padrão"
    real preco_combustivel "do combustível padrão"
    text combustiveis "gasolina, etanol ou os dois"
    text combustivel_padrao "com qual abastece agora"
    real preco_gasolina
    real consumo_gasolina
    real preco_etanol
    real consumo_etanol
    real km_por_dia
    real dias_por_semana
    real custo_parcela "R$ por mês"
    real custo_seguro "R$ por mês ou por ano"
    text custo_seguro_periodo "mes ou ano"
    real custo_ipva "R$ por ano"
    real custo_manutencao "R$ por mês ou por ano"
    text custo_manutencao_periodo "mes ou ano"
    real custo_depreciacao "reserva para troca, R$ por mês"
    real custo_outros "R$ por mês"
    real custos_fixos_mensais "calculado"
    real km_mensal_estimado "calculado"
  }
  LANCAMENTOS {
    int id PK
    text data UK "AAAA-MM-DD"
    real ganho_uber
    real ganho_99
    real ganho_outros
    real km_rodados
    real horas_trabalhadas
    real gastos_extras
    real custo_km_aplicado "foto do custo/km no dia"
    real combustivel_km_aplicado
    real fixo_km_aplicado
    text combustivel_tipo "gasolina ou etanol"
    real preco_litro_aplicado
    real consumo_aplicado
    text observacao
  }
  ABASTECIMENTOS {
    int id PK
    text data "AAAA-MM-DD"
    real valor "R$ pagos no posto"
    text combustivel_tipo "gasolina ou etanol"
    real litros "opcional"
  }
```

## API REST

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/saude` | Verifica se a API está no ar |
| GET | `/api/perfil` | Perfil + custo por km (ou `null` se não cadastrado) |
| PUT | `/api/perfil` | Cria ou atualiza o perfil |
| POST | `/api/perfil/previa` | Custo por km e do mês enquanto o motorista preenche (não grava) |
| GET | `/api/lancamentos?de=&ate=` | Lista os dias lançados com indicadores |
| POST | `/api/lancamentos/previa` | A conta do dia enquanto o motorista digita (não grava) |
| GET | `/api/lancamentos/:data` | Lançamento de um dia |
| PUT | `/api/lancamentos/:data` | Cria ou atualiza o lançamento do dia |
| DELETE | `/api/lancamentos/:data` | Exclui o lançamento do dia |
| GET | `/api/abastecimentos?de=&ate=` | Lista os abastecimentos (com preço por litro, quando há litros) |
| POST | `/api/abastecimentos` | Registra um abastecimento |
| PUT / DELETE | `/api/abastecimentos/:id` | Corrige ou exclui um abastecimento |
| GET | `/api/resumo?ate=&dias=7` | Hoje, meta, série diária e totais do período |
| GET | `/api/resumo/mes?mes=AAAA-MM&hoje=` | Fechamento do mês: custos fixos do período x descontados nos dias e lucro ajustado |

Erros retornam `{ "erro": "mensagem" }` com o status HTTP adequado (400, 404, 409). Valores suspeitos (ganho acima de R$ 2.000 num dia, ganho sem km) voltam com status 422 e `"confirmar": true`: o front pergunta ao motorista e reenvia com `"confirmado": true`.

## Segurança

- **Regra de negócio fica só no backend.** Validações, limites e contas ficam em `backend/src/regras.js` e `backend/src/calculos.js`. O front não calcula nada: até a prévia que aparece enquanto o motorista digita vem da API (`/previa`). A exceção é a versão do GitHub Pages, que não tem servidor e roda esses mesmos módulos no navegador, com os dados no próprio aparelho.
- **Nenhuma variável `VITE_` ou `NEXT_PUBLIC_`.** Tudo com esse prefixo vai parar no JavaScript que o navegador baixa. O build do front falha se aparecer um `.env` ou uma dessas variáveis. Chaves e senhas, se um dia existirem, ficam só no backend.
- **A API só atende o próprio computador.** A rede local só é liberada com `npm run start:celular`.
- **Sem CORS:** outros sites abertos no navegador não conseguem ler nem alterar a API.

---

## Próximos passos (fora do MVP)

- Importação automática de ganhos. Uber e 99 não oferecem API pública para isso hoje, então o lançamento é manual.
- Múltiplos usuários com login.
- Valor mínimo por km: quanto cada km precisa render para cobrir os custos e bater a meta, como referência para o motorista.
- Alertas de manutenção por quilometragem.
- Versão instalável no celular (PWA).

---

Quilômetro Labs · Projeto Integrador · Design Profissional · Universidade Positivo · 2026
