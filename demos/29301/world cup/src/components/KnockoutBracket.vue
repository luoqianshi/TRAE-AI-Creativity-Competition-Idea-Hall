<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-2xl font-bold text-world-cup-blue mb-6">淘汰赛预测</h2>
    
    <div class="mb-4 flex items-center gap-4">
      <span class="text-gray-600">当前轮次:</span>
      <select v-model="currentRound" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-world-cup-blue">
        <option v-for="round in rounds" :key="round.key" :value="round.key">{{ round.label }}</option>
      </select>
      <button
        @click="predictRound"
        :disabled="isPredicting"
        class="px-6 py-2 bg-world-cup-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isPredicting ? '预测中...' : '预测本轮' }}
      </button>
    </div>

    <div v-if="currentMatches.length > 0" class="space-y-4">
      <div
        v-for="match in currentMatches"
        :key="match.match"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-center justify-center gap-6">
          <div class="flex-1 text-center">
            <div class="font-bold text-lg" :class="getTeamClass(match.teams[0])">{{ match.teams[0] }}</div>
            <div v-if="teamStats[match.teams[0]]" class="text-sm text-gray-500 mt-1">
              排名: {{ teamStats[match.teams[0]].rank }} | 冠军: {{ teamStats[match.teams[0]].worldCupTitles }}次
            </div>
          </div>
          <div class="text-center">
            <div v-if="match.winner" class="text-2xl font-bold text-world-cup-gold">
              {{ match.score }}
            </div>
            <div v-else class="text-2xl font-bold text-gray-400">VS</div>
          </div>
          <div class="flex-1 text-center">
            <div class="font-bold text-lg" :class="getTeamClass(match.teams[1])">{{ match.teams[1] }}</div>
            <div v-if="teamStats[match.teams[1]]" class="text-sm text-gray-500 mt-1">
              排名: {{ teamStats[match.teams[1]].rank }} | 冠军: {{ teamStats[match.teams[1]].worldCupTitles }}次
            </div>
          </div>
        </div>
        
        <div v-if="match.winner && match.reason" class="mt-4 p-3 bg-blue-50 rounded-lg">
          <div class="font-medium text-world-cup-blue mb-1">预测依据:</div>
          <p class="text-sm text-gray-600">{{ match.reason }}</p>
        </div>
      </div>
    </div>

    <div v-if="predictionHistory.length > 0" class="mt-6">
      <h3 class="font-semibold text-gray-700 mb-3">预测记录</h3>
      <div class="space-y-2">
        <div
          v-for="(record, index) in predictionHistory"
          :key="index"
          class="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2"
        >
          <span class="text-gray-700">{{ record.round }}</span>
          <span class="text-world-cup-blue font-medium">{{ record.winners.length }} 支球队晋级</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { teamStats } from '../data/worldCupData';
const rounds = [
 { key: 'roundOf16', label: '1/8决赛' },
 { key: 'quarterfinals', label: '1/4决赛' },
 { key: 'semifinals', label: '半决赛' },
 { key: 'final', label: '决赛' },
 { key: 'thirdPlace', label: '三四名决赛' }
];
const currentRound = ref('roundOf16');
const isPredicting = ref(false);
const predictionHistory = ref([]);
const bracket = ref({
 roundOf16: [
 { match: 1, teams: ['荷兰', '美国'], winner: null, score: null, reason: null },
 { match: 2, teams: ['阿根廷', '澳大利亚'], winner: null, score: null, reason: null },
 { match: 3, teams: ['法国', '波兰'], winner: null, score: null, reason: null },
 { match: 4, teams: ['英格兰', '塞内加尔'], winner: null, score: null, reason: null },
 { match: 5, teams: ['日本', '克罗地亚'], winner: null, score: null, reason: null },
 { match: 6, teams: ['巴西', '韩国'], winner: null, score: null, reason: null },
 { match: 7, teams: ['摩洛哥', '西班牙'], winner: null, score: null, reason: null },
 { match: 8, teams: ['葡萄牙', '瑞士'], winner: null, score: null, reason: null }
 ],
 quarterfinals: [
 { match: 9, teams: [null, null], winner: null, score: null, reason: null },
 { match: 10, teams: [null, null], winner: null, score: null, reason: null },
 { match: 11, teams: [null, null], winner: null, score: null, reason: null },
 { match: 12, teams: [null, null], winner: null, score: null, reason: null }
 ],
 semifinals: [
 { match: 13, teams: [null, null], winner: null, score: null, reason: null },
 { match: 14, teams: [null, null], winner: null, score: null, reason: null }
 ],
 final: [
 { match: 15, teams: [null, null], winner: null, score: null, reason: null }
 ],
 thirdPlace: [
 { match: 16, teams: [null, null], winner: null, score: null, reason: null }
 ]
});
const currentMatches = computed(() => bracket.value[currentRound.value]);
const predictMatch = (team1, team2) => {
 const stats1 = teamStats[team1];
 const stats2 = teamStats[team2];
 let score1 = Math.floor(Math.random() * 3) + (stats1.worldCupTitles * 0.5);
 let score2 = Math.floor(Math.random() * 3) + (stats2.worldCupTitles * 0.5);
 const rankDiff = stats1.rank - stats2.rank;
 if (rankDiff < 0) {
 score1 += Math.abs(rankDiff) * 0.1;
 }
 else {
 score2 += rankDiff * 0.1;
 }
 score1 = Math.round(score1);
 score2 = Math.round(score2);
 if (score1 === score2) {
 if (stats1.rank < stats2.rank) {
 score1++;
 }
 else {
 score2++;
 }
 }
 const winner = score1 > score2 ? team1 : team2;
 const loser = score1 > score2 ? team2 : team1;
 let reason = `【${winner}】晋级理由：`;
 if (stats1.worldCupTitles > stats2.worldCupTitles) {
 reason += `历史底蕴更深厚（${stats1.worldCupTitles}次冠军 vs ${stats2.worldCupTitles}次）；`;
 }
 if (stats1.rank < stats2.rank) {
 reason += `国际排名更高（第${stats1.rank}位 vs 第${stats2.rank}位）；`;
 }
 reason += `关键球员：${stats1.keyPlayers.slice(0, 2).join('、')}状态正佳。`;
 return { winner, score: `${score1}-${score2}`, reason };
};
const predictRound = async () => {
 isPredicting.value = true;
 await new Promise(resolve => setTimeout(resolve, 1500));
 const round = currentRound.value;
 const matches = bracket.value[round];
 const winners = [];
 matches.forEach((match, index) => {
 if (!match.winner && match.teams[0] && match.teams[1]) {
 const result = predictMatch(match.teams[0], match.teams[1]);
 match.winner = result.winner;
 match.score = result.score;
 match.reason = result.reason;
 winners.push(result.winner);
 }
 });
 if (round === 'roundOf16') {
 bracket.value.quarterfinals[0].teams = [bracket.value.roundOf16[0].winner, bracket.value.roundOf16[1].winner];
 bracket.value.quarterfinals[1].teams = [bracket.value.roundOf16[2].winner, bracket.value.roundOf16[3].winner];
 bracket.value.quarterfinals[2].teams = [bracket.value.roundOf16[4].winner, bracket.value.roundOf16[5].winner];
 bracket.value.quarterfinals[3].teams = [bracket.value.roundOf16[6].winner, bracket.value.roundOf16[7].winner];
 }
 else if (round === 'quarterfinals') {
 bracket.value.semifinals[0].teams = [bracket.value.quarterfinals[0].winner, bracket.value.quarterfinals[1].winner];
 bracket.value.semifinals[1].teams = [bracket.value.quarterfinals[2].winner, bracket.value.quarterfinals[3].winner];
 }
 else if (round === 'semifinals') {
 bracket.value.final[0].teams = [bracket.value.semifinals[0].winner, bracket.value.semifinals[1].winner];
 bracket.value.thirdPlace[0].teams = [
 bracket.value.semifinals[0].winner !== bracket.value.final[0].teams[0] ? bracket.value.semifinals[0].winner : bracket.value.semifinals[1].winner,
 bracket.value.semifinals[1].winner !== bracket.value.final[0].teams[0] ? bracket.value.semifinals[1].winner : bracket.value.semifinals[0].winner
 ];
 }
 predictionHistory.value.push({
 round: rounds.find(r => r.key === round).label,
 winners
 });
 isPredicting.value = false;
};
const getTeamClass = (teamName) => {
 const stats = teamStats[teamName];
 if (!stats)
 return 'text-gray-700';
 if (stats.worldCupTitles >= 2)
 return 'text-world-cup-gold';
 if (stats.rank <= 10)
 return 'text-world-cup-blue';
 return 'text-gray-700';
};
</script>
