# Pendências

Itens levantados na revisão do MVP, para depois do redesign.

## Regras de negócio

- [ ] **Editar um dia antigo recalcula o lucro com o custo/km atual.** `PUT /api/lancamentos/:data` sempre grava `custo_km_aplicado` com o perfil de hoje, então mudar até a observação de um dia antigo altera o lucro dele. A prévia da tela de lançamento também usa o custo atual. Preservar o custo original ao editar (e, se fizer sentido, oferecer um "recalcular com o custo atual" explícito).
- [ ] **Falha ao carregar um dia aparece como formulário vazio.** A tela de lançamento trata qualquer erro do `GET /api/lancamentos/:data` como "dia sem lançamento". Diferenciar 404 de falha de rede ou do servidor.
- [ ] **Parcela + depreciação.** Quem financia já paga o carro na parcela; somar a depreciação por cima infla o custo. Decidir a regra (ex.: dica "se você paga parcela, pode deixar a depreciação em branco").
- [ ] **Taxa da plataforma.** Deixar claro nos campos de ganho que o valor é o que caiu para o motorista, já sem a taxa do app.
- [ ] **Aba "Veículo" esconde nome e meta.** Configurações pessoais ficam dentro de "Veículo". Renomear ("Perfil e veículo") ou separar as seções.
