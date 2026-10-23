export const createDashboardController = (service) => ({
  get: (req, res) => res.json(service.build(req.query.now, req.user.id)),
});
