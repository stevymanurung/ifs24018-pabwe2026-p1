export const createTaskController = (service) => ({
  list: (req, res) => res.json(service.list(req.query.status)),
  create: (req, res) => res.status(201).json(service.create(req.body)),
  update: (req, res) => res.json(service.setDone(req.params.id, req.body.done)),
  remove: (req, res) => {
    service.remove(req.params.id);
    res.sendStatus(204);
  },
});
