import { addMonths, currentMonth } from '../../utils/months.js';

export class RelatoriosService {
  constructor({ repository, clock }) {
    this.repository = repository;
    this.clock = clock;
  }

  /** Realizado = lançamentos pagos. Previsto = pagos + pendentes. */
  resumo(mes = currentMonth(this.clock())) {
    const resultado = {
      mes,
      receitas: { pago: 0, pendente: 0, total: 0 },
      despesas: { pago: 0, pendente: 0, total: 0 },
    };

    for (const linha of this.repository.totaisPorTipoEStatus(mes)) {
      const bloco = linha.tipo === 'RECEITA' ? resultado.receitas : resultado.despesas;
      bloco[linha.status === 'PAGO' ? 'pago' : 'pendente'] += linha.total;
      bloco.total += linha.total;
    }

    return {
      ...resultado,
      saldo: {
        realizado: resultado.receitas.pago - resultado.despesas.pago,
        previsto: resultado.receitas.total - resultado.despesas.total,
      },
    };
  }

  porCategoria(mes = currentMonth(this.clock()), tipo = 'DESPESA') {
    const linhas = this.repository.totaisPorCategoria(mes, tipo);
    const total = linhas.reduce((soma, l) => soma + l.total, 0);

    return {
      mes,
      tipo,
      total,
      categorias: linhas.map((l) => ({ ...l, percentual: total ? Math.round((l.total / total) * 1000) / 10 : 0 })),
    };
  }

  /** Receitas e despesas (todos os status) dos últimos N meses até o mês informado. */
  fluxo(mesFinal = currentMonth(this.clock()), meses = 6) {
    const mesInicial = addMonths(mesFinal, -(meses - 1));
    const porMes = new Map();
    for (let i = 0; i < meses; i += 1) {
      porMes.set(addMonths(mesInicial, i), { mes: addMonths(mesInicial, i), receitas: 0, despesas: 0, saldo: 0 });
    }

    for (const linha of this.repository.totaisPorMes(mesInicial, mesFinal)) {
      const item = porMes.get(linha.mes);
      item[linha.tipo === 'RECEITA' ? 'receitas' : 'despesas'] = linha.total;
    }
    for (const item of porMes.values()) item.saldo = item.receitas - item.despesas;

    return { meses: [...porMes.values()] };
  }
}
