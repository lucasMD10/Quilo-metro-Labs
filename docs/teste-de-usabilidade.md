# Teste de usabilidade

Roteiro para testar o KM Real com motoristas de verdade antes da apresentação.

## Objetivo

Descobrir se um motorista de aplicativo, sem ajuda, consegue:

1. Cadastrar o carro e os custos.
2. Lançar um dia de trabalho.
3. Entender quanto lucrou e por quê.

## Formato

- **Participantes:** 3 a 5 motoristas de Uber ou 99. Cinco pessoas já mostram a maior parte dos problemas. Podem ser os mesmos das entrevistas.
- **Duração:** 20 a 25 minutos por pessoa.
- **Onde:** no celular do próprio motorista, abrindo o app pelo Wi-Fi (veja "Abrir no celular" no README). Se não der, use o celular de alguém da equipe.
- **Equipe:**
  - **Facilitador:** lê o roteiro e não ajuda.
  - **Observador:** anota tempo, erros e frases.
- **Método:** pensar em voz alta. O motorista fala o que está pensando enquanto usa o app.

## Preparação

1. **Antes de cada participante,** apague o banco para começar do zero. Feche o app e apague o arquivo `backend/data/km.db`; no pacote portátil, é a pasta `data`.
2. **Abra o app no celular** e confira se aparece a tela de boas-vindas.
3. **Tenha à mão** a ficha de registro (no fim deste documento) e um cronômetro.
4. **Entre a tarefa 1 e a 2,** rode `npm run seed` (ou `DADOS-DE-EXEMPLO.bat`) e atualize a página. Assim o app fica com 4 semanas de dias lançados para as outras tarefas.

## Roteiro do facilitador

**Abertura (leia em voz alta):**

> Obrigado por ajudar. Estamos testando o app, não você: se algo ficar difícil, o problema é do app, e é isso que queremos achar. Vou pedir algumas tarefas. Tente fazer sozinho e vá falando o que pensa, o que procura, o que esperava acontecer. Eu não vou poder ajudar durante as tarefas, mas no fim conversamos. Posso anotar o que você falar?

Durante as tarefas, só diga frases neutras, como "Continue falando" ou "O que você esperava que acontecesse?". Se a pessoa travar por mais de 2 minutos, anote "não concluiu" e passe para a próxima.

## Tarefas

### T1. Primeiro acesso

> "Você acabou de baixar o app. Configure com os dados do seu carro."

O motorista usa os dados dele. Se não souber algum, pode estimar.

- **Sucesso:** chega ao início com o custo por km calculado.
- **Observar:**
  - Se entende o que é "meta de lucro por dia".
  - Se sabe onde achar o IPVA e o seguro.
  - Se o custo por km faz sentido para ele ("isso é mais ou menos o que eu imaginava?").

### T2. Lançar o dia

> "Hoje você fez R$ 260 na Uber e R$ 95 na 99, rodou 180 km, ficou 9 horas e meia online e gastou R$ 25 com lavagem. Lance o seu dia."

- **Sucesso:** dia salvo com lucro estimado de R$ 182,81. Esse valor vale para os dados de exemplo; com o carro do próprio motorista, o número muda.
- **Observar:**
  - Se coloca a gasolina em "outros gastos". Isso é um erro, porque o combustível já é descontado pelos km.
  - Como digita as horas (9:30, 9h30, 9,5).
  - Se olha a prévia do lucro antes de salvar.

### T3. Ler o resultado

> "Quanto você lucrou hoje? Bateu a meta?"

- **Sucesso:** responde o lucro de hoje e se bateu a meta, olhando a tela inicial.
- **Observar:**
  - Se confunde lucro com ganho bruto.
  - Se entende a barra da meta.

### T4. Entender o custo

> "O app diz que cada km custa R$ 0,82 para você. De onde sai esse número?"

- **Sucesso:** abre "Entender o cálculo" e explica com as próprias palavras: combustível mais custos fixos.
- **Observar:**
  - Quanto tempo leva para achar.
  - Se a explicação convence ou gera desconfiança.

### T5. Corrigir um dia passado

> "Você percebeu que na última terça-feira esqueceu de lançar R$ 40 de uma corrida particular. Corrija."

- **Sucesso:** acha o dia no histórico e coloca R$ 40 em "Outros ganhos".
- **Observar:**
  - Se procura no histórico ou tenta pelo "Lançar".
  - Se tem medo de apagar sem querer, por estar perto da lixeira.

### T6. Gasolina subiu

> "A gasolina subiu para R$ 6,49. Atualize no app. Quanto passa a custar cada km?"

- **Sucesso:** muda o preço no Perfil, salva e diz o novo custo por km (R$ 0,83 com os dados de exemplo).
- **Observar:** se espera que os dias antigos mudem, já que eles não mudam.

### T7. Fechamento do mês

> "Neste mês, quanto sobrou de verdade no seu bolso?"

- **Sucesso:** encontra o "Fechamento do mês" e responde o lucro ajustado.
- **Observar:** se entende a diferença entre o lucro dos dias e o lucro ajustado.

## Depois das tarefas

### Facilidade de cada tarefa

Logo após cada tarefa, pergunte:

> "De 1 (muito difícil) a 7 (muito fácil), quanto foi fácil?"

### Questionário SUS

Aplique ao final. O motorista responde de 1 (discordo totalmente) a 5 (concordo totalmente).

1. Eu usaria este app com frequência.
2. Achei o app mais complicado do que precisava.
3. Achei o app fácil de usar.
4. Eu precisaria de ajuda de alguém para conseguir usar o app.
5. As funções do app estão bem integradas.
6. Achei o app inconsistente, com coisas que não combinam.
7. Acho que a maioria das pessoas aprenderia a usar o app rápido.
8. Achei o app chato ou trabalhoso de usar.
9. Me senti confiante usando o app.
10. Precisei aprender muita coisa antes de conseguir usar o app.

**Cálculo:**
- Nas perguntas ímpares, use a resposta menos 1.
- Nas pares, use 5 menos a resposta.
- Some tudo e multiplique por 2,5.

O resultado vai de 0 a 100. Acima de 68 é considerado bom; acima de 80, excelente.

### Conversa final

1. O que você mais gostou? E o que mais te irritou?
2. Algum número te surpreendeu?
3. Você usaria isso todo dia, no fim do expediente? O que faria você parar de usar?
4. Pagaria por esse app? Quanto?

## Ficha de registro (uma por participante)

**Participante:** ____ · **Apps:** ____ · **Tempo de rodagem:** ____ · **Carro:** próprio / financiado / alugado

| Tarefa | Concluiu? (sim / com ajuda / não) | Tempo | Erros e hesitações | Facilidade (1 a 7) | Frase marcante |
|---|---|---|---|---|---|
| T1. Primeiro acesso | | | | | |
| T2. Lançar o dia | | | | | |
| T3. Ler o resultado | | | | | |
| T4. Entender o custo | | | | | |
| T5. Corrigir um dia | | | | | |
| T6. Gasolina subiu | | | | | |
| T7. Fechamento do mês | | | | | |

**SUS:** ____ / 100

## Como consolidar os resultados

1. **Monte a tabela de resultados.** Para cada tarefa, registre a taxa de sucesso, o tempo médio e a nota média de facilidade.
2. **Liste os problemas encontrados.** Classifique cada um pela gravidade:
   - **Crítico:** impede concluir a tarefa.
   - **Sério:** atrasa ou gera erro, mas a pessoa conclui.
   - **Cosmético:** só incomoda.
3. **Proponha uma correção** para cada problema crítico ou sério. Marque o que foi corrigido antes da apresentação.
4. **Leve para o relatório:**
   - A média do SUS.
   - As 3 frases mais marcantes.
   - O "antes e depois" de pelo menos uma correção.

| Problema | Tarefa | Quantos tiveram | Gravidade | Correção proposta | Corrigido? |
|---|---|---|---|---|---|
| | | | | | |
