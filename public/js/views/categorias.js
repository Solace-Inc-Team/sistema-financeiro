import { api } from '../api.js';
import { clear, emptyState, h, showError, toast } from '../dom.js';

export async function renderCategorias(container) {
  const corpo = h('div', { class: 'dois-col' });

  async function carregar() {
    const categorias = await api.get('/categorias');
    clear(corpo).append(
      painel('Despesas', 'DESPESA', categorias.filter((c) => c.tipo === 'DESPESA')),
      painel('Receitas', 'RECEITA', categorias.filter((c) => c.tipo === 'RECEITA')),
    );
  }

  async function tentar(acao, mensagem) {
    try {
      await acao();
      toast(mensagem);
      carregar();
    } catch (error) {
      showError(error);
    }
  }

  function painel(titulo, tipo, itens) {
    const nome = h('input', { required: true, minLength: 2, maxLength: 60, placeholder: `Nova categoria de ${titulo.toLowerCase()}`, 'aria-label': `Nome da nova categoria de ${titulo.toLowerCase()}` });
    return h('section', { class: 'panel' }, h('h2', {}, titulo),
      h('form', { class: 'inline-form', onSubmit: (e) => { e.preventDefault(); tentar(() => api.post('/categorias', { nome: nome.value, tipo }), 'Categoria criada.'); } },
        nome, h('button', { type: 'submit', class: 'btn' }, 'Adicionar')),
      itens.length === 0 ? emptyState('Nenhuma categoria ainda') : h('ul', { class: 'lista-simples' }, itens.map((c) =>
        h('li', {},
          h('span', {}, c.nome, h('small', { class: 'muted' }, ` · ${c.lancamentos} lançamento(s)`)),
          h('span', {},
            h('button', { class: 'btn btn-ghost btn-sm', onClick: () => { const novo = prompt('Novo nome da categoria:', c.nome); if (novo?.trim()) tentar(() => api.patch(`/categorias/${c.id}`, { nome: novo.trim() }), 'Categoria renomeada.'); } }, 'Renomear'),
            ' ',
            h('button', { class: 'btn btn-danger btn-sm', onClick: () => { if (confirm(`Excluir a categoria “${c.nome}”?`)) tentar(() => api.delete(`/categorias/${c.id}`), 'Categoria excluída.'); } }, 'Excluir'))))),
    );
  }

  container.append(h('h1', {}, 'Categorias'), corpo);
  await carregar();
}
