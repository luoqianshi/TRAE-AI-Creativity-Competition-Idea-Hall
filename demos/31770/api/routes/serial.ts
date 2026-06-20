import express from 'express';
import { serialService } from '../services/serialService';
import { ConnectConfig } from '../../shared/types';

const router = express.Router();

router.get('/ports', async (req, res) => {
  try {
    const ports = await serialService.listPorts();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list ports' });
  }
});

router.post('/connect', async (req, res) => {
  try {
    const config: ConnectConfig = req.body;
    if (!config.path || !config.baudRate) {
      return res.status(400).json({ error: 'Path and baudRate are required' });
    }
    const state = await serialService.connect(config);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect' });
  }
});

router.post('/disconnect', (req, res) => {
  try {
    const state = serialService.disconnect();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

router.get('/state', (req, res) => {
  try {
    const state = serialService.getConnectionState();
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get state' });
  }
});

router.get('/data', (req, res) => {
  try {
    const data = serialService.getRecentData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get data' });
  }
});

export default router;
