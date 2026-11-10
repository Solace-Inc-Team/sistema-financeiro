import { AppError } from '../../utils/AppError.js';

export class LancamentosService {
  constructor({ repository, categoriasService }) {
    this.repository = repository;
    this.categorias = categoriasService;
  }

  listar(filtros) {
    return this.repository.listar({
      mes: filtros.mes,
      tipo: filtros.tipo,
      status: filtros.status,
      categoriaId: filtros.categoria_id,
      q: filtros.q,
    });
  }

  obter(id) {
    const lancamento = this.repository.buscarPorId(id);
    if (!lancamento) throw AppError.notFound('Lançamento não encontrado.');
    return lancamento;
  }

  /** O tipo (receita/despesa) é sempre o da categoria escolhida. */
  criar(dados) {
    const categoria = this.categorias.obter(dados.categoria_id);
    const id = this.repository.criar({ ...dados, tipo: categoria.tipo });
    return this.obter(id);
  }

  atualizar(id, alteracoes) {
    const atual = this.obter(id);
    const categoriaId = alteracoes.categoria_id ?? atual.categoria_id;
    const categoria = this.categorias.obter(categoriaId);

    this.repository.atualizar(id, {
      descricao: alteracoes.descricao ?? atual.descricao,
      valor_centavos: alteracoes.valor_centavos ?? atual.valor_centavos,
      tipo: categoria.tipo,
      categoria_id: categoriaId,
      data: alteracoes.data ?? atual.data,
      status: alteracoes.status ?? atual.status,
    });
    return this.obter(id);
  }

  alterarStatus(id, status) {
    return this.atualizar(id, { status });
  }

  remover(id) {
    this.obter(id);
    this.repository.remover(id);
  }
}
