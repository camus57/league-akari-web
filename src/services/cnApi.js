/**
 * 国服英雄联盟 API 服务
 * 使用多个 API 源备用
 */

// 国服大区列表（共 28 个正式大区）
const CN_SERVERS = [
  { id: 1, name: '艾欧尼亚' },
  { id: 2, name: '祖安' },
  { id: 3, name: '诺克萨斯' },
  { id: 4, name: '班德尔城' },
  { id: 5, name: '皮尔特沃夫' },
  { id: 6, name: '战争学院' },
  { id: 7, name: '弗雷尔卓德' },
  { id: 8, name: '雷瑟守备' },
  { id: 9, name: '钢铁烈阳' },
  { id: 10, name: '暗影岛' },
  { id: 11, name: '均衡教派' },
  { id: 12, name: '水晶之痕' },
  { id: 13, name: '征服之海' },
  { id: 14, name: '皮城警备' },
  { id: 15, name: '糖果峡谷' },
  { id: 16, name: '卡拉曼达' },
  { id: 17, name: '扭曲丛林' },
  { id: 18, name: '巨神峰' },
  { id: 19, name: '教育网' },
  { id: 20, name: '男爵领域' },
  { id: 21, name: '飓风狂怒' },
  { id: 22, name: '无畏先锋' },
  { id: 23, name: '恕瑞玛' },
  { id: 24, name: '巨龙之巢' },
  { id: 25, name: '黑色玫瑰' },
  { id: 26, name: '焰浪之潮' },
  { id: 27, name: '铸星龙王' },
  { id: 28, name: '峡谷之巅' }
]

// 英雄数据
let championMap = new Map()

class CNApiService {
  constructor() {
    this.loadGameData()
  }

  async loadGameData() {
    try {
      const res = await fetch('https://game.gtimg.cn/images/lol/act/img/champion-list.json')
      const data = await res.json()
      if (data?.list) {
        data.list.forEach(c => {
          championMap.set(String(c.id), {
            name: c.name,
            key: c.alias,
            image: `https://game.gtimg.cn/images/lol/act/img/champion/${c.alias}.png`
          })
        })
      }
    } catch (e) {
      console.error('加载英雄失败:', e)
    }
  }

  getServers() {
    return CN_SERVERS
  }

  getServerById(id) {
    return CN_SERVERS.find(s => s.id === parseInt(id))
  }

  // 查询召唤师 - 尝试多个 API
  async searchSummoner(serverId, summonerName) {
    console.log('[CN] 查询:', serverId, summonerName)
    
    // API 1: 掌盟搜索
    try {
      const url = `/api/cn/cmc/zmMcnTargetContentList?r0=133&page=1&num=10&target=2&source=web_pc&cid=${serverId}&name=${encodeURIComponent(summonerName)}`
      const res = await fetch(url)
      const json = await res.json()
      
      console.log('[CN] API1 响应:', json)
      
      if (json?.data?.list?.length > 0) {
        const data = json.data.list[0]
        return {
          id: data.targetId,
          name: data.targetName,
          serverId: parseInt(serverId),
          serverName: this.getServerById(serverId)?.name,
          level: parseInt(data.level) || 0,
          iconId: data.iconId || 1,
          puuid: data.targetId
        }
      }
    } catch (e) {
      console.warn('[CN] API1 失败:', e.message)
    }
    
    // API 2: 直接搜索
    try {
      const url = `/api/cn/cmc/search?source=web_pc&cid=${serverId}&name=${encodeURIComponent(summonerName)}`
      const res = await fetch(url)
      const json = await res.json()
      
      if (json?.data?.list?.length > 0) {
        const data = json.data.list[0]
        return {
          id: data.targetId,
          name: data.targetName,
          serverId: parseInt(serverId),
          serverName: this.getServerById(serverId)?.name,
          level: parseInt(data.level) || 0,
          iconId: data.iconId || 1,
          puuid: data.targetId
        }
      }
    } catch (e) {
      console.warn('[CN] API2 失败:', e.message)
    }
    
    throw new Error('未找到该召唤师，请检查大区或名称是否正确')
  }

  async getRankInfo(serverId, summonerId) {
    try {
      const url = `/api/cn/cmc/rank?cid=${serverId}&uid=${summonerId}`
      const res = await fetch(url)
      const json = await res.json()
      
      if (json?.data) {
        return [{
          queueType: 'RANKED_SOLO_5x5',
          tier: json.data.tier || '',
          rank: json.data.rank || '',
          leaguePoints: json.data.lp || 0,
          wins: json.data.wins || 0,
          losses: json.data.losses || 0
        }]
      }
    } catch (e) {
      console.warn('[CN] 排位查询失败:', e.message)
    }
    return []
  }

  async getMatchList(serverId, summonerId, count = 10) {
    try {
      const url = `/api/cn/cmc/matchlist?cid=${serverId}&uid=${summonerId}&begidx=0&cnt=${count}`
      const res = await fetch(url)
      const json = await res.json()
      
      if (json?.data?.matchList) {
        return json.data.matchList.map(m => ({
          matchId: m.matchId,
          matchTime: m.matchTime,
          matchLength: m.matchLength,
          mode: this.getModeName(m.mode),
          championId: m.championId,
          kills: m.kills || 0,
          deaths: m.deaths || 0,
          assists: m.assists || 0,
          item0: m.item0 || 0,
          item1: m.item1 || 0,
          item2: m.item2 || 0,
          item3: m.item3 || 0,
          item4: m.item4 || 0,
          item5: m.item5 || 0,
          item6: m.item6 || 0,
          cs: m.cs || 0,
          damage: m.damage || 0,
          gold: m.gold || 0,
          result: m.result
        }))
      }
    } catch (e) {
      console.warn('[CN] 比赛列表失败:', e.message)
    }
    return []
  }

  getModeName(mode) {
    const modes = {
      '1': '召唤师峡谷', '420': '单/双排', '430': '匹配模式',
      '440': '灵活排位', '450': '大乱斗', '1700': '斗魂竞技场'
    }
    return modes[mode] || `模式 ${mode}`
  }

  getChampionName(id) {
    return championMap.get(String(id))?.name || `英雄${id}`
  }

  getChampionImage(id) {
    return championMap.get(String(id))?.image || `https://game.gtimg.cn/images/lol/act/img/champion/${id}.png`
  }

  getItemImage(id) {
    if (!id || id === 0) return ''
    return `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
  }
}

export default new CNApiService()
