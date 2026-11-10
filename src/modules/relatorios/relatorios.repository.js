export class RelatoriosRepository {
  constructor(db) {
    this.db = db;
  }

  totaisPorTipoEStatus(mes) {
    return this.db
      .prepare(
        `SELECT tipo, status, SUM(valor_centavos) AS total, COUNT(*) AS quantidade
           FROM lancamentos
          WHERE substr(data, 1, 7) = ?
          GROUP BY tipo, status`,
      )
      .all(mes);
  }

  totaisPorCategoria(mes, tipo) {
    return this.db
      .prepare(
        `SELECT c.id AS categoria_id, c.nome AS categoria, SUM(l.valor_centavos) AS total, COUNT(*) AS quantidade
           FROM lancamentos l
           JOIN categorias c ON c.id = l.categoria_id
          WHERE substr(l.data, 1, 7) = ? AND l.tipo = ?
          GROUP BY c.id
          ORDER BY total DESC, c.nome`,
      )
      .all(mes, tipo);
  }

  totaisPorMes(mesInicial, mesFinal) {
    return this.db
      .prepare(
        `SELECT substr(data, 1, 7) AS mes, tipo, SUM(valor_centavos) AS total
           FROM lancamentos
          WHERE substr(data, 1, 7) BETWEEN ? AND ?
          GROUP BY mes, tipo`,
      )
      .all(mesInicial, mesFinal);
  }
}
