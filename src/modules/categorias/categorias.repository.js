export class CategoriasRepository {
  constructor(db) {
    this.db = db;
  }

  listar({ tipo } = {}) {
    const where = tipo ? 'WHERE c.tipo = ?' : '';
    return this.db
      .prepare(
        `SELECT c.id, c.nome, c.tipo, COUNT(l.id) AS lancamentos
           FROM categorias c
           LEFT JOIN lancamentos l ON l.categoria_id = c.id
           ${where}
          GROUP BY c.id
          ORDER BY c.tipo, c.nome`,
      )
      .all(...(tipo ? [tipo] : []));
  }

  buscarPorId(id) {
    return this.db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
  }

  buscarPorNomeETipo(nome, tipo) {
    return this.db.prepare('SELECT * FROM categorias WHERE nome = ? AND tipo = ?').get(nome, tipo);
  }

  criar({ nome, tipo }) {
    const result = this.db.prepare('INSERT INTO categorias (nome, tipo) VALUES (?, ?)').run(nome, tipo);
    return Number(result.lastInsertRowid);
  }

  renomear(id, nome) {
    this.db.prepare('UPDATE categorias SET nome = ? WHERE id = ?').run(nome, id);
  }

  contarLancamentos(id) {
    return this.db.prepare('SELECT COUNT(*) AS total FROM lancamentos WHERE categoria_id = ?').get(id).total;
  }

  remover(id) {
    this.db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
  }
}
