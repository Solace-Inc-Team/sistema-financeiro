import { api, qs } from '../api.js';
import { clear, downloadCsv, emptyState, field, h, openModal, select, showError, toast } from '../dom.js';
import { centsToInput, dateBR, money, parseMoneyToCents, thisMonth, todayISO } from '../format.js';

export async function renderLancamentos(container) {
  const categorias = await api.get('/categorias');
  const filtros = { mes: thisMonth(), tipo: '', status: '', q: '' };
  const lista = h('div', { class: 'panel' });
  let itensAtuais = [];
  let temporizador;

  async function carregar() {
    itensAtuais = await api.get(`/lancamentos${qs(filtros)}`);
    clear(lista);
    if (itensAtuais.length === 0) {
      lista.append(emptyState('Nenhum lançamento encontrado', 'Mude os filtros ou registre um novo lançamento.'));
      return;
    }
    const soma = (tipo) => itensAtuais.filter((l) => l.tipo === tipo).reduce((total, l) => total + l.valor_centavos, 0);
    const receitas = soma('RECEITA');
    const despesas = soma('DESPESA');

    lista.append(h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Data', 'Descrição', 'Valor', 'Situação', ''].map((t, i) => h('th', { class: i === 2 ? 'right' : '' }, t)))),
      h('tbody', {}, itensAtuais.map((l) =>
        h('tr', {},
          h('td', { class: 'num' }, dateBR(l.data)),
          h('td', {}, l.descricao, h('br'), h('small', { class: 'muted' }, l.categoria_nome)),
          h('td', { class: `right num ${l.tipo === 'RECEITA' ? 'pos' : 'neg'}` }, `${l.tipo === 'RECEITA' ? '+' : '−'} ${money(l.valor_centavos)}`),
          h('td', {}, h('span', { class: `badge ${l.status === 'PAGO' ? 'badge-ok' : 'badge-warn'}` }, rotuloStatus(l))),
          h('td', { class: 'actions' },
            h('button', { class: 'btn btn-ghost btn-sm', onClick: () => alternarStatus(l) }, l.status === 'PAGO' ? 'Reabrir' : (l.tipo === 'RECEITA' ? 'Marcar recebido' : 'Marcar pago')),
            ' ', h('button', { class: 'btn btn-ghost btn-sm', onClick: () => abrirForm(categorias, l, carregar) }, 'Editar'),
            ' ', h('button', { class: 'btn btn-danger btn-sm', onClick: () => remover(l) }, 'Excluir')),
        ))),
      h('tfoot', {}, h('tr', {},
        h('td', { colSpan: 2 }, `Total (${itensAtuais.length} lançamentos)`),
        h('td', { class: `right num ${receitas - despesas < 0 ? 'neg' : 'pos'}`, title: `Receitas ${money(receitas)} · Despesas ${money(despesas)}` }, money(receitas - despesas)),
        h('td', { colSpan: 2 }, `Receitas ${money(receitas)} · Despesas ${money(despesas)}`))),
    )));
  }

  const rotuloStatus = (l) => (l.status === 'PAGO' ? (l.tipo === 'RECEITA' ? 'Recebido' : 'Pago') : (l.tipo === 'RECEITA' ? 'A receber' : 'A pagar'));

  async function alternarStatus(l) {
    try {
      await api.patch(`/lancamentos/${l.id}/status`, { status: l.status === 'PAGO' ? 'PENDENTE' : 'PAGO' });
      carregar();
    } catch (error) {
      showError(error);
    }
  }

  async function remover(l) {
    if (!confirm(`Excluir “${l.descricao}”?`)) return;
    try {
      await api.delete(`/lancamentos/${l.id}`);
      toast('Lançamento excluído.');
      carregar();
    } catch (error) {
      showError(error);
    }
  }

  const exportar = () =>
    downloadCsv(`lancamentos-${filtros.mes || 'todos'}.csv`, [
      ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Situação'],
      ...itensAtuais.map((l) => [dateBR(l.data), l.descricao, l.categoria_nome, l.tipo === 'RECEITA' ? 'Receita' : 'Despesa', centsToInput(l.valor_centavos), rotuloStatus(l)]),
    ]);

  const filtro = (chave) => (e) => { filtros[chave] = e.target.value; carregar(); };

  container.append(
    h('div', { class: 'page-head' }, h('h1', {}, 'Lançamentos'),
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn btn-ghost', onClick: exportar }, 'Exportar CSV'),
        h('button', { class: 'btn', onClick: () => abrirForm(categorias, null, carregar) }, 'Novo lançamento'))),
    h('div', { class: 'toolbar' },
      field('Mês', h('input', { type: 'month', value: filtros.mes, onChange: filtro('mes') })),
      field('Tipo', select([{ value: '', label: 'Todos' }, { value: 'RECEITA', label: 'Receitas' }, { value: 'DESPESA', label: 'Despesas' }], '', { onChange: filtro('tipo') })),
      field('Situação', select([{ value: '', label: 'Todas' }, { value: 'PENDENTE', label: 'Pendentes' }, { value: 'PAGO', label: 'Pagos/recebidos' }], '', { onChange: filtro('status') })),
      field('Buscar', h('input', { type: 'search', placeholder: 'Descrição', onInput: (e) => { clearTimeout(temporizador); temporizador = setTimeout(() => { filtros.q = e.target.value.trim(); carregar(); }, 250); } }))),
    lista,
  );
  await carregar();
}

function abrirForm(categorias, lancamento, aoSalvar) {
  const tipo = select([{ value: 'DESPESA', label: 'Despesa' }, { value: 'RECEITA', label: 'Receita' }], lancamento?.tipo ?? 'DESPESA');
  const categoria = select([], null, { required: true });
  const descricao = h('input', { required: true, minLength: 2, maxLength: 150, value: lancamento?.descricao ?? '' });
  const valor = h('input', { inputMode: 'decimal', required: true, placeholder: '0,00', value: lancamento ? centsToInput(lancamento.valor_centavos) : '' });
  const data = h('input', { type: 'date', required: true, value: lancamento?.data ?? todayISO() });
  const status = select([{ value: 'PENDENTE', label: 'Pendente' }, { value: 'PAGO', label: 'Pago / recebido' }], lancamento?.status ?? 'PENDENTE');

  function preencherCategorias(selecionada) {
    clear(categoria);
    for (const c of categorias.filter((x) => x.tipo === tipo.value)) categoria.append(h('option', { value: c.id }, c.nome));
    if (selecionada) categoria.value = String(selecionada);
  }
  preencherCategorias(lancamento?.categoria_id);
  tipo.addEventListener('change', () => preencherCategorias());

  const form = h('form', {
    onSubmit: async (e) => {
      e.preventDefault();
      const centavos = parseMoneyToCents(valor.value);
      if (!(centavos > 0)) return toast('Informe um valor maior que zero, como 150,00.', 'erro');
      if (!categoria.value) return toast('Cadastre uma categoria desse tipo antes de lançar.', 'erro');
      const dados = { descricao: descricao.value, valor_centavos: centavos, categoria_id: Number(categoria.value), data: data.value, status: status.value };
      try {
        if (lancamento) await api.patch(`/lancamentos/${lancamento.id}`, dados);
        else await api.post('/lancamentos', dados);
        toast('Lançamento salvo.');
        fechar();
        aoSalvar();
      } catch (error) {
        showError(error);
      }
    },
  },
    h('div', { class: 'form-row' }, field('Tipo', tipo), field('Categoria', categoria)),
    field('Descrição', descricao),
    h('div', { class: 'form-row' }, field('Valor (R$)', valor), field('Data', data)),
    field('Situação', status),
    h('div', { class: 'form-actions' }, h('button', { type: 'submit', class: 'btn' }, 'Salvar')),
  );
  const fechar = openModal(lancamento ? 'Editar lançamento' : 'Novo lançamento', form);
}
