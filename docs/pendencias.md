# Pendências

Itens levantados na revisão do MVP.

## Regras de negócio

- [x] **Editar um dia antigo recalcula o lucro com o custo/km atual.** `PUT /api/lancamentos/:data` sempre grava `custo_km_aplicado` com o perfil de hoje, então mudar até a observação de um dia antigo altera o lucro dele. A prévia da tela de lançamento também usa o custo atual. Preservar o custo original ao editar (e, se fizer sentido, oferecer um "recalcular com o custo atual" explícito).
- [x] **Falha ao carregar um dia aparece como formulário vazio.** A tela de lançamento trata qualquer erro do `GET /api/lancamentos/:data` como "dia sem lançamento". Diferenciar 404 de falha de rede ou do servidor.
- [x] **Parcela + depreciação.** Quem financia já paga o carro na parcela; somar a depreciação por cima infla o custo. Decidir a regra (ex.: dica "se você paga parcela, pode deixar a depreciação em branco").
- [x] **Taxa da plataforma.** Deixar claro nos campos de ganho que o valor é o que caiu para o motorista, já sem a taxa do app.
- [x] **Aba "Veículo" esconde nome e meta.** Configurações pessoais ficam dentro de "Veículo". Renomear ("Perfil e veículo") ou separar as seções.

### Como ficou

- O custo por km fica congelado no dia lançado (com as partes de combustível e custos fixos). Ao editar, aparece o custo da época e a opção "Recalcular com o custo de hoje".
- Só um 404 vira "dia novo"; outras falhas mostram uma mensagem com "Tentar de novo" e não deixam salvar.
- Lucro definido como **sobra no bolso** (opção A). A depreciação virou "Reserva para trocar de carro", opcional, e os números passam a dizer "estimado".
- Dicas nos campos de ganho: o valor que caiu para o motorista, já sem a taxa do app.
- A aba virou "Perfil" (tela "Perfil e veículo"), com ícone próprio.
