export const createSettingsController = (service) => ({
  get: (_req, res) => res.json(service.get()),
  update: (req, res) => res.json(service.update(req.body)),
});
