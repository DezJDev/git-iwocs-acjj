// Champion data structure
export interface Champion {
  championname: string;
  role: string;
  genre: string;
  espece: string;
  ressource: string;
  range: string;
  regions: string;
  releasedate: string;
  iconurl: string;
}

// API response for random champion
export interface RandomChampionResponse {
  championId: string;
  answer: Champion;
}
