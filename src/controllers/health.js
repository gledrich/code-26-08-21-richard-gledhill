module.exports = ({
  readiness: (req, res) => res.status(200).json({ ping: 'pong' }),
  liveness: (req, res) => res.status(200).json({ ping: 'pong' }),
});
