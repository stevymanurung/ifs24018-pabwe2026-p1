export const createSettingsController = (service) => ({
  get: (req, res) => res.json(service.get(req.user.id)),
  update: (req, res) => res.json(service.update(req.body, req.user.id)),
});
