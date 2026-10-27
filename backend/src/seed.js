// Popula o banco com um motorista de exemplo e 14 dias de lançamentos.
// Útil para a demonstração na apresentação: npm run seed
import { db } from './db.js';
import { custoPorKm, custosFixosMensais, kmMensal } from './calculos.js';

const perfil = {
  nome: 'Carlos',
  apps: 'uber,99',
  meta_diaria: 180,
  modelo_veiculo: 'Onix 1.0 2020',
  consumo_km_l: 12,
  preco_combustivel: 6.29,
  km_por_dia: 190,
  dias_por_semana: 6,
  custo_parcela: 800,
  custo_seguro: 180,
  custo_ipva: 1800, // por ano
  custo_manutencao: 200,
  custo_depreciacao: 120,
  custo_outros: 0,
};
perfil.custos_fixos_mensais = custosFixosMensais(perfil);
perfil.km_mensal_estimado = kmMensal(perfil);

db.exec('DELETE FROM lancamentos; DELETE FROM perfil;');
const colunas = Object.keys(perfil);
db.prepare(`INSERT INTO perfil (id, ${colunas.join(', ')}) VALUES (1, ${colunas.map((c) => `:${c}`).join(', ')})`).run(perfil);

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
