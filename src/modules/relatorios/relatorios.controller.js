export class RelatoriosController {
  constructor(service) {
    this.service = service;
  }

  resumo = (req, res) => {
    res.json(this.service.resumo(req.valid.query.mes));
  };

  porCategoria = (req, res) => {
    const { mes, tipo } = req.valid.query;
    res.json(this.service.porCategoria(mes, tipo));
  };

  fluxo = (req, res) => {
    const { mes, meses } = req.valid.query;
    res.json(this.service.fluxo(mes, meses));
  };
}
