export class CategoriasController {
  constructor(service) {
    this.service = service;
  }

  listar = (req, res) => {
    res.json(this.service.listar(req.valid.query));
  };

  criar = (req, res) => {
    res.status(201).json(this.service.criar(req.valid.body));
  };

  renomear = (req, res) => {
    res.json(this.service.renomear(req.valid.params.id, req.valid.body));
  };

  remover = (req, res) => {
    this.service.remover(req.valid.params.id);
    res.status(204).end();
  };
}
