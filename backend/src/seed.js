// Popula o banco com um motorista de exemplo e os dias do mês até ontem.
// Útil para a demonstração na apresentação: npm run seed
import { db } from './db.js';
import { custoPorKm } from './calculos.js';
import { perfilExemplo, lancamentosExemplo } from './exemplo.js';

const perfil = perfilExemplo();

db.exec('DELETE FROM lancamentos; DELETE FROM perfil;');
const colunas = Object.keys(perfil);
db.prepare(`INSERT INTO perfil (id, ${colunas.join(', ')}) VALUES (1, ${colunas.map((c) => `:${c}`).join(', ')})`).run(perfil);

const inserir = db.prepare(`
  INSERT INTO lancamentos (data, ganho_uber, ganho_99, ganho_outros, km_rodados, horas_trabalhadas, gastos_extras,
                           custo_km_aplicado, combustivel_km_aplicado, fixo_km_aplicado,
                           combustivel_tipo, preco_litro_aplicado, consumo_aplicado)
  VALUES (:data, :ganho_uber, :ganho_99, :ganho_outros, :km_rodados, :horas_trabalhadas, :gastos_extras,
          :custo_km_aplicado, :combustivel_km_aplicado, :fixo_km_aplicado,
          :combustivel_tipo, :preco_litro_aplicado, :consumo_aplicado)
`);
for (const { observacao, ...dia } of lancamentosExemplo(perfil)) inserir.run(dia);

console.log('Banco populado com dados de exemplo. Custo por km:', custoPorKm(perfil).total_km);
