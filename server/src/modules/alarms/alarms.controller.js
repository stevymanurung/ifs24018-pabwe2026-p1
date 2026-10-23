export const createAlarmController = (service) => ({
  list: (_req, res) => res.json(service.list()),
  create: (req, res) => res.status(201).json(service.create(req.body)),
  update: (req, res) => res.json(service.setEnabled(req.params.id, req.body.enabled)),
  remove: (req, res) => {
    service.remove(req.params.id);
    res.sendStatus(204);
  },
});
