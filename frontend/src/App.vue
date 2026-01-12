<template>
  <div id="app">
    <header class="header">
      <h1>LODLE</h1>
      <p>Guess the League of Legends Champion!</p>
    </header>

    <div v-if="loading" class="loading">
      Loading game...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="game-container">
      <!-- Stats and Controls -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ guesses.length }}</div>
          <div class="stat-label">Guesses</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ gamesPlayed }}</div>
          <div class="stat-label">Games Played</div>
        </div>
      </div>

      <!-- Search Input -->
      <div v-if="!gameWon" class="search-container">
        <input
          v-model="searchQuery"
          @input="filterChampions"
          @keydown.enter="makeGuess"
          type="text"
          class="search-input"
          placeholder="Type a champion name..."
          :disabled="gameWon"
        />

        <!-- Autocomplete dropdown -->
        <div v-if="filteredChampions.length > 0 && searchQuery" class="autocomplete-list">
          <div
            v-for="champion in filteredChampions"
            :key="champion"
            @click="selectChampion(champion)"
            class="autocomplete-item"
          >
            {{ champion }}
          </div>
        </div>
      </div>

      <!-- Victory Message -->
      <div v-if="gameWon" class="victory-message">
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You found {{ targetChampion?.championname }} in {{ guesses.length }} guesses!</p>
        <button @click="startNewGame" class="new-game-btn">
          Play Again
        </button>
      </div>

      <!-- Guesses Table -->
      <div v-if="guesses.length > 0" class="guesses-container">
        <table class="guess-table">
          <thead>
            <tr>
              <th>Champion</th>
              <th>Role</th>
              <th>Gender</th>
              <th>Species</th>
              <th>Resource</th>
              <th>Range</th>
              <th>Region</th>
              <th>Release Year</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(guess, index) in guesses" :key="index" class="guess-row">
              <td>
                <img :src="guess.iconurl" :alt="guess.championname" class="champion-icon" />
                <div>{{ guess.championname }}</div>
              </td>
              <td :class="getCellClass('role', guess)">
                {{ guess.role }}
              </td>
              <td :class="getCellClass('genre', guess)">
                {{ guess.genre }}
              </td>
              <td :class="getCellClass('espece', guess)">
                {{ guess.espece }}
              </td>
              <td :class="getCellClass('ressource', guess)">
                {{ guess.ressource }}
              </td>
              <td :class="getCellClass('range', guess)">
                {{ guess.range }}
              </td>
              <td :class="getCellClass('regions', guess)">
                {{ guess.regions }}
              </td>
              <td :class="getYearClass(guess)">
                {{ getReleaseYear(guess.releasedate) }}
                {{ getYearArrow(guess.releasedate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import type { Champion, RandomChampionResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// State
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const searchQuery = ref<string>('');
const allChampions = ref<string[]>([]);
const filteredChampions = ref<string[]>([]);
const targetChampion = ref<Champion | null>(null);
const guesses = ref<Champion[]>([]);
const gameWon = ref<boolean>(false);
const gamesPlayed = ref<number>(0);

// Methods
async function loadChampions(): Promise<void> {
  try {
    const response = await axios.get<string[]>(`${API_URL}/api/champions/all`);
    allChampions.value = response.data;
  } catch (err: any) {
    error.value = 'Failed to load champions. Please check if the backend is running.';
    console.error(err);
  }
}

async function startNewGame(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get<RandomChampionResponse>(`${API_URL}/api/champions/random`);
    targetChampion.value = response.data.answer;
    guesses.value = [];
    gameWon.value = false;
    searchQuery.value = '';
  } catch (err: any) {
    error.value = 'Failed to start new game. Please try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function filterChampions(): void {
  if (!searchQuery.value) {
    filteredChampions.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredChampions.value = allChampions.value
    .filter(champion => champion.toLowerCase().includes(query))
    .slice(0, 10); // Limit to 10 suggestions
}

function selectChampion(championName: string): void {
  searchQuery.value = championName;
  filteredChampions.value = [];
  makeGuess();
}

async function makeGuess(): Promise<void> {
  if (!searchQuery.value.trim()) return;

  // Check if champion exists
  const championName = searchQuery.value.trim();
  const exists = allChampions.value.some(
    c => c.toLowerCase() === championName.toLowerCase()
  );

  if (!exists) {
    alert('Please select a valid champion name from the list.');
    return;
  }

  // Check if already guessed
  const alreadyGuessed = guesses.value.some(
    g => g.championname.toLowerCase() === championName.toLowerCase()
  );

  if (alreadyGuessed) {
    alert('You already guessed this champion!');
    return;
  }

  try {
    // Fetch champion data
    const response = await axios.post<Champion>(`${API_URL}/api/champions/guess`, {
      guess: championName
    });

    const guessData = response.data;
    guesses.value.unshift(guessData); // Add to beginning of array

    // Check if won
    if (targetChampion.value && guessData.championname.toLowerCase() === targetChampion.value.championname.toLowerCase()) {
      gameWon.value = true;
      gamesPlayed.value++;
      saveStats();
    }

    searchQuery.value = '';
    filteredChampions.value = [];
  } catch (err: any) {
    error.value = 'Failed to process guess. Please try again.';
    console.error(err);
  }
}

function getCellClass(attribute: keyof Champion, guess: Champion): string {
  if (!targetChampion.value) return '';

  const guessValue = guess[attribute]?.toString().toLowerCase();
  const targetValue = targetChampion.value[attribute]?.toString().toLowerCase();

  if (guessValue === targetValue) {
    return 'cell-correct';
  }

  // Check for partial matches in regions (could contain multiple)
  if (attribute === 'regions' && guessValue && targetValue) {
    if (guessValue.includes(targetValue) || targetValue.includes(guessValue)) {
      return 'cell-partial';
    }
  }

  return 'cell-incorrect';
}

function getYearClass(guess: Champion): string {
  if (!targetChampion.value) return '';

  const guessYear = new Date(guess.releasedate).getFullYear();
  const targetYear = new Date(targetChampion.value.releasedate).getFullYear();

  if (guessYear === targetYear) {
    return 'cell-correct';
  }

  return 'cell-incorrect';
}

function getYearArrow(releaseDate: string): string {
  if (!targetChampion.value) return '';

  const guessYear = new Date(releaseDate).getFullYear();
  const targetYear = new Date(targetChampion.value.releasedate).getFullYear();

  if (guessYear === targetYear) return '';
  if (guessYear < targetYear) return '⬆️';
  return '⬇️';
}

function getReleaseYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

function loadStats(): void {
  const stats = localStorage.getItem('lodleStats');
  if (stats) {
    const parsed = JSON.parse(stats);
    gamesPlayed.value = parsed.gamesPlayed || 0;
  }
}

function saveStats(): void {
  localStorage.setItem('lodleStats', JSON.stringify({
    gamesPlayed: gamesPlayed.value
  }));
}

// Lifecycle
onMounted(async () => {
  await loadChampions();
  await startNewGame();
  loadStats();
});
</script>
