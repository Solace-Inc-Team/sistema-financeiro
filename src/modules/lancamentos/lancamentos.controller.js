export class LancamentosController {
  constructor(service) {
    this.service = service;
  }

  listar = (req, res) => {
    res.json(this.service.listar(req.valid.query));
  };

  obter = (req, res) => {
    res.json(this.service.obter(req.valid.params.id));
  };

  criar = (req, res) => {
    res.status(201).json(this.service.criar(req.valid.body));
  };

  atualizar = (req, res) => {
    res.json(this.service.atualizar(req.valid.params.id, req.valid.body));
  };

  alterarStatus = (req, res) => {
    res.json(this.service.alterarStatus(req.valid.params.id, req.valid.body.status));
  };

  remover = (req, res) => {
    this.service.remover(req.valid.params.id);
    res.status(204).end();
  };
}
