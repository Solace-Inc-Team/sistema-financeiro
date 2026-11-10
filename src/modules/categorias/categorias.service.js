import { AppError } from '../../utils/AppError.js';

export class CategoriasService {
  constructor(repository) {
    this.repository = repository;
  }

  listar(filtros) {
    return this.repository.listar(filtros);
  }

  obter(id) {
    const categoria = this.repository.buscarPorId(id);
    if (!categoria) throw AppError.notFound('Categoria não encontrada.');
    return categoria;
  }

  criar({ nome, tipo }) {
    this.#garantirNomeLivre(nome, tipo);
    return this.obter(this.repository.criar({ nome, tipo }));
  }

  renomear(id, { nome }) {
    const atual = this.obter(id);
    if (nome !== atual.nome) this.#garantirNomeLivre(nome, atual.tipo);
    this.repository.renomear(id, nome);
    return this.obter(id);
  }

  remover(id) {
    this.obter(id);
    if (this.repository.contarLancamentos(id) > 0) {
      throw AppError.conflict('Esta categoria já possui lançamentos e não pode ser excluída.');
    }
    this.repository.remover(id);
  }

  #garantirNomeLivre(nome, tipo) {
    if (this.repository.buscarPorNomeETipo(nome, tipo)) {
      throw AppError.conflict(`Já existe uma categoria de ${tipo.toLowerCase()} chamada “${nome}”.`);
    }
  }
}
