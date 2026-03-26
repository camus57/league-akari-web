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
          
          <!-- Region Type Select -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">选择服务器类型</label>
            <div class="flex space-x-4">
              <button
                @click="serverType = 'cn'"
                :class="['flex-1 py-3 px-4 rounded-lg font-semibold transition-colors', 
                  serverType === 'cn' ? 'bg-hextech-100 text-dark-100' : 'bg-dark-300 text-gray-400 hover:bg-dark-200']"
              >
                🇨🇳 国服
              </button>
              <button
                @click="serverType = 'intl'"
                :class="['flex-1 py-3 px-4 rounded-lg font-semibold transition-colors', 
                  serverType === 'intl' ? 'bg-hextech-100 text-dark-100' : 'bg-dark-300 text-gray-400 hover:bg-dark-200']"
              >
                🌏 国际服
              </button>
            </div>
          </div>

          <!-- CN Server Select -->
          <div v-if="serverType === 'cn'" class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">选择大区</label>
            <select 
              v-model="selectedCnServer"
              class="w-full bg-dark-300 border border-dark-300 rounded-lg px-4 py-3 focus:outline-none focus:border-hextech-100"
            >
              <option v-for="server in cnServers" :key="server.id" :value="server.id">
                {{ server.name }}
              </option>
            </select>
          </div>

          <!-- Summoner Name Input -->
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">
              {{ serverType === 'cn' ? '召唤师名称' : 'Riot ID (游戏名#标签)' }}
            </label>
            <input 
              v-model="summonerName"
              type="text" 
              :placeholder="serverType === 'cn' ? '例如：TheShy' : '例如：Faker#KR1'"
              class="w-full bg-dark-300 border border-dark-300 rounded-lg px-4 py-3 focus:outline-none focus:border-hextech-100"
              @keyup.enter="searchSummoner"
            />
            <p v-if="serverType === 'intl'" class="text-xs text-gray-500 mt-1">格式：游戏名#标签 (区分大小写)</p>
          </div>

          <!-- API Key Input (Intl only) -->
          <div v-if="serverType === 'intl'" class="mb-4">
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

          <!-- Intl Region Select -->
          <div v-if="serverType === 'intl'" class="mb-4">
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
              :src="summoner.icon"
              :alt="summoner.name"
              class="w-24 h-24 rounded-full border-4 border-hextech-100"
            />
            <div>
              <h2 class="text-2xl font-bold">{{ summoner.displayName }}</h2>
              <p class="text-gray-400">等级：{{ summoner.level }} | 大区：{{ summoner.server }}</p>
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
            :key="match.id || match.metadata?.matchId"
            :class="['bg-dark-200 rounded-xl p-6 shadow-lg', getMatchResultClass(match)]"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <span :class="['px-3 py-1 rounded text-sm font-semibold', getMatchResultBadgeClass(match)]">
                  {{ getMatchResult(match) ? '胜利' : '失败' }}
                </span>
                <span class="text-gray-400">{{ formatMatchDuration(match.duration || match.info?.gameDuration) }}</span>
                <span class="text-gray-500 text-sm">{{ formatMatchTime(match.time || match.info?.gameCreation) }}</span>
              </div>
              <span class="text-gray-400 text-sm">{{ getQueueName(match.mode || match.info?.queueId) }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Champion & KDA -->
              <div class="flex items-center space-x-3">
                <img 
                  :src="match.championImage"
                  :alt="match.champion"
                  class="w-12 h-12 rounded"
                />
                <div>
                  <div class="font-semibold">{{ match.champion }}</div>
                  <div class="text-sm text-gray-400">
                    {{ match.kda }} 
                    <span class="text-gray-500">KDA</span>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div class="flex items-center space-x-2">
                <img 
                  v-for="itemId in match.items" 
                  :key="itemId"
                  :src="getItemImage(itemId)"
                  :alt="`Item ${itemId}`"
                  class="w-8 h-8 rounded"
                />
              </div>

              <!-- Stats -->
              <div class="text-sm text-gray-400">
                <div>补刀：{{ match.cs }} | 伤害：{{ formatNumber(match.damage) }}</div>
                <div>金币：{{ formatNumber(match.gold) }}</div>
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
import cnApi from './services/cnApi'

export default {
  name: 'App',
  data() {
    return {
      serverType: 'cn',
      summonerName: '',
      apiKey: '',
      selectedRegion: 'kr',
      selectedCnServer: 1,
      cnServers: cnApi.getServers(),
      loading: false,
      error: null,
      summoner: null,
      rankedInfo: null,
      matches: null
    }
  },
  methods: {
    async searchSummoner() {
      if (!this.summonerName) {
        this.error = '请输入召唤师名称'
        return
      }

      if (this.serverType === 'intl' && !this.apiKey) {
        this.error = '国际服需要输入 API Key'
        return
      }

      this.loading = true
      this.error = null
      this.summoner = null
      this.rankedInfo = null
      this.matches = null

      try {
        if (this.serverType === 'cn') {
          await this.searchCnSummoner()
        } else {
          await this.searchIntlSummoner()
        }
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

    async searchCnSummoner() {
      // Step 1: Search summoner
      const summonerData = await cnApi.searchSummoner(this.selectedCnServer, this.summonerName)
      
      this.summoner = {
        id: summonerData.id,
        name: summonerData.name,
        displayName: `${summonerData.name} (${summonerData.serverName})`,
        level: summonerData.level,
        server: summonerData.serverName,
        icon: `https://game.gtimg.cn/images/lol/act/img/profileicon/${summonerData.iconId}.png`,
        puuid: summonerData.puuid,
        serverId: summonerData.serverId
      }

      // Step 2: Get rank info
      try {
        this.rankedInfo = await cnApi.getRankInfo(this.selectedCnServer, summonerData.id)
      } catch (e) {
        console.log('No rank info')
      }

      // Step 3: Get match list
      const matchList = await cnApi.getMatchList(this.selectedCnServer, summonerData.id, 10)
      
      if (matchList && matchList.length > 0) {
        this.matches = matchList.map(match => ({
          id: match.matchId,
          time: match.matchTime * 1000,
          duration: match.matchLength,
          mode: match.mode,
          champion: cnApi.getChampionName(match.championId),
          championImage: cnApi.getChampionImage(match.championId),
          kda: `${match.kills}/${match.deaths}/${match.assists}`,
          items: [match.item0, match.item1, match.item2, match.item3, match.item4, match.item5, match.item6].filter(i => i !== 0),
          cs: match.cs,
          damage: match.damage,
          gold: match.gold,
          win: match.result === 1
        }))
      }
    },

    async searchIntlSummoner() {
      const [gameName, tagLine] = this.summonerName.split('#')
      if (!gameName || !tagLine) {
        this.error = 'Riot ID 格式错误，应为：游戏名#标签'
        throw new Error('Invalid Riot ID format')
      }

      // Step 1: Get account info by Riot ID
      const accountUrl = `https://${this.selectedRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
      const accountRes = await axios.get(accountUrl, {
        headers: { 'X-Riot-Token': this.apiKey }
      })
      const account = accountRes.data

      // Step 2: Get summoner info by PUUID
      const platform = this.getPlatformForRegion()
      const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`
      const summonerRes = await axios.get(summonerUrl, {
        headers: { 'X-Riot-Token': this.apiKey }
      })
      
      this.summoner = {
        ...summonerRes.data,
        displayName: `${account.gameName}#${account.tagLine}`,
        server: this.selectedRegion,
        icon: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summonerRes.data.profileIconId}.png`
      }

      // Step 3: Get ranked info
      try {
        const rankedUrl = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${this.summoner.id}`
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
    },

    getPlatformForRegion() {
      const mapping = {
        'americas': 'na1',
        'europe': 'euw1',
        'asia': 'sg2'
      }
      return mapping[this.selectedRegion] || this.selectedRegion
    },

    getQueueName(queueType) {
      const names = {
        'RANKED_SOLO_5x5': '单/双排',
        'RANKED_FLEX_SR': '灵活排位',
        '420': '单/双排',
        '440': '灵活排位',
        '430': '匹配模式',
        '450': '大乱斗',
        '1700': '斗魂竞技场',
        '1': '召唤师峡谷',
        '2': '召唤师峡谷',
        '4': '排位赛',
        '6': '大乱斗',
        '8': '3v3',
        '9': '统治战场',
        '14': '末日人机',
        '16': '克隆模式',
        '17': '飞升模式',
        '19': '冰雪大乱斗',
        '23': '魄罗大乱斗',
        '30': '枢纽攻防战',
        '32': '克隆大作战',
        '33': '超频行动',
        '34': '诺克萨斯',
        '35': '魄罗王',
        '36': '血月猎杀',
        '37': '征召模式',
        '38': '黑暗之星',
        '41': '无限火力',
        '52': '无限乱斗',
        '61': '冠军杯赛',
        '700': '斗魂竞技场',
        '1090': '无限火力',
        '1111': '特殊模式'
      }
      return names[queueType] || (typeof queueType === 'string' ? queueType : `模式 ${queueType}`)
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
        'CHALLENGER': '最强王者',
        '': '未定级'
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
      if (match.win !== undefined) {
        return match.win
      }
      if (this.serverType === 'intl' && this.summoner?.puuid) {
        const participant = match.info?.participants?.find(p => p.puuid === this.summoner.puuid)
        return participant ? participant.win : false
      }
      return false
    },

    getMatchResultClass(match) {
      return this.getMatchResult(match) ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
    },

    getMatchResultBadgeClass(match) {
      return this.getMatchResult(match) ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
    },

    formatMatchDuration(seconds) {
      if (!seconds) return '未知'
      const mins = Math.floor(seconds / 60)
      return `${mins}分钟`
    },

    formatMatchTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    getItemImage(itemId) {
      if (this.serverType === 'cn') {
        return cnApi.getItemImage(itemId)
      }
      return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`
    },

    formatNumber(num) {
      if (!num) return '0'
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
