/**
 * 国服英雄联盟 API 服务
 * 使用腾讯官方 API 和掌盟接口
 */

import axios from 'axios'

// 国服 API 基础 URL
const CN_API_BASE = {
  // 查询召唤师信息
  summoner: 'https://wegame.qq.com/api/lol/users',
  // 战绩列表
  matches: 'https://wegame.qq.com/api/lol/matches',
  // 战绩详情
  matchDetail: 'https://wegame.qq.com/api/lol/match/detail',
  // 排名信息
  rank: 'https://wegame.qq.com/api/lol/rank',
  // 英雄列表
  champions: 'https://game.gtimg.cn/images/lol/act/img/champion-list.json',
  // 物品列表
  items: 'https://game.gtimg.cn/images/lol/act/item/list.json'
}

// 大区映射
const CN_SERVERS = [
  { id: 1, name: '艾欧尼亚', key: 'iyonia' },
  { id: 2, name: '祖安', key: 'zuan' },
  { id: 3, name: '诺克萨斯', key: 'noxus' },
  { id: 4, name: '班德尔城', key: 'bandel' },
  { id: 5, name: '皮尔特沃夫', key: 'polt' },
  { id: 6, name: '战争学院', key: 'war' },
  { id: 7, name: '弗雷尔卓德', key: 'freljord' },
  { id: 8, name: '雷瑟守备', key: 'riven' },
  { id: 9, name: '钢铁烈阳', key: 'sun' },
  { id: 10, name: '暗影岛', key: 'shadow' },
  { id: 11, name: '均衡教派', key: 'kama' },
  { id: 12, name: '水晶之痕', key: 'crystal' },
  { id: 13, name: '征服之海', key: 'sea' },
  { id: 14, name: '皮城警备', key: 'police' },
  { id: 15, name: '糖果峡谷', key: 'candy' },
  { id: 16, name: '卡拉曼达', key: 'kalaman' },
  { id: 17, name: '扭曲丛林', key: 'twisted' },
  { id: 18, name: '巨神峰', key: 'targon' },
  { id: 19, name: '教育网', key: 'edu' },
  { id: 20, name: '男爵领域', key: 'baron' },
  { id: 21, name: '飓风狂怒', key: 'hurricane' },
  { id: 22, name: '无畏先锋', key: 'vanguard' },
  { id: 23, name: '恕瑞玛', key: 'shurima' },
  { id: 24, name: '巨龙之巢', key: 'dragon' },
  { id: 25, name: '超凡大师', key: 'master' },
  { id: 26, name: '黑色玫瑰', key: 'rose' },
  { id: 27, name: '焰浪之潮', key: 'tide' },
  { id: 28, name: '铸星龙王', key: 'star' },
  { id: 29, name: '影流', key: 'shadowflow' },
  { id: 30, name: '守望之海', key: 'watch' },
  { id: 31, name: '聚爆峡谷', key: 'explosion' },
  { id: 32, name: '熔岩之巅', key: 'lava' },
  { id: 33, name: '祖安花火', key: 'zuanhua' },
  { id: 34, name: '峡谷之巅', key: 'top' }
]

class CNApiService {
  constructor() {
    this.championMap = new Map()
    this.itemMap = new Map()
    this.loadGameData()
  }

  // 加载游戏数据
  async loadGameData() {
    try {
      // 加载英雄数据
      const champRes = await axios.get(CN_API_BASE.champions)
      if (champRes.data && Array.isArray(champRes.data.list)) {
        champRes.data.list.forEach(champ => {
          this.championMap.set(champ.id, {
            name: champ.name,
            key: champ.alias,
            image: `https://game.gtimg.cn/images/lol/act/img/champion/${champ.alias}.png`
          })
        })
      }

      // 加载物品数据
      const itemRes = await axios.get(CN_API_BASE.items)
      if (itemRes.data) {
        Object.entries(itemRes.data).forEach(([id, item]) => {
          this.itemMap.set(id, {
            name: item.name,
            image: `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
          })
        })
      }
    } catch (e) {
      console.error('加载游戏数据失败:', e)
    }
  }

  // 获取所有大区
  getServers() {
    return CN_SERVERS
  }

  // 根据名称获取大区
  getServerByName(name) {
    return CN_SERVERS.find(s => s.name === name || s.key === name)
  }

  // 查询召唤师
  async searchSummoner(serverId, summonerName) {
    try {
      // 使用掌盟 API
      const url = `https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=133&page=1&num=1&target=2&source=web_pc&cid=${serverId}&name=${encodeURIComponent(summonerName)}`
      
      const res = await axios.get(url, {
        headers: {
          'Referer': 'https://lol.qq.com/'
        }
      })

      if (res.data && res.data.data && res.data.data.list && res.data.data.list.length > 0) {
        const data = res.data.data.list[0]
        return {
          id: data.targetId,
          name: data.targetName,
          serverId: serverId,
          serverName: this.getServerById(serverId)?.name || '未知',
          level: parseInt(data.level) || 0,
          iconId: data.iconId || 1,
          puuid: data.targetId // 国服使用 targetId 作为唯一标识
        }
      }

      throw new Error('未找到该召唤师')
    } catch (e) {
      if (e.response?.status === 404) {
        throw new Error('未找到该召唤师')
      }
      throw e
    }
  }

  // 获取大区信息
  getServerById(id) {
    return CN_SERVERS.find(s => s.id === id)
  }

  // 获取召唤师排名信息
  async getRankInfo(serverId, summonerId) {
    try {
      const url = `https://apps.game.qq.com/cmc/rank?cid=${serverId}&uid=${summonerId}`
      const res = await axios.get(url)
      
      if (res.data && res.data.data) {
        const data = res.data.data
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
      console.log('获取排名信息失败:', e)
      return []
    }
  }

  // 获取比赛列表
  async getMatchList(serverId, summonerId, count = 10) {
    try {
      const url = `https://apps.game.qq.com/cmc/matchlist?cid=${serverId}&uid=${summonerId}&begidx=0&cnt=${count}`
      const res = await axios.get(url)
      
      if (res.data && res.data.data && res.data.data.matchList) {
        return res.data.data.matchList
      }
      return []
    } catch (e) {
      console.error('获取比赛列表失败:', e)
      return []
    }
  }

  // 获取比赛详情
  async getMatchDetail(serverId, matchId) {
    try {
      const url = `https://apps.game.qq.com/cmc/matchdetail?cid=${serverId}&mid=${matchId}`
      const res = await axios.get(url)
      
      if (res.data && res.data.data) {
        return res.data.data
      }
      return null
    } catch (e) {
      console.error('获取比赛详情失败:', e)
      return null
    }
  }

  // 获取英雄名称
  getChampionName(id) {
    const champ = this.championMap.get(String(id))
    return champ ? champ.name : `英雄${id}`
  }

  // 获取英雄图片
  getChampionImage(id) {
    const champ = this.championMap.get(String(id))
    return champ ? champ.image : ''
  }

  // 获取物品图片
  getItemImage(id) {
    if (!id || id === 0) return ''
    const item = this.itemMap.get(String(id))
    return item ? item.image : `https://game.gtimg.cn/images/lol/act/img/item/${id}.png`
  }
}

export default new CNApiService()
