// Popula o banco com um motorista de exemplo e 14 dias de lançamentos.
// Útil para a demonstração na apresentação: npm run seed
import { db } from './db.js';
import { custoPorKm } from './calculos.js';

const perfil = {
  nome: 'Carlos',
  apps: 'uber,99',
  meta_diaria: 180,
  modelo_veiculo: 'Onix 1.0 2020',
  consumo_km_l: 12,
  preco_combustivel: 6.29,
  custos_fixos_mensais: 1450,
  km_mensal_estimado: 5000,
};

db.exec('DELETE FROM lancamentos; DELETE FROM perfil;');
db.prepare(`
  INSERT INTO perfil (id, nome, apps, meta_diaria, modelo_veiculo, consumo_km_l, preco_combustivel, custos_fixos_mensais, km_mensal_estimado)
  VALUES (1, :nome, :apps, :meta_diaria, :modelo_veiculo, :consumo_km_l, :preco_combustivel, :custos_fixos_mensais, :km_mensal_estimado)
`).run(perfil);

const custoKm = custoPorKm(perfil).total_km;
const inserir = db.prepare(`
  INSERT INTO lancamentos (data, ganho_uber, ganho_99, ganho_outros, km_rodados, horas_trabalhadas, gastos_extras, custo_km_aplicado)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const hoje = new Date();
for (let i = 13; i >= 1; i--) {
  const d = new Date(hoje);
  d.setDate(d.getDate() - i);
  if (d.getDay() === 0) continue; // folga no domingo
  const data = d.toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
  const km = 150 + Math.round(Math.random() * 90);
  const uber = Math.round(km * (1.1 + Math.random() * 0.6));
  const noventa = Math.round(km * (0.3 + Math.random() * 0.4));
  inserir.run(data, uber, noventa, 0, km, 8 + Math.round(Math.random() * 3), Math.round(Math.random() * 40), custoKm);
}

console.log('Banco populado com dados de exemplo. Custo por km:', custoKm);
