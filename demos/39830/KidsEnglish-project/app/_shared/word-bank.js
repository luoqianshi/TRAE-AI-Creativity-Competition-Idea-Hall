/**
 * KidsEnglish - Word Bank
 * 儿童英语词汇库
 * 包含 34 个分类，涵盖日常生活各场景的英语词汇
 *
 * 数据结构:
 *   WORD_BANK = {
 *     [categoryId]: {
 *       name: '分类中文名',
 *       icon: '代表性emoji',
 *       sections: [
 *         {
 *           name: '小分类名',
 *           words: [
 *             { en: '英文', cn: '中文', ipa: '/音标/', emoji: 'emoji' [, img: '图片路径'] }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 */

var WORD_BANK = {
  actions: {
    name: '动作词',
    icon: '🏃',
    sections: [
      {
        name: '日常动作',
        words: [
          { en: 'walk', cn: '走', ipa: '/wɔːk/', emoji: '🚶' },
          { en: 'run', cn: '跑', ipa: '/rʌn/', emoji: '🏃' },
          { en: 'jump', cn: '跳', ipa: '/dʒʌmp/', emoji: '🦘' },
          { en: 'sit', cn: '坐', ipa: '/sɪt/', emoji: '🪑' },
          { en: 'stand', cn: '站', ipa: '/stænd/', emoji: '🧍' },
          { en: 'sleep', cn: '睡觉', ipa: '/sliːp/', emoji: '😴' },
          { en: 'eat', cn: '吃', ipa: '/iːt/', emoji: '🍽️' },
          { en: 'drink', cn: '喝', ipa: '/drɪŋk/', emoji: '🥤' },
          { en: 'play', cn: '玩', ipa: '/pleɪ/', emoji: '🎮' },
          { en: 'read', cn: '读/看书', ipa: '/riːd/', emoji: '📖' },
          { en: 'write', cn: '写', ipa: '/raɪt/', emoji: '✍️' },
          { en: 'draw', cn: '画画', ipa: '/drɔː/', emoji: '🎨' },
          { en: 'sing', cn: '唱歌', ipa: '/sɪŋ/', emoji: '🎤' },
          { en: 'dance', cn: '跳舞', ipa: '/dɑːns/', emoji: '💃' },
          { en: 'swim', cn: '游泳', ipa: '/swɪm/', emoji: '🏊' },
          { en: 'fly', cn: '飞', ipa: '/flaɪ/', emoji: '🦅' },
          { en: 'climb', cn: '爬', ipa: '/klaɪm/', emoji: '📝' },
          { en: 'throw', cn: '扔', ipa: '/θrəʊ/', emoji: '📝' },
          { en: 'catch', cn: '接', ipa: '/kætʃ/', emoji: '🐱' },
          { en: 'kick', cn: '踢', ipa: '/kɪk/', emoji: '📝' }
        ]
      },
      {
        name: '手部动作',
        words: [
          { en: 'clap', cn: '拍手', ipa: '/klæp/', emoji: '📝' },
          { en: 'wave', cn: '挥手', ipa: '/weɪv/', emoji: '📝' },
          { en: 'hold', cn: '拿/握', ipa: '/həʊld/', emoji: '📝' },
          { en: 'push', cn: '推', ipa: '/pʊʃ/', emoji: '📝' },
          { en: 'pull', cn: '拉', ipa: '/pʊl/', emoji: '📝' },
          { en: 'open', cn: '打开', ipa: '/ˈəʊpən/', emoji: '📂' },
          { en: 'close', cn: '关上', ipa: '/kləʊz/', emoji: '📁' },
          { en: 'touch', cn: '摸', ipa: '/tʌtʃ/', emoji: '📝' },
          { en: 'pick up', cn: '捡起', ipa: '/pɪk ʌp/', emoji: '📝' },
          { en: 'put down', cn: '放下', ipa: '/pʊt daʊn/', emoji: '📝' },
          { en: 'give', cn: '给', ipa: '/ɡɪv/', emoji: '🤲' },
          { en: 'take', cn: '拿', ipa: '/teɪk/', emoji: '✋' },
          { en: 'wash', cn: '洗', ipa: '/wɒʃ/', emoji: '🧼' },
          { en: 'brush', cn: '刷', ipa: '/brʌʃ/', emoji: '🪥' },
          { en: 'wipe', cn: '擦', ipa: '/waɪp/', emoji: '📝' }
        ]
      },
      {
        name: '认知与感官',
        words: [
          { en: 'look', cn: '看', ipa: '/lʊk/', emoji: '👀' },
          { en: 'see', cn: '看见', ipa: '/siː/', emoji: '🪑' },
          { en: 'listen', cn: '听', ipa: '/ˈlɪsn/', emoji: '👂' },
          { en: 'hear', cn: '听见', ipa: '/hɪər/', emoji: '👂' },
          { en: 'smell', cn: '闻', ipa: '/smel/', emoji: '📝' },
          { en: 'taste', cn: '尝', ipa: '/teɪst/', emoji: '👅' },
          { en: 'think', cn: '想', ipa: '/θɪŋk/', emoji: '🤔' },
          { en: 'know', cn: '知道', ipa: '/nəʊ/', emoji: '❌' },
          { en: 'like', cn: '喜欢', ipa: '/laɪk/', emoji: '📝' },
          { en: 'want', cn: '想要', ipa: '/wɒnt/', emoji: '🐜' },
          { en: 'need', cn: '需要', ipa: '/niːd/', emoji: '📝' },
          { en: 'help', cn: '帮助', ipa: '/help/', emoji: '🤝' },
          { en: 'try', cn: '尝试', ipa: '/traɪ/', emoji: '📝' },
          { en: 'stop', cn: '停', ipa: '/stɒp/', emoji: '📝' },
          { en: 'wait', cn: '等待', ipa: '/weɪt/', emoji: '⏳' },
          { en: 'come', cn: '来', ipa: '/kʌm/', emoji: '🤝' },
          { en: 'go', cn: '去', ipa: '/ɡəʊ/', emoji: '🐐' },
          { en: 'put on', cn: '穿上', ipa: '/pʊt ɒn/', emoji: '📝' },
          { en: 'take off', cn: '脱下', ipa: '/teɪk ɒf/', emoji: '✋' },
          { en: 'wake up', cn: '醒来', ipa: '/weɪk ʌp/', emoji: '⏰' }
        ]
      }
    ]
  },
  animals: {
    name: '动物',
    icon: '🐕',
    sections: [
      {
        name: '农场动物',
        words: [
          { en: 'dog', cn: '狗', ipa: '/dɒɡ/', emoji: '🐕', img: 'assets/images/animals/dog.jpg' },
          { en: 'cat', cn: '猫', ipa: '/kæt/', emoji: '🐱', img: 'assets/images/animals/cat.jpg' },
          { en: 'pig', cn: '猪', ipa: '/pɪɡ/', emoji: '🐷', img: 'assets/images/animals/pig.jpg' },
          { en: 'cow', cn: '牛', ipa: '/kaʊ/', emoji: '🐄', img: 'assets/images/animals/cow.jpg' },
          { en: 'chicken', cn: '鸡', ipa: '/ˈtʃɪkɪn/', emoji: '🍗', img: 'assets/images/animals/chicken.jpg' },
          { en: 'duck', cn: '鸭子', ipa: '/dʌk/', emoji: '🦆', img: 'assets/images/animals/duck.jpg' },
          { en: 'sheep', cn: '绵羊', ipa: '/ʃiːp/', emoji: '🐑', img: 'assets/images/animals/sheep.jpg' },
          { en: 'horse', cn: '马', ipa: '/hɔːrs/', emoji: '🐴', img: 'assets/images/animals/horse.jpg' },
          { en: 'goat', cn: '山羊', ipa: '/ɡəʊt/', emoji: '🐐', img: 'assets/images/animals/goat.jpg' },
          { en: 'rabbit', cn: '兔子', ipa: '/ˈræbɪt/', emoji: '🐰', img: 'assets/images/animals/rabbit.jpg' },
          { en: 'mouse', cn: '老鼠', ipa: '/maʊs/', emoji: '🐭', img: 'assets/images/animals/mouse.jpg' },
          { en: 'bird', cn: '鸟', ipa: '/bɜːrd/', emoji: '🐦', img: 'assets/images/animals/bird.jpg' }
        ]
      },
      {
        name: '野生动物',
        words: [
          { en: 'lion', cn: '狮子', ipa: '/ˈlaɪən/', emoji: '🦁', img: 'assets/images/animals/lion.jpg' },
          { en: 'tiger', cn: '老虎', ipa: '/ˈtaɪɡər/', emoji: '🐯', img: 'assets/images/animals/tiger.jpg' },
          { en: 'elephant', cn: '大象', ipa: '/ˈelɪfənt/', emoji: '🐘', img: 'assets/images/animals/elephant.jpg' },
          { en: 'monkey', cn: '猴子', ipa: '/ˈmʌŋki/', emoji: '🐒', img: 'assets/images/animals/monkey.jpg' },
          { en: 'bear', cn: '熊', ipa: '/beər/', emoji: '🐻', img: 'assets/images/animals/bear.jpg' },
          { en: 'zebra', cn: '斑马', ipa: '/ˈzebrə/', emoji: '🦓', img: 'assets/images/animals/zebra.jpg' },
          { en: 'giraffe', cn: '长颈鹿', ipa: '/dʒɪˈrɑːf/', emoji: '🦒', img: 'assets/images/animals/giraffe.jpg' },
          { en: 'deer', cn: '鹿', ipa: '/dɪər/', emoji: '🦌', img: 'assets/images/animals/deer.jpg' },
          { en: 'fox', cn: '狐狸', ipa: '/fɒks/', emoji: '🦊', img: 'assets/images/animals/fox.jpg' },
          { en: 'wolf', cn: '狼', ipa: '/wʊlf/', emoji: '🐺', img: 'assets/images/animals/wolf.jpg' },
          { en: 'snake', cn: '蛇', ipa: '/sneɪk/', emoji: '🐍', img: 'assets/images/animals/snake.jpg' },
          { en: 'frog', cn: '青蛙', ipa: '/frɒɡ/', emoji: '🐸', img: 'assets/images/animals/frog.jpg' }
        ]
      },
      {
        name: '海洋动物',
        words: [
          { en: 'fish', cn: '鱼', ipa: '/fɪʃ/', emoji: '🐟', img: 'assets/images/animals/fish.jpg' },
          { en: 'shark', cn: '鲨鱼', ipa: '/ʃɑːrk/', emoji: '🦈', img: 'assets/images/animals/shark.jpg' },
          { en: 'dolphin', cn: '海豚', ipa: '/ˈdɒlfɪn/', emoji: '🐬', img: 'assets/images/animals/dolphin.jpg' },
          { en: 'whale', cn: '鲸鱼', ipa: '/weɪl/', emoji: '🐋', img: 'assets/images/animals/whale.jpg' },
          { en: 'turtle', cn: '海龟/乌龟', ipa: '/ˈtɜːrtl/', emoji: '🐢', img: 'assets/images/animals/turtle.jpg' },
          { en: 'crab', cn: '螃蟹', ipa: '/kræb/', emoji: '🦀', img: 'assets/images/animals/crab.jpg' },
          { en: 'octopus', cn: '章鱼', ipa: '/ˈɒktəpəs/', emoji: '🐙', img: 'assets/images/animals/octopus.jpg' },
          { en: 'starfish', cn: '海星', ipa: '/ˈstɑːrfɪʃ/', emoji: '⭐', img: 'assets/images/animals/starfish.jpg' }
        ]
      },
      {
        name: '昆虫',
        words: [
          { en: 'ant', cn: '蚂蚁', ipa: '/ænt/', emoji: '🐜', img: 'assets/images/animals/ant.jpg' },
          { en: 'bee', cn: '蜜蜂', ipa: '/biː/', emoji: '🐝', img: 'assets/images/animals/bee.jpg' },
          { en: 'butterfly', cn: '蝴蝶', ipa: '/ˈbʌtərflaɪ/', emoji: '🦋', img: 'assets/images/animals/butterfly.jpg' },
          { en: 'ladybug', cn: '瓢虫', ipa: '/ˈleɪdibʌɡ/', emoji: '🐞', img: 'assets/images/animals/ladybug.jpg' },
          { en: 'spider', cn: '蜘蛛', ipa: '/ˈspaɪdər/', emoji: '🕷️', img: 'assets/images/animals/spider.jpg' },
          { en: 'caterpillar', cn: '毛毛虫', ipa: '/ˈkætərpɪlər/', emoji: '🐛', img: 'assets/images/animals/caterpillar.jpg' }
        ]
      }
    ]
  },
  attitude: {
    name: '态度表达',
    icon: '💪',
    sections: [
      {
        name: '积极态度 Positive Attitudes',
        words: [
          { en: 'happy', cn: '开心的', ipa: '/ˈhæpi/', emoji: '😊' },
          { en: 'glad', cn: '高兴的', ipa: '/ɡlæd/', emoji: '😄' },
          { en: 'excited', cn: '兴奋的', ipa: '/ɪkˈsaɪtɪd/', emoji: '🤩' },
          { en: 'proud', cn: '骄傲的', ipa: '/praʊd/', emoji: '😇' },
          { en: 'brave', cn: '勇敢的', ipa: '/breɪv/', emoji: '😎' },
          { en: 'kind', cn: '善良的', ipa: '/kaɪnd/', emoji: '🥰' },
          { en: 'helpful', cn: '乐于助人的', ipa: '/ˈhelpfl/', emoji: '🙌' },
          { en: 'polite', cn: '有礼貌的', ipa: '/pəˈlaɪt/', emoji: '🙏' }
        ]
      },
      {
        name: '消极态度 Negative Attitudes',
        words: [
          { en: 'sad', cn: '难过的', ipa: '/sæd/', emoji: '😢' },
          { en: 'angry', cn: '生气的', ipa: '/ˈæŋɡri/', emoji: '😠' },
          { en: 'scared', cn: '害怕的', ipa: '/skeəd/', emoji: '😨' },
          { en: 'shy', cn: '害羞的', ipa: '/ʃaɪ/', emoji: '😳' },
          { en: 'worried', cn: '担心的', ipa: '/ˈwʌrid/', emoji: '😟' },
          { en: 'bored', cn: '无聊的', ipa: '/bɔːrd/', emoji: '😴' },
          { en: 'tired', cn: '累的', ipa: '/ˈtaɪərd/', emoji: '😫' },
          { en: 'jealous', cn: '嫉妒的', ipa: '/ˈdʒeləs/', emoji: '😒' }
        ]
      },
      {
        name: '评价性态度 Evaluative Attitudes',
        words: [
          { en: 'good', cn: '好的', ipa: '/ɡʊd/', emoji: '👍' },
          { en: 'great', cn: '棒的', ipa: '/ɡreɪt/', emoji: '👏' },
          { en: 'wonderful', cn: '精彩的', ipa: '/ˈwʌndəfl/', emoji: '⭐' },
          { en: 'perfect', cn: '完美的', ipa: '/ˈpɜːrfɪkt/', emoji: '🌟' },
          { en: 'bad', cn: '坏的', ipa: '/bæd/', emoji: '👎' },
          { en: 'sorry', cn: '抱歉的', ipa: '/ˈsɔːri/', emoji: '🙏' },
          { en: 'thank you', cn: '谢谢', ipa: '/ˈθæŋk juː/', emoji: '💜' },
          { en: 'please', cn: '请', ipa: '/pliːz/', emoji: '🙏' }
        ]
      },
      {
        name: '态度动词 Attitude Verbs',
        words: [
          { en: 'like', cn: '喜欢', ipa: '/laɪk/', emoji: '❤️' },
          { en: 'love', cn: '爱', ipa: '/lʌv/', emoji: '💚' },
          { en: 'hate', cn: '讨厌', ipa: '/heɪt/', emoji: '💔' },
          { en: 'enjoy', cn: '享受', ipa: '/ɪnˈdʒɔɪ/', emoji: '😍' },
          { en: 'prefer', cn: '更喜欢', ipa: '/prɪˈfɜːr/', emoji: '💕' },
          { en: 'mind', cn: '介意', ipa: '/maɪnd/', emoji: '🤔' },
          { en: 'care', cn: '在乎', ipa: '/keər/', emoji: '💝' },
          { en: 'believe', cn: '相信', ipa: '/bɪˈliːv/', emoji: '🧠' }
        ]
      }
    ]
  },
  bedtime: {
    name: '睡觉场景',
    icon: '🌙',
    sections: [
      {
        name: '睡前相关词汇',
        words: [
          { en: 'bed', cn: '床', ipa: '/bed/', emoji: '🛏️' },
          { en: 'bedroom', cn: '卧室', ipa: '/ˈbedruːm/', emoji: '🛏️' },
          { en: 'pillow', cn: '枕头', ipa: '/ˈpɪləʊ/', emoji: '🛏️' },
          { en: 'blanket', cn: '毯子', ipa: '/ˈblæŋkɪt/', emoji: '🛏️' },
          { en: 'quilt', cn: '被子', ipa: '/kwɪlt/', emoji: '📝' },
          { en: 'pajamas', cn: '睡衣', ipa: '/pəˈdʒɑːməz/', emoji: '📝' },
          { en: 'lullaby', cn: '摇篮曲', ipa: '/ˈlʌləbaɪ/', emoji: '📝' },
          { en: 'dream', cn: '梦', ipa: '/driːm/', emoji: '💭' },
          { en: 'night light', cn: '夜灯', ipa: '/naɪt laɪt/', emoji: '💡' },
          { en: 'story', cn: '故事', ipa: '/ˈstɔːri/', emoji: '📖' },
          { en: 'sleep', cn: '睡觉', ipa: '/sliːp/', emoji: '😴' },
          { en: 'good night', cn: '晚安', ipa: '/ɡʊd naɪt/', emoji: '🌙' },
          { en: 'star', cn: '星星', ipa: '/stɑːr/', emoji: '⭐' },
          { en: 'moon', cn: '月亮', ipa: '/muːn/', emoji: '🌙' },
          { en: 'dark', cn: '黑暗', ipa: '/dɑːrk/', emoji: '🌑' }
        ]
      }
    ]
  },
  body: {
    name: '身体部位',
    icon: '🧍',
    sections: [
      {
        name: '默认',
        words: [
          { en: 'head', cn: '头', ipa: '/hed/', emoji: '👤' },
          { en: 'hair', cn: '头发', ipa: '/heər/', emoji: '💇' },
          { en: 'face', cn: '脸', ipa: '/feɪs/', emoji: '🧼' },
          { en: 'eye / eyes', cn: '眼睛', ipa: '/aɪ/ /aɪz/', emoji: '👁️' },
          { en: 'ear', cn: '耳朵', ipa: '/ɪər/', emoji: '👂' },
          { en: 'nose', cn: '鼻子', ipa: '/nəʊz/', emoji: '👃' },
          { en: 'mouth', cn: '嘴巴', ipa: '/maʊθ/', emoji: '👄' },
          { en: 'tooth / teeth', cn: '牙齿', ipa: '/tuːθ/ /tiːθ/', emoji: '🦷' },
          { en: 'tongue', cn: '舌头', ipa: '/tʌŋ/', emoji: '📝' },
          { en: 'lip', cn: '嘴唇', ipa: '/lɪp/', emoji: '📝' },
          { en: 'neck', cn: '脖子', ipa: '/nek/', emoji: '🫣' },
          { en: 'shoulder', cn: '肩膀', ipa: '/ˈʃəʊldər/', emoji: '💪' },
          { en: 'arm', cn: '手臂', ipa: '/ɑːrm/', emoji: '💪' },
          { en: 'hand', cn: '手', ipa: '/hænd/', emoji: '✋' },
          { en: 'finger', cn: '手指', ipa: '/ˈfɪŋɡər/', emoji: '☝️' },
          { en: 'thumb', cn: '大拇指', ipa: '/θʌm/', emoji: '📝' },
          { en: 'belly / tummy', cn: '肚子', ipa: '/ˈbeli/ /ˈtʌmi/', emoji: '📝' },
          { en: 'leg', cn: '腿', ipa: '/leɡ/', emoji: '🦵' },
          { en: 'knee', cn: '膝盖', ipa: '/niː/', emoji: '🦵' },
          { en: 'foot / feet', cn: '脚', ipa: '/fʊt/ /fiːt/', emoji: '🦶' },
          { en: 'toe', cn: '脚趾', ipa: '/təʊ/', emoji: '🦶' },
          { en: 'elbow', cn: '手肘', ipa: '/ˈelbəʊ/', emoji: '📝' },
          { en: 'wrist', cn: '手腕', ipa: '/rɪst/', emoji: '📝' },
          { en: 'back', cn: '背', ipa: '/bæk/', emoji: '🔙' },
          { en: 'chest', cn: '胸', ipa: '/tʃest/', emoji: '📝' }
        ]
      }
    ]
  },
  colors: {
    name: '颜色',
    icon: '🎨',
    sections: [
      {
        name: '基础颜色 (Basic Colors)',
        words: [
          { en: 'red', cn: '红色', ipa: '/red/', emoji: '' },
          { en: 'blue', cn: '蓝色', ipa: '/bluː/', emoji: '' },
          { en: 'yellow', cn: '黄色', ipa: '/ˈjeləʊ/', emoji: '' },
          { en: 'green', cn: '绿色', ipa: '/ɡriːn/', emoji: '' },
          { en: 'orange', cn: '橙色', ipa: '/ˈɒrɪndʒ/', emoji: '' },
          { en: 'purple', cn: '紫色', ipa: '/ˈpɜːrpl/', emoji: '' },
          { en: 'pink', cn: '粉色', ipa: '/pɪŋk/', emoji: '' },
          { en: 'brown', cn: '棕色', ipa: '/braʊn/', emoji: '' },
          { en: 'black', cn: '黑色', ipa: '/blæk/', emoji: '' },
          { en: 'white', cn: '白色', ipa: '/waɪt/', emoji: '' }
        ]
      },
      {
        name: '扩展颜色 (Extended Colors)',
        words: [
          { en: 'gray / grey', cn: '灰色', ipa: '/ɡreɪ/', emoji: '' },
          { en: 'gold', cn: '金色', ipa: '/ɡəʊld/', emoji: '' },
          { en: 'silver', cn: '银色', ipa: '/ˈsɪlvər/', emoji: '' },
          { en: 'red-orange', cn: '橘红色', ipa: '/red ˈɒrɪndʒ/', emoji: '' },
          { en: 'teal', cn: '青色', ipa: '/tiːl/', emoji: '' },
          { en: 'light pink', cn: '浅粉色', ipa: '/laɪt pɪŋk/', emoji: '' }
        ]
      }
    ]
  },
  dress: {
    name: '穿衣场景',
    icon: '👗',
    sections: [
      {
        name: '衣物与配件词汇',
        words: [
          { en: 'shirt', cn: '衬衫', ipa: '/ʃɜːrt/', emoji: '👕' },
          { en: 'T-shirt', cn: 'T恤', ipa: '/ˈtiːʃɜːrt/', emoji: '👋' },
          { en: 'pants', cn: '裤子', ipa: '/pænts/', emoji: '👖' },
          { en: 'dress', cn: '连衣裙', ipa: '/dres/', emoji: '👗' },
          { en: 'skirt', cn: '裙子', ipa: '/skɜːrt/', emoji: '👗' },
          { en: 'coat', cn: '外套', ipa: '/kəʊt/', emoji: '🧥' },
          { en: 'jacket', cn: '夹克', ipa: '/ˈdʒækɪt/', emoji: '📝' },
          { en: 'sweater', cn: '毛衣', ipa: '/ˈswetər/', emoji: '🍽️' },
          { en: 'hat', cn: '帽子', ipa: '/hæt/', emoji: '🎩' },
          { en: 'socks', cn: '袜子', ipa: '/sɒks/', emoji: '🧦' },
          { en: 'shoes', cn: '鞋子', ipa: '/ʃuːz/', emoji: '👟' },
          { en: 'boots', cn: '靴子', ipa: '/buːts/', emoji: '📝' },
          { en: 'gloves', cn: '手套', ipa: '/ɡlʌvz/', emoji: '🧤' },
          { en: 'scarf', cn: '围巾', ipa: '/skɑːrf/', emoji: '🧣' },
          { en: 'pajamas', cn: '睡衣', ipa: '/pəˈdʒɑːməz/', emoji: '📝' },
          { en: 'zipper', cn: '拉链', ipa: '/ˈzɪpər/', emoji: '🤐' },
          { en: 'button', cn: '纽扣', ipa: '/ˈbʌtn/', emoji: '🔘' },
          { en: 'pocket', cn: '口袋', ipa: '/ˈpɒkɪt/', emoji: '👖' }
        ]
      }
    ]
  },
  emotions: {
    name: '情绪表达',
    icon: '😊',
    sections: [
      {
        name: '默认',
        words: [
          { en: 'happy', cn: '开心的', ipa: '/ˈhæpi/', emoji: '😊' },
          { en: 'sad', cn: '难过的', ipa: '/sæd/', emoji: '😢' },
          { en: 'angry', cn: '生气的', ipa: '/ˈæŋɡri/', emoji: '😠' },
          { en: 'scared', cn: '害怕的', ipa: '/skeərd/', emoji: '😨' },
          { en: 'surprised', cn: '惊讶的', ipa: '/sərˈpraɪzd/', emoji: '😲' },
          { en: 'excited', cn: '兴奋的', ipa: '/ɪkˈsaɪtɪd/', emoji: '🤩' },
          { en: 'tired', cn: '累的', ipa: '/ˈtaɪərd/', emoji: '😴' },
          { en: 'hungry', cn: '饿的', ipa: '/ˈhʌŋɡri/', emoji: '😋' },
          { en: 'thirsty', cn: '渴的', ipa: '/ˈθɜːrsti/', emoji: '🥤' },
          { en: 'sick', cn: '生病的', ipa: '/sɪk/', emoji: '🤒' },
          { en: 'shy', cn: '害羞的', ipa: '/ʃaɪ/', emoji: '😊' },
          { en: 'proud', cn: '骄傲的', ipa: '/praʊd/', emoji: '🥰' },
          { en: 'brave', cn: '勇敢的', ipa: '/breɪv/', emoji: '📝' },
          { en: 'sleepy', cn: '困的', ipa: '/ˈsliːpi/', emoji: '😴' },
          { en: 'bored', cn: '无聊的', ipa: '/bɔːrd/', emoji: '😴' },
          { en: 'worried', cn: '担心的', ipa: '/ˈwʌrid/', emoji: '😰' },
          { en: 'silly', cn: '傻傻的', ipa: '/ˈsɪli/', emoji: '📝' },
          { en: 'grumpy', cn: '烦躁的', ipa: '/ˈɡrʌmpi/', emoji: '📝' },
          { en: 'calm', cn: '平静的', ipa: '/kɑːm/', emoji: '📝' },
          { en: 'love', cn: '爱', ipa: '/lʌv/', emoji: '❤️' }
        ]
      }
    ]
  },
  family: {
    name: '家庭成员',
    icon: '👨‍👩‍👧',
    sections: [
      {
        name: '核心家庭',
        words: [
          { en: 'father', cn: '爸爸', ipa: '/ˈfɑːðər/', emoji: '👨' },
          { en: 'mother', cn: '妈妈', ipa: '/ˈmʌðər/', emoji: '👩' },
          { en: 'dad / daddy', cn: '爸爸（口语）', ipa: '/dæd/ /ˈdædi/', emoji: '👨' },
          { en: 'mom / mommy', cn: '妈妈（口语）', ipa: '/mɒm/ /ˈmɒmi/', emoji: '👩' },
          { en: 'brother', cn: '兄弟', ipa: '/ˈbrʌðər/', emoji: '👦' },
          { en: 'sister', cn: '姐妹', ipa: '/ˈsɪstər/', emoji: '👧' },
          { en: 'older brother', cn: '哥哥', ipa: '/ˈəʊldər ˈbrʌðər/', emoji: '👦' },
          { en: 'younger brother', cn: '弟弟', ipa: '/ˈjʌŋɡər ˈbrʌðər/', emoji: '👦' },
          { en: 'older sister', cn: '姐姐', ipa: '/ˈəʊldər ˈsɪstər/', emoji: '👧' },
          { en: 'younger sister', cn: '妹妹', ipa: '/ˈjʌŋɡər ˈsɪstər/', emoji: '👧' },
          { en: 'baby', cn: '宝宝', ipa: '/ˈbeɪbi/', emoji: '👶' },
          { en: 'son', cn: '儿子', ipa: '/sʌn/', emoji: '👦' },
          { en: 'daughter', cn: '女儿', ipa: '/ˈdɔːtər/', emoji: '👧' },
          { en: 'family', cn: '家庭', ipa: '/ˈfæməli/', emoji: '👨‍👩‍👧‍👦' }
        ]
      },
      {
        name: '祖辈',
        words: [
          { en: 'grandfather', cn: '爷爷/外公', ipa: '/ˈɡrændfɑːðər/', emoji: '👴' },
          { en: 'grandmother', cn: '奶奶/外婆', ipa: '/ˈɡrændmʌðər/', emoji: '👵' },
          { en: 'grandpa', cn: '爷爷（口语）', ipa: '/ˈɡrænpɑː/', emoji: '👴' },
          { en: 'grandma', cn: '奶奶（口语）', ipa: '/ˈɡrænmɑː/', emoji: '👵' }
        ]
      },
      {
        name: '亲戚',
        words: [
          { en: 'uncle', cn: '叔叔/舅舅', ipa: '/ˈʌŋkl/', emoji: '👨' },
          { en: 'aunt', cn: '阿姨/姑姑', ipa: '/ɑːnt/', emoji: '👩' },
          { en: 'cousin', cn: '堂/表兄弟姐妹', ipa: '/ˈkʌzn/', emoji: '👦' },
          { en: 'nephew', cn: '侄子/外甥', ipa: '/ˈnefjuː/', emoji: '👦' },
          { en: 'niece', cn: '侄女/外甥女', ipa: '/niːs/', emoji: '👧' }
        ]
      }
    ]
  },
  festivals: {
    name: '节日庆祝',
    icon: '🎉',
    sections: [
      {
        name: '中国传统节日',
        words: [
          { en: 'Spring Festival', cn: '春节', ipa: '/sprɪŋ ˈfestɪvl/', emoji: '🎊' },
          { en: 'red envelope', cn: '红包', ipa: '/red ˈenvələʊp/', emoji: '🧧' },
          { en: 'dragon dance', cn: '舞龙', ipa: '/ˈdræɡən dɑːns/', emoji: '🐉' },
          { en: 'dumpling', cn: '饺子', ipa: '/ˈdʌmplɪŋ/', emoji: '🥟' },
          { en: 'Lantern Festival', cn: '元宵节', ipa: '/ˈlæntən ˈfestɪvl/', emoji: '🏮' },
          { en: 'Mid-Autumn Festival', cn: '中秋节', ipa: '/mɪd ˈɔːtəm ˈfestɪvl/', emoji: '🥮' },
          { en: 'mooncake', cn: '月饼', ipa: '/ˈmuːnkeɪk/', emoji: '🌕' },
          { en: 'Double Ninth Festival', cn: '重阳节', ipa: '/ˈdʌbl naɪnθ ˈfestɪvl/', emoji: '⛰️' },
          { en: 'Dragon Boat Festival', cn: '端午节', ipa: '/ˈdræɡən bəʊt ˈfestɪvl/', emoji: '🦣' },
          { en: 'zongzi', cn: '粽子', ipa: '/ˈzʌŋzi/', emoji: '🥘' },
          { en: 'Mother\'s Day', cn: '母亲节', ipa: '/ˈmʌðəz deɪ/', emoji: '👩' },
          { en: 'Father\'s Day', cn: '父亲节', ipa: '/ˈfɑːðəz deɪ/', emoji: '👨' }
        ]
      },
      {
        name: '西方节日',
        words: [
          { en: 'Christmas', cn: '圣诞节', ipa: '/ˈkrɪsməs/', emoji: '🎄' },
          { en: 'Santa Claus', cn: '圣诞老人', ipa: '/ˈsæntə klɔːz/', emoji: '🎅' },
          { en: 'Christmas tree', cn: '圣诞树', ipa: '/ˈkrɪsməs triː/', emoji: '🎄' },
          { en: 'gift / present', cn: '礼物', ipa: '/ɡɪft/ /ˈpreznt/', emoji: '🎁' },
          { en: 'Halloween', cn: '万圣节', ipa: '/ˌhæləʊˈiːn/', emoji: '🎃' },
          { en: 'costume', cn: '服装/装扮', ipa: '/ˈkɒstjuːm/', emoji: '🧛' },
          { en: 'pumpkin', cn: '南瓜', ipa: '/ˈpʌmpkɪn/', emoji: '🍬' },
          { en: 'Easter', cn: '复活节', ipa: '/ˈiːstər/', emoji: '🐰' },
          { en: 'Easter egg', cn: '复活节彩蛋', ipa: '/ˈiːstər eɡ/', emoji: '🥚' },
          { en: 'Easter bunny', cn: '复活节兔子', ipa: '/ˈiːstər ˈbʌni/', emoji: '🐇' },
          { en: 'Thanksgiving', cn: '感恩节', ipa: '/ˌθæŋksˈɡɪvɪŋ/', emoji: '🦃' },
          { en: 'turkey', cn: '火鸡', ipa: '/ˈtɜːki/', emoji: '🦃' }
        ]
      },
      {
        name: '生日与个人庆祝',
        words: [
          { en: 'birthday', cn: '生日', ipa: '/ˈbɜːθdeɪ/', emoji: '🎂' },
          { en: 'birthday cake', cn: '生日蛋糕', ipa: '/ˈbɜːθdeɪ keɪk/', emoji: '🔮' },
          { en: 'candle', cn: '蜡烛', ipa: '/ˈkændl/', emoji: '🕯️' },
          { en: 'party', cn: '派对', ipa: '/ˈpɑːrti/', emoji: '🎊' },
          { en: 'birthday song', cn: '生日歌', ipa: '/ˈbɜːθdeɪ sɒŋ/', emoji: '🎵' },
          { en: 'wish', cn: '愿望', ipa: '/wɪʃ/', emoji: '⭐' },
          { en: 'celebrate', cn: '庆祝', ipa: '/ˈselɪbreɪt/', emoji: '🎉' },
          { en: 'New Year', cn: '新年', ipa: '/njuː jɪər/', emoji: '🎆' },
          { en: 'fireworks', cn: '烟花', ipa: '/ˈfaɪərwɜːks/', emoji: '🎆' },
          { en: 'countdown', cn: '倒计时', ipa: '/ˈkaʊntdaʊn/', emoji: '⏳' }
        ]
      }
    ]
  },
  food: {
    name: '食物',
    icon: '🍔',
    sections: [
      {
        name: '主食',
        words: [
          { en: 'rice', cn: '米饭', ipa: '/raɪs/', emoji: '🍚' },
          { en: 'bread', cn: '面包', ipa: '/bred/', emoji: '🍞' },
          { en: 'noodles', cn: '面条', ipa: '/ˈnuːdlz/', emoji: '❌' },
          { en: 'pasta', cn: '意面', ipa: '/ˈpæstə/', emoji: '📝' },
          { en: 'cereal', cn: '麦片', ipa: '/ˈsɪəriəl/', emoji: '📝' },
          { en: 'oatmeal', cn: '燕麦粥', ipa: '/ˈəʊtmiːl/', emoji: '📝' },
          { en: 'pancake', cn: '煎饼', ipa: '/ˈpænkeɪk/', emoji: '🎂' },
          { en: 'dumpling', cn: '饺子', ipa: '/ˈdʌmplɪŋ/', emoji: '📝' },
          { en: 'sandwich', cn: '三明治', ipa: '/ˈsænwɪtʃ/', emoji: '📝' },
          { en: 'pizza', cn: '披萨', ipa: '/ˈpiːtsə/', emoji: '📝' },
          { en: 'cookie', cn: '饼干', ipa: '/ˈkʊki/', emoji: '🍪' },
          { en: 'cake', cn: '蛋糕', ipa: '/keɪk/', emoji: '🎂' },
          { en: 'egg', cn: '鸡蛋', ipa: '/eɡ/', emoji: '🥚' },
          { en: 'soup', cn: '汤', ipa: '/suːp/', emoji: '🍲' },
          { en: 'cheese', cn: '奶酪', ipa: '/tʃiːz/', emoji: '🧀' },
          { en: 'butter', cn: '黄油', ipa: '/ˈbʌtər/', emoji: '🧈' }
        ]
      },
      {
        name: '肉类与蔬菜',
        words: [
          { en: 'chicken (meat)', cn: '鸡肉', ipa: '/ˈtʃɪkɪn/', emoji: '🍗' },
          { en: 'beef', cn: '牛肉', ipa: '/biːf/', emoji: '🐝' },
          { en: 'fish (food)', cn: '鱼肉', ipa: '/fɪʃ/', emoji: '🐟' },
          { en: 'shrimp', cn: '虾', ipa: '/ʃrɪmp/', emoji: '📝' },
          { en: 'carrot', cn: '胡萝卜', ipa: '/ˈkærət/', emoji: '🚗' },
          { en: 'tomato', cn: '番茄', ipa: '/təˈmɑːtəʊ/', emoji: '📝' },
          { en: 'potato', cn: '土豆', ipa: '/pəˈteɪtəʊ/', emoji: '📝' },
          { en: 'corn', cn: '玉米', ipa: '/kɔːrn/', emoji: '📝' },
          { en: 'broccoli', cn: '西兰花', ipa: '/ˈbrɒkəli/', emoji: '📝' },
          { en: 'cabbage', cn: '卷心菜', ipa: '/ˈkæbɪdʒ/', emoji: '🛍️' },
          { en: 'mushroom', cn: '蘑菇', ipa: '/ˈmʌʃruːm/', emoji: '📝' },
          { en: 'onion', cn: '洋葱', ipa: '/ˈʌnjən/', emoji: '📝' },
          { en: 'pea', cn: '豌豆', ipa: '/piː/', emoji: '🍑' },
          { en: 'bean', cn: '豆子', ipa: '/biːn/', emoji: '📝' }
        ]
      },
      {
        name: '饮品与零食',
        words: [
          { en: 'milk', cn: '牛奶', ipa: '/mɪlk/', emoji: '🥛' },
          { en: 'water', cn: '水', ipa: '/ˈwɔːtər/', emoji: '💧' },
          { en: 'juice', cn: '果汁', ipa: '/dʒuːs/', emoji: '🧃' },
          { en: 'tea', cn: '茶', ipa: '/tiː/', emoji: '🍵' },
          { en: 'yogurt', cn: '酸奶', ipa: '/ˈjɒɡərt/', emoji: '📝' },
          { en: 'ice cream', cn: '冰淇淋', ipa: '/aɪs kriːm/', emoji: '🍦' },
          { en: 'candy', cn: '糖果', ipa: '/ˈkændi/', emoji: '🍬' },
          { en: 'chocolate', cn: '巧克力', ipa: '/ˈtʃɒklət/', emoji: '🍫' },
          { en: 'popcorn', cn: '爆米花', ipa: '/ˈpɒpkɔːrn/', emoji: '📝' },
          { en: 'honey', cn: '蜂蜜', ipa: '/ˈhʌni/', emoji: '📝' },
          { en: 'sugar', cn: '糖', ipa: '/ˈʃʊɡər/', emoji: '🍬' },
          { en: 'salt', cn: '盐', ipa: '/sɔːlt/', emoji: '🧂' }
        ]
      },
      {
        name: '味道词',
        words: [
          { en: 'sweet', cn: '甜的', ipa: '/swiːt/', emoji: '📝' },
          { en: 'sour', cn: '酸的', ipa: '/ˈsaʊər/', emoji: '📝' },
          { en: 'salty', cn: '咸的', ipa: '/ˈsɔːlti/', emoji: '🧂' },
          { en: 'spicy', cn: '辣的', ipa: '/ˈspaɪsi/', emoji: '📝' },
          { en: 'bitter', cn: '苦的', ipa: '/ˈbɪtər/', emoji: '📝' },
          { en: 'delicious', cn: '好吃的', ipa: '/dɪˈlɪʃəs/', emoji: '😋' },
          { en: 'yummy', cn: '好吃的（口语）', ipa: '/ˈjʌmi/', emoji: '📝' },
          { en: 'hot (food)', cn: '烫的', ipa: '/hɒt/', emoji: '📝' },
          { en: 'cold', cn: '冷的', ipa: '/kəʊld/', emoji: '🤧' }
        ]
      }
    ]
  },
  fruits: {
    name: '水果',
    icon: '🍎',
    sections: [
      {
        name: '默认',
        words: [
          { en: 'apple', cn: '苹果', ipa: '/ˈæpl/', emoji: '🍎', img: 'assets/images/fruits/apple.jpg' },
          { en: 'banana', cn: '香蕉', ipa: '/bəˈnɑːnə/', emoji: '🍌', img: 'assets/images/fruits/banana.jpg' },
          { en: 'orange', cn: '橙子', ipa: '/ˈɒrɪndʒ/', emoji: '🍊', img: 'assets/images/fruits/orange.jpg' },
          { en: 'grape', cn: '葡萄', ipa: '/ɡreɪp/', emoji: '🍇', img: 'assets/images/fruits/grape.jpg' },
          { en: 'strawberry', cn: '草莓', ipa: '/ˈstrɔːbəri/', emoji: '🍓', img: 'assets/images/fruits/strawberry.jpg' },
          { en: 'watermelon', cn: '西瓜', ipa: '/ˈwɔːtərmelən/', emoji: '🍉', img: 'assets/images/fruits/watermelon.jpg' },
          { en: 'pear', cn: '梨', ipa: '/peər/', emoji: '🍐', img: 'assets/images/fruits/pear.jpg' },
          { en: 'peach', cn: '桃子', ipa: '/piːtʃ/', emoji: '🍑', img: 'assets/images/fruits/peach.jpg' },
          { en: 'mango', cn: '芒果', ipa: '/ˈmæŋɡəʊ/', emoji: '🥭', img: 'assets/images/fruits/mango.jpg' },
          { en: 'pineapple', cn: '菠萝', ipa: '/ˈpaɪnæpl/', emoji: '🍍', img: 'assets/images/fruits/pineapple.jpg' },
          { en: 'lemon', cn: '柠檬', ipa: '/ˈlemən/', emoji: '🍋', img: 'assets/images/fruits/lemon.jpg' },
          { en: 'cherry', cn: '樱桃', ipa: '/ˈtʃeri/', emoji: '🍒', img: 'assets/images/fruits/cherry.jpg' },
          { en: 'kiwi', cn: '猕猴桃', ipa: '/ˈkiːwiː/', emoji: '🥝', img: 'assets/images/fruits/kiwi.jpg' },
          { en: 'coconut', cn: '椰子', ipa: '/ˈkəʊkənʌt/', emoji: '🥥', img: 'assets/images/fruits/coconut.jpg' },
          { en: 'blueberry', cn: '蓝莓', ipa: '/ˈbluːbəri/', emoji: '🔵', img: 'assets/images/fruits/blueberry.jpg' },
          { en: 'plum', cn: '李子', ipa: '/plʌm/', emoji: '📝' },
          { en: 'fig', cn: '无花果', ipa: '/fɪɡ/', emoji: '😤', img: 'assets/images/fruits/fig.jpg' },
          { en: 'pomegranate', cn: '石榴', ipa: '/ˈpɒmɪɡrænɪt/', emoji: '📝', img: 'assets/images/fruits/pomegranate.jpg' }
        ]
      }
    ]
  },
  greetings: {
    name: '日常打招呼',
    icon: '👋',
    sections: [
      {
        name: '默认',
        words: [
          { en: 'hello', cn: '你好', ipa: '/həˈləʊ/', emoji: '👋' },
          { en: 'hi', cn: '嗨', ipa: '/haɪ/', emoji: '👋' },
          { en: 'good morning', cn: '早上好', ipa: '/ɡʊd ˈmɔːrnɪŋ/', emoji: '🌅' },
          { en: 'good afternoon', cn: '下午好', ipa: '/ɡʊd ˌæftərˈnuːn/', emoji: '☀️' },
          { en: 'good evening', cn: '晚上好', ipa: '/ɡʊd ˈiːvnɪŋ/', emoji: '🌙' },
          { en: 'good night', cn: '晚安', ipa: '/ɡʊd naɪt/', emoji: '🌙' },
          { en: 'goodbye', cn: '再见', ipa: '/ˌɡʊdˈbaɪ/', emoji: '👋' },
          { en: 'bye-bye', cn: '拜拜', ipa: '/ˈbaɪ baɪ/', emoji: '📝' },
          { en: 'see you', cn: '再见/回头见', ipa: '/siː juː/', emoji: '📝' },
          { en: 'see you later', cn: '回头见', ipa: '/siː juː ˈleɪtər/', emoji: '📝' },
          { en: 'how are you?', cn: '你好吗？', ipa: '/haʊ ɑːr juː/', emoji: '❓' },
          { en: 'I\'m fine', cn: '我很好', ipa: '/aɪm faɪn/', emoji: '📝' },
          { en: 'nice to meet you', cn: '很高兴认识你', ipa: '/naɪs tuː miːt juː/', emoji: '🤝' },
          { en: 'welcome', cn: '欢迎', ipa: '/ˈwelkəm/', emoji: '🤝' },
          { en: 'what\'s your name?', cn: '你叫什么名字？', ipa: '/wɒts jɔːr neɪm/', emoji: '🎩' },
          { en: 'my name is...', cn: '我的名字是...', ipa: '/maɪ neɪm ɪz/', emoji: '📝' }
        ]
      }
    ]
  },
  hobbies: {
    name: '爱好',
    icon: '🎯',
    sections: [
      {
        name: '艺术创作 Art & Creation',
        words: [
          { en: 'draw', cn: '画画', ipa: '/drɔː/', emoji: '🎨' },
          { en: 'paint', cn: '涂色', ipa: '/peɪnt/', emoji: '🎨' },
          { en: 'color', cn: '上色', ipa: '/ˈkʌlər/', emoji: '🖌️' },
          { en: 'sing', cn: '唱歌', ipa: '/sɪŋ/', emoji: '🎤' },
          { en: 'dance', cn: '跳舞', ipa: '/dɑːns/', emoji: '💃' },
          { en: 'play music', cn: '演奏音乐', ipa: '/pleɪ ˈmjuːzɪk/', emoji: '🎵' },
          { en: 'write', cn: '写作', ipa: '/raɪt/', emoji: '✍️' }
        ]
      },
      {
        name: '手工与制作 Crafts & Making',
        words: [
          { en: 'craft', cn: '手工', ipa: '/krɑːft/', emoji: '✂️' },
          { en: 'build', cn: '搭建', ipa: '/bɪld/', emoji: '🧱' },
          { en: 'make', cn: '制作', ipa: '/meɪk/', emoji: '🔨' },
          { en: 'cook', cn: '烹饪', ipa: '/kʊk/', emoji: '🍳' },
          { en: 'bake', cn: '烘焙', ipa: '/beɪk/', emoji: '🍰' },
          { en: 'sew', cn: '缝纫', ipa: '/səʊ/', emoji: '🧵' }
        ]
      },
      {
        name: '阅读与学习 Reading & Learning',
        words: [
          { en: 'read', cn: '阅读', ipa: '/riːd/', emoji: '📖' },
          { en: 'story', cn: '故事', ipa: '/ˈstɔːri/', emoji: '📖' },
          { en: 'book', cn: '书', ipa: '/bʊk/', emoji: '📖' },
          { en: 'learn', cn: '学习', ipa: '/lɜːrn/', emoji: '📚' },
          { en: 'study', cn: '学习', ipa: '/ˈstʌdi/', emoji: '📚' },
          { en: 'puzzle', cn: '拼图', ipa: '/ˈpʌzl/', emoji: '🧩' }
        ]
      },
      {
        name: '游戏与娱乐 Games & Entertainment',
        words: [
          { en: 'game', cn: '游戏', ipa: '/ɡeɪm/', emoji: '🎮' },
          { en: 'toy', cn: '玩具', ipa: '/tɔɪ/', emoji: '🧸' },
          { en: 'puppet', cn: '木偶', ipa: '/ˈpʌpɪt/', emoji: '🧢' },
          { en: 'magic', cn: '魔术', ipa: '/ˈmædʒɪk/', emoji: '🎩' },
          { en: 'joke', cn: '笑话', ipa: '/dʒəʊk/', emoji: '😀' },
          { en: 'riddle', cn: '谜语', ipa: '/ˈrɪdl/', emoji: '💭' }
        ]
      },
      {
        name: '自然与观察 Nature & Observation',
        words: [
          { en: 'collect', cn: '收集', ipa: '/kəˈlekt/', emoji: '📌' },
          { en: 'plant', cn: '种植', ipa: '/plɑːnt/', emoji: '🌱' },
          { en: 'garden', cn: '园艺', ipa: '/ˈɡɑːrdn/', emoji: '🏡' },
          { en: 'watch', cn: '观察', ipa: '/wɒtʃ/', emoji: '👁️' },
          { en: 'explore', cn: '探索', ipa: '/ɪkˈsplɔːr/', emoji: '🔭' },
          { en: 'photograph', cn: '拍照', ipa: '/ˈfəʊtəɡrɑːf/', emoji: '📸' }
        ]
      }
    ]
  },
  hospital: {
    name: '医院场景',
    icon: '🏥',
    sections: [
      {
        name: '医疗与健康词汇',
        words: [
          { en: 'doctor', cn: '医生', ipa: '/ˈdɒktər/', emoji: '👨‍⚕️' },
          { en: 'nurse', cn: '护士', ipa: '/nɜːrs/', emoji: '👩‍⚕️' },
          { en: 'hospital', cn: '医院', ipa: '/ˈhɒspɪtl/', emoji: '🏥' },
          { en: 'medicine', cn: '药', ipa: '/ˈmedɪsn/', emoji: '💊' },
          { en: 'sick', cn: '生病的', ipa: '/sɪk/', emoji: '🤒' },
          { en: 'hurt', cn: '疼', ipa: '/hɜːrt/', emoji: '😣' },
          { en: 'pain', cn: '疼痛', ipa: '/peɪn/', emoji: '📝' },
          { en: 'cough', cn: '咳嗽', ipa: '/kɒf/', emoji: '🤧' },
          { en: 'fever', cn: '发烧', ipa: '/ˈfiːvər/', emoji: '🌡️' },
          { en: 'temperature', cn: '体温', ipa: '/ˈtemprətʃər/', emoji: '📝' },
          { en: 'bandage', cn: '绷带', ipa: '/ˈbændɪdʒ/', emoji: '🩹' },
          { en: 'injection', cn: '打针', ipa: '/ɪnˈdʒekʃn/', emoji: '💉' },
          { en: 'healthy', cn: '健康的', ipa: '/ˈhelθi/', emoji: '📝' },
          { en: 'health', cn: '健康', ipa: '/helθ/', emoji: '📝' },
          { en: 'checkup', cn: '检查', ipa: '/ˈtʃekʌp/', emoji: '📝' }
        ]
      }
    ]
  },
  jobs: {
    name: '职业',
    icon: '👨‍⚕️',
    sections: [
      {
        name: '医疗与救助 (Medical & Emergency)',
        words: [
          { en: 'doctor', cn: '医生', ipa: '/ˈdɒktər/', emoji: '👨‍⚕️' },
          { en: 'nurse', cn: '护士', ipa: '/nɜːrs/', emoji: '👩‍⚕️' },
          { en: 'dentist', cn: '牙医', ipa: '/ˈdentɪst/', emoji: '🦷' },
          { en: 'firefighter', cn: '消防员', ipa: '/ˈfaɪərfaɪtər/', emoji: '🧑‍🚒' },
          { en: 'police officer', cn: '警察', ipa: '/pəˈliːs ˈɒfɪsər/', emoji: '👮' }
        ]
      },
      {
        name: '教育与科研 (Education & Science)',
        words: [
          { en: 'teacher', cn: '老师', ipa: '/ˈtiːtʃər/', emoji: '🧑‍🏫' },
          { en: 'student', cn: '学生', ipa: '/ˈstjuːdnt/', emoji: '👩‍🎓' },
          { en: 'scientist', cn: '科学家', ipa: '/ˈsaɪəntɪst/', emoji: '🔭' },
          { en: 'librarian', cn: '图书管理员', ipa: '/ˈlaɪbreriən/', emoji: '📚' }
        ]
      },
      {
        name: '商业与办公 (Business & Office)',
        words: [
          { en: 'chef', cn: '厨师', ipa: '/ʃef/', emoji: '👨‍🍳' },
          { en: 'waiter', cn: '服务员', ipa: '/ˈweɪtər/', emoji: '👨‍🍴' },
          { en: 'driver', cn: '司机', ipa: '/ˈdraɪvər/', emoji: '🚔' },
          { en: 'pilot', cn: '飞行员', ipa: '/ˈpaɪlət/', emoji: '👨‍✈️' },
          { en: 'farmer', cn: '农民', ipa: '/ˈfɑːrmər/', emoji: '🧑‍🌾' },
          { en: 'builder', cn: '建筑工人', ipa: '/ˈbɪldər/', emoji: '👷' }
        ]
      },
      {
        name: '艺术与表演 (Arts & Performance)',
        words: [
          { en: 'singer', cn: '歌手', ipa: '/ˈsɪŋər/', emoji: '🎤' },
          { en: 'dancer', cn: '舞蹈家', ipa: '/ˈdɑːnsər/', emoji: '💃' },
          { en: 'artist', cn: '画家', ipa: '/ˈɑːrtɪst/', emoji: '🎨' },
          { en: 'actor', cn: '演员', ipa: '/ˈæktər/', emoji: '🎭' }
        ]
      },
      {
        name: '日常服务 (Daily Services)',
        words: [
          { en: 'baker', cn: '面包师', ipa: '/ˈbeɪkər/', emoji: '🧵' },
          { en: 'barber', cn: '理发师', ipa: '/ˈbɑːrbər/', emoji: '💈' },
          { en: 'postman', cn: '邮递员', ipa: '/ˈpəʊstmən/', emoji: '📬' },
          { en: 'shopkeeper', cn: '店主', ipa: '/ˈʃɒpkiːpər/', emoji: '🏪' }
        ]
      }
    ]
  },
  kindergarten: {
    name: '幼儿园场景',
    icon: '🏫',
    sections: [
      {
        name: '学校与学习词汇',
        words: [
          { en: 'school', cn: '学校', ipa: '/skuːl/', emoji: '🏫' },
          { en: 'kindergarten', cn: '幼儿园', ipa: '/ˌkɪndərˈɡɑːrtn/', emoji: '❤️' },
          { en: 'teacher', cn: '老师', ipa: '/ˈtiːtʃər/', emoji: '👩‍🏫' },
          { en: 'friend', cn: '朋友', ipa: '/frend/', emoji: '🧑‍🤝‍🧑' },
          { en: 'class', cn: '班级', ipa: '/klɑːs/', emoji: '🏫' },
          { en: 'classroom', cn: '教室', ipa: '/ˈklɑːsruːm/', emoji: '🏫' },
          { en: 'desk', cn: '课桌', ipa: '/desk/', emoji: '📚' },
          { en: 'chair', cn: '椅子', ipa: '/tʃeər/', emoji: '🪑' },
          { en: 'pencil', cn: '铅笔', ipa: '/ˈpensl/', emoji: '✏️' },
          { en: 'eraser', cn: '橡皮', ipa: '/ɪˈreɪzər/', emoji: '🧽' },
          { en: 'paper', cn: '纸', ipa: '/ˈpeɪpər/', emoji: '📝' },
          { en: 'crayon', cn: '蜡笔', ipa: '/ˈkreɪən/', emoji: '🖍️' },
          { en: 'scissors', cn: '剪刀', ipa: '/ˈsɪzərz/', emoji: '📝' },
          { en: 'glue', cn: '胶水', ipa: '/ɡluː/', emoji: '📝' },
          { en: 'backpack', cn: '书包', ipa: '/ˈbækpæk/', emoji: '🎒' },
          { en: 'lunchbox', cn: '饭盒', ipa: '/ˈlʌntʃbɒks/', emoji: '🍱' },
          { en: 'line', cn: '排队', ipa: '/laɪn/', emoji: '🚶' },
          { en: 'circle', cn: '圆圈', ipa: '/ˈsɜːrkl/', emoji: '⭕' },
          { en: 'share', cn: '分享', ipa: '/ʃeər/', emoji: '🤝' },
          { en: 'raise hand', cn: '举手', ipa: '/reɪz hænd/', emoji: '✋' }
        ]
      }
    ]
  },
  manners: {
    name: '礼貌用语',
    icon: '🙏',
    sections: [
      {
        name: '默认',
        words: [
          { en: 'please', cn: '请', ipa: '/pliːz/', emoji: '🙏' },
          { en: 'thank you', cn: '谢谢', ipa: '/θæŋk juː/', emoji: '🙏' },
          { en: 'thanks', cn: '谢谢（口语）', ipa: '/θæŋks/', emoji: '📝' },
          { en: 'sorry', cn: '对不起', ipa: '/ˈsɒri/', emoji: '🙏' },
          { en: 'excuse me', cn: '打扰一下', ipa: '/ɪkˈskjuːz miː/', emoji: '🙏' },
          { en: 'you\'re welcome', cn: '不客气', ipa: '/jɔːr ˈwelkəm/', emoji: '😊' },
          { en: 'I\'m sorry', cn: '我很抱歉', ipa: '/aɪm ˈsɒri/', emoji: '🙏' },
          { en: 'that\'s okay', cn: '没关系', ipa: '/ðæts əʊˈkeɪ/', emoji: '🎩' },
          { en: 'no problem', cn: '没问题', ipa: '/nəʊ ˈprɒbləm/', emoji: '👍' },
          { en: 'may I...', cn: '我可以...吗？', ipa: '/meɪ aɪ/', emoji: '📝' }
        ]
      }
    ]
  },
  meal: {
    name: '吃饭场景',
    icon: '🍽️',
    sections: [
      {
        name: '餐具与用餐词汇',
        words: [
          { en: 'spoon', cn: '勺子', ipa: '/spuːn/', emoji: '🥄' },
          { en: 'fork', cn: '叉子', ipa: '/fɔːrk/', emoji: '🍴' },
          { en: 'knife', cn: '刀', ipa: '/naɪf/', emoji: '🔪' },
          { en: 'bowl', cn: '碗', ipa: '/bəʊl/', emoji: '🥣' },
          { en: 'plate', cn: '盘子', ipa: '/pleɪt/', emoji: '🍽️' },
          { en: 'cup', cn: '杯子', ipa: '/kʌp/', emoji: '☕' },
          { en: 'glass', cn: '玻璃杯', ipa: '/ɡlɑːs/', emoji: '🕶️' },
          { en: 'table', cn: '桌子', ipa: '/ˈteɪbl/', emoji: '🪑' },
          { en: 'chair', cn: '椅子', ipa: '/tʃeər/', emoji: '🪑' },
          { en: 'high chair', cn: '儿童餐椅', ipa: '/haɪ tʃeər/', emoji: '👋' },
          { en: 'napkin', cn: '餐巾', ipa: '/ˈnæpkɪn/', emoji: '📝' },
          { en: 'breakfast', cn: '早餐', ipa: '/ˈbrekfəst/', emoji: '🍳' },
          { en: 'lunch', cn: '午餐', ipa: '/lʌntʃ/', emoji: '🍱' },
          { en: 'dinner', cn: '晚餐', ipa: '/ˈdɪnər/', emoji: '🍽️' },
          { en: 'snack', cn: '零食', ipa: '/snæk/', emoji: '🍿' }
        ]
      }
    ]
  },
  opinion: {
    name: '观点表达',
    icon: '💭',
    sections: [
      {
        name: '观点动词',
        words: [
          { en: 'think', cn: '认为', ipa: '/θɪŋk/', emoji: '💭' },
          { en: 'know', cn: '知道', ipa: '/nəʊ/', emoji: '🧠' },
          { en: 'feel', cn: '觉得', ipa: '/fiːl/', emoji: '❤️' },
          { en: 'guess', cn: '猜测', ipa: '/ɡes/', emoji: '🤔' },
          { en: 'remember', cn: '记得', ipa: '/rɪˈmembər/', emoji: '💭' },
          { en: 'forget', cn: '忘记', ipa: '/fəˈɡet/', emoji: '💤' },
          { en: 'understand', cn: '理解', ipa: '/ˌʌndərˈstænd/', emoji: '👍' },
          { en: 'agree', cn: '同意', ipa: '/əˈɡriː/', emoji: '✅' },
          { en: 'disagree', cn: '不同意', ipa: '/ˌdɪsəˈɡriː/', emoji: '❌' }
        ]
      },
      {
        name: '观点形容词',
        words: [
          { en: 'right', cn: '对的', ipa: '/raɪt/', emoji: '✅' },
          { en: 'wrong', cn: '错的', ipa: '/rɒŋ/', emoji: '❌' },
          { en: 'true', cn: '真的', ipa: '/truː/', emoji: '💯' },
          { en: 'false', cn: '假的', ipa: '/fɔːls/', emoji: '🚫' },
          { en: 'possible', cn: '可能的', ipa: '/ˈpɒsəbl/', emoji: '🎯' },
          { en: 'impossible', cn: '不可能的', ipa: '/ɪmˈpɒsəbl/', emoji: '🚫' },
          { en: 'sure', cn: '确定的', ipa: '/ʃʊər/', emoji: '👍' },
          { en: 'maybe', cn: '也许', ipa: '/ˈmeɪbi/', emoji: '🤷' }
        ]
      },
      {
        name: '观点程度',
        words: [
          { en: 'always', cn: '总是', ipa: '/ˈɔːlweɪz/', emoji: '💯' },
          { en: 'usually', cn: '通常', ipa: '/ˈjuːʒuəli/', emoji: '📅' },
          { en: 'sometimes', cn: '有时', ipa: '/ˈsʌmtaɪmz/', emoji: '📆' },
          { en: 'never', cn: '从不', ipa: '/ˈnevər/', emoji: '🚫' },
          { en: 'really', cn: '真的', ipa: '/ˈriːəli/', emoji: '⭐' },
          { en: 'maybe', cn: '可能', ipa: '/ˈmeɪbi/', emoji: '🤷' },
          { en: 'probably', cn: '大概', ipa: '/ˈprɒbəbli/', emoji: '🤔' },
          { en: 'of course', cn: '当然', ipa: '/əv kɔːrs/', emoji: '👍' }
        ]
      },
      {
        name: '观点短语',
        words: [
          { en: 'I think', cn: '我认为', ipa: '/aɪ θɪŋk/', emoji: '💭' },
          { en: 'I know', cn: '我知道', ipa: '/aɪ nəʊ/', emoji: '🧠' },
          { en: 'I believe', cn: '我相信', ipa: '/aɪ bɪˈliːv/', emoji: '❤️' },
          { en: 'in my opinion', cn: '在我看来', ipa: '/ɪn maɪ əˈpɪnjən/', emoji: '💬' },
          { en: 'I am sure', cn: '我确定', ipa: '/aɪ əm ʃʊər/', emoji: '👍' },
          { en: 'I wonder', cn: '我想知道', ipa: '/aɪ ˈwʌndər/', emoji: '🤔' },
          { en: 'it seems', cn: '似乎', ipa: '/ɪt siːmz/', emoji: '👀' }
        ]
      }
    ]
  },
  outing: {
    name: '外出场景',
    icon: '🏕️',
    sections: [
      {
        name: '出行与天气词汇',
        words: [
          { en: 'outside', cn: '外面', ipa: '/ˌaʊtˈsaɪd/', emoji: '📝' },
          { en: 'door', cn: '门', ipa: '/dɔːr/', emoji: '📝' },
          { en: 'car', cn: '汽车', ipa: '/kɑːr/', emoji: '🚗' },
          { en: 'bus', cn: '公交车', ipa: '/bʌs/', emoji: '🚌' },
          { en: 'walk', cn: '走路', ipa: '/wɔːk/', emoji: '🚶' },
          { en: 'street', cn: '街道', ipa: '/striːt/', emoji: '🛣️' },
          { en: 'road', cn: '道路', ipa: '/rəʊd/', emoji: '📝' },
          { en: 'park', cn: '公园', ipa: '/pɑːrk/', emoji: '🌳' },
          { en: 'store', cn: '商店', ipa: '/stɔːr/', emoji: '📝' },
          { en: 'school', cn: '学校', ipa: '/skuːl/', emoji: '🏫' },
          { en: 'bag', cn: '包', ipa: '/bæɡ/', emoji: '🛍️' },
          { en: 'backpack', cn: '背包', ipa: '/ˈbækpæk/', emoji: '🎒' },
          { en: 'umbrella', cn: '雨伞', ipa: '/ʌmˈbrelə/', emoji: '☂️' },
          { en: 'rain', cn: '雨', ipa: '/reɪn/', emoji: '🌧️' },
          { en: 'sun', cn: '太阳', ipa: '/sʌn/', emoji: '☀️' },
          { en: 'weather', cn: '天气', ipa: '/ˈweðər/', emoji: '🍽️' },
          { en: 'hot', cn: '热', ipa: '/hɒt/', emoji: '📝' },
          { en: 'cold', cn: '冷', ipa: '/kəʊld/', emoji: '🤧' },
          { en: 'warm', cn: '温暖', ipa: '/wɔːrm/', emoji: '💪' },
          { en: 'cool', cn: '凉爽', ipa: '/kuːl/', emoji: '📝' }
        ]
      }
    ]
  },
  park: {
    name: '公园场景',
    icon: '🌳',
    sections: [
      {
        name: '公园相关词汇',
        words: [
          { en: 'park', cn: '公园', ipa: '/pɑːrk/', emoji: '🌳' },
          { en: 'grass', cn: '草地', ipa: '/ɡrɑːs/', emoji: '🌿' },
          { en: 'tree', cn: '树', ipa: '/triː/', emoji: '🌳' },
          { en: 'flower', cn: '花', ipa: '/ˈflaʊər/', emoji: '🌸' },
          { en: 'swing', cn: '秋千', ipa: '/swɪŋ/', emoji: '🎢' },
          { en: 'slide', cn: '滑梯', ipa: '/slaɪd/', emoji: '🎢' },
          { en: 'seesaw', cn: '跷跷板', ipa: '/ˈsiːsɔː/', emoji: '🪑' },
          { en: 'sandbox', cn: '沙坑', ipa: '/ˈsændbɒks/', emoji: '🏖️' },
          { en: 'bench', cn: '长椅', ipa: '/bentʃ/', emoji: '🪑' },
          { en: 'path', cn: '小路', ipa: '/pɑːθ/', emoji: '📝' },
          { en: 'pond', cn: '池塘', ipa: '/pɒnd/', emoji: '🌊' },
          { en: 'duck', cn: '鸭子', ipa: '/dʌk/', emoji: '🦆' },
          { en: 'bird', cn: '鸟', ipa: '/bɜːrd/', emoji: '🐦' },
          { en: 'sky', cn: '天空', ipa: '/skaɪ/', emoji: '📝' },
          { en: 'cloud', cn: '云', ipa: '/klaʊd/', emoji: '☁️' },
          { en: 'kite', cn: '风筝', ipa: '/kaɪt/', emoji: '🪁' },
          { en: 'ball', cn: '球', ipa: '/bɔːl/', emoji: '⚽' },
          { en: 'run', cn: '跑', ipa: '/rʌn/', emoji: '🏃' }
        ]
      }
    ]
  },
  plants: {
    name: '植物花草',
    icon: '🌱',
    sections: [
      {
        name: '常见花卉',
        words: [
          { en: 'flower', cn: '花', ipa: '/ˈflaʊər/', emoji: '🌺' },
          { en: 'rose', cn: '玫瑰', ipa: '/rəʊz/', emoji: '🌹' },
          { en: 'tulip', cn: '郁金香', ipa: '/ˈtjuːlɪp/', emoji: '🌷' },
          { en: 'sunflower', cn: '向日葵', ipa: '/ˈsʌnflaʊər/', emoji: '🌻' },
          { en: 'lily', cn: '百合', ipa: '/ˈlɪli/', emoji: '🏵️' },
          { en: 'daisy', cn: '雏菊', ipa: '/ˈdeɪzi/', emoji: '🌼' },
          { en: 'cherry blossom', cn: '樱花', ipa: '/ˈtʃeri ˈblɒsəm/', emoji: '🌸' },
          { en: 'lavender', cn: '薰衣草', ipa: '/ˈlævəndər/', emoji: '🏵️' }
        ]
      },
      {
        name: '树木',
        words: [
          { en: 'tree', cn: '树', ipa: '/triː/', emoji: '🌳' },
          { en: 'oak', cn: '橡树', ipa: '/əʊk/', emoji: '🌳' },
          { en: 'pine', cn: '松树', ipa: '/paɪn/', emoji: '🌲' },
          { en: 'willow', cn: '柳树', ipa: '/ˈwɪləʊ/', emoji: '🌳' },
          { en: 'bamboo', cn: '竹子', ipa: '/bæmˈbuː/', emoji: '🎍' },
          { en: 'palm', cn: '棕榈树', ipa: '/pɑːm/', emoji: '🌴' }
        ]
      },
      {
        name: '植物部位',
        words: [
          { en: 'leaf', cn: '叶子', ipa: '/liːf/', emoji: '🍃' },
          { en: 'root', cn: '根', ipa: '/ruːt/', emoji: '🌼' },
          { en: 'stem', cn: '茎', ipa: '/stem/', emoji: '🌿' },
          { en: 'petal', cn: '花瓣', ipa: '/ˈpetl/', emoji: '🌼' },
          { en: 'seed', cn: '种子', ipa: '/siːd/', emoji: '🌱' },
          { en: 'bud', cn: '花苞', ipa: '/bʌd/', emoji: '🌼' }
        ]
      },
      {
        name: '果实类植物',
        words: [
          { en: 'apple tree', cn: '苹果树', ipa: '/ˈæpl triː/', emoji: '🍎' },
          { en: 'strawberry plant', cn: '草莓植株', ipa: '/ˈstrɔːbəri plɑːnt/', emoji: '🍓' },
          { en: 'grapevine', cn: '葡萄藤', ipa: '/ˈɡreɪpvaɪn/', emoji: '🍇' },
          { en: 'watermelon vine', cn: '西瓜藤', ipa: '/ˈwɔːtəmelən vaɪn/', emoji: '🍉' }
        ]
      },
      {
        name: '草本植物',
        words: [
          { en: 'grass', cn: '草', ipa: '/ɡrɑːs/', emoji: '🌿' },
          { en: 'herb', cn: '香草', ipa: '/hɜːrb/', emoji: '🌿' },
          { en: 'mint', cn: '薄荷', ipa: '/mɪnt/', emoji: '🌿' },
          { en: 'mushroom', cn: '蘑菇', ipa: '/ˈmʌʃrʊm/', emoji: '🍄' },
          { en: 'cactus', cn: '仙人掌', ipa: '/ˈkæktəs/', emoji: '🌵' }
        ]
      }
    ]
  },
  seniors: {
    name: '长辈问候',
    icon: '👴',
    sections: [
      {
        name: '长辈相关词汇',
        words: [
          { en: 'grandpa', cn: '爷爷', ipa: '/ˈɡrænpɑː/', emoji: '👴' },
          { en: 'grandma', cn: '奶奶', ipa: '/ˈɡrænmɑː/', emoji: '👵' },
          { en: 'hug', cn: '拥抱', ipa: '/hʌɡ/', emoji: '🤗' },
          { en: 'kiss', cn: '亲吻', ipa: '/kɪs/', emoji: '📝' },
          { en: 'visit', cn: '拜访', ipa: '/ˈvɪzɪt/', emoji: '🪑' },
          { en: 'miss', cn: '想念', ipa: '/mɪs/', emoji: '📝' },
          { en: 'love', cn: '爱', ipa: '/lʌv/', emoji: '❤️' },
          { en: 'gift', cn: '礼物', ipa: '/ɡɪft/', emoji: '🎁' },
          { en: 'present', cn: '礼物', ipa: '/ˈpreznt/', emoji: '📝' },
          { en: 'happy', cn: '快乐的', ipa: '/ˈhæpi/', emoji: '😊' },
          { en: 'birthday', cn: '生日', ipa: '/ˈbɜːrθdeɪ/', emoji: '🎂' },
          { en: 'health', cn: '健康', ipa: '/helθ/', emoji: '📝' },
          { en: 'take care', cn: '保重', ipa: '/teɪk keər/', emoji: '🚗' }
        ]
      }
    ]
  },
  siblings: {
    name: '兄弟姐妹互动',
    icon: '👶',
    sections: [
      {
        name: '互动相关词汇',
        words: [
          { en: 'share', cn: '分享', ipa: '/ʃeər/', emoji: '🤝' },
          { en: 'help', cn: '帮助', ipa: '/help/', emoji: '🤝' },
          { en: 'play', cn: '玩', ipa: '/pleɪ/', emoji: '🎮' },
          { en: 'together', cn: '一起', ipa: '/təˈɡeðər/', emoji: '👨‍👩‍👧‍👦' },
          { en: 'fight', cn: '打架', ipa: '/faɪt/', emoji: '😤' },
          { en: 'sorry', cn: '对不起', ipa: '/ˈsɒri/', emoji: '🙏' },
          { en: 'forgive', cn: '原谅', ipa: '/fərˈɡɪv/', emoji: '🤲' },
          { en: 'hug', cn: '拥抱', ipa: '/hʌɡ/', emoji: '🤗' },
          { en: 'older', cn: '年长的', ipa: '/ˈəʊldər/', emoji: '👦' },
          { en: 'younger', cn: '年幼的', ipa: '/ˈjʌŋɡər/', emoji: '👦' },
          { en: 'teach', cn: '教', ipa: '/tiːtʃ/', emoji: '📖' },
          { en: 'learn', cn: '学习', ipa: '/lɜːrn/', emoji: '📚' },
          { en: 'copy', cn: '模仿', ipa: '/ˈkɒpi/', emoji: '📝' },
          { en: 'bossy', cn: '爱管人的', ipa: '/ˈbɒsi/', emoji: '📝' },
          { en: 'kind', cn: '善良的', ipa: '/kaɪnd/', emoji: '❤️' },
          { en: 'fair', cn: '公平的', ipa: '/feər/', emoji: '📝' }
        ]
      }
    ]
  },
  sports: {
    name: '运动',
    icon: '⚽',
    sections: [
      {
        name: '球类运动',
        words: [
          { en: 'football', cn: '足球', ipa: '/ˈfʊtbɔːl/', emoji: '⚽' },
          { en: 'basketball', cn: '篮球', ipa: '/ˈbɑːskɪtbɔːl/', emoji: '🏀' },
          { en: 'volleyball', cn: '排球', ipa: '/ˈvɒlibɔːl/', emoji: '🏐' },
          { en: 'tennis', cn: '网球', ipa: '/ˈtenɪs/', emoji: '🎾' },
          { en: 'badminton', cn: '羽毛球', ipa: '/ˈbædmɪntən/', emoji: '🏸' },
          { en: 'ping-pong', cn: '乒乓球', ipa: '/ˈpɪŋ pɒŋ/', emoji: '🏓' },
          { en: 'baseball', cn: '棒球', ipa: '/ˈbeɪsbɔːl/', emoji: '⚾' }
        ]
      },
      {
        name: '田径与体操',
        words: [
          { en: 'run', cn: '跑步', ipa: '/rʌn/', emoji: '🏃' },
          { en: 'jump', cn: '跳跃', ipa: '/dʒʌmp/', emoji: '🏄' },
          { en: 'swim', cn: '游泳', ipa: '/swɪm/', emoji: '🏊' },
          { en: 'dance', cn: '跳舞', ipa: '/dɑːns/', emoji: '💃' },
          { en: 'skip', cn: '跳绳', ipa: '/skɪp/', emoji: '🏃' },
          { en: 'climb', cn: '攀爬', ipa: '/klaɪm/', emoji: '🧗' },
          { en: 'ride', cn: '骑行', ipa: '/raɪd/', emoji: '🚴' },
          { en: 'skate', cn: '滑冰', ipa: '/skeɪt/', emoji: '⛸️' }
        ]
      },
      {
        name: '水上与户外',
        words: [
          { en: 'dive', cn: '跳水', ipa: '/daɪv/', emoji: '🏊' },
          { en: 'surf', cn: '冲浪', ipa: '/sɜːrf/', emoji: '🏄' },
          { en: 'hike', cn: '徒步', ipa: '/haɪk/', emoji: '🏔️' },
          { en: 'camp', cn: '露营', ipa: '/kæmp/', emoji: '⛺' },
          { en: 'fish', cn: '钓鱼', ipa: '/fɪʃ/', emoji: '🎣' },
          { en: 'fly a kite', cn: '放风筝', ipa: '/flaɪ ə kaɪt/', emoji: '🪁' }
        ]
      },
      {
        name: '运动装备与场地',
        words: [
          { en: 'ball', cn: '球', ipa: '/bɔːl/', emoji: '⚽' },
          { en: 'bat', cn: '球拍', ipa: '/bæt/', emoji: '🏏' },
          { en: 'racket', cn: '球拍', ipa: '/ˈrækɪt/', emoji: '🎾' },
          { en: 'goal', cn: '球门', ipa: '/ɡəʊl/', emoji: '🥅' },
          { en: 'net', cn: '网', ipa: '/net/', emoji: '🏓' },
          { en: 'court', cn: '球场', ipa: '/kɔːrt/', emoji: '🏐' },
          { en: 'playground', cn: '操场', ipa: '/ˈpleɪɡraʊnd/', emoji: '🏃' }
        ]
      }
    ]
  },
  supermarket: {
    name: '超市场景',
    icon: '🛒',
    sections: [
      {
        name: '超市相关词汇',
        words: [
          { en: 'supermarket', cn: '超市', ipa: '/ˈsuːpərmɑːrkɪt/', emoji: '🛒' },
          { en: 'shop', cn: '商店', ipa: '/ʃɒp/', emoji: '🛒' },
          { en: 'shopping cart', cn: '购物车', ipa: '/ˈʃɒpɪŋ kɑːrt/', emoji: '🛒' },
          { en: 'shelf', cn: '货架', ipa: '/ʃelf/', emoji: '🛒' },
          { en: 'price', cn: '价格', ipa: '/praɪs/', emoji: '💰' },
          { en: 'money', cn: '钱', ipa: '/ˈmʌni/', emoji: '💰' },
          { en: 'pay', cn: '付款', ipa: '/peɪ/', emoji: '💳' },
          { en: 'bag', cn: '袋子', ipa: '/bæɡ/', emoji: '🛍️' },
          { en: 'basket', cn: '购物篮', ipa: '/ˈbɑːskɪt/', emoji: '📝' },
          { en: 'cashier', cn: '收银员', ipa: '/kæˈʃɪər/', emoji: '👋' }
        ]
      }
    ]
  },
  time: {
    name: '时间日期',
    icon: '🕐',
    sections: [
      {
        name: '时间',
        words: [
          { en: 'time', cn: '时间', ipa: '/taɪm/', emoji: '⏰' },
          { en: 'o\'clock', cn: '...点钟', ipa: '/əˈklɒk/', emoji: '🕐' },
          { en: 'morning', cn: '早上', ipa: '/ˈmɔːrnɪŋ/', emoji: '🌅' },
          { en: 'afternoon', cn: '下午', ipa: '/ˌɑːftəˈnuːn/', emoji: '☀️' },
          { en: 'evening', cn: '傍晚/晚上', ipa: '/ˈiːvnɪŋ/', emoji: '🌆' },
          { en: 'night', cn: '夜晚', ipa: '/naɪt/', emoji: '🌙' },
          { en: 'noon', cn: '中午', ipa: '/nuːn/', emoji: '🌟' },
          { en: 'midnight', cn: '午夜', ipa: '/ˈmɪdnaɪt/', emoji: '🌌' },
          { en: 'half past', cn: '半点', ipa: '/hɑːf pɑːst/', emoji: '🕜' },
          { en: 'quarter', cn: '一刻钟', ipa: '/ˈkwɔːrtər/', emoji: '🕑' },
          { en: 'today', cn: '今天', ipa: '/təˈdeɪ/', emoji: '📅' },
          { en: 'yesterday', cn: '昨天', ipa: '/ˈjestərdeɪ/', emoji: '📆' },
          { en: 'tomorrow', cn: '明天', ipa: '/təˈmɒrəʊ/', emoji: '📅' }
        ]
      },
      {
        name: '星期',
        words: [
          { en: 'Monday', cn: '星期一', ipa: '/ˈmʌndeɪ/', emoji: '🌑' },
          { en: 'Tuesday', cn: '星期二', ipa: '/ˈtjuːzdeɪ/', emoji: '🌒' },
          { en: 'Wednesday', cn: '星期三', ipa: '/ˈwenzdeɪ/', emoji: '🌓' },
          { en: 'Thursday', cn: '星期四', ipa: '/ˈθɜːrzdeɪ/', emoji: '🌔' },
          { en: 'Friday', cn: '星期五', ipa: '/ˈfraɪdeɪ/', emoji: '🌕' },
          { en: 'Saturday', cn: '星期六', ipa: '/ˈsætərdeɪ/', emoji: '🌖' },
          { en: 'Sunday', cn: '星期天', ipa: '/ˈsʌndeɪ/', emoji: '🌗' },
          { en: 'weekend', cn: '周末', ipa: '/ˈwiːkend/', emoji: '🎆' },
          { en: 'weekday', cn: '工作日', ipa: '/ˈwiːkdeɪ/', emoji: '💼' }
        ]
      },
      {
        name: '月份与季节',
        words: [
          { en: 'January', cn: '一月', ipa: '/ˈdʒænjuəri/', emoji: '❄️' },
          { en: 'February', cn: '二月', ipa: '/ˈfebruəri/', emoji: '❄️' },
          { en: 'March', cn: '三月', ipa: '/mɑːrtʃ/', emoji: '🌸' },
          { en: 'April', cn: '四月', ipa: '/ˈeɪprəl/', emoji: '🌱' },
          { en: 'May', cn: '五月', ipa: '/meɪ/', emoji: '🌼' },
          { en: 'June', cn: '六月', ipa: '/dʒuːn/', emoji: '🌺' },
          { en: 'July', cn: '七月', ipa: '/dʒuˈlaɪ/', emoji: '☀️' },
          { en: 'August', cn: '八月', ipa: '/ˈɔːɡəst/', emoji: '🏖️' },
          { en: 'September', cn: '九月', ipa: '/sepˈtembər/', emoji: '🍂' },
          { en: 'October', cn: '十月', ipa: '/ɒkˈtəʊbər/', emoji: '🍁' },
          { en: 'November', cn: '十一月', ipa: '/nəʊˈvembər/', emoji: '🎃' },
          { en: 'December', cn: '十二月', ipa: '/dɪˈsembər/', emoji: '🎄' },
          { en: 'spring', cn: '春天', ipa: '/sprɪŋ/', emoji: '🌸' },
          { en: 'summer', cn: '夏天', ipa: '/ˈsʌmər/', emoji: '☀️' },
          { en: 'autumn / fall', cn: '秋天', ipa: '/ˈɔːtəm/ /fɔːl/', emoji: '🍂' },
          { en: 'winter', cn: '冬天', ipa: '/ˈwɪntər/', emoji: '❄️' }
        ]
      }
    ]
  },
  toys: {
    name: '玩具',
    icon: '🧸',
    sections: [
      {
        name: '毛绒与玩偶 (Soft Toys & Dolls)',
        words: [
          { en: 'teddy bear', cn: '泰迪熊', ipa: '/ˈtedi beər/', emoji: '🧸' },
          { en: 'doll', cn: '娃娃', ipa: '/dɒl/', emoji: '👩' },
          { en: 'puppet', cn: '木偶', ipa: '/ˈpʌpɪt/', emoji: '🧢' },
          { en: 'soft toy', cn: '毛绒玩具', ipa: '/sɒft tɔɪ/', emoji: '🐻' }
        ]
      },
      {
        name: '交通工具玩具 (Vehicle Toys)',
        words: [
          { en: 'toy car', cn: '玩具车', ipa: '/tɔɪ kɑːr/', emoji: '🏎️' },
          { en: 'train', cn: '火车', ipa: '/treɪn/', emoji: '🚆' },
          { en: 'plane', cn: '飞机', ipa: '/pleɪn/', emoji: '✈️' },
          { en: 'boat', cn: '船', ipa: '/bəʊt/', emoji: '⛵' },
          { en: 'truck', cn: '卡车', ipa: '/trʌk/', emoji: '🚛' },
          { en: 'tricycle', cn: '三轮车', ipa: '/ˈtraɪsɪkl/', emoji: '🚲' }
        ]
      },
      {
        name: '积木与建构 (Building & Construction)',
        words: [
          { en: 'block', cn: '积木', ipa: '/blɒk/', emoji: '🧱' },
          { en: 'tower', cn: '塔', ipa: '/ˈtaʊər/', emoji: '🏛️' },
          { en: 'robot', cn: '机器人', ipa: '/ˈrəʊbɒt/', emoji: '🤖' },
          { en: 'Lego', cn: '乐高', ipa: '/ˈleɡəʊ/', emoji: '🧱' }
        ]
      },
      {
        name: '户外与运动玩具 (Outdoor & Sports Toys)',
        words: [
          { en: 'ball', cn: '球', ipa: '/bɔːl/', emoji: '⚽' },
          { en: 'kite', cn: '风筝', ipa: '/kaɪt/', emoji: '🪁' },
          { en: 'slide', cn: '滑梯', ipa: '/slaɪd/', emoji: '🎢' },
          { en: 'swing', cn: '秋千', ipa: '/swɪŋ/', emoji: '🎢' },
          { en: 'bubble', cn: '泡泡', ipa: '/ˈbʌbl/', emoji: '💭' },
          { en: 'marble', cn: '弹珠', ipa: '/ˈmɑːrbl/', emoji: '⚽' }
        ]
      },
      {
        name: '益智与创意 (Puzzles & Creative)',
        words: [
          { en: 'puzzle', cn: '拼图', ipa: '/ˈpʌzl/', emoji: '🧩' },
          { en: 'crayon', cn: '蜡笔', ipa: '/ˈkreɪən/', emoji: '🖍️' },
          { en: 'paint', cn: '颜料', ipa: '/peɪnt/', emoji: '🎨' },
          { en: 'board game', cn: '桌游', ipa: '/bɔːrd ɡeɪm/', emoji: '🎲' },
          { en: 'drum', cn: '鼓', ipa: '/drʌm/', emoji: '🥁' }
        ]
      }
    ]
  },
  vehicles: {
    name: '交通工具',
    icon: '🚗',
    sections: [
      {
        name: '道路车辆 (Road Vehicles)',
        words: [
          { en: 'car', cn: '汽车', ipa: '/kɑːr/', emoji: '🚗' },
          { en: 'bus', cn: '公交车', ipa: '/bʌs/', emoji: '🚌' },
          { en: 'taxi', cn: '出租车', ipa: '/ˈtæksi/', emoji: '🚕' },
          { en: 'truck', cn: '卡车', ipa: '/trʌk/', emoji: '🚛' },
          { en: 'motorcycle', cn: '摩托车', ipa: '/ˈməʊtərsaɪkl/', emoji: '🏍️' },
          { en: 'bicycle', cn: '自行车', ipa: '/ˈbaɪsɪkl/', emoji: '🎲' },
          { en: 'van', cn: '面包车', ipa: '/væn/', emoji: '🚐' }
        ]
      },
      {
        name: '轨道交通 (Rail Transport)',
        words: [
          { en: 'train', cn: '火车', ipa: '/treɪn/', emoji: '🚆' },
          { en: 'subway', cn: '地铁', ipa: '/ˈsʌbweɪ/', emoji: '🚇' },
          { en: 'tram', cn: '有轨电车', ipa: '/træm/', emoji: '🚋' }
        ]
      },
      {
        name: '水上交通 (Water Transport)',
        words: [
          { en: 'ship', cn: '轮船', ipa: '/ʃɪp/', emoji: '🚢' },
          { en: 'boat', cn: '小船', ipa: '/bəʊt/', emoji: '⛵' },
          { en: 'sailboat', cn: '帆船', ipa: '/ˈseɪlbəʊt/', emoji: '⛵' },
          { en: 'speedboat', cn: '快艇', ipa: '/ˈspiːdbəʊt/', emoji: '🚤' }
        ]
      },
      {
        name: '空中交通 (Air Transport)',
        words: [
          { en: 'airplane', cn: '飞机', ipa: '/ˈeərpleɪn/', emoji: '✈️' },
          { en: 'helicopter', cn: '直升机', ipa: '/ˈhelɪkɒptər/', emoji: '🚁' },
          { en: 'rocket', cn: '火箭', ipa: '/ˈrɒkɪt/', emoji: '🚀' },
          { en: 'hot air balloon', cn: '热气球', ipa: '/hɒt eər bəˈluːn/', emoji: '🪁' }
        ]
      },
      {
        name: '特殊车辆 (Special Vehicles)',
        words: [
          { en: 'ambulance', cn: '救护车', ipa: '/ˈæmbjʊləns/', emoji: '🚑' },
          { en: 'fire engine', cn: '消防车', ipa: '/faɪər ˈendʒɪn/', emoji: '🚒' },
          { en: 'police car', cn: '警车', ipa: '/pəˈliːs kɑːr/', emoji: '🚓' },
          { en: 'school bus', cn: '校车', ipa: '/skuːl bʌs/', emoji: '🚍' }
        ]
      }
    ]
  },
  'wake-up': {
    name: '起床场景',
    icon: '⏰',
    sections: [
      {
        name: '起床相关词汇',
        words: [
          { en: 'wake up', cn: '醒来', ipa: '/weɪk ʌp/', emoji: '⏰' },
          { en: 'get up', cn: '起床', ipa: '/ɡet ʌp/', emoji: '🛏️' },
          { en: 'alarm clock', cn: '闹钟', ipa: '/əˈlɑːrm klɒk/', emoji: '⏰' },
          { en: 'morning', cn: '早晨', ipa: '/ˈmɔːrnɪŋ/', emoji: '🌅' },
          { en: 'sun', cn: '太阳', ipa: '/sʌn/', emoji: '☀️' },
          { en: 'sunshine', cn: '阳光', ipa: '/ˈsʌnʃaɪn/', emoji: '👋' },
          { en: 'blanket', cn: '毯子', ipa: '/ˈblæŋkɪt/', emoji: '🛏️' },
          { en: 'pillow', cn: '枕头', ipa: '/ˈpɪləʊ/', emoji: '🛏️' },
          { en: 'bed', cn: '床', ipa: '/bed/', emoji: '🛏️' },
          { en: 'bedroom', cn: '卧室', ipa: '/ˈbedruːm/', emoji: '🛏️' },
          { en: 'window', cn: '窗户', ipa: '/ˈwɪndəʊ/', emoji: '📝' },
          { en: 'curtain', cn: '窗帘', ipa: '/ˈkɜːrtn/', emoji: '📝' },
          { en: 'stretch', cn: '伸展', ipa: '/stretʃ/', emoji: '🤸' },
          { en: 'yawn', cn: '打哈欠', ipa: '/jɔːn/', emoji: '🥱' }
        ]
      }
    ]
  },
  wash: {
    name: '洗漱场景',
    icon: '🧼',
    sections: [
      {
        name: '洗漱相关词汇',
        words: [
          { en: 'bathroom', cn: '浴室', ipa: '/ˈbɑːθruːm/', emoji: '📝' },
          { en: 'toothbrush', cn: '牙刷', ipa: '/ˈtuːθbrʌʃ/', emoji: '🦷' },
          { en: 'toothpaste', cn: '牙膏', ipa: '/ˈtuːθpeɪst/', emoji: '🦷' },
          { en: 'soap', cn: '肥皂', ipa: '/səʊp/', emoji: '🧼' },
          { en: 'towel', cn: '毛巾', ipa: '/ˈtaʊəl/', emoji: '🧣' },
          { en: 'washcloth', cn: '洗脸巾', ipa: '/ˈwɒʃklɒθ/', emoji: '🧼' },
          { en: 'faucet', cn: '水龙头', ipa: '/ˈfɔːsɪt/', emoji: '📝' },
          { en: 'sink', cn: '水槽', ipa: '/sɪŋk/', emoji: '📝' },
          { en: 'mirror', cn: '镜子', ipa: '/ˈmɪrər/', emoji: '📝' },
          { en: 'comb', cn: '梳子', ipa: '/kəʊm/', emoji: '📝' },
          { en: 'brush teeth', cn: '刷牙', ipa: '/brʌʃ tiːθ/', emoji: '🪥' },
          { en: 'wash face', cn: '洗脸', ipa: '/wɒʃ feɪs/', emoji: '🧼' },
          { en: 'comb hair', cn: '梳头', ipa: '/kəʊm heər/', emoji: '💇' },
          { en: 'flush', cn: '冲水', ipa: '/flʌʃ/', emoji: '📝' },
          { en: 'toilet', cn: '马桶', ipa: '/ˈtɔɪlɪt/', emoji: '📝' }
        ]
      }
    ]
  },
  weather: {
    name: '天气',
    icon: '🌤️',
    sections: [
      {
        name: '天气现象 Weather Phenomena',
        words: [
          { en: 'sunny', cn: '晴朗的', ipa: '/ˈsʌni/', emoji: '☀️' },
          { en: 'cloudy', cn: '多云的', ipa: '/ˈklaʊdi/', emoji: '☁️' },
          { en: 'rainy', cn: '下雨的', ipa: '/ˈreɪni/', emoji: '🌧️' },
          { en: 'snowy', cn: '下雪的', ipa: '/ˈsnəʊi/', emoji: '🌨️' },
          { en: 'windy', cn: '刮风的', ipa: '/ˈwɪndi/', emoji: '🌬️' },
          { en: 'foggy', cn: '有雾的', ipa: '/ˈfɒɡi/', emoji: '🌫️' },
          { en: 'stormy', cn: '暴风雨的', ipa: '/ˈstɔːrmi/', emoji: '⛈️' },
          { en: 'thunder', cn: '雷', ipa: '/ˈθʌndər/', emoji: '🌩️' },
          { en: 'lightning', cn: '闪电', ipa: '/ˈlaɪtnɪŋ/', emoji: '🌩️' }
        ]
      },
      {
        name: '温度 Temperature',
        words: [
          { en: 'hot', cn: '热的', ipa: '/hɒt/', emoji: '🔥' },
          { en: 'warm', cn: '温暖的', ipa: '/wɔːrm/', emoji: '🌞' },
          { en: 'cool', cn: '凉爽的', ipa: '/kuːl/', emoji: '🍃' },
          { en: 'cold', cn: '冷的', ipa: '/kəʊld/', emoji: '❄️' },
          { en: 'freezing', cn: '冰冻的', ipa: '/ˈfriːzɪŋ/', emoji: '🧊' }
        ]
      },
      {
        name: '天空与降水 Sky & Precipitation',
        words: [
          { en: 'sky', cn: '天空', ipa: '/skaɪ/', emoji: '🌎' },
          { en: 'sun', cn: '太阳', ipa: '/sʌn/', emoji: '☀️' },
          { en: 'moon', cn: '月亮', ipa: '/muːn/', emoji: '🌙' },
          { en: 'star', cn: '星星', ipa: '/stɑːr/', emoji: '⭐' },
          { en: 'cloud', cn: '云', ipa: '/klaʊd/', emoji: '☁️' },
          { en: 'rain', cn: '雨', ipa: '/reɪn/', emoji: '💧' },
          { en: 'snow', cn: '雪', ipa: '/snəʊ/', emoji: '❄️' },
          { en: 'rainbow', cn: '彩虹', ipa: '/ˈreɪnbəʊ/', emoji: '🌈' },
          { en: 'hail', cn: '冰雹', ipa: '/heɪl/', emoji: '💧' }
        ]
      },
      {
        name: '季节相关 Seasonal',
        words: [
          { en: 'season', cn: '季节', ipa: '/ˈsiːzn/', emoji: '🏖️' },
          { en: 'spring', cn: '春天', ipa: '/sprɪŋ/', emoji: '🌸' },
          { en: 'summer', cn: '夏天', ipa: '/ˈsʌmər/', emoji: '☀️' },
          { en: 'autumn', cn: '秋天', ipa: '/ˈɔːtəm/', emoji: '🍂' },
          { en: 'fall', cn: '秋天(美)', ipa: '/fɔːl/', emoji: '🍂' },
          { en: 'winter', cn: '冬天', ipa: '/ˈwɪntər/', emoji: '❄️' }
        ]
      }
    ]
  },
  willingness: {
    name: '意愿表达',
    icon: '👍',
    sections: [
      {
        name: '意愿动词',
        words: [
          { en: 'want', cn: '想要', ipa: '/wɒnt/', emoji: '🙋' },
          { en: 'need', cn: '需要', ipa: '/niːd/', emoji: '🙏' },
          { en: 'wish', cn: '希望', ipa: '/wɪʃ/', emoji: '⭐' },
          { en: 'hope', cn: '盼望', ipa: '/həʊp/', emoji: '🌟' },
          { en: 'would like', cn: '想要(礼貌)', ipa: '/wʊd laɪk/', emoji: '🙌' },
          { en: 'choose', cn: '选择', ipa: '/tʃuːz/', emoji: '✅' },
          { en: 'decide', cn: '决定', ipa: '/dɪˈsaɪd/', emoji: '📝' },
          { en: 'plan', cn: '计划', ipa: '/plæn/', emoji: '📅' }
        ]
      },
      {
        name: '意愿程度',
        words: [
          { en: 'eager', cn: '渴望的', ipa: '/ˈiːɡər/', emoji: '🤩' },
          { en: 'ready', cn: '准备好的', ipa: '/ˈredi/', emoji: '👍' },
          { en: 'willing', cn: '愿意的', ipa: '/ˈwɪlɪŋ/', emoji: '🙌' },
          { en: 'ready to', cn: '准备好', ipa: '/ˈredi tuː/', emoji: '🏃' },
          { en: 'afraid', cn: '不敢的', ipa: '/əˈfreɪd/', emoji: '😨' },
          { en: 'refuse', cn: '拒绝', ipa: '/rɪˈfjuːz/', emoji: '🙅' }
        ]
      },
      {
        name: '请求与许可',
        words: [
          { en: 'may', cn: '可以', ipa: '/meɪ/', emoji: '🙋' },
          { en: 'can', cn: '能', ipa: '/kæn/', emoji: '👍' },
          { en: 'could', cn: '可以(礼貌)', ipa: '/kʊd/', emoji: '🙏' },
          { en: 'please', cn: '请', ipa: '/pliːz/', emoji: '💜' },
          { en: 'sure', cn: '当然', ipa: '/ʃʊər/', emoji: '😊' },
          { en: 'okay', cn: '好的', ipa: '/əʊˈkeɪ/', emoji: '👌' },
          { en: 'yes', cn: '是', ipa: '/jes/', emoji: '✅' },
          { en: 'no', cn: '不', ipa: '/nəʊ/', emoji: '❌' }
        ]
      },
      {
        name: '意愿短语',
        words: [
          { en: 'let me', cn: '让我', ipa: '/let miː/', emoji: '🙋' },
          { en: 'help me', cn: '帮我', ipa: '/help miː/', emoji: '🤝' },
          { en: 'show me', cn: '给我看', ipa: '/ʃəʊ miː/', emoji: '👁️' },
          { en: 'tell me', cn: '告诉我', ipa: '/tel miː/', emoji: '💬' },
          { en: 'give me', cn: '给我', ipa: '/ɡɪv miː/', emoji: '🙌' },
          { en: 'follow me', cn: '跟我来', ipa: '/ˈfɒləʊ miː/', emoji: '🚶' }
        ]
      }
    ]
  }
};

// Total categories: 34
// Total words: 812
