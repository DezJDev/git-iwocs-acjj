import express, { Request, Response } from 'express';
import Champion from '../models/Champion';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { serializeChampion } from '../utils/serializer';

const router = express.Router();

/**
 * GET /api/champions/random
 * Get a random champion for a new game
 */
router.get('/random', async (_req: Request, res: Response) => {
  try {
    // Get a random champion using Sequelize
    const champion = await Champion.findOne({
      order: sequelize.random()
    });

    if (!champion) {
      return res.status(404).json({ error: 'No champions found' });
    }

    // Return champion data
    res.json({
      championId: champion.championName,
      // For simplicity, we send the answer to client
      // In production, you might want to store this server-side with sessions
      answer: serializeChampion(champion)
    });
  } catch (error: any) {
    console.error('Error fetching random champion:', error);
    res.status(500).json({ error: 'Failed to fetch random champion' });
  }
});

/**
 * GET /api/champions/all
 * Get all champion names for autocomplete
 */
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const champions = await Champion.findAll({
      attributes: ['championName'],
      order: [['championName', 'ASC']]
    });

    const championNames = champions.map(c => c.championName);
    res.json(championNames);
  } catch (error: any) {
    console.error('Error fetching champion names:', error);
    res.status(500).json({ error: 'Failed to fetch champion names' });
  }
});

/**
 * POST /api/champions/guess
 * Validate a guess and return matching attributes
 */
router.post('/guess', async (req: Request, res: Response) => {
  try {
    const { guess } = req.body;

    if (!guess) {
      return res.status(400).json({ error: 'Guess is required' });
    }

    // Find champion by name (case-insensitive)
    const champion = await Champion.findOne({
      where: {
        championName: {
          [Op.iLike]: guess // Case-insensitive search
        }
      }
    });

    if (!champion) {
      return res.status(404).json({ error: 'Champion not found' });
    }

    // Return the champion data so frontend can compare
    res.json(serializeChampion(champion));
  } catch (error: any) {
    console.error('Error processing guess:', error);
    res.status(500).json({ error: 'Failed to process guess' });
  }
});

/**
 * GET /api/champions/:name
 * Get specific champion data by name
 */
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    const champion = await Champion.findOne({
      where: {
        championName: {
          [Op.iLike]: name
        }
      }
    });

    if (!champion) {
      return res.status(404).json({ error: 'Champion not found' });
    }

    res.json(serializeChampion(champion));
  } catch (error: any) {
    console.error('Error fetching champion:', error);
    res.status(500).json({ error: 'Failed to fetch champion' });
  }
});

export default router;
