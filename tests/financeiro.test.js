import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

const clock = () => new Date(2026, 10, 9, 12, 0); // 09/11/2026

describe('API financeira', () => {
  let api;
  let vendas;
  let aluguel;

  before(async () => {
    api = await startTestServer({ clock });
    vendas = (await api.post('/categorias', { nome: 'Vendas', tipo: 'RECEITA' })).body;
    aluguel = (await api.post('/categorias', { nome: 'Aluguel', tipo: 'DESPESA' })).body;
  });

  after(() => api.close());

  const lancar = (categoria, valor_centavos, data, status = 'PAGO') =>
    api.post('/lancamentos', { descricao: 'Lançamento de teste', categoria_id: categoria.id, valor_centavos, data, status });

  it('deriva o tipo do lançamento a partir da categoria', async () => {
    const receita = await lancar(vendas, 100_000, '2026-11-03');
    assert.equal(receita.status, 201);
    assert.equal(receita.body.tipo, 'RECEITA');
    assert.equal((await lancar(aluguel, 30_000, '2026-11-05')).body.tipo, 'DESPESA');
  });

  it('calcula o resumo do mês separando realizado e previsto', async () => {
    await lancar(aluguel, 20_000, '2026-11-20', 'PENDENTE');
    const { body } = await api.get('/relatorios/resumo?mes=2026-11');
    assert.equal(body.receitas.pago, 100_000);
    assert.equal(body.despesas.pago, 30_000);
    assert.equal(body.despesas.pendente, 20_000);
    assert.equal(body.saldo.realizado, 70_000);
    assert.equal(body.saldo.previsto, 50_000);
  });

  it('marca um lançamento pendente como pago', async () => {
    const pendente = (await lancar(aluguel, 5_000, '2026-11-25', 'PENDENTE')).body;
    const pago = await api.patch(`/lancamentos/${pendente.id}/status`, { status: 'PAGO' });
    assert.equal(pago.body.status, 'PAGO');
  });

  it('agrupa as despesas por categoria com percentual', async () => {
    const { body } = await api.get('/relatorios/por-categoria?mes=2026-11&tipo=DESPESA');
    assert.equal(body.categorias.length, 1);
    assert.equal(body.categorias[0].percentual, 100);
    assert.equal(body.total, 55_000);
  });

  it('monta o fluxo dos últimos meses, incluindo meses vazios', async () => {
    await lancar(vendas, 40_000, '2026-09-10');
    const { body } = await api.get('/relatorios/fluxo?mes=2026-11&meses=3');
    assert.deepEqual(body.meses.map((m) => m.mes), ['2026-09', '2026-10', '2026-11']);
    assert.equal(body.meses[0].receitas, 40_000);
    assert.equal(body.meses[1].saldo, 0);
  });

  it('filtra lançamentos por mês e tipo', async () => {
    const novembro = await api.get('/lancamentos?mes=2026-11&tipo=DESPESA');
    assert.ok(novembro.body.length >= 2);
    assert.ok(novembro.body.every((l) => l.tipo === 'DESPESA' && l.data.startsWith('2026-11')));
  });

  it('valida valores e referências', async () => {
    assert.equal((await lancar(vendas, 0, '2026-11-03')).status, 400);
    assert.equal((await lancar(vendas, 1000, '2026-02-31')).status, 400);
    assert.equal((await lancar({ id: 999 }, 1000, '2026-11-03')).status, 404);
  });

  it('protege categorias em uso e nomes duplicados', async () => {
    assert.equal((await api.delete(`/categorias/${vendas.id}`)).status, 409);
    assert.equal((await api.post('/categorias', { nome: 'Vendas', tipo: 'RECEITA' })).status, 409);

    const vazia = (await api.post('/categorias', { nome: 'Sem uso', tipo: 'DESPESA' })).body;
    assert.equal((await api.delete(`/categorias/${vazia.id}`)).status, 204);
  });
});
