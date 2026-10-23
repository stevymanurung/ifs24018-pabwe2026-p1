/** Controller tipis: menerjemahkan HTTP <-> pemanggilan service. */
export const createSessionController = (service) => ({
  list: (req, res) => res.json(service.list(req.user.id)),
  create: (req, res) => res.status(201).json(service.create(req.body, req.user.id)),
  remove: (req, res) => {
    service.remove(req.params.id, req.user.id);
    res.sendStatus(204);
  },
});
