# Pitch do KM Real

Slides em PDF: [KM-Real-Pitch.pdf](KM-Real-Pitch.pdf). Tempo total: uns 8 minutos, contando a demonstração.

Entre colchetes, quem fala em cada slide.

## 1. KM Real

[Rafael] Boa noite, banca. Nós somos a Quilômetro Labs e este é o KM Real, um app de gestão financeira para motorista de Uber e 99. A ideia cabe numa frase: mostrar quanto sobra de verdade a cada quilômetro que o motorista roda.

## 2. “Tem dia que entra bastante dinheiro, mas parece que não sobra nada.”

[Rafael] Essa frase é de um dos motoristas que entrevistamos, e resume o problema. O motorista vê quanto entrou no app, mas esse valor é bruto. Ele abastece, paga a parcela, o seguro, o IPVA, troca pneu e óleo, e no fim do mês não sabe se o carro está dando lucro ou só girando dinheiro.

## 3. O segmento com mais necessidade da pesquisa

[Rafael] Escolhemos esse segmento por causa dos dados. Na pesquisa de mais de 40 mil entrevistas do professor, gestão financeira para Uber e 99 teve 92% de necessidade, o maior índice. A mesma pesquisa mostra que 78% abandonam apps que não resolvem uma dor financeira direta, e que o engajamento triplica quando o app mostra o ganho em dinheiro. Por isso o KM Real mostra o lucro logo na primeira tela.

## 4. O que os motoristas disseram

[Vinicius] Fomos a campo e conversamos com dois motoristas: um que roda o dia inteiro e outro que faz corrida depois do trabalho como renda extra. Os dois confirmaram a dor: sabem quanto entra, mas não quanto sobra. E deram três recados que viraram regra de design: mostrar o que sobra, ser rápido de preencher no fim do dia, e aceitar uma estimativa dos gastos, porque ninguém sabe de cabeça quanto gasta com pneu e óleo. Os dois disseram que usariam o app.

## 5. O KM Real em três passos

[Lucas] A solução é o KM Real. Funciona em três passos. Primeiro o motorista cadastra o carro uma vez: preço do combustível, consumo, quantos km roda por dia e os custos fixos, como parcela, seguro, IPVA e manutenção. Com isso o app calcula o custo real de cada km. Depois, no fim do dia, ele lança quanto ganhou em cada app e quantos km rodou, e já vê a conta pronta. Na tela inicial fica o que interessa: quanto sobrou hoje, se bateu a meta, a semana e o fechamento do mês.

## 6. A conta que o motorista não faz

[Lucas] Esse é o coração do app. Com um Onix 1.0, gasolina a R$ 6,29 e 12 km por litro, cada km gasta 52 centavos de combustível. Os custos fixos, parcela, seguro, IPVA e manutenção, somam R$ 1.450 por mês; divididos pelos 4.940 km que ele roda no mês, dão 29 centavos por km. Somando, com os centavos que o arredondamento esconde, cada km custa R$ 0,82. Num dia de 180 km em que entraram R$ 355, sobram R$ 182,81. Quase metade do que entrou ficou no carro. É isso que o motorista não vê hoje.

## 7. Combustível do jeito que o motorista abastece

[Lucas] Uma melhoria que veio depois do protótipo, conversando sobre como o motorista abastece de verdade. Ele pode usar gasolina, etanol ou os dois, cada um com o seu preço e consumo, e o app mostra qual compensa por km. Se um dia abasteceu com outro preço ou com etanol, ele ajusta ali mesmo, na tela de lançar, e escolhe se isso vale para os próximos dias. E ele pode registrar o que pagou no posto: no fechamento do mês isso aparece ao lado do combustível estimado pelos km, mas não entra no lucro, para o mesmo combustível não ser descontado duas vezes. A diferença entre os dois pode ser combustível que ficou no tanque ou uso fora do trabalho.

## 8. Demonstração

[Lucas] Roteiro da demo, uns 2 minutos. Antes da aula: rodar DADOS-DE-EXEMPLO.bat e abrir no celular pelo hotspot.

1) Aba Lançar: Uber 260, 99 95, 180 km, 9:30 horas, 25 de lavagem. Mostrar a conta mudando enquanto digita.

2) Em "Combustível estimado", tocar em Ajustar: trocar para Etanol e mostrar o valor do combustível caindo. Antes de salvar, desmarcar "Usar nos próximos dias" (senão o etanol vira o padrão e o custo da tela inicial deixa de ser os R$ 0,82 do slide da conta). Salvar.

3) Início: lucro de hoje, a barra da meta, tocar em "Entender o cálculo" no custo por km.

4) Rolar até o Fechamento do mês: lucro ajustado e o combustível do mês (estimado x pago no posto).

5) Se sobrar tempo: Histórico > Abastecimentos.

Plano B se der problema: mostrar o protótipo no Figma.

## 9. Do papel ao app

[Rafael ou Lucas] O processo seguiu as fases do projeto. Primeiro os wireframes, só com a estrutura das 6 telas. Depois a identidade visual e o guia de estilo, e o protótipo navegável no Figma, todo montado com componentes. Por fim o app de verdade, que segue o mesmo layout e funciona no celular e no computador. Pensamos o celular primeiro, porque é onde o motorista vive.

## 10. Como o KM Real foi construído

[Lucas] Por baixo, o front é em React, a API em Node com Express e o banco é SQLite, que já vem embutido no Node, então não tem nada para instalar além dele. As regras de cálculo ficam isoladas na API. Tudo está versionado no GitHub com README, arquitetura e guia de execução. Para rodar são dois comandos. Por segurança, o npm start só abre no próprio computador; para abrir no celular, o npm run start:celular libera a rede e mostra o endereço.

## 11. Próximos passos

[Vinicius] Para frente, o primeiro passo é o valor mínimo por km: o app mostra quanto cada km precisa render para pagar o carro e bater a meta, e o motorista usa isso como referência na hora de aceitar uma corrida. Depois vêm alertas de manutenção, login com dados na nuvem e o consumo real do carro, medido por ciclos de tanque cheio: só os litros colocados não dizem quanto foi gasto. Importar ganhos direto da Uber e da 99 depende delas, porque hoje não existe API pública para isso.

## 12. Quanto sobra de verdade a cada quilômetro que você roda.

[Rafael] Para fechar: o KM Real responde a pergunta que o motorista faz todo fim de dia, quanto sobrou de verdade. A dor apareceu nos dados da pesquisa e foi confirmada pelos motoristas, e o app já funciona. Somos a Quilômetro Labs: Rafael e Vinicius no produto, Lucas no desenvolvimento, Lucas e Rafael no design e Vinicius nos testes. Obrigado, e ficamos abertos a perguntas.
