/** Controller tipis: menerjemahkan HTTP <-> pemanggilan service. */
export const createSessionController = (service) => ({
  list: (_req, res) => res.json(service.list()),
  create: (req, res) => res.status(201).json(service.create(req.body)),
  remove: (req, res) => {
    service.remove(req.params.id);
    res.sendStatus(204);
  },
});
