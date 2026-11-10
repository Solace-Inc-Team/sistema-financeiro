import { api, qs } from '../api.js';
import { clear, emptyState, field, h } from '../dom.js';
import { money, thisMonth } from '../format.js';

function rotuloMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  const nome = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${nome}/${String(ano).slice(2)}`;
}

export async function renderDashboard(container) {
  const state = { mes: thisMonth() };
  const corpo = h('div', { class: 'page' });

  async function carregar() {
    const [resumo, fluxo, despesas, receitas] = await Promise.all([
      api.get(`/relatorios/resumo${qs({ mes: state.mes })}`),
      api.get(`/relatorios/fluxo${qs({ mes: state.mes, meses: 6 })}`),
      api.get(`/relatorios/por-categoria${qs({ mes: state.mes, tipo: 'DESPESA' })}`),
      api.get(`/relatorios/por-categoria${qs({ mes: state.mes, tipo: 'RECEITA' })}`),
    ]);

    const stat = (rotulo, valor, detalhe, classe = '') =>
      h('div', { class: 'panel stat' }, h('span', {}, rotulo), h('strong', { class: `num ${classe}` }, money(valor)), h('small', {}, detalhe));

    clear(corpo).append(
      h('div', { class: 'grid' },
        stat('Receitas recebidas', resumo.receitas.pago, `A receber: ${money(resumo.receitas.pendente)}`, 'pos'),
        stat('Despesas pagas', resumo.despesas.pago, `A pagar: ${money(resumo.despesas.pendente)}`, 'neg'),
        stat('Saldo realizado', resumo.saldo.realizado, 'Recebido menos pago', resumo.saldo.realizado < 0 ? 'neg' : 'pos'),
        stat('Saldo previsto', resumo.saldo.previsto, 'Incluindo pendentes', resumo.saldo.previsto < 0 ? 'neg' : ''),
      ),
      h('section', { class: 'panel' },
        h('h2', {}, 'Últimos 6 meses'),
        h('div', { class: 'fluxo' }, fluxo.meses.map((m) => {
          const maior = Math.max(1, ...fluxo.meses.flatMap((x) => [x.receitas, x.despesas]));
          return h('div', { class: 'mes' },
            h('div', { class: 'barras' },
              h('i', { class: 'b rec', style: `height:${(m.receitas / maior) * 100}%`, title: `Receitas: ${money(m.receitas)}` }),
              h('i', { class: 'b des', style: `height:${(m.despesas / maior) * 100}%`, title: `Despesas: ${money(m.despesas)}` })),
            h('strong', {}, rotuloMes(m.mes)),
            h('small', { class: `num ${m.saldo < 0 ? 'neg' : 'pos'}` }, money(m.saldo)));
        })),
        h('div', { class: 'legenda' }, h('span', {}, h('i', { style: 'background:var(--pos)' }), 'Receitas'), h('span', {}, h('i', { style: 'background:var(--neg)' }), 'Despesas'), h('span', {}, 'Valor abaixo do mês = saldo')),
      ),
      h('div', { class: 'dois-col' }, categorias('Despesas por categoria', despesas, 'des'), categorias('Receitas por categoria', receitas, 'rec')),
    );
  }

  const seletor = h('input', { type: 'month', value: state.mes, required: true, onChange: (e) => { if (e.target.value) { state.mes = e.target.value; carregar(); } } });
  container.append(h('div', { class: 'page-head' }, h('h1', {}, 'Resumo do mês'), h('div', { class: 'toolbar' }, field('Mês', seletor))), corpo);
  await carregar();
}

function categorias(titulo, dados, classe) {
  return h('section', { class: 'panel' }, h('h2', {}, titulo),
    dados.categorias.length === 0
      ? emptyState('Sem lançamentos neste mês')
      : dados.categorias.map((c) =>
          h('div', { class: `cat-linha ${classe}` },
            h('span', {}, c.categoria, h('small', { class: 'muted' }, ` · ${c.percentual.toLocaleString('pt-BR')}%`)),
            h('strong', { class: 'num' }, money(c.total)),
            h('div', { class: 'trilho' }, h('i', { style: `width:${c.percentual}%` })))),
  );
}
