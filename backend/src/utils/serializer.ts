import { Champion } from '../models/Champion';

/**
 * Serialize Champion model to match frontend expectations
 * Converts camelCase to lowercase field names
 */
export function serializeChampion(champion: Champion) {
  return {
    championname: champion.championName,
    role: champion.role,
    genre: champion.genre,
    espece: champion.espece,
    ressource: champion.ressource,
    range: champion.range,
    regions: champion.regions,
    releasedate: champion.releaseDate,
    iconurl: champion.iconUrl
  };
}
