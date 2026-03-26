/**
 * 国服英雄联盟 API 服务
 * 使用掌盟/WeGame 接口 + CORS 代理
 */

// 使用 CORS 代理来解决跨域问题
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

// 国服大区列表
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
  { id: 25, name: '超凡大师' },
  { id: 26, name: '黑色玫瑰' },
  { id: 27, name: '焰浪之潮' },
  { id: 28, name: '铸星龙王' },
  { id: 29, name: '影流' },
  { id: 30, name: '守望之海' },
  { id: 31, name: '聚爆峡谷' },
  { id: 32, name: '熔岩之巅' },
  { id: 33, name: '祖安花火' },
  { id: 34, name: '峡谷之巅' }
]

// 英雄数据缓存
let championMap = new Map()

class CNApiService {
  constructor() {
    this.loadGameData()
  }

  // 加载游戏数据
  async loadGameData() {
    try {
      // 从腾讯 CDN 加载英雄数据
      const response = await fetch('https://game.gtimg.cn/images/lol/act/img/champion-list.json')
      const data = await response.json()
      
      if (data && Array.isArray(data.list)) {
        data.list.forEach(champ => {
          championMap.set(String(champ.id), {
            name: champ.name,
            key: champ.alias,
            image: `https://game.gtimg.cn/images/lol/act/img/champion/${champ.alias}.png`
          })
        })
      }
      console.log('国服英雄数据加载完成:', championMap.size)
    } catch (e) {
      console.error('加载英雄数据失败:', e)
      this.loadFallbackChampions()
    }
  }

  // 备用英雄数据
  loadFallbackChampions() {
    const fallback = [
      { id: '1', name: '安妮', key: 'Annie' },
      { id: '2', name: '奥利安娜', key: 'Orianna' },
      { id: '103', name: '阿狸', key: 'Ahri' },
      { id: '157', name: '亚索', key: 'Yasuo' },
      { id: '238', name: '劫', key: 'Zed' },
      { id: '777', name: '永恩', key: 'Yone' },
      { id: '555', name: '派克', key: 'Pyke' },
      { id: '236', name: '卢锡安', key: 'Lucian' },
      { id: '222', name: '金克丝', key: 'Jinx' },
      { id: '67', name: '薇恩', key: 'Vayne' },
      { id: '81', name: '伊泽瑞尔', key: 'Ezreal' },
      { id: '51', name: '凯特琳', key: 'Caitlyn' },
      { id: '412', name: '锤石', key: 'Thresh' },
      { id: '64', name: '李青', key: 'LeeSin' },
      { id: '11', name: '易', key: 'MasterYi' },
      { id: '99', name: '拉克丝', key: 'Lux' },
      { id: '122', name: '德莱厄斯', key: 'Darius' },
      { id: '86', name: '盖伦', key: 'Garen' }
    ]
    fallback.forEach(c => {
      championMap.set(c.id, {
        name: c.name,
        key: c.key,
        image: `https://game.gtimg.cn/images/lol/act/img/champion/${c.key}.png`
      })
    })
  }

  // 获取所有大区
  getServers() {
    return CN_SERVERS
  }

  // 根据 ID 获取大区
  getServerById(id) {
    return CN_SERVERS.find(s => s.id === parseInt(id))
  }

  // 查询召唤师
  async searchSummoner(serverId, summonerName) {
    try {
      // 使用掌盟 API 通过 CORS 代理
      const url = `https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=133&page=1&num=10&target=2&source=web_pc&cid=${serverId}&name=${encodeURIComponent(summonerName)}`
      
      const response = await fetch(CORS_PROXY + encodeURIComponent(url))
      const json = await response.json()
      
      if (json && json.data && json.data.list && json.data.list.length > 0) {
        const data = json.data.list[0]
        return {
          id: data.targetId,
          name: data.targetName,
          serverId: parseInt(serverId),
          serverName: this.getServerById(serverId)?.name || '未知',
          level: parseInt(data.level) || 0,
          iconId: data.iconId || 1,
          puuid: data.targetId
        }
      }
      
      throw new Error('未找到该召唤师')
    } catch (e) {
      console.error('查询召唤师失败:', e)
      if (e.message === '未找到该召唤师') {
        throw e
      }
      throw new Error(`查询失败：${e.message}`)
    }
  }

  // 获取排位信息
  async getRankInfo(serverId, summonerId) {
    try {
      const url = `https://apps.game.qq.com/cmc/rank?cid=${serverId}&uid=${summonerId}`
      const response = await fetch(CORS_PROXY + encodeURIComponent(url))
      const json = await response.json()
      
      if (json && json.data) {
        const data = json.data
        return [{
          queueType: 'RANKED_SOLO_5x5',
          tier: data.tier || '',
          rank: data.rank || '',
          leaguePoints: data.lp || 0,
          wins: data.wins || 0,
          losses: data.losses || 0
        }]
      }
      return []
    } catch (e) {
      console.error('获取排位信息失败:', e)
      return []
    }
  }

  // 获取比赛列表
  async getMatchList(serverId, summonerId, count = 10) {
    try {
      const url = `https://apps.game.qq.com/cmc/matchlist?cid=${serverId}&uid=${summonerId}&begidx=0&cnt=${count}`
      const response = await fetch(CORS_PROXY + encodeURIComponent(url))
      const json = await response.json()
      
      if (json && json.data && json.data.matchList) {
        return json.data.matchList.map(match => ({
          matchId: match.matchId,
          matchTime: match.matchTime,
          matchLength: match.matchLength,
          mode: this.getModeName(match.mode),
          championId: match.championId,
          kills: match.kills || 0,
          deaths: match.deaths || 0,
          assists: match.assists || 0,
          item0: match.item0 || 0,
          item1: match.item1 || 0,
          item2: match.item2 || 0,
          item3: match.item3 || 0,
          item4: match.item4 || 0,
          item5: match.item5 || 0,
          item6: match.item6 || 0,
          cs: match.cs || 0,
          damage: match.damage || 0,
          gold: match.gold || 0,
          result: match.result
        }))
      }
      return []
    } catch (e) {
      console.error('获取比赛列表失败:', e)
      return []
    }
  }

  // 获取模式名称
  getModeName(mode) {
    const modes = {
      '1': '召唤师峡谷',
      '2': '召唤师峡谷',
      '4': '排位赛',
      '6': '大乱斗',
      '8': '3v3',
      '430': '匹配模式',
      '420': '单/双排',
      '440': '灵活排位',
      '450': '大乱斗',
      '1700': '斗魂竞技场'
    }
    return modes[mode] || `模式 ${mode}`
  }

  // 获取英雄名称
  getChampionName(id) {
    const champ = championMap.get(String(id))
    return champ ? champ.name : `英雄${id}`
  }

  // 获取英雄图片
  getChampionImage(id) {
    const champ = championMap.get(String(id))
    return champ ? champ.image : `https://game.gtimg.cn/images/lol/act/img/champion/${id}.png`
  }

  // 获取物品图片
  getItemImage(id) {
    if (!id || id === 0) return ''
    return `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
  }
}

export default new CNApiService()
