const SELECT_BASE = `
  SELECT l.*, c.nome AS categoria_nome
    FROM lancamentos l
    JOIN categorias c ON c.id = l.categoria_id`;

export class LancamentosRepository {
  constructor(db) {
    this.db = db;
  }

  listar({ mes, tipo, status, categoriaId, q } = {}) {
    const filtros = [];
    const valores = [];
    if (mes) {
      filtros.push('substr(l.data, 1, 7) = ?');
      valores.push(mes);
    }
    if (tipo) {
      filtros.push('l.tipo = ?');
      valores.push(tipo);
    }
    if (status) {
      filtros.push('l.status = ?');
      valores.push(status);
    }
    if (categoriaId) {
      filtros.push('l.categoria_id = ?');
      valores.push(categoriaId);
    }
    if (q) {
      filtros.push('l.descricao LIKE ?');
      valores.push(`%${q}%`);
    }
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    return this.db.prepare(`${SELECT_BASE} ${where} ORDER BY l.data DESC, l.id DESC`).all(...valores);
  }

  buscarPorId(id) {
    return this.db.prepare(`${SELECT_BASE} WHERE l.id = ?`).get(id);
  }

  criar({ descricao, valor_centavos, tipo, categoria_id, data, status }) {
    const result = this.db
      .prepare(
        `INSERT INTO lancamentos (descricao, valor_centavos, tipo, categoria_id, data, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(descricao, valor_centavos, tipo, categoria_id, data, status);
    return Number(result.lastInsertRowid);
  }

  atualizar(id, { descricao, valor_centavos, tipo, categoria_id, data, status }) {
    this.db
      .prepare(
        `UPDATE lancamentos
            SET descricao = ?, valor_centavos = ?, tipo = ?, categoria_id = ?, data = ?, status = ?
          WHERE id = ?`,
      )
      .run(descricao, valor_centavos, tipo, categoria_id, data, status, id);
  }

  remover(id) {
    this.db.prepare('DELETE FROM lancamentos WHERE id = ?').run(id);
  }
}
