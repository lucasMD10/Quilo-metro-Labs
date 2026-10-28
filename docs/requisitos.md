# Requisitos do KM Real

Lista de requisitos do MVP, levantada a partir da pesquisa de mercado (segmento "Gestão Financeira para Uber/99", 92% de necessidade) e das dores dos motoristas. Prioridade no modelo MoSCoW: **Deve** (sem isso o produto não resolve o problema), **Deveria** (importante, mas o produto funciona sem), **Poderia** (melhora a experiência) e **Futuro** (fora do MVP).

## Requisitos funcionais

### Cadastro inicial

| ID | Requisito | Prioridade | Situação | Tela |
|---|---|---|---|---|
| RF01 | O motorista informa nome, apps em que roda (Uber, 99 ou os dois) e meta de lucro por dia. | Deve | Feito | Boas-vindas 1 |
| RF02 | O motorista informa os dados do carro: modelo, preço do litro, consumo (km/l), km num dia normal e dias de trabalho por semana. | Deve | Feito | Boas-vindas 2 |
| RF03 | O motorista informa cada custo fixo separado: parcela ou aluguel, seguro, IPVA e licenciamento (por ano), manutenção, reserva para trocar de carro e outros. | Deve | Feito | Boas-vindas 2, Perfil |
| RF04 | Enquanto preenche, o app mostra a prévia do custo por km, do custo do carro no mês e de quanto ele precisa faturar por dia para bater a meta. | Deveria | Feito | Boas-vindas 2, Perfil |
| RF05 | O app avisa quando um valor parece digitado errado (consumo, preço do litro ou km por dia fora do normal, custo por km alto). | Deveria | Feito | Boas-vindas 2, Perfil |

### Custo por km

| ID | Requisito | Prioridade | Situação | Tela |
|---|---|---|---|---|
| RF06 | O app calcula o custo real por km, separado entre combustível e custos fixos. | Deve | Feito | Início, Perfil |
| RF07 | O motorista consegue ver como o custo por km foi calculado ("Entender o cálculo"). | Deveria | Feito | Início |

### Lançamento do dia

| ID | Requisito | Prioridade | Situação | Tela |
|---|---|---|---|---|
| RF08 | O motorista lança o dia com ganhos por app (Uber, 99, outros), km rodados, horas online, outros gastos e observação. | Deve | Feito | Lançar dia |
| RF09 | Enquanto digita, o app mostra a conta do dia aberta: ganho bruto, combustível, custos fixos, outros gastos e lucro estimado. | Deve | Feito | Lançar dia |
| RF10 | Cada dia guarda o custo por km da época. Mudar o preço do combustível não altera dias antigos, a não ser que o motorista peça para recalcular. | Deve | Feito | Lançar dia |
| RF11 | O motorista pode lançar ou editar dias anteriores escolhendo a data (o seletor não oferece datas futuras). | Deveria | Feito | Lançar dia |

### Acompanhamento

| ID | Requisito | Prioridade | Situação | Tela |
|---|---|---|---|---|
| RF12 | O início mostra o lucro estimado de hoje e o progresso da meta diária. | Deve | Feito | Início |
| RF13 | O início mostra indicadores rápidos: custo por km, ganho bruto por km e km rodados hoje. | Deveria | Feito | Início |
| RF14 | O início mostra os últimos 7 dias em gráfico (lucro, ganho bruto e meta), com totais, lucro por hora e dias com meta batida. Tocar numa barra mostra os números daquele dia. | Deveria | Feito | Início |
| RF15 | O fechamento do mês compara os custos fixos reais do período com o que os dias já descontaram e mostra o lucro do mês ajustado. | Deveria | Feito | Início |
| RF16 | O histórico lista os dias lançados com lucro, km e ganho bruto, e permite abrir para editar ou excluir (com confirmação). | Deve | Feito | Histórico |

### Perfil

| ID | Requisito | Prioridade | Situação | Tela |
|---|---|---|---|---|
| RF17 | O motorista edita nome, apps, meta, dados e custos do carro. O novo custo por km vale para os próximos lançamentos. | Deve | Feito | Perfil |

### Fora do MVP

| ID | Requisito | Prioridade |
|---|---|---|
| RF18 | Importar ganhos direto da Uber e da 99 (hoje não há API pública para isso). | Futuro |
| RF19 | Simulador "essa corrida compensa?" antes de aceitar. | Futuro |
| RF20 | Alertas de manutenção por quilometragem. | Futuro |
| RF21 | Login e vários motoristas no mesmo sistema. | Futuro |
| RF22 | Instalar no celular como app (PWA) e funcionar sem internet. | Futuro |

## Requisitos não funcionais

| ID | Requisito | Categoria | Situação |
|---|---|---|---|
| RNF01 | Celular primeiro: layout pensado para 360 a 430 px de largura, com versão em duas colunas no computador. | Usabilidade | Feito |
| RNF02 | Áreas de toque com no mínimo 44 px. Menu inferior e botão de salvar sempre ao alcance do polegar. | Usabilidade | Feito |
| RNF03 | Linguagem do motorista, sem termos técnicos ("sobra no bolso", "o que caiu pra você"). Todo valor calculado mostra de onde veio. | Usabilidade | Feito |
| RNF04 | Aceitar números no formato brasileiro (1.234,56) e horas como 8:30, 8h30 ou 8,5. | Usabilidade | Feito |
| RNF05 | Contraste de texto dentro do recomendado pela WCAG AA. Lucro e prejuízo não dependem só da cor (o prejuízo vem com sinal de menos). | Acessibilidade | Feito |
| RNF06 | Respostas rápidas mesmo sem internet boa: banco SQLite local, sem chamadas a serviços externos. | Desempenho | Feito |
| RNF07 | Validação no front e no back: horas até 24, km até 1.500 por dia, dia vazio recusado, datas reais. | Confiabilidade | Feito |
| RNF08 | Rodar com um comando (`npm start`) num computador com Node 22.13 ou mais novo, e abrir no celular pela mesma rede Wi-Fi. | Portabilidade | Feito |
| RNF09 | Dados ficam só no computador do motorista. Nenhuma chave de API nem dado pessoal enviado para fora. | Privacidade | Feito |
| RNF10 | Identidade visual consistente, seguindo o [guia de estilo](guia-de-estilo/). | Consistência | Feito |

## Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Lucro é a sobra no bolso: ganhos menos combustível, custos fixos do carro e outros gastos do dia. |
| RN02 | Custo por km = preço do litro ÷ consumo + custos fixos do mês ÷ km do mês. |
| RN03 | Km do mês = km por dia × dias por semana × 52 ÷ 12. |
| RN04 | Custos fixos do mês = parcela + seguro + IPVA ÷ 12 + manutenção + reserva para troca + outros. |
| RN05 | O custo por km usado num dia fica congelado nele; só muda se o motorista marcar "Recalcular com o custo de hoje". |
| RN06 | O fechamento do mês conta os custos fixos a partir do primeiro dia lançado no app, proporcional aos dias do período. |
| RN07 | O motorista roda em pelo menos um app (Uber ou 99). |
| RN08 | Ganho maior que R$ 2.000 num dia, ou ganho sem km rodados, pede confirmação antes de salvar. |

## Rastreabilidade: dor → requisito

| Dor do motorista | Requisitos |
|---|---|
| Só vê o valor bruto e não sabe quanto sobra | RF06, RF09, RF12 |
| Não sabe quanto o carro custa de verdade | RF02, RF03, RF04, RF07 |
| Não sabe se bateu a meta | RF01, RF12, RF14 |
| Controla de cabeça ou no caderno, e perde a conta | RF08, RF16 |
| Tem mês bom e mês ruim e não entende por quê | RF14, RF15 |
| Esquece gastos como pneu e óleo até ter que pagar | RF03, RF06 |
| Está cansado no fim do dia e precisa preencher rápido | RF08, RF09 |
| Não sabe todos os gastos de cabeça | RF04, RF17 |

As frases dos motoristas que deram origem a essas dores estão na [pesquisa](pesquisa.md).
