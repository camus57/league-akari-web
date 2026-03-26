<template>
  <div class="min-h-screen bg-dark-100 text-white">
    <!-- Header -->
    <header class="bg-dark-200 border-b border-dark-300">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-hextech-100 rounded-lg flex items-center justify-center">
              <span class="text-dark-100 font-bold text-xl">A</span>
            </div>
            <h1 class="text-2xl font-bold">LeagueAkari Web</h1>
          </div>
          <div class="text-sm text-gray-400">英雄联盟战绩查询</div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Search Section -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
          <h2 class="text-xl font-semibold mb-4">查询召唤师</h2>
          
          <!-- Region Select -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">选择赛区</label>
            <select 
              v-model="selectedRegion"
              class="w-full bg-dark-300 border border-dark-300 rounded-lg px-4 py-3 focus:outline-none focus:border-hextech-100"
            >
              <option value="kr">韩国 (KR)</option>
              <option value="jp">日本 (JP)</option>
              <option value="europe">欧洲 (EUW/EUNE/TR)</option>
              <option value="americas">美洲 (NA/BR/LAN/LAS)</option>
              <option value="asia">亚洲 (SG/PH/TW/VN/TH)</option>
            </select>
          </div>

          <!-- Riot ID Input -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">Riot ID (游戏名#标签)</label>
            <input 
              v-model="riotId"
              type="text" 
              placeholder="例如：Faker#KR1"
              class="w-full bg-dark-300 border border-dark-300 rounded-lg px-4 py-3 focus:outline-none focus:border-hextech-100"
              @keyup.enter="searchSummoner"
            />
            <p class="text-xs text-gray-500 mt-1">格式：游戏名#标签 (区分大小写)</p>
          </div>

          <!-- API Key Input -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">Riot API Key</label>
            <input 
              v-model="apiKey"
              type="password" 
              placeholder="输入你的 Riot API Key"
              class="w-full bg-dark-300 border border-dark-300 rounded-lg px-4 py-3 focus:outline-none focus:border-hextech-100"
            />
            <p class="text-xs text-gray-500 mt-1">
              在 <a href="https://developer.riotgames.com/" target="_blank" class="text-hextech-100 hover:underline">Riot Developer Portal</a> 获取
            </p>
          </div>

          <!-- Search Button -->
          <button 
            @click="searchSummoner"
            :disabled="loading"
            class="w-full bg-hextech-100 hover:bg-hextech-200 text-dark-100 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '查询中...' : '查询战绩' }}
          </button>

          <!-- Error Message -->
          <div v-if="error" class="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Summoner Info -->
      <div v-if="summoner" class="max-w-4xl mx-auto mb-8">
        <div class="bg-dark-200 rounded-xl p-6 shadow-lg">
          <div class="flex items-center space-x-6">
            <img 
              :src="`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`"
              :alt="summoner.name"
              class="w-24 h-24 rounded-full border-4 border-hextech-100"
            />
            <div>
              <h2 class="text-2xl font-bold">{{ summoner.gameName }}#{{ summoner.tagLine }}</h2>
              <p class="text-gray-400">召唤师等级：{{ summoner.summonerLevel }}</p>
              <p class="text-gray-400 text-sm">PUUID: {{ summoner.puuid.substring(0, 20) }}...</p>
            </div>
          </div>

          <!-- Ranked Info -->
          <div v-if="rankedInfo && rankedInfo.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="queue in rankedInfo" :key="queue.queueType" class="bg-dark-300 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">{{ getQueueName(queue.queueType) }}</span>
                <span class="text-lg font-bold">{{ getTierName(queue.tier) }} {{ queue.rank }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-400">{{ queue.wins }}胜{{ queue.losses }}负</span>
                <span :class="getWinRateColor(queue.wins, queue.losses)">
                  胜率：{{ calculateWinRate(queue.wins, queue.losses) }}%
                </span>
              </div>
              <div class="mt-2 h-2 bg-dark-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-hextech-100"
                  :style="{ width: calculateWinRate(queue.wins, queue.losses) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Match History -->
      <div v-if="matches && matches.length > 0" class="max-w-4xl mx-auto">
        <h3 class="text-xl font-semibold mb-4">近期比赛</h3>
        <div class="space-y-4">
          <div 
            v-for="match in matches" 
            :key="match.metadata.matchId"
            :class="['bg-dark-200 rounded-xl p-6 shadow-lg', getMatchResultClass(match)]"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <span :class="['px-3 py-1 rounded text-sm font-semibold', getMatchResultBadgeClass(match)]">
                  {{ getMatchResult(match) ? '胜利' : '失败' }}
                </span>
                <span class="text-gray-400">{{ formatMatchDuration(match.info.gameDuration) }}</span>
                <span class="text-gray-500 text-sm">{{ new Date(match.info.gameCreation).toLocaleString('zh-CN') }}</span>
              </div>
              <span class="text-gray-400 text-sm">{{ getQueueName(match.info.queueId) }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Champion & KDA -->
              <div class="flex items-center space-x-3">
                <img 
                  :src="getChampionImage(match)"
                  :alt="getChampionName(match)"
                  class="w-12 h-12 rounded"
                />
                <div>
                  <div class="font-semibold">{{ getChampionName(match) }}</div>
                  <div class="text-sm text-gray-400">
                    {{ getKDA(match) }} 
                    <span class="text-gray-500">KDA</span>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="flex items-center space-x-2">
                <img 
                  v-for="itemId in getPlayerItems(match)" 
                  :key="itemId"
                  :src="`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`"
                  :alt="`Item ${itemId}`"
                  class="w-8 h-8 rounded"
                />
              </div>

              <!-- Stats -->
              <div class="text-sm text-gray-400">
                <div>补刀：{{ getCS(match) }} | 伤害：{{ formatNumber(getDamage(match)) }}</div>
                <div>金币：{{ formatNumber(getGold(match)) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Matches -->
      <div v-if="summoner && (!matches || matches.length === 0)" class="max-w-4xl mx-auto text-center text-gray-400">
        暂无比赛记录
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark-200 border-t border-dark-300 mt-12 py-6">
      <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>LeagueAkari Web 不是 Riot Games 的官方产品</p>
        <p class="mt-1">League of Legends 和 Riot Games 是 Riot Games, Inc. 的商标或注册商标</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  data() {
    return {
      riotId: '',
      apiKey: '',
      selectedRegion: 'kr',
      loading: false,
      error: null,
      summoner: null,
      rankedInfo: null,
      matches: null
    }
  },
  methods: {
    async searchSummoner() {
      if (!this.riotId || !this.apiKey) {
        this.error = '请输入 Riot ID 和 API Key'
        return
      }

      const [gameName, tagLine] = this.riotId.split('#')
      if (!gameName || !tagLine) {
        this.error = 'Riot ID 格式错误，应为：游戏名#标签'
        return
      }

      this.loading = true
      this.error = null
      this.summoner = null
      this.rankedInfo = null
      this.matches = null

      try {
        // Step 1: Get account info by Riot ID
        const accountUrl = `https://${this.selectedRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
        const accountRes = await axios.get(accountUrl, {
          headers: { 'X-Riot-Token': this.apiKey }
        })
        const account = accountRes.data

        // Step 2: Get summoner info by PUUID
        const summonerUrl = `https://${this.selectedRegion === 'americas' || this.selectedRegion === 'europe' || this.selectedRegion === 'asia' ? this.getPlatformForRegion() : this.selectedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
        const summonerRes = await axios.get(summonerUrl, {
          headers: { 'X-Riot-Token': this.apiKey }
        })
        this.summoner = {
          ...summonerRes.data,
          gameName: account.gameName,
          tagLine: account.tagLine
        }

        // Step 3: Get ranked info
        try {
          const rankedUrl = `https://${this.selectedRegion === 'americas' || this.selectedRegion === 'europe' || this.selectedRegion === 'asia' ? this.getPlatformForRegion() : this.selectedRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${this.summoner.id}`
          const rankedRes = await axios.get(rankedUrl, {
            headers: { 'X-Riot-Token': this.apiKey }
          })
          this.rankedInfo = rankedRes.data.filter(q => q.queueType === 'RANKED_SOLO_5x5' || q.queueType === 'RANKED_FLEX_SR')
        } catch (e) {
          console.log('No ranked info')
        }

        // Step 4: Get match history
        const matchIdsUrl = `https://${this.selectedRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${this.summoner.puuid}/ids?start=0&count=10`
        const matchIdsRes = await axios.get(matchIdsUrl, {
          headers: { 'X-Riot-Token': this.apiKey }
        })
        
        // Get match details
        const matchDetails = await Promise.all(
          matchIdsRes.data.slice(0, 5).map(async (matchId) => {
            const matchUrl = `https://${this.selectedRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`
            const matchRes = await axios.get(matchUrl, {
              headers: { 'X-Riot-Token': this.apiKey }
            })
            return matchRes.data
          })
        )
        
        this.matches = matchDetails

      } catch (err) {
        console.error(err)
        if (err.response?.status === 401) {
          this.error = 'API Key 无效'
        } else if (err.response?.status === 404) {
          this.error = '未找到该召唤师'
        } else if (err.response?.status === 429) {
          this.error = '请求过于频繁，请稍后再试'
        } else {
          this.error = `查询失败：${err.message}`
        }
      } finally {
        this.loading = false
      }
    },

    getPlatformForRegion() {
      const mapping = {
        'americas': 'na1',
        'europe': 'euw1',
        'asia': 'sg2'
      }
      return mapping[this.selectedRegion] || 'na1'
    },

    getQueueName(queueType) {
      const names = {
        'RANKED_SOLO_5x5': '单/双排',
        'RANKED_FLEX_SR': '灵活排位',
        '420': '单/双排',
        '440': '灵活排位',
        '430': '匹配模式',
        '450': '大乱斗',
        '1700': '斗魂竞技场'
      }
      return names[queueType] || `模式 ${queueType}`
    },

    getTierName(tier) {
      const names = {
        'IRON': '坚韧黑铁',
        'BRONZE': '英勇黄铜',
        'SILVER': '不屈白银',
        'GOLD': '荣耀黄金',
        'PLATINUM': '华贵铂金',
        'EMERALD': '流光翡翠',
        'DIAMOND': '璀璨钻石',
        'MASTER': '超凡大师',
        'GRANDMASTER': '傲世宗师',
        'CHALLENGER': '最强王者'
      }
      return names[tier] || tier
    },

    calculateWinRate(wins, losses) {
      const total = wins + losses
      if (total === 0) return 0
      return Math.round((wins / total) * 100)
    },

    getWinRateColor(wins, losses) {
      const rate = this.calculateWinRate(wins, losses)
      if (rate >= 60) return 'text-green-400'
      if (rate >= 50) return 'text-yellow-400'
      return 'text-red-400'
    },

    getMatchResult(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      return participant ? participant.win : false
    },

    getMatchResultClass(match) {
      return this.getMatchResult(match) ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
    },

    getMatchResultBadgeClass(match) {
      return this.getMatchResult(match) ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
    },

    formatMatchDuration(seconds) {
      const mins = Math.floor(seconds / 60)
      return `${mins}分钟`
    },

    getKDA(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return '0/0/0'
      return `${participant.kills}/${participant.deaths}/${participant.assists}`
    },

    getChampionName(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      return participant ? this.getChampionNameById(participant.championId) : 'Unknown'
    },

    getChampionNameById(id) {
      // Simple mapping - in production, fetch from data dragon
      const champions = {
        1: '安妮', 2: '奥利安娜', 3: '加里奥', 4: '崔斯特', 5: ' Xin Zhao',
        103: '阿狸', 157: '亚索', 238: '劫', 555: '派克', 777: '永恩',
        236: '卢锡安', 222: '金克丝', 67: '薇恩', 81: '伊泽瑞尔', 51: '凯特琳'
      }
      return champions[id] || `英雄${id}`
    },

    getChampionImage(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return ''
      return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${this.getChampionNameById(participant.championId)}.png`
    },

    getPlayerItems(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return []
      return [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5
      ].filter(i => i !== 0)
    },

    getCS(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return 0
      return participant.totalMinionsKilled + participant.neutralMinionsKilled
    },

    getDamage(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return 0
      return participant.totalDamageDealtToChampions
    },

    getGold(match) {
      const participant = match.info.participants.find(p => p.puuid === this.summoner.puuid)
      if (!participant) return 0
      return participant.goldEarned
    },

    formatNumber(num) {
      if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
      return num.toString()
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a2e;
}

::-webkit-scrollbar-thumb {
  background: #0a7a73;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0a9c92;
}
</style>
