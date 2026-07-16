/**
 * ============================================================
 * 小学英语学习平台 - 数据文件 (data.js)
 * 符合 2022 年义务教育英语课程标准要求
 * 覆盖人教版 PEP 三至六年级核心词汇与知识点
 * 文件编码: UTF-8
 * ============================================================
 */

// ============================================================
// 1. 完整单词库 wordData
// 按主题 + 年级分层，覆盖人教版 PEP 一至六年级核心词汇
// 每个单词含: en(英文), cn(中文), emoji(图标), phonetic(音标),
//            grade(年级), example(例句)
// ============================================================
const wordData = {
  // ---------- 一级 (1-2年级) ----------
  // 主题: numbers（数字）
  numbers: [
    { en: 'one', cn: '一', emoji: '1️⃣', phonetic: '/wʌn/', grade: 1, example: 'I have one apple.' },
    { en: 'two', cn: '二', emoji: '2️⃣', phonetic: '/tuː/', grade: 1, example: 'I see two cats.' },
    { en: 'three', cn: '三', emoji: '3️⃣', phonetic: '/θriː/', grade: 1, example: 'There are three birds.' },
    { en: 'four', cn: '四', emoji: '4️⃣', phonetic: '/fɔːr/', grade: 1, example: 'Four pencils are on the desk.' },
    { en: 'five', cn: '五', emoji: '5️⃣', phonetic: '/faɪv/', grade: 1, example: 'I am five years old.' },
    { en: 'six', cn: '六', emoji: '6️⃣', phonetic: '/sɪks/', grade: 1, example: 'Six students are here.' },
    { en: 'seven', cn: '七', emoji: '7️⃣', phonetic: '/ˈsevn/', grade: 1, example: 'Seven days in a week.' },
    { en: 'eight', cn: '八', emoji: '8️⃣', phonetic: '/eɪt/', grade: 1, example: 'I have eight books.' },
    { en: 'nine', cn: '九', emoji: '9️⃣', phonetic: '/naɪn/', grade: 1, example: 'Nine children are playing.' },
    { en: 'ten', cn: '十', emoji: '🔟', phonetic: '/ten/', grade: 1, example: 'Ten fingers on my hands.' },
  ],

  // 主题: greetings（问候）
  greetings: [
    { en: 'hello', cn: '你好', emoji: '👋', phonetic: '/həˈloʊ/', grade: 1, example: 'Hello, my name is Tom.' },
    { en: 'hi', cn: '嗨', emoji: '🙋', phonetic: '/haɪ/', grade: 1, example: 'Hi, nice to meet you!' },
    { en: 'goodbye', cn: '再见', emoji: '👋', phonetic: '/ˌɡʊdˈbaɪ/', grade: 1, example: 'Goodbye, see you tomorrow.' },
    { en: 'good morning', cn: '早上好', emoji: '🌅', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', grade: 1, example: 'Good morning, teacher!' },
    { en: 'good afternoon', cn: '下午好', emoji: '☀️', phonetic: '/ɡʊd ˌæftərˈnuːn/', grade: 1, example: 'Good afternoon, everyone.' },
    { en: 'thank you', cn: '谢谢你', emoji: '🙏', phonetic: '/θæŋk juː/', grade: 1, example: 'Thank you very much.' },
    { en: 'please', cn: '请', emoji: '😊', phonetic: '/pliːz/', grade: 1, example: 'Please sit down.' },
    { en: 'sorry', cn: '对不起', emoji: '😞', phonetic: '/ˈsɑːri/', grade: 1, example: 'Sorry, I am late.' },
    { en: 'yes', cn: '是', emoji: '✅', phonetic: '/jes/', grade: 1, example: 'Yes, I can.' },
    { en: 'no', cn: '不', emoji: '❌', phonetic: '/noʊ/', grade: 1, example: 'No, thank you.' },
  ],

  // 主题: classroom（教室）
  classroom: [
    { en: 'book', cn: '书', emoji: '📖', phonetic: '/bʊk/', grade: 1, example: 'This is my book.' },
    { en: 'pen', cn: '钢笔', emoji: '🖊️', phonetic: '/pen/', grade: 1, example: 'I have a red pen.' },
    { en: 'pencil', cn: '铅笔', emoji: '✏️', phonetic: '/ˈpensl/', grade: 1, example: 'Please give me a pencil.' },
    { en: 'ruler', cn: '尺子', emoji: '📏', phonetic: '/ˈruːlər/', grade: 1, example: 'The ruler is long.' },
    { en: 'bag', cn: '书包', emoji: '🎒', phonetic: '/bæɡ/', grade: 1, example: 'My bag is blue.' },
    { en: 'desk', cn: '课桌', emoji: '🪑', phonetic: '/desk/', grade: 1, example: 'The book is on the desk.' },
    { en: 'chair', cn: '椅子', emoji: '💺', phonetic: '/tʃer/', grade: 1, example: 'Sit on the chair, please.' },
    { en: 'eraser', cn: '橡皮', emoji: '🧹', phonetic: '/ɪˈreɪsər/', grade: 1, example: 'I need an eraser.' },
    { en: 'teacher', cn: '老师', emoji: '👩‍🏫', phonetic: '/ˈtiːtʃər/', grade: 1, example: 'The teacher is kind.' },
    { en: 'student', cn: '学生', emoji: '🧑‍🎓', phonetic: '/ˈstuːdnt/', grade: 1, example: 'I am a good student.' },
  ],

  // 主题: nature（自然）
  nature: [
    { en: 'sun', cn: '太阳', emoji: '☀️', phonetic: '/sʌn/', grade: 1, example: 'The sun is big and bright.' },
    { en: 'moon', cn: '月亮', emoji: '🌙', phonetic: '/muːn/', grade: 1, example: 'The moon is in the sky.' },
    { en: 'star', cn: '星星', emoji: '⭐', phonetic: '/stɑːr/', grade: 1, example: 'I can see many stars.' },
    { en: 'tree', cn: '树', emoji: '🌳', phonetic: '/triː/', grade: 1, example: 'The tree is very tall.' },
    { en: 'flower', cn: '花', emoji: '🌸', phonetic: '/ˈflaʊər/', grade: 1, example: 'The flower is beautiful.' },
    { en: 'water', cn: '水', emoji: '💧', phonetic: '/ˈwɔːtər/', grade: 1, example: 'I want some water.' },
    { en: 'sky', cn: '天空', emoji: '🌤️', phonetic: '/skaɪ/', grade: 1, example: 'The sky is blue today.' },
    { en: 'grass', cn: '草', emoji: '🌿', phonetic: '/ɡræs/', grade: 1, example: 'The grass is green.' },
    { en: 'rain', cn: '雨', emoji: '🌧️', phonetic: '/reɪn/', grade: 2, example: 'I like the rain.' },
    { en: 'snow', cn: '雪', emoji: '❄️', phonetic: '/snoʊ/', grade: 2, example: 'The snow is white.' },
  ],

  // ---------- 二级 (3-4年级) ----------
  // 主题: animals（动物）
  animals: [
    { en: 'cat', cn: '猫', emoji: '🐱', phonetic: '/kæt/', grade: 3, example: 'The cat is sleeping.' },
    { en: 'dog', cn: '狗', emoji: '🐶', phonetic: '/dɒɡ/', grade: 3, example: 'I have a big dog.' },
    { en: 'bird', cn: '鸟', emoji: '🐦', phonetic: '/bɜːrd/', grade: 3, example: 'The bird can fly.' },
    { en: 'fish', cn: '鱼', emoji: '🐟', phonetic: '/fɪʃ/', grade: 3, example: 'The fish is in the water.' },
    { en: 'rabbit', cn: '兔子', emoji: '🐰', phonetic: '/ˈræbɪt/', grade: 3, example: 'The rabbit eats carrots.' },
    { en: 'elephant', cn: '大象', emoji: '🐘', phonetic: '/ˈelɪfənt/', grade: 3, example: 'The elephant is very big.' },
    { en: 'monkey', cn: '猴子', emoji: '🐵', phonetic: '/ˈmʌŋki/', grade: 3, example: 'The monkey likes bananas.' },
    { en: 'panda', cn: '熊猫', emoji: '🐼', phonetic: '/ˈpændə/', grade: 3, example: 'The panda is from China.' },
    { en: 'tiger', cn: '老虎', emoji: '🐯', phonetic: '/ˈtaɪɡər/', grade: 3, example: 'The tiger is strong.' },
    { en: 'duck', cn: '鸭子', emoji: '🦆', phonetic: '/dʌk/', grade: 3, example: 'The duck swims in the river.' },
    { en: 'pig', cn: '猪', emoji: '🐷', phonetic: '/pɪɡ/', grade: 3, example: 'The pig is pink.' },
    { en: 'bear', cn: '熊', emoji: '🐻', phonetic: '/ber/', grade: 4, example: 'The bear is in the forest.' },
  ],

  // 主题: food（食物）
  food: [
    { en: 'apple', cn: '苹果', emoji: '🍎', phonetic: '/ˈæpl/', grade: 3, example: 'I like apples.' },
    { en: 'banana', cn: '香蕉', emoji: '🍌', phonetic: '/bəˈnænə/', grade: 3, example: 'The banana is yellow.' },
    { en: 'bread', cn: '面包', emoji: '🍞', phonetic: '/bred/', grade: 3, example: 'I have bread for breakfast.' },
    { en: 'milk', cn: '牛奶', emoji: '🥛', phonetic: '/mɪlk/', grade: 3, example: 'I drink milk every day.' },
    { en: 'egg', cn: '鸡蛋', emoji: '🥚', phonetic: '/eɡ/', grade: 3, example: 'I eat an egg in the morning.' },
    { en: 'rice', cn: '米饭', emoji: '🍚', phonetic: '/raɪs/', grade: 3, example: 'We eat rice for lunch.' },
    { en: 'cake', cn: '蛋糕', emoji: '🎂', phonetic: '/keɪk/', grade: 3, example: 'The cake is sweet.' },
    { en: 'chicken', cn: '鸡肉', emoji: '🍗', phonetic: '/ˈtʃɪkɪn/', grade: 3, example: 'I like fried chicken.' },
    { en: 'juice', cn: '果汁', emoji: '🧃', phonetic: '/dʒuːs/', grade: 3, example: 'I drink orange juice.' },
    { en: 'noodles', cn: '面条', emoji: '🍜', phonetic: '/ˈnuːdlz/', grade: 3, example: 'Chinese people like noodles.' },
    { en: 'fish', cn: '鱼', emoji: '🐟', phonetic: '/fɪʃ/', grade: 4, example: 'The fish tastes good.' },
    { en: 'ice cream', cn: '冰淇淋', emoji: '🍦', phonetic: '/aɪs kriːm/', grade: 4, example: 'I love ice cream in summer.' },
  ],

  // 主题: colors（颜色）
  colors: [
    { en: 'red', cn: '红色', emoji: '🔴', phonetic: '/red/', grade: 3, example: 'The apple is red.' },
    { en: 'blue', cn: '蓝色', emoji: '🔵', phonetic: '/bluː/', grade: 3, example: 'The sky is blue.' },
    { en: 'green', cn: '绿色', emoji: '🟢', phonetic: '/ɡriːn/', grade: 3, example: 'The grass is green.' },
    { en: 'yellow', cn: '黄色', emoji: '🟡', phonetic: '/ˈjeloʊ/', grade: 3, example: 'The sun is yellow.' },
    { en: 'black', cn: '黑色', emoji: '⚫', phonetic: '/blæk/', grade: 3, example: 'My bag is black.' },
    { en: 'white', cn: '白色', emoji: '⚪', phonetic: '/waɪt/', grade: 3, example: 'The paper is white.' },
    { en: 'orange', cn: '橙色', emoji: '🟠', phonetic: '/ˈɔːrɪndʒ/', grade: 3, example: 'The orange is orange.' },
    { en: 'pink', cn: '粉色', emoji: '🩷', phonetic: '/pɪŋk/', grade: 3, example: 'Her dress is pink.' },
    { en: 'purple', cn: '紫色', emoji: '🟣', phonetic: '/ˈpɜːrpl/', grade: 3, example: 'The grape is purple.' },
    { en: 'brown', cn: '棕色', emoji: '🟤', phonetic: '/braʊn/', grade: 4, example: 'The dog is brown.' },
  ],

  // 主题: family（家庭）
  family: [
    { en: 'father', cn: '爸爸', emoji: '👨', phonetic: '/ˈfɑːðər/', grade: 3, example: 'My father is tall.' },
    { en: 'mother', cn: '妈妈', emoji: '👩', phonetic: '/ˈmʌðər/', grade: 3, example: 'My mother is beautiful.' },
    { en: 'brother', cn: '兄弟', emoji: '👦', phonetic: '/ˈbrʌðər/', grade: 3, example: 'I have one brother.' },
    { en: 'sister', cn: '姐妹', emoji: '👧', phonetic: '/ˈsɪstər/', grade: 3, example: 'My sister is five years old.' },
    { en: 'grandfather', cn: '爷爷/外公', emoji: '👴', phonetic: '/ˈɡrændˌfɑːðər/', grade: 3, example: 'My grandfather reads newspapers.' },
    { en: 'grandmother', cn: '奶奶/外婆', emoji: '👵', phonetic: '/ˈɡrændˌmʌðər/', grade: 3, example: 'My grandmother cooks well.' },
    { en: 'uncle', cn: '叔叔/舅舅', emoji: '👨‍🦱', phonetic: '/ˈʌŋkl/', grade: 3, example: 'My uncle is a doctor.' },
    { en: 'aunt', cn: '阿姨/姑姑', emoji: '👩‍🦰', phonetic: '/ænt/', grade: 3, example: 'My aunt lives in Beijing.' },
    { en: 'baby', cn: '宝宝', emoji: '👶', phonetic: '/ˈbeɪbi/', grade: 4, example: 'The baby is cute.' },
    { en: 'parents', cn: '父母', emoji: '👨‍👩‍👧', phonetic: '/ˈperənts/', grade: 4, example: 'My parents love me.' },
  ],

  // 主题: school（学校）
  school: [
    { en: 'classroom', cn: '教室', emoji: '🏫', phonetic: '/ˈklæsruːm/', grade: 3, example: 'The classroom is clean.' },
    { en: 'playground', cn: '操场', emoji: '🏟️', phonetic: '/ˈpleɪɡraʊnd/', grade: 3, example: 'We play on the playground.' },
    { en: 'library', cn: '图书馆', emoji: '📚', phonetic: '/ˈlaɪbreri/', grade: 3, example: 'I read books in the library.' },
    { en: 'math', cn: '数学', emoji: '🔢', phonetic: '/mæθ/', grade: 3, example: 'I like math class.' },
    { en: 'English', cn: '英语', emoji: '🇬🇧', phonetic: '/ˈɪŋɡlɪʃ/', grade: 3, example: 'We learn English at school.' },
    { en: 'music', cn: '音乐', emoji: '🎵', phonetic: '/ˈmjuːzɪk/', grade: 3, example: 'I like music class.' },
    { en: 'art', cn: '美术', emoji: '🎨', phonetic: '/ɑːrt/', grade: 3, example: 'She is good at art.' },
    { en: 'homework', cn: '作业', emoji: '📝', phonetic: '/ˈhoʊmwɜːrk/', grade: 3, example: 'I do my homework every day.' },
    { en: 'science', cn: '科学', emoji: '🔬', phonetic: '/ˈsaɪəns/', grade: 4, example: 'We have science on Monday.' },
    { en: 'Chinese', cn: '语文', emoji: '📖', phonetic: '/tʃaɪˈniːz/', grade: 4, example: 'I study Chinese at school.' },
    { en: 'computer', cn: '电脑', emoji: '💻', phonetic: '/kəmˈpjuːtər/', grade: 4, example: 'We use computers in class.' },
  ],

  // 主题: body（身体）
  body: [
    { en: 'head', cn: '头', emoji: '🗣️', phonetic: '/hed/', grade: 3, example: 'Nod your head.' },
    { en: 'eye', cn: '眼睛', emoji: '👁️', phonetic: '/aɪ/', grade: 3, example: 'I have two eyes.' },
    { en: 'ear', cn: '耳朵', emoji: '👂', phonetic: '/ɪr/', grade: 3, example: 'I can hear with my ears.' },
    { en: 'nose', cn: '鼻子', emoji: '👃', phonetic: '/noʊz/', grade: 3, example: 'The dog has a big nose.' },
    { en: 'mouth', cn: '嘴巴', emoji: '👄', phonetic: '/maʊθ/', grade: 3, example: 'Open your mouth, please.' },
    { en: 'hand', cn: '手', emoji: '✋', phonetic: '/hænd/', grade: 3, example: 'Wash your hands.' },
    { en: 'foot', cn: '脚', emoji: '🦶', phonetic: '/fʊt/', grade: 3, example: 'My foot hurts.' },
    { en: 'arm', cn: '胳膊', emoji: '💪', phonetic: '/ɑːrm/', grade: 3, example: 'Raise your arm.' },
    { en: 'leg', cn: '腿', emoji: '🦵', phonetic: '/leɡ/', grade: 3, example: 'He has long legs.' },
    { en: 'face', cn: '脸', emoji: '😊', phonetic: '/feɪs/', grade: 4, example: 'She has a round face.' },
    { en: 'hair', cn: '头发', emoji: '💇', phonetic: '/her/', grade: 4, example: 'Her hair is long and black.' },
  ],

  // 主题: weather（天气）
  weather: [
    { en: 'sunny', cn: '晴朗的', emoji: '☀️', phonetic: '/ˈsʌni/', grade: 3, example: 'It is sunny today.' },
    { en: 'cloudy', cn: '多云的', emoji: '☁️', phonetic: '/ˈklaʊdi/', grade: 3, example: 'It is cloudy outside.' },
    { en: 'rainy', cn: '下雨的', emoji: '🌧️', phonetic: '/ˈreɪni/', grade: 3, example: 'It is a rainy day.' },
    { en: 'windy', cn: '有风的', emoji: '💨', phonetic: '/ˈwɪndi/', grade: 3, example: 'It is very windy today.' },
    { en: 'snowy', cn: '下雪的', emoji: '🌨️', phonetic: '/ˈsnoʊi/', grade: 3, example: 'It is snowy in winter.' },
    { en: 'hot', cn: '热的', emoji: '🌡️', phonetic: '/hɒt/', grade: 3, example: 'It is hot in summer.' },
    { en: 'cold', cn: '冷的', emoji: '🥶', phonetic: '/koʊld/', grade: 3, example: 'It is cold in winter.' },
    { en: 'warm', cn: '温暖的', emoji: '🌤️', phonetic: '/wɔːrm/', grade: 4, example: 'Spring is warm and nice.' },
    { en: 'cool', cn: '凉爽的', emoji: '🍃', phonetic: '/kuːl/', grade: 4, example: 'Autumn is cool.' },
    { en: 'foggy', cn: '有雾的', emoji: '🌫️', phonetic: '/ˈfɑːɡi/', grade: 4, example: 'It is foggy in the morning.' },
  ],

  // 主题: clothes（服装）
  clothes: [
    { en: 'shirt', cn: '衬衫', emoji: '👔', phonetic: '/ʃɜːrt/', grade: 4, example: 'He wears a white shirt.' },
    { en: 'T-shirt', cn: 'T恤', emoji: '👕', phonetic: '/ˈtiːʃɜːrt/', grade: 4, example: 'This T-shirt is nice.' },
    { en: 'skirt', cn: '裙子', emoji: '👗', phonetic: '/skɜːrt/', grade: 4, example: 'She has a new skirt.' },
    { en: 'dress', cn: '连衣裙', emoji: '👗', phonetic: '/dres/', grade: 4, example: 'The dress is very pretty.' },
    { en: 'pants', cn: '裤子', emoji: '👖', phonetic: '/pænts/', grade: 4, example: 'I need new pants.' },
    { en: 'shoes', cn: '鞋子', emoji: '👟', phonetic: '/ʃuːz/', grade: 4, example: 'Put on your shoes.' },
    { en: 'hat', cn: '帽子', emoji: '🎩', phonetic: '/hæt/', grade: 4, example: 'He wears a black hat.' },
    { en: 'coat', cn: '外套', emoji: '🧥', phonetic: '/koʊt/', grade: 4, example: 'Wear your coat, please.' },
    { en: 'socks', cn: '袜子', emoji: '🧦', phonetic: '/sɑːks/', grade: 4, example: 'I have two pairs of socks.' },
    { en: 'sweater', cn: '毛衣', emoji: '🧶', phonetic: '/ˈswetər/', grade: 4, example: 'The sweater is warm.' },
  ],

  // 主题: hobbies（爱好）
  hobbies: [
    { en: 'sing', cn: '唱歌', emoji: '🎤', phonetic: '/sɪŋ/', grade: 4, example: 'She likes to sing songs.' },
    { en: 'dance', cn: '跳舞', emoji: '💃', phonetic: '/dæns/', grade: 4, example: 'He likes to dance.' },
    { en: 'draw', cn: '画画', emoji: '🎨', phonetic: '/drɔː/', grade: 4, example: 'I like to draw pictures.' },
    { en: 'read', cn: '阅读', emoji: '📖', phonetic: '/riːd/', grade: 4, example: 'She likes to read books.' },
    { en: 'swim', cn: '游泳', emoji: '🏊', phonetic: '/swɪm/', grade: 4, example: 'We swim in summer.' },
    { en: 'run', cn: '跑步', emoji: '🏃', phonetic: '/rʌn/', grade: 4, example: 'He runs every morning.' },
    { en: 'jump', cn: '跳', emoji: '🤸', phonetic: '/dʒʌmp/', grade: 4, example: 'The frog can jump high.' },
    { en: 'cook', cn: '做饭', emoji: '👨‍🍳', phonetic: '/kʊk/', grade: 4, example: 'My mother can cook well.' },
    { en: 'play football', cn: '踢足球', emoji: '⚽', phonetic: '/pleɪ ˈfʊtbɔːl/', grade: 4, example: 'We play football after school.' },
    { en: 'fly kites', cn: '放风筝', emoji: '🪁', phonetic: '/flaɪ kaɪts/', grade: 4, example: 'Let us fly kites in the park.' },
  ],

  // 主题: places（场所）
  places: [
    { en: 'home', cn: '家', emoji: '🏠', phonetic: '/hoʊm/', grade: 4, example: 'I go home at five.' },
    { en: 'park', cn: '公园', emoji: '🌳', phonetic: '/pɑːrk/', grade: 4, example: 'We play in the park.' },
    { en: 'zoo', cn: '动物园', emoji: '🦁', phonetic: '/zuː/', grade: 4, example: 'I go to the zoo with my family.' },
    { en: 'hospital', cn: '医院', emoji: '🏥', phonetic: '/ˈhɑːspɪtl/', grade: 4, example: 'The doctor works in the hospital.' },
    { en: 'shop', cn: '商店', emoji: '🏪', phonetic: '/ʃɑːp/', grade: 4, example: 'We buy food at the shop.' },
    { en: 'cinema', cn: '电影院', emoji: '🎬', phonetic: '/ˈsɪnəmə/', grade: 4, example: 'We watch a movie at the cinema.' },
    { en: 'farm', cn: '农场', emoji: '🚜', phonetic: '/fɑːrm/', grade: 4, example: 'There are cows on the farm.' },
    { en: 'supermarket', cn: '超市', emoji: '🛒', phonetic: '/ˈsuːpərmɑːrkɪt/', grade: 4, example: 'We buy fruit at the supermarket.' },
    { en: 'museum', cn: '博物馆', emoji: '🏛️', phonetic: '/mjuːˈziːəm/', grade: 4, example: 'We visit the museum on Sunday.' },
    { en: 'garden', cn: '花园', emoji: '🌺', phonetic: '/ˈɡɑːrdn/', grade: 4, example: 'There are many flowers in the garden.' },
  ],

  // ---------- 三级 (5-6年级) ----------
  // 主题: emotions（情感）
  emotions: [
    { en: 'happy', cn: '开心的', emoji: '😊', phonetic: '/ˈhæpi/', grade: 5, example: 'I am happy today.' },
    { en: 'sad', cn: '伤心的', emoji: '😢', phonetic: '/sæd/', grade: 5, example: 'She looks sad.' },
    { en: 'angry', cn: '生气的', emoji: '😠', phonetic: '/ˈæŋɡri/', grade: 5, example: 'Do not make him angry.' },
    { en: 'scared', cn: '害怕的', emoji: '😨', phonetic: '/skerd/', grade: 5, example: 'The little girl is scared of dogs.' },
    { en: 'excited', cn: '兴奋的', emoji: '🤩', phonetic: '/ɪkˈsaɪtɪd/', grade: 5, example: 'We are excited about the trip.' },
    { en: 'tired', cn: '疲倦的', emoji: '😴', phonetic: '/ˈtaɪərd/', grade: 5, example: 'I feel tired after running.' },
    { en: 'worried', cn: '担心的', emoji: '😟', phonetic: '/ˈwɜːrid/', grade: 5, example: 'She is worried about the test.' },
    { en: 'surprised', cn: '惊讶的', emoji: '😲', phonetic: '/sərˈpraɪzd/', grade: 5, example: 'I was surprised to see him.' },
    { en: 'proud', cn: '自豪的', emoji: '🥳', phonetic: '/praʊd/', grade: 6, example: 'I am proud of my school.' },
    { en: 'lonely', cn: '孤独的', emoji: '😔', phonetic: '/ˈloʊnli/', grade: 6, example: 'He feels lonely in a new city.' },
  ],

  // 主题: occupations（职业）
  occupations: [
    { en: 'doctor', cn: '医生', emoji: '👨‍⚕️', phonetic: '/ˈdɑːktər/', grade: 5, example: 'The doctor helps sick people.' },
    { en: 'teacher', cn: '老师', emoji: '👩‍🏫', phonetic: '/ˈtiːtʃər/', grade: 5, example: 'My teacher is very kind.' },
    { en: 'nurse', cn: '护士', emoji: '👩‍⚕️', phonetic: '/nɜːrs/', grade: 5, example: 'The nurse takes care of patients.' },
    { en: 'farmer', cn: '农民', emoji: '👨‍🌾', phonetic: '/ˈfɑːrmər/', grade: 5, example: 'The farmer works on the farm.' },
    { en: 'driver', cn: '司机', emoji: '🚕', phonetic: '/ˈdraɪvər/', grade: 5, example: 'The bus driver drives carefully.' },
    { en: 'cook', cn: '厨师', emoji: '👨‍🍳', phonetic: '/kʊk/', grade: 5, example: 'The cook makes delicious food.' },
    { en: 'policeman', cn: '警察', emoji: '👮', phonetic: '/pəˈliːsmən/', grade: 5, example: 'The policeman keeps us safe.' },
    { en: 'scientist', cn: '科学家', emoji: '🔬', phonetic: '/ˈsaɪəntɪst/', grade: 6, example: 'She wants to be a scientist.' },
    { en: 'writer', cn: '作家', emoji: '✍️', phonetic: '/ˈraɪtər/', grade: 6, example: 'He is a famous writer.' },
    { en: 'pilot', cn: '飞行员', emoji: '✈️', phonetic: '/ˈpaɪlət/', grade: 6, example: 'The pilot flies a plane.' },
  ],

  // 主题: travel（旅行）
  travel: [
    { en: 'plane', cn: '飞机', emoji: '✈️', phonetic: '/pleɪn/', grade: 5, example: 'We go to Beijing by plane.' },
    { en: 'train', cn: '火车', emoji: '🚄', phonetic: '/treɪn/', grade: 5, example: 'The train is very fast.' },
    { en: 'bus', cn: '公共汽车', emoji: '🚌', phonetic: '/bʌs/', grade: 5, example: 'I go to school by bus.' },
    { en: 'bike', cn: '自行车', emoji: '🚲', phonetic: '/baɪk/', grade: 5, example: 'She rides a bike to school.' },
    { en: 'ship', cn: '轮船', emoji: '🚢', phonetic: '/ʃɪp/', grade: 5, example: 'The ship goes across the sea.' },
    { en: 'map', cn: '地图', emoji: '🗺️', phonetic: '/mæp/', grade: 5, example: 'Look at the map, please.' },
    { en: 'ticket', cn: '车票', emoji: '🎫', phonetic: '/ˈtɪkɪt/', grade: 5, example: 'I have a train ticket.' },
    { en: 'passport', cn: '护照', emoji: '📕', phonetic: '/ˈpæspɔːrt/', grade: 6, example: 'You need a passport to go abroad.' },
    { en: 'camera', cn: '相机', emoji: '📷', phonetic: '/ˈkæmərə/', grade: 6, example: 'I take photos with my camera.' },
    { en: 'luggage', cn: '行李', emoji: '🧳', phonetic: '/ˈlʌɡɪdʒ/', grade: 6, example: 'My luggage is very heavy.' },
  ],

  // 主题: festivals（节日）
  festivals: [
    { en: 'Spring Festival', cn: '春节', emoji: '🧨', phonetic: '/sprɪŋ ˈfestɪvl/', grade: 5, example: 'We eat dumplings on Spring Festival.' },
    { en: 'Christmas', cn: '圣诞节', emoji: '🎄', phonetic: '/ˈkrɪsməs/', grade: 5, example: 'We get presents at Christmas.' },
    { en: 'Mid-Autumn Festival', cn: '中秋节', emoji: '🌕', phonetic: '/mɪd ˈɔːtəm ˈfestɪvl/', grade: 5, example: 'We eat mooncakes on Mid-Autumn Festival.' },
    { en: 'Dragon Boat Festival', cn: '端午节', emoji: '🐉', phonetic: '/ˈdræɡən boʊt ˈfestɪvl/', grade: 5, example: 'We have zongzi on Dragon Boat Festival.' },
    { en: 'Halloween', cn: '万圣节', emoji: '🎃', phonetic: '/ˌhæloʊˈiːn/', grade: 6, example: 'Children dress up on Halloween.' },
    { en: 'Thanksgiving', cn: '感恩节', emoji: '🦃', phonetic: '/θæŋksˈɡɪvɪŋ/', grade: 6, example: 'People eat turkey on Thanksgiving.' },
    { en: 'Easter', cn: '复活节', emoji: '🐣', phonetic: '/ˈiːstər/', grade: 6, example: 'Children paint eggs at Easter.' },
    { en: 'National Day', cn: '国庆节', emoji: '🇨🇳', phonetic: '/ˈnæʃənl deɪ/', grade: 6, example: 'We have a holiday on National Day.' },
    { en: 'birthday', cn: '生日', emoji: '🎂', phonetic: '/ˈbɜːrθdeɪ/', grade: 5, example: 'Happy birthday to you!' },
    { en: 'lantern', cn: '灯笼', emoji: '🏮', phonetic: '/ˈlæntərn/', grade: 6, example: 'We make lanterns for the festival.' },
  ],

  // 主题: technology（科技）
  technology: [
    { en: 'computer', cn: '电脑', emoji: '💻', phonetic: '/kəmˈpjuːtər/', grade: 5, example: 'I use a computer to study.' },
    { en: 'phone', cn: '手机', emoji: '📱', phonetic: '/foʊn/', grade: 5, example: 'She calls her mom on the phone.' },
    { en: 'internet', cn: '互联网', emoji: '🌐', phonetic: '/ˈɪntərnet/', grade: 5, example: 'We use the internet to learn.' },
    { en: 'robot', cn: '机器人', emoji: '🤖', phonetic: '/ˈroʊbɑːt/', grade: 5, example: 'The robot can clean the room.' },
    { en: 'email', cn: '电子邮件', emoji: '📧', phonetic: '/ˈiːmeɪl/', grade: 5, example: 'I send an email to my friend.' },
    { en: 'keyboard', cn: '键盘', emoji: '⌨️', phonetic: '/ˈkiːbɔːrd/', grade: 6, example: 'Type on the keyboard.' },
    { en: 'screen', cn: '屏幕', emoji: '🖥️', phonetic: '/skriːn/', grade: 6, example: 'The screen is very big.' },
    { en: 'website', cn: '网站', emoji: '🌐', phonetic: '/ˈwebsaɪt/', grade: 6, example: 'I visit this website every day.' },
    { en: 'app', cn: '应用程序', emoji: '📲', phonetic: '/æp/', grade: 6, example: 'I use an app to learn English.' },
    { en: 'program', cn: '程序', emoji: '💻', phonetic: '/ˈproʊɡræm/', grade: 6, example: 'He learns to write a program.' },
  ],

  // 主题: environment（环境）
  environment: [
    { en: 'pollution', cn: '污染', emoji: '🏭', phonetic: '/pəˈluːʃn/', grade: 6, example: 'Air pollution is a big problem.' },
    { en: 'recycle', cn: '回收', emoji: '♻️', phonetic: '/riːˈsaɪkl/', grade: 6, example: 'We should recycle paper.' },
    { en: 'protect', cn: '保护', emoji: '🛡️', phonetic: '/prəˈtekt/', grade: 6, example: 'We must protect the earth.' },
    { en: 'plant', cn: '种植', emoji: '🌱', phonetic: '/plænt/', grade: 6, example: 'Let us plant more trees.' },
    { en: 'save', cn: '节约', emoji: '💡', phonetic: '/seɪv/', grade: 6, example: 'Save water every day.' },
    { en: 'energy', cn: '能源', emoji: '⚡', phonetic: '/ˈenərdʒi/', grade: 6, example: 'We should save energy.' },
    { en: 'forest', cn: '森林', emoji: '🌲', phonetic: '/ˈfɔːrɪst/', grade: 6, example: 'The forest is home to many animals.' },
    { en: 'ocean', cn: '海洋', emoji: '🌊', phonetic: '/ˈoʊʃn/', grade: 6, example: 'The ocean is very big.' },
    { en: 'rubbish', cn: '垃圾', emoji: '🗑️', phonetic: '/ˈrʌbɪʃ/', grade: 6, example: 'Put the rubbish in the bin.' },
    { en: 'clean', cn: '干净的', emoji: '✨', phonetic: '/kliːn/', grade: 5, example: 'Keep our city clean.' },
  ],

  // 主题: food_cooking（食物与烹饪）
  food_cooking: [
    { en: 'boil', cn: '煮沸', emoji: '🫕', phonetic: '/bɔɪl/', grade: 6, example: 'Boil the water first.' },
    { en: 'fry', cn: '煎/炒', emoji: '🍳', phonetic: '/fraɪ/', grade: 6, example: 'She fries eggs for breakfast.' },
    { en: 'bake', cn: '烘烤', emoji: '🥖', phonetic: '/beɪk/', grade: 6, example: 'We bake cookies on Sunday.' },
    { en: 'cut', cn: '切', emoji: '🔪', phonetic: '/kʌt/', grade: 6, example: 'Cut the apple into pieces.' },
    { en: 'mix', cn: '混合', emoji: '🥣', phonetic: '/mɪks/', grade: 6, example: 'Mix the flour and water.' },
    { en: 'salt', cn: '盐', emoji: '🧂', phonetic: '/sɔːlt/', grade: 6, example: 'Add some salt to the soup.' },
    { en: 'sugar', cn: '糖', emoji: '🍬', phonetic: '/ˈʃʊɡər/', grade: 6, example: 'Do you like sugar in your tea?' },
    { en: 'delicious', cn: '美味的', emoji: '😋', phonetic: '/dɪˈlɪʃəs/', grade: 6, example: 'The food is delicious.' },
    { en: 'recipe', cn: '食谱', emoji: '📋', phonetic: '/ˈresəpi/', grade: 6, example: 'Follow the recipe to make a cake.' },
    { en: 'ingredient', cn: '食材', emoji: '🥬', phonetic: '/ɪnˈɡriːdiənt/', grade: 6, example: 'We need fresh ingredients.' },
  ],

  // 主题: sports（运动）
  sports: [
    { en: 'basketball', cn: '篮球', emoji: '🏀', phonetic: '/ˈbæskɪtbɔːl/', grade: 5, example: 'He plays basketball after school.' },
    { en: 'football', cn: '足球', emoji: '⚽', phonetic: '/ˈfʊtbɔːl/', grade: 5, example: 'Football is very popular.' },
    { en: 'table tennis', cn: '乒乓球', emoji: '🏓', phonetic: '/ˈteɪbl ˈtenɪs/', grade: 5, example: 'She is good at table tennis.' },
    { en: 'volleyball', cn: '排球', emoji: '🏐', phonetic: '/ˈvɑːlibɔːl/', grade: 5, example: 'We play volleyball on the beach.' },
    { en: 'badminton', cn: '羽毛球', emoji: '🏸', phonetic: '/ˈbædmɪntən/', grade: 5, example: 'My father likes badminton.' },
    { en: 'swimming', cn: '游泳', emoji: '🏊', phonetic: '/ˈswɪmɪŋ/', grade: 5, example: 'Swimming is good for health.' },
    { en: 'running', cn: '跑步', emoji: '🏃', phonetic: '/ˈrʌnɪŋ/', grade: 5, example: 'I go running every morning.' },
    { en: 'skipping', cn: '跳绳', emoji: '🤸', phonetic: '/ˈskɪpɪŋ/', grade: 5, example: 'The girls like skipping.' },
    { en: 'gymnastics', cn: '体操', emoji: '🤸‍♀️', phonetic: '/dʒɪmˈnæstɪks/', grade: 6, example: 'She practices gymnastics every day.' },
    { en: 'race', cn: '赛跑', emoji: '🏁', phonetic: '/reɪs/', grade: 6, example: 'He won the 100-metre race.' },
  ],
};


// ============================================================
// 2. 听力题库 listeningData
// 分三个级别，每级别至少 15 题
// 每题含: grade, type, question, answer, options, audio_text
// ============================================================
const listeningData = {

  // ---------- 一级听力题 ----------
  grade1: [
    {
      grade: 1,
      type: '听单词选图片',
      question: '听录音，选出你听到的动物。',
      answer: 'B',
      options: ['A. cat', 'B. dog', 'C. pig'],
      audio_text: 'dog',
    },
    {
      grade: 1,
      type: '听数字',
      question: '听录音，选出你听到的数字。',
      answer: 'C',
      options: ['A. two', 'B. five', 'C. seven'],
      audio_text: 'seven',
    },
    {
      grade: 1,
      type: '听颜色',
      question: '听录音，选出你听到的颜色。',
      answer: 'A',
      options: ['A. red', 'B. blue', 'C. green'],
      audio_text: 'red',
    },
    {
      grade: 1,
      type: '听单词选图片',
      question: '听录音，选出你听到的水果。',
      answer: 'B',
      options: ['A. banana', 'B. apple', 'C. orange'],
      audio_text: 'apple',
    },
    {
      grade: 1,
      type: '听数字',
      question: '听录音，选出你听到的数字。',
      answer: 'A',
      options: ['A. three', 'B. six', 'C. nine'],
      audio_text: 'three',
    },
    {
      grade: 1,
      type: '听颜色',
      question: '听录音，选出你听到的颜色。',
      answer: 'C',
      options: ['A. yellow', 'B. pink', 'C. white'],
      audio_text: 'white',
    },
    {
      grade: 1,
      type: '听单词选图片',
      question: '听录音，选出你听到的物品。',
      answer: 'A',
      options: ['A. book', 'B. pen', 'C. bag'],
      audio_text: 'book',
    },
    {
      grade: 1,
      type: '听数字',
      question: '听录音，选出你听到的数字。',
      answer: 'B',
      options: ['A. one', 'B. four', 'C. eight'],
      audio_text: 'four',
    },
    {
      grade: 1,
      type: '听颜色',
      question: '听录音，选出你听到的颜色。',
      answer: 'B',
      options: ['A. green', 'B. blue', 'C. black'],
      audio_text: 'blue',
    },
    {
      grade: 1,
      type: '听单词选图片',
      question: '听录音，选出你听到的动物。',
      answer: 'C',
      options: ['A. bird', 'B. fish', 'C. rabbit'],
      audio_text: 'rabbit',
    },
    {
      grade: 1,
      type: '听数字',
      question: '听录音，选出你听到的数字。',
      answer: 'A',
      options: ['A. ten', 'B. seven', 'C. five'],
      audio_text: 'ten',
    },
    {
      grade: 1,
      type: '听颜色',
      question: '听录音，选出你听到的颜色。',
      answer: 'A',
      options: ['A. yellow', 'B. red', 'C. purple'],
      audio_text: 'yellow',
    },
    {
      grade: 1,
      type: '听单词选图片',
      question: '听录音，选出你听到的文具。',
      answer: 'B',
      options: ['A. ruler', 'B. pencil', 'C. eraser'],
      audio_text: 'pencil',
    },
    {
      grade: 1,
      type: '听数字',
      question: '听录音，选出你听到的数字。',
      answer: 'C',
      options: ['A. two', 'B. four', 'C. six'],
      audio_text: 'six',
    },
    {
      grade: 1,
      type: '听颜色',
      question: '听录音，选出你听到的颜色。',
      answer: 'B',
      options: ['A. orange', 'B. pink', 'C. brown'],
      audio_text: 'pink',
    },
  ],

  // ---------- 二级听力题 ----------
  grade2: [
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。',
      answer: 'A',
      options: ['A. It is sunny.', 'B. It is rainy.', 'C. It is cloudy.'],
      audio_text: 'It is sunny today.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。',
      answer: 'B',
      options: ['A. I have two books.', 'B. I have three pens.', 'C. I have four pencils.'],
      audio_text: 'I have three pens.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。What does Amy like?',
      answer: 'C',
      options: ['A. apples', 'B. bananas', 'C. oranges'],
      audio_text: '— What do you like, Amy? — I like oranges.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。What colour is the bag?',
      answer: 'A',
      options: ['A. It is blue.', 'B. It is red.', 'C. It is green.'],
      audio_text: 'My bag is blue.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。How many cats does Tom have?',
      answer: 'B',
      options: ['A. One', 'B. Two', 'C. Three'],
      audio_text: '— How many cats do you have, Tom? — I have two cats.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。Where is the book?',
      answer: 'C',
      options: ['A. On the chair.', 'B. In the bag.', 'C. On the desk.'],
      audio_text: 'The book is on the desk.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。What is the weather like today?',
      answer: 'A',
      options: ['A. It is windy.', 'B. It is snowy.', 'C. It is hot.'],
      audio_text: '— What is the weather like today? — It is windy.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。What does the boy have for breakfast?',
      answer: 'B',
      options: ['A. Bread and milk.', 'B. Eggs and milk.', 'C. Cake and juice.'],
      audio_text: 'I have eggs and milk for breakfast.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。Who is tall?',
      answer: 'A',
      options: ['A. The father.', 'B. The mother.', 'C. The brother.'],
      audio_text: '— Who is tall in your family? — My father is tall.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。What can the girl do?',
      answer: 'C',
      options: ['A. She can sing.', 'B. She can dance.', 'C. She can swim.'],
      audio_text: 'I can swim very well.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。Where are they going?',
      answer: 'B',
      options: ['A. To the park.', 'B. To the zoo.', 'C. To the school.'],
      audio_text: '— Let us go to the zoo! — Great! I want to see pandas.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。When does the boy get up?',
      answer: 'A',
      options: ['A. At six.', 'B. At seven.', 'C. At eight.'],
      audio_text: 'I get up at six every morning.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。What subject does the girl like?',
      answer: 'C',
      options: ['A. Math.', 'B. Science.', 'C. English.'],
      audio_text: '— What is your favourite subject? — I like English best.',
    },
    {
      grade: 2,
      type: '听句子选答案',
      question: '听录音，选出正确的答案。What is the girl wearing?',
      answer: 'B',
      options: ['A. A red dress.', 'B. A pink skirt.', 'C. A blue coat.'],
      audio_text: 'She is wearing a pink skirt.',
    },
    {
      grade: 2,
      type: '听对话',
      question: '听对话，选出正确的答案。Whose pencil is this?',
      answer: 'A',
      options: ['A. It is Lily\'s.', 'B. It is Tom\'s.', 'C. It is Jack\'s.'],
      audio_text: '— Whose pencil is this? — It is Lily\'s pencil.',
    },
  ],

  // ---------- 三级听力题 ----------
  grade3: [
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。Where does Sarah live?',
      answer: 'A',
      options: ['A. In Beijing.', 'B. In Shanghai.', 'C. In Guangzhou.'],
      audio_text: 'Sarah is a student. She lives in Beijing with her family. She goes to school by bike every day. She likes reading books and playing table tennis. Her favourite subject is English. She wants to be a teacher in the future.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What does Mike do on weekends?',
      answer: 'B',
      options: ['A. He plays football.', 'B. He goes swimming.', 'C. He watches TV.'],
      audio_text: 'Mike is a busy student. From Monday to Friday, he studies hard at school. On Saturday morning, he helps his mother clean the house. On Sunday, he goes swimming with his friends. He feels very happy.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。How does the boy go to school?',
      answer: 'C',
      options: ['A. By bus.', 'B. By bike.', 'C. On foot.'],
      audio_text: 'My name is Jack. I am eleven years old. I live near my school, so I walk to school every day. I like my school because the teachers are very nice. After school, I play basketball with my classmates.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What is the weather like in spring in the passage?',
      answer: 'A',
      options: ['A. Warm and sunny.', 'B. Hot and rainy.', 'C. Cold and windy.'],
      audio_text: 'There are four seasons in a year. In spring, it is warm and sunny. Flowers bloom and birds sing. In summer, it is hot and we often go swimming. In autumn, leaves fall from the trees. In winter, it is cold and sometimes it snows. I like spring best because everything is beautiful.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What did Lisa do yesterday?',
      answer: 'B',
      options: ['A. She went shopping.', 'B. She visited her grandma.', 'C. She did her homework.'],
      audio_text: 'Yesterday was Sunday. Lisa did not go to school. In the morning, she finished her homework. In the afternoon, she visited her grandma. Her grandma made delicious noodles for her. Lisa was very happy.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。When is the school trip?',
      answer: 'C',
      options: ['A. Next Monday.', 'B. Next Wednesday.', 'C. Next Friday.'],
      audio_text: 'Good news, everyone! We are going to have a school trip next Friday. We will go to the science museum. We will meet at school at eight in the morning and take a bus there. Please bring your lunch and water. I hope you will have a wonderful time.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。Why was Tom sad yesterday?',
      answer: 'A',
      options: ['A. He lost his bag.', 'B. He failed the test.', 'C. He was sick.'],
      audio_text: 'Tom was sad yesterday because he lost his school bag. He looked everywhere but could not find it. His friend Peter helped him look for it. Finally, they found it in the library. Tom was very thankful and happy.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What does the girl want to be?',
      answer: 'B',
      options: ['A. A doctor.', 'B. A writer.', 'C. A pilot.'],
      audio_text: 'Emma loves reading books. She reads every day after school. She likes stories about animals and nature. She writes stories in her notebook too. She wants to be a writer when she grows up so she can share her stories with children all over the world.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。How many people are there in Sam\'s family?',
      answer: 'C',
      options: ['A. Three.', 'B. Four.', 'C. Five.'],
      audio_text: 'Hello, my name is Sam. There are five people in my family. They are my grandfather, my grandmother, my father, my mother and me. My grandfather likes fishing. My grandmother likes cooking. My father is a teacher and my mother is a nurse. I love my family very much.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What should we do to protect the environment?',
      answer: 'A',
      options: ['A. Plant trees and save water.', 'B. Drive cars less.', 'C. Use more plastic bags.'],
      audio_text: 'Our earth is beautiful, but it needs our help. We should protect the environment. We can plant more trees and save water. We should not throw rubbish everywhere. We should recycle paper and plastic bottles. If everyone does a little, our world will be much better.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What is David\'s favourite sport?',
      answer: 'B',
      options: ['A. Basketball.', 'B. Football.', 'C. Swimming.'],
      audio_text: 'David is a sporty boy. He likes many sports, but football is his favourite. He plays football with his friends every Saturday afternoon. He also likes watching football matches on TV. His dream is to become a great football player one day.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。Where are the children going for the holiday?',
      answer: 'C',
      options: ['A. To the beach.', 'B. To the mountains.', 'C. To the countryside.'],
      audio_text: 'The summer holiday is coming. The children are very excited. They are going to the countryside to visit their uncle. Their uncle has a big farm with many animals. They will help feed the animals and pick fruit. They will also have a barbecue under the stars.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。How did the man feel at the end?',
      answer: 'A',
      options: ['A. Happy and proud.', 'B. Tired and sad.', 'C. Worried and scared.'],
      audio_text: 'Last weekend, our school had a sports day. There were many races and games. Mr. Li, our PE teacher, ran in the teachers\' race. He ran very fast and won first place. All the students cheered for him. He was very happy and proud of himself.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。What is the passage mainly about?',
      answer: 'B',
      options: ['A. A birthday party.', 'B. Spring Festival traditions.', 'C. Christmas customs.'],
      audio_text: 'Spring Festival is the most important festival in China. Before the festival, people clean their houses and buy new clothes. On New Year\'s Eve, families get together and have a big dinner. Children get red packets with money. People visit relatives and friends during the holiday.',
    },
    {
      grade: 3,
      type: '听短文选答案',
      question: '听短文，选出正确的答案。Why does the writer like autumn best?',
      answer: 'C',
      options: ['A. It is warm.', 'B. She can swim.', 'C. The colours are beautiful.'],
      audio_text: 'I like all the seasons, but autumn is my favourite season. In autumn, the leaves on the trees change colour. Some are yellow, some are orange and some are red. The weather is cool and comfortable. I like walking in the park and looking at the beautiful leaves. It makes me feel peaceful.',
    },
  ],
};


// ============================================================
// 3. 阅读材料 readingData
// 分三个级别，每级别至少 6 篇
// 每篇含: grade, title, content, questions(q/options/answer)
// ============================================================
const readingData = {

  // ---------- 一级阅读（简单短文 30-50 词，2 题）----------
  grade1: [
    {
      grade: 1,
      title: 'My Cat',
      content: 'I have a cat. Its name is Mimi. It is white and small. It likes fish and milk. Mimi sleeps on my bed. I love my cat very much.',
      questions: [
        {
          q: 'What colour is the cat?',
          options: ['A. Black.', 'B. White.', 'C. Brown.'],
          answer: 'B',
        },
        {
          q: 'What does the cat like?',
          options: ['A. Fish and milk.', 'B. Bread and milk.', 'C. Fish and rice.'],
          answer: 'A',
        },
      ],
    },
    {
      grade: 1,
      title: 'My School',
      content: 'My school is big and clean. There are many classrooms. I like my classroom. My teacher is Miss Li. She is very nice. I like to read books in the classroom.',
      questions: [
        {
          q: 'Who is the teacher?',
          options: ['A. Miss Wang.', 'B. Miss Li.', 'C. Miss Chen.'],
          answer: 'B',
        },
        {
          q: 'What does the writer like to do?',
          options: ['A. Sing songs.', 'B. Play games.', 'C. Read books.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 1,
      title: 'A Sunny Day',
      content: 'Today is a sunny day. The sky is blue. The birds are singing. I go to the park with my friends. We play on the playground. We are very happy.',
      questions: [
        {
          q: 'How is the weather today?',
          options: ['A. Rainy.', 'B. Cloudy.', 'C. Sunny.'],
          answer: 'C',
        },
        {
          q: 'Where do they go?',
          options: ['A. To the zoo.', 'B. To the park.', 'C. To the school.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 1,
      title: 'My Family',
      content: 'Hello! I am Tom. I have a happy family. There are four people in my family. My father, my mother, my sister and me. My father is a teacher. My mother is a nurse. I love my family.',
      questions: [
        {
          q: 'How many people are there in Tom\'s family?',
          options: ['A. Three.', 'B. Four.', 'C. Five.'],
          answer: 'B',
        },
        {
          q: 'What is Tom\'s mother?',
          options: ['A. A teacher.', 'B. A doctor.', 'C. A nurse.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 1,
      title: 'My Lunch',
      content: 'It is twelve o\'clock. It is time for lunch. I have rice, chicken and vegetables. I also have some apple juice. The food is very delicious. I like lunch time.',
      questions: [
        {
          q: 'What does the writer have for lunch?',
          options: ['A. Rice and fish.', 'B. Rice, chicken and vegetables.', 'C. Bread and eggs.'],
          answer: 'B',
        },
        {
          q: 'What does the writer drink?',
          options: ['A. Milk.', 'B. Water.', 'C. Apple juice.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 1,
      title: 'The Dog',
      content: 'This is my dog, Max. Max is a big brown dog. He has long ears and a short tail. Max likes to run and play. He can catch a ball. Max is my best friend.',
      questions: [
        {
          q: 'What colour is Max?',
          options: ['A. Black.', 'B. Brown.', 'C. White.'],
          answer: 'B',
        },
        {
          q: 'What can Max do?',
          options: ['A. Sing.', 'B. Dance.', 'C. Catch a ball.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 1,
      title: 'My Bedroom',
      content: 'My bedroom is small but nice. There is a bed, a desk and a chair. My books are on the desk. There is a picture on the wall. It is a picture of a tree. I like my room.',
      questions: [
        {
          q: 'Where are the books?',
          options: ['A. On the bed.', 'B. On the desk.', 'C. On the chair.'],
          answer: 'B',
        },
        {
          q: 'What is on the wall?',
          options: ['A. A map.', 'B. A clock.', 'C. A picture of a tree.'],
          answer: 'C',
        },
      ],
    },
  ],

  // ---------- 二级阅读（中等短文 50-80 词，3 题）----------
  grade2: [
    {
      grade: 2,
      title: 'A Day at School',
      content: 'I get up at seven every morning. I have bread and milk for breakfast. Then I go to school by bus. School starts at eight. We have four classes in the morning. My favourite class is English. I eat lunch at school. In the afternoon, we have two classes. After school, I play football with my friends. I go home at five.',
      questions: [
        {
          q: 'How does the writer go to school?',
          options: ['A. By bike.', 'B. By bus.', 'C. On foot.'],
          answer: 'B',
        },
        {
          q: 'What is the writer\'s favourite class?',
          options: ['A. Math.', 'B. Music.', 'C. English.'],
          answer: 'C',
        },
        {
          q: 'What does the writer do after school?',
          options: ['A. Plays football.', 'B. Plays basketball.', 'C. Reads books.'],
          answer: 'A',
        },
      ],
    },
    {
      grade: 2,
      title: 'My Best Friend',
      content: 'My best friend is Lily. She is ten years old. She has long black hair and big eyes. She is friendly and helpful. Lily likes drawing pictures and reading books. She can draw very well. On weekends, we often go to the park together. Sometimes we fly kites. I am lucky to have Lily as my friend.',
      questions: [
        {
          q: 'How old is Lily?',
          options: ['A. Nine.', 'B. Ten.', 'C. Eleven.'],
          answer: 'B',
        },
        {
          q: 'What does Lily like to do?',
          options: ['A. Sing and dance.', 'B. Draw and read.', 'C. Swim and run.'],
          answer: 'B',
        },
        {
          q: 'Where do they go on weekends?',
          options: ['A. To the zoo.', 'B. To the cinema.', 'C. To the park.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 2,
      title: 'Four Seasons',
      content: 'There are four seasons in a year. Spring is warm and green. We can see many flowers. Summer is hot. We eat ice cream and go swimming. Autumn is cool. The leaves turn yellow and red. Winter is cold. We can make snowmen and play in the snow. Every season is beautiful.',
      questions: [
        {
          q: 'What can we do in summer?',
          options: ['A. Fly kites.', 'B. Go swimming.', 'C. Make snowmen.'],
          answer: 'B',
        },
        {
          q: 'What colour are the leaves in autumn?',
          options: ['A. Green.', 'B. Yellow and red.', 'C. White.'],
          answer: 'B',
        },
        {
          q: 'Which season is cold?',
          options: ['A. Spring.', 'B. Summer.', 'C. Winter.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 2,
      title: 'Animals in the Zoo',
      content: 'Today, I go to the zoo with my family. I see many animals. The elephants are very big. They have long noses. The monkeys are clever. They jump from tree to tree. The pandas are cute. They eat bamboo. My little brother likes the tigers best. They are strong and fast. We have a great time at the zoo.',
      questions: [
        {
          q: 'What do the elephants have?',
          options: ['A. Long ears.', 'B. Long noses.', 'C. Long tails.'],
          answer: 'B',
        },
        {
          q: 'What do the pandas eat?',
          options: ['A. Bananas.', 'B. Bamboo.', 'C. Fish.'],
          answer: 'B',
        },
        {
          q: 'Which animal does the little brother like best?',
          options: ['A. Pandas.', 'B. Monkeys.', 'C. Tigers.'],
          answer: 'C',
        },
      ],
    },
    {
      grade: 2,
      title: 'A Picnic',
      content: 'It is Sunday. The weather is sunny and warm. My family and I go for a picnic in the park. My mother makes sandwiches. My father brings some fruit and juice. My sister brings a kite. We eat the food under a big tree. Then we play games and fly the kite. We all feel very happy.',
      questions: [
        {
          q: 'Who makes sandwiches?',
          options: ['A. Father.', 'B. Mother.', 'C. Sister.'],
          answer: 'B',
        },
        {
          q: 'What does the father bring?',
          options: ['A. Sandwiches.', 'B. Cake and milk.', 'C. Fruit and juice.'],
          answer: 'C',
        },
        {
          q: 'Where do they eat the food?',
          options: ['A. At home.', 'B. Under a big tree.', 'C. In the car.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 2,
      title: 'My Pet Rabbit',
      content: 'I have a pet rabbit. Its name is Snowball because it is white like snow. It has long ears and red eyes. Snowball likes eating carrots and cabbage. It lives in a small box in my room. Every afternoon, I play with Snowball in the garden. It can jump very high. Snowball is very cute and I love it.',
      questions: [
        {
          q: 'Why is the rabbit named Snowball?',
          options: ['A. It likes snow.', 'B. It is white like snow.', 'C. It plays with snow.'],
          answer: 'B',
        },
        {
          q: 'What does Snowball like eating?',
          options: ['A. Fish and rice.', 'B. Bread and milk.', 'C. Carrots and cabbage.'],
          answer: 'C',
        },
        {
          q: 'When does the writer play with the rabbit?',
          options: ['A. Every morning.', 'B. Every afternoon.', 'C. Every evening.'],
          answer: 'B',
        },
      ],
    },
  ],

  // ---------- 三级阅读（较长短文 80-120 词，3-4 题，含推理题）----------
  grade3: [
    {
      grade: 3,
      title: 'A Letter to a Pen Pal',
      content: 'Dear Emma,\nMy name is Chen Jie. I am twelve years old. I live in Shanghai, China. Shanghai is a big and modern city. There are many tall buildings and beautiful parks here. My favourite place is the Bund. You can see the river and the city lights there at night.\nI go to school from Monday to Friday. I study Chinese, English, math, science and music. I like English best because I want to make friends from all over the world. My hobby is reading books. I read every day before bedtime.\nWhat about you? Where do you live? What do you like to do?\nYour friend,\nChen Jie',
      questions: [
        {
          q: 'Where does Chen Jie live?',
          options: ['A. In Beijing.', 'B. In Shanghai.', 'C. In Guangzhou.'],
          answer: 'B',
        },
        {
          q: 'Why does Chen Jie like English best?',
          options: ['A. Because the teacher is nice.', 'B. Because it is easy.', 'C. Because she wants to make friends from all over the world.'],
          answer: 'C',
        },
        {
          q: 'What is Chen Jie\'s hobby?',
          options: ['A. Singing.', 'B. Dancing.', 'C. Reading books.'],
          answer: 'C',
        },
        {
          q: 'What can you infer (推断) about this passage?',
          options: ['A. Chen Jie writes to Emma.', 'B. Emma lives in China too.', 'C. Chen Jie does not like school.'],
          answer: 'A',
        },
      ],
    },
    {
      grade: 3,
      title: 'The School Talent Show',
      content: 'Last Friday, our school had a talent show. Many students performed on stage. First, Tom played the guitar. He practiced for three weeks and played very well. Then, Lucy sang an English song. Her voice was beautiful and everyone clapped. After that, a group of students performed a short play about protecting the environment. They wore costumes made of recycled materials. It was very creative. Finally, Mike did a magic trick. He made a rabbit appear from an empty hat. The audience was surprised. The talent show was a great success. We all enjoyed it very much.',
      questions: [
        {
          q: 'When did the talent show happen?',
          options: ['A. Last Monday.', 'B. Last Friday.', 'C. Last Saturday.'],
          answer: 'B',
        },
        {
          q: 'What did the students\' play teach us about?',
          options: ['A. Animals.', 'B. History.', 'C. Protecting the environment.'],
          answer: 'C',
        },
        {
          q: 'What did Mike do?',
          options: ['A. He sang a song.', 'B. He did a magic trick.', 'C. He played the guitar.'],
          answer: 'B',
        },
        {
          q: 'How did the audience feel about the magic trick?',
          options: ['A. Bored.', 'B. Surprised.', 'C. Angry.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 3,
      title: 'How to Keep Healthy',
      content: 'Health is very important for everyone, especially for children. Here are some tips to help you stay healthy.\nFirst, eat well. You should eat more vegetables and fruit. They have many vitamins. Do not eat too much junk food like hamburgers and chips. Drink water instead of sweet drinks.\nSecond, exercise every day. You can run, swim, play football or ride a bike. Try to exercise for at least thirty minutes each day.\nThird, sleep well. Children should sleep for about nine or ten hours every night. Do not stay up too late.\nFinally, be happy. A good mood helps you stay healthy too. Smile more and enjoy your life!',
      questions: [
        {
          q: 'What should we eat more?',
          options: ['A. Junk food.', 'B. Vegetables and fruit.', 'C. Hamburgers.'],
          answer: 'B',
        },
        {
          q: 'How long should children exercise every day?',
          options: ['A. Ten minutes.', 'B. Twenty minutes.', 'C. At least thirty minutes.'],
          answer: 'C',
        },
        {
          q: 'How many hours should children sleep every night?',
          options: ['A. About eight hours.', 'B. About nine or ten hours.', 'C. About twelve hours.'],
          answer: 'B',
        },
        {
          q: 'What is the main idea of this passage?',
          options: ['A. How to study well.', 'B. How to keep healthy.', 'C. How to make friends.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 3,
      title: 'A Visit to the Science Museum',
      content: 'Last Saturday, our class visited the science museum. We went there by school bus. The museum was very big and had many interesting exhibitions.\nFirst, we went to the space exhibition. We saw models of rockets and planets. We even tried on a space suit. It was very exciting. Then we went to the robot exhibition. There was a robot that could talk and dance. It could also play chess. Many students played chess with the robot.\nAfter lunch, we visited the nature exhibition. We learned about different animals and plants. We also did some science experiments. It was a wonderful day. We learned a lot and had fun at the same time.',
      questions: [
        {
          q: 'How did the class go to the museum?',
          options: ['A. By bus.', 'B. By train.', 'C. By bike.'],
          answer: 'A',
        },
        {
          q: 'What could the robot do?',
          options: ['A. Cook food.', 'B. Talk, dance and play chess.', 'C. Drive a car.'],
          answer: 'B',
        },
        {
          q: 'What did they learn about in the nature exhibition?',
          options: ['A. Space and planets.', 'B. Robots and machines.', 'C. Animals and plants.'],
          answer: 'C',
        },
        {
          q: 'What can we infer from the passage?',
          options: ['A. The students did not like the museum.', 'B. The museum has many different exhibitions.', 'C. The students visited only one exhibition.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 3,
      title: 'The Story of the Little Turtle',
      content: 'Once upon a time, there was a little turtle named Tim. Tim was very slow. The other animals often laughed at him. "You are so slow!" they said. Tim felt sad but he did not give up.\nOne day, there was a race. The rabbit, the deer and many other fast animals joined the race. Tim joined too. Everyone laughed. "You can not win, Tim!" they said.\nThe race began. The rabbit ran very fast. He was far ahead. He decided to take a nap under a tree. But Tim kept walking, step by step. He did not stop. When the rabbit woke up, Tim was already near the finish line. The rabbit ran as fast as he could, but it was too late. Tim won the race!\nEveryone was surprised. Tim smiled and said, "Slow and steady wins the race."',
      questions: [
        {
          q: 'Why did the other animals laugh at Tim?',
          options: ['A. Because he was small.', 'B. Because he was slow.', 'C. Because he was big.'],
          answer: 'B',
        },
        {
          q: 'What did the rabbit do during the race?',
          options: ['A. He ran all the way.', 'B. He took a nap.', 'C. He gave up.'],
          answer: 'B',
        },
        {
          q: 'Who won the race?',
          options: ['A. The rabbit.', 'B. The deer.', 'C. The little turtle.'],
          answer: 'C',
        },
        {
          q: 'What can we learn from this story?',
          options: ['A. Being fast is always best.', 'B. Never give up and keep trying.', 'C. Sleep is more important than work.'],
          answer: 'B',
        },
      ],
    },
    {
      grade: 3,
      title: 'Our Earth, Our Home',
      content: 'The Earth is our home. It gives us air to breathe, water to drink and food to eat. But the Earth is facing many problems. Air pollution, water pollution and cutting down trees are making our home sick.\nWe must do something to help. Here are some things we can do. First, we can plant more trees. Trees help clean the air. Second, we can save water. Turn off the tap when we brush our teeth. Third, we should not throw rubbish into rivers or oceans. Fourth, we can walk or ride bikes instead of using cars. This helps reduce air pollution.\nEvery little action counts. If we all work together, we can make our Earth a better place to live. Let us start today!',
      questions: [
        {
          q: 'What problems is the Earth facing?',
          options: ['A. Only air pollution.', 'B. Air pollution, water pollution and cutting down trees.', 'C. Only water pollution.'],
          answer: 'B',
        },
        {
          q: 'What can trees do?',
          options: ['A. Give us food.', 'B. Help clean the air.', 'C. Make water.'],
          answer: 'B',
        },
        {
          q: 'What should we do when we brush our teeth?',
          options: ['A. Leave the water running.', 'B. Turn off the tap.', 'C. Use more water.'],
          answer: 'B',
        },
        {
          q: 'What is the purpose (目的) of this passage?',
          options: ['A. To introduce animals.', 'B. To tell a story.', 'C. To ask people to protect the Earth.'],
          answer: 'C',
        },
      ],
    },
  ],
};


// ============================================================
// 4. 语法练习库 grammarData
// 按新课标要求，覆盖小学所有语法点
// 每题含: grade, topic, explanation(语法讲解), exercise_type, questions
// ============================================================
const grammarData = [

  // ---------- be 动词 (am/is/are) ----------
  {
    grade: 3,
    topic: 'be动词 (am/is/are)',
    explanation: 'be 动词有三个形式：am、is、are。I 后面用 am；he/she/it 和单数名词后面用 is；we/you/they 和复数名词后面用 are。',
    exercise_type: 'choice',
    questions: [
      {
        q: 'I ___ a student.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'A',
      },
      {
        q: 'She ___ my friend.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'B',
      },
      {
        q: 'They ___ from China.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'C',
      },
      {
        q: 'The cat ___ on the desk.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'B',
      },
      {
        q: 'Tom and I ___ good friends.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'C',
      },
    ],
  },

  // ---------- 一般现在时 ----------
  {
    grade: 3,
    topic: '一般现在时',
    explanation: '一般现在时表示经常发生的动作或存在的状态。主语是 I/you/we/they 或复数名词时，动词用原形；主语是 he/she/it 或单数名词时，动词加 -s 或 -es。',
    exercise_type: 'fill',
    questions: [
      {
        q: 'She ___ (like) apples very much.',
        options: ['A. like', 'B. likes', 'C. liking'],
        answer: 'B',
      },
      {
        q: 'They ___ (play) football every day.',
        options: ['A. play', 'B. plays', 'C. playing'],
        answer: 'A',
      },
      {
        q: 'He ___ (go) to school by bus.',
        options: ['A. go', 'B. goes', 'C. going'],
        answer: 'B',
      },
      {
        q: 'My mother ___ (cook) dinner at six.',
        options: ['A. cook', 'B. cooks', 'C. cooking'],
        answer: 'B',
      },
      {
        q: 'We ___ (read) books in the library.',
        options: ['A. read', 'B. reads', 'C. reading'],
        answer: 'A',
      },
    ],
  },

  // ---------- 现在进行时 ----------
  {
    grade: 4,
    topic: '现在进行时',
    explanation: '现在进行时表示正在发生的动作。结构：主语 + am/is/are + 动词-ing。如：I am reading. She is singing. They are playing.',
    exercise_type: 'fill',
    questions: [
      {
        q: 'Look! The boy ___ (run) on the playground.',
        options: ['A. run', 'B. runs', 'C. is running'],
        answer: 'C',
      },
      {
        q: 'I ___ (read) a book now.',
        options: ['A. am reading', 'B. read', 'C. reads'],
        answer: 'A',
      },
      {
        q: 'They ___ (play) basketball at the moment.',
        options: ['A. play', 'B. are playing', 'C. plays'],
        answer: 'B',
      },
      {
        q: 'Listen! She ___ (sing) an English song.',
        options: ['A. sings', 'B. is singing', 'C. sing'],
        answer: 'B',
      },
      {
        q: 'My father ___ (watch) TV in the living room.',
        options: ['A. watches', 'B. is watching', 'C. watch'],
        answer: 'B',
      },
    ],
  },

  // ---------- 一般过去时 ----------
  {
    grade: 5,
    topic: '一般过去时',
    explanation: '一般过去时表示过去发生的动作或状态。规则动词加 -ed（如 played, watched）；不规则动词需要特别记忆（如 went, ate, saw）。句中有 often 用过去时间词：yesterday, last week, last night 等。',
    exercise_type: 'fill',
    questions: [
      {
        q: 'I ___ (go) to the zoo yesterday.',
        options: ['A. go', 'B. went', 'C. going'],
        answer: 'B',
      },
      {
        q: 'She ___ (watch) TV last night.',
        options: ['A. watch', 'B. watches', 'C. watched'],
        answer: 'C',
      },
      {
        q: 'Tom ___ (eat) two apples this morning.',
        options: ['A. ate', 'B. eats', 'C. eating'],
        answer: 'A',
      },
      {
        q: 'We ___ (visit) the museum last week.',
        options: ['A. visit', 'B. visited', 'C. visiting'],
        answer: 'B',
      },
      {
        q: 'He ___ (see) a bird in the tree yesterday.',
        options: ['A. see', 'B. sees', 'C. saw'],
        answer: 'C',
      },
    ],
  },

  // ---------- 一般将来时 ----------
  {
    grade: 6,
    topic: '一般将来时',
    explanation: '一般将来时表示将要发生的动作或计划。常用两种结构：(1) will + 动词原形；(2) be going to + 动词原形。如：I will go. She is going to visit.',
    exercise_type: 'choice',
    questions: [
      {
        q: 'We ___ visit the Great Wall next week.',
        options: ['A. will', 'B. did', 'C. are'],
        answer: 'A',
      },
      {
        q: 'She ___ going to have a picnic tomorrow.',
        options: ['A. am', 'B. is', 'C. are'],
        answer: 'B',
      },
      {
        q: 'I ___ (be) a doctor when I grow up.',
        options: ['A. will be', 'B. am', 'C. was'],
        answer: 'A',
      },
      {
        q: 'They are going to ___ (play) football this afternoon.',
        options: ['A. played', 'B. play', 'C. playing'],
        answer: 'B',
      },
      {
        q: 'It ___ (rain) tomorrow.',
        options: ['A. will rain', 'B. rained', 'C. is raining'],
        answer: 'A',
      },
    ],
  },

  // ---------- 名词复数 ----------
  {
    grade: 4,
    topic: '名词复数',
    explanation: '名词复数变化规则：(1) 一般加 -s（cat→cats）；(2) 以 s, x, sh, ch 结尾加 -es（box→boxes）；(3) 以辅音字母+y 结尾，变 y 为 i 加 -es（family→families）；(4) 不规则变化（child→children, foot→feet）。',
    exercise_type: 'choice',
    questions: [
      {
        q: 'There are three ___ on the desk.',
        options: ['A. book', 'B. books', 'C. bookes'],
        answer: 'B',
      },
      {
        q: 'I can see many ___ in the zoo.',
        options: ['A. monkey', 'B. monkies', 'C. monkeys'],
        answer: 'C',
      },
      {
        q: 'There are five ___ in my family.',
        options: ['A. child', 'B. childs', 'C. children'],
        answer: 'C',
      },
      {
        q: 'The ___ are playing on the playground.',
        options: ['A. box', 'B. boxes', 'C. boxs'],
        answer: 'B',
      },
      {
        q: 'Two ___ are standing near the door.',
        options: ['A. man', 'B. mans', 'C. men'],
        answer: 'C',
      },
    ],
  },

  // ---------- 代词（主格/宾格/物主） ----------
  {
    grade: 4,
    topic: '代词（主格/宾格/物主）',
    explanation: '主格代词做主语：I, you, he, she, it, we, they。宾格代词做宾语：me, you, him, her, it, us, them。形容词性物主代词：my, your, his, her, its, our, their。名词性物主代词：mine, yours, his, hers, its, ours, theirs。',
    exercise_type: 'fill',
    questions: [
      {
        q: '___ (He/Him) is my brother.',
        options: ['A. He', 'B. Him', 'C. His'],
        answer: 'A',
      },
      {
        q: 'Please give ___ (I/me) a book.',
        options: ['A. I', 'B. me', 'C. my'],
        answer: 'B',
      },
      {
        q: 'This is ___ (she/her) bag.',
        options: ['A. she', 'B. her', 'C. hers'],
        answer: 'B',
      },
      {
        q: '___ (We/Us) are good friends.',
        options: ['A. We', 'B. Us', 'C. Our'],
        answer: 'A',
      },
      {
        q: 'The cat is ___ (my/mine).',
        options: ['A. my', 'B. me', 'C. mine'],
        answer: 'C',
      },
    ],
  },

  // ---------- 介词 (in/on/at) ----------
  {
    grade: 4,
    topic: '介词 (in/on/at)',
    explanation: 'in 表示在...里面/在某年某月某季节；on 表示在...上面/在某一天；at 表示在某时刻/某地点。如：in the morning, on Monday, at seven o\'clock.',
    exercise_type: 'fill',
    questions: [
      {
        q: 'The book is ___ the desk.',
        options: ['A. in', 'B. on', 'C. at'],
        answer: 'B',
      },
      {
        q: 'I get up ___ seven o\'clock every morning.',
        options: ['A. in', 'B. on', 'C. at'],
        answer: 'C',
      },
      {
        q: 'We have English class ___ Monday.',
        options: ['A. in', 'B. on', 'C. at'],
        answer: 'B',
      },
      {
        q: 'The cat is ___ the box.',
        options: ['A. in', 'B. on', 'C. at'],
        answer: 'A',
      },
      {
        q: 'It is very cold ___ winter.',
        options: ['A. in', 'B. on', 'C. at'],
        answer: 'A',
      },
    ],
  },

  // ---------- 比较级和最高级 ----------
  {
    grade: 5,
    topic: '比较级和最高级',
    explanation: '比较级用于两者比较，结构：A + be/动词 + 比较级 + than + B。最高级用于三者或以上比较，结构：the + 最高级 + of/in...。规则：一般加 -er/-est；以 e 结尾加 -r/-st；重读闭音节双写加 -er/-est；多音节词前加 more/most。不规则变化：good→better→best。',
    exercise_type: 'choice',
    questions: [
      {
        q: 'Tom is ___ (tall) than Jack.',
        options: ['A. tall', 'B. taller', 'C. tallest'],
        answer: 'B',
      },
      {
        q: 'She is the ___ (good) student in our class.',
        options: ['A. good', 'B. better', 'C. best'],
        answer: 'C',
      },
      {
        q: 'This box is ___ (heavy) than that one.',
        options: ['A. heavy', 'B. heavier', 'C. heaviest'],
        answer: 'B',
      },
      {
        q: 'The elephant is ___ (big) animal on land.',
        options: ['A. the biggest', 'B. bigger', 'C. big'],
        answer: 'A',
      },
      {
        q: 'My mother is ___ (busy) than my father.',
        options: ['A. busy', 'B. more busy', 'C. busier'],
        answer: 'C',
      },
    ],
  },

  // ---------- 情态动词 can/must/should ----------
  {
    grade: 5,
    topic: '情态动词 can/must/should',
    explanation: '情态动词后面跟动词原形。can 表示能力、许可（能/可以）；must 表示必须（必须）；should 表示应该（应该）。否定形式：can\'t, mustn\'t, shouldn\'t。',
    exercise_type: 'choice',
    questions: [
      {
        q: 'She ___ swim very well.',
        options: ['A. can', 'B. cans', 'C. caning'],
        answer: 'A',
      },
      {
        q: 'You ___ finish your homework before playing.',
        options: ['A. should', 'B. shoulds', 'C. should to'],
        answer: 'A',
      },
      {
        q: 'We ___ not run in the hallway.',
        options: ['A. must', 'B. should', 'C. are'],
        answer: 'A',
      },
      {
        q: '___ I use your pen?',
        options: ['A. Do', 'B. Can', 'C. Am'],
        answer: 'B',
      },
      {
        q: 'You ___ eat more vegetables to stay healthy.',
        options: ['A. can', 'B. must', 'C. should'],
        answer: 'C',
      },
    ],
  },

  // ---------- There be 句型 ----------
  {
    grade: 5,
    topic: 'There be 句型',
    explanation: 'There be 句型表示"某处有某物"。There is 后面跟单数名词或不可数名词；There are 后面跟复数名词。就近原则：be 动词的形式由最近的名词决定。',
    exercise_type: 'choice',
    questions: [
      {
        q: 'There ___ a book on the desk.',
        options: ['A. is', 'B. are', 'C. be'],
        answer: 'A',
      },
      {
        q: 'There ___ three cats in the room.',
        options: ['A. is', 'B. are', 'C. be'],
        answer: 'B',
      },
      {
        q: 'There ___ some water in the glass.',
        options: ['A. is', 'B. are', 'C. be'],
        answer: 'A',
      },
      {
        q: 'There ___ a pen and two books on the table.',
        options: ['A. is', 'B. are', 'C. be'],
        answer: 'A',
      },
      {
        q: '___ there any milk in the fridge?',
        options: ['A. Is', 'B. Are', 'C. Be'],
        answer: 'A',
      },
    ],
  },

  // ---------- 祈使句 ----------
  {
    grade: 4,
    topic: '祈使句',
    explanation: '祈使句表示请求、命令、建议等。肯定祈使句以动词原形开头，如：Open the door. 否定祈使句在动词前加 Don\'t，如：Don\'t run in the hallway.',
    exercise_type: 'transform',
    questions: [
      {
        q: 'Open the window, please. (改为否定句)',
        options: ['A. Don\'t open the window.', 'B. Not open the window.', 'C. Doesn\'t open the window.'],
        answer: 'A',
      },
      {
        q: 'Be quiet, please. (改为否定句)',
        options: ['A. Don\'t be quiet.', 'B. Please don\'t be quiet.', 'C. Not be quiet.'],
        answer: 'A',
      },
      {
        q: '___ (not/late) for school.',
        options: ['A. Don\'t be late', 'B. Not be late', 'C. Doesn\'t be late'],
        answer: 'A',
      },
      {
        q: 'Let\'s go to the park. (改为否定句)',
        options: ['A. Let\'s not go to the park.', 'B. Don\'t let\'s go to the park.', 'C. Not let\'s go to the park.'],
        answer: 'A',
      },
      {
        q: '___ (stand) in line, please.',
        options: ['A. Stand', 'B. Stands', 'C. Standing'],
        answer: 'A',
      },
    ],
  },
];


// ============================================================
// 5. 自然拼读库 phonicsData
// 系统的 Phonics 规则，涵盖字母发音、字母组合、魔法 e、r 控制元音
// 每条含: pattern, sound, words(至少5个例词), example_sentence
// ============================================================
const phonicsData = [

  // ---------- 26 个字母发音 ----------
  { pattern: 'a (短元音)', sound: '/æ/', words: ['apple', 'ant', 'bag', 'cat', 'hat'], example_sentence: 'The black cat has a hat.' },
  { pattern: 'b', sound: '/b/', words: ['ball', 'big', 'book', 'bird', 'boy'], example_sentence: 'The big boy reads a book.' },
  { pattern: 'c (软音)', sound: '/s/', words: ['city', 'circle', 'cent', 'nice', 'rice'], example_sentence: 'The nice city is very big.' },
  { pattern: 'c (硬音)', sound: '/k/', words: ['cat', 'cup', 'cake', 'cold', 'car'], example_sentence: 'A cold cat sits in a car.' },
  { pattern: 'd', sound: '/d/', words: ['dog', 'duck', 'door', 'desk', 'doll'], example_sentence: 'The dog is at the door.' },
  { pattern: 'e (短元音)', sound: '/e/', words: ['egg', 'pen', 'bed', 'red', 'ten'], example_sentence: 'Ten red pens are on the bed.' },
  { pattern: 'f', sound: '/f/', words: ['fish', 'five', 'four', 'family', 'farm'], example_sentence: 'Five fish are on the farm.' },
  { pattern: 'g (软音)', sound: '/dʒ/', words: ['giraffe', 'gym', 'orange', 'page', 'cage'], example_sentence: 'The giraffe is in the cage.' },
  { pattern: 'g (硬音)', sound: '/ɡ/', words: ['girl', 'goat', 'game', 'good', 'green'], example_sentence: 'The good girl plays a game.' },
  { pattern: 'h', sound: '/h/', words: ['hat', 'hand', 'house', 'horse', 'help'], example_sentence: 'The horse helps the man.' },
  { pattern: 'i (短元音)', sound: '/ɪ/', words: ['ink', 'is', 'it', 'in', 'six'], example_sentence: 'Six pens are in the ink.' },
  { pattern: 'j', sound: '/dʒ/', words: ['jam', 'juice', 'jump', 'job', 'joy'], example_sentence: 'Jump with joy and drink juice.' },
  { pattern: 'k', sound: '/k/', words: ['kite', 'king', 'key', 'knee', 'kitchen'], example_sentence: 'The king has a kite and a key.' },
  { pattern: 'l', sound: '/l/', words: ['lion', 'leg', 'lamp', 'leaf', 'like'], example_sentence: 'The lion likes the green leaf.' },
  { pattern: 'm', sound: '/m/', words: ['moon', 'mouse', 'milk', 'man', 'map'], example_sentence: 'The man drinks milk under the moon.' },
  { pattern: 'n', sound: '/n/', words: ['nine', 'nose', 'nest', 'name', 'net'], example_sentence: 'Nine birds are in the nest.' },
  { pattern: 'o (短元音)', sound: '/ɒ/', words: ['dog', 'box', 'hot', 'not', 'orange'], example_sentence: 'The hot dog is in a box.' },
  { pattern: 'p', sound: '/p/', words: ['pen', 'pig', 'park', 'play', 'apple'], example_sentence: 'The pig plays in the park.' },
  { pattern: 'qu', sound: '/kw/', words: ['queen', 'quick', 'quiet', 'quiz', 'question'], example_sentence: 'The quiet queen asks a question.' },
  { pattern: 'r', sound: '/r/', words: ['rain', 'run', 'red', 'rice', 'river'], example_sentence: 'Red rice is in the river.' },
  { pattern: 's', sound: '/s/', words: ['sun', 'six', 'sit', 'star', 'sing'], example_sentence: 'Six stars sing in the sun.' },
  { pattern: 't', sound: '/t/', words: ['ten', 'two', 'tree', 'tiger', 'time'], example_sentence: 'Two tigers sit in a tree.' },
  { pattern: 'u (短元音)', sound: '/ʌ/', words: ['umbrella', 'up', 'under', 'cup', 'bus'], example_sentence: 'An umbrella is under the cup.' },
  { pattern: 'v', sound: '/v/', words: ['van', 'vet', 'very', 'five', 'love'], example_sentence: 'Five vans go to the vet.' },
  { pattern: 'w', sound: '/w/', words: ['water', 'wind', 'winter', 'watch', 'window'], example_sentence: 'Watch the water from the window.' },
  { pattern: 'x', sound: '/ks/', words: ['box', 'fox', 'six', 'taxi', 'mix'], example_sentence: 'Six foxes sit in a box.' },
  { pattern: 'y (辅音)', sound: '/j/', words: ['yes', 'yellow', 'you', 'yogurt', 'young'], example_sentence: 'Yes, you are a young yellow bird.' },
  { pattern: 'z', sound: '/z/', words: ['zoo', 'zero', 'zip', 'zone', 'zebra'], example_sentence: 'Zero zebras are in the zoo.' },

  // ---------- 元音字母组合 ----------
  { pattern: 'ai', sound: '/eɪ/', words: ['rain', 'tail', 'paint', 'wait', 'train'], example_sentence: 'Wait for the train in the rain.' },
  { pattern: 'ay', sound: '/eɪ/', words: ['day', 'play', 'say', 'may', 'today'], example_sentence: 'We play outside today.' },
  { pattern: 'ea (长音)', sound: '/iː/', words: ['eat', 'meat', 'seat', 'read', 'tea'], example_sentence: 'I eat meat and drink tea on the seat.' },
  { pattern: 'ea (短音)', sound: '/e/', words: ['bread', 'head', 'sweater', 'weather', 'healthy'], example_sentence: 'The weather is good for healthy bread.' },
  { pattern: 'ee', sound: '/iː/', words: ['see', 'tree', 'green', 'three', 'sleep'], example_sentence: 'I see three green trees and sleep.' },
  { pattern: 'ey', sound: '/iː/', words: ['key', 'monkey', 'donkey', 'honey', 'valley'], example_sentence: 'The monkey eats honey with a key.' },
  { pattern: 'igh', sound: '/aɪ/', words: ['high', 'light', 'night', 'right', 'flight'], example_sentence: 'The high light shines at night.' },
  { pattern: 'ie', sound: '/aɪ/', words: ['pie', 'tie', 'lie', 'die', 'quiet'], example_sentence: 'I eat a pie and lie down quietly.' },
  { pattern: 'oa', sound: '/oʊ/', words: ['boat', 'coat', 'goat', 'road', 'soap'], example_sentence: 'The goat wears a coat on the road.' },
  { pattern: 'ow (长音)', sound: '/oʊ/', words: ['snow', 'bow', 'row', 'show', 'grow'], example_sentence: 'Snow helps flowers grow and show.' },
  { pattern: 'ow (双元音)', sound: '/aʊ/', words: ['cow', 'how', 'now', 'brown', 'town'], example_sentence: 'The brown cow is in the town now.' },
  { pattern: 'ou', sound: '/aʊ/', words: ['out', 'house', 'mouth', 'round', 'cloud'], example_sentence: 'Go out of the round house.' },
  { pattern: 'oi', sound: '/ɔɪ/', words: ['oil', 'coin', 'point', 'join', 'voice'], example_sentence: 'Join the boy with a loud voice.' },
  { pattern: 'oy', sound: '/ɔɪ/', words: ['boy', 'toy', 'joy', 'enjoy', 'coin'], example_sentence: 'The boy enjoys his toy.' },
  { pattern: 'oo (长音)', sound: '/uː/', words: ['moon', 'food', 'zoo', 'cool', 'school'], example_sentence: 'The cool school is near the zoo and the moon.' },
  { pattern: 'oo (短音)', sound: '/ʊ/', words: ['book', 'look', 'good', 'wood', 'foot'], example_sentence: 'Look at the good book about wood.' },
  { pattern: 'ue', sound: '/uː/', words: ['blue', 'true', 'glue', 'clue', 'ruler'], example_sentence: 'The true blue ruler is made with glue.' },
  { pattern: 'ui', sound: '/uː/', words: ['fruit', 'juice', 'suit', 'build', 'guide'], example_sentence: 'The guide builds a suit with fruit juice.' },
  { pattern: 'ew', sound: '/juː/', words: ['new', 'few', 'drew', 'knew', 'chew'], example_sentence: 'A few new friends knew how to chew.' },
  { pattern: 'aw', sound: '/ɔː/', words: ['draw', 'saw', 'law', 'straw', 'paw'], example_sentence: 'I saw the dog draw with a straw paw.' },
  { pattern: 'au', sound: '/ɔː/', words: ['author', 'August', 'autumn', 'cause', 'sauce'], example_sentence: 'The author likes autumn sauce.' },

  // ---------- 辅音字母组合 ----------
  { pattern: 'ch', sound: '/tʃ/', words: ['chair', 'child', 'chicken', 'watch', 'beach'], example_sentence: 'The child watches a chicken on the beach chair.' },
  { pattern: 'sh', sound: '/ʃ/', words: ['ship', 'shop', 'fish', 'sheep', 'shoe'], example_sentence: 'The sheep wears a shoe on the ship.' },
  { pattern: 'th (清音)', sound: '/θ/', words: ['think', 'three', 'tooth', 'mouth', 'thumb'], example_sentence: 'Think about three teeth in the thumb.' },
  { pattern: 'th (浊音)', sound: '/ð/', words: ['this', 'that', 'mother', 'father', 'brother'], example_sentence: 'This mother and that father have a brother.' },
  { pattern: 'wh', sound: '/w/', words: ['what', 'when', 'where', 'why', 'white'], example_sentence: 'What is the white rabbit when and where?' },
  { pattern: 'ph', sound: '/f/', words: ['phone', 'photo', 'elephant', 'dolphin', 'physics'], example_sentence: 'The elephant takes a photo with a phone.' },
  { pattern: 'ck', sound: '/k/', words: ['clock', 'duck', 'black', 'sock', 'stick'], example_sentence: 'The black duck has a clock and a sock.' },
  { pattern: 'ng', sound: '/ŋ/', words: ['sing', 'ring', 'king', 'long', 'strong'], example_sentence: 'The strong king sings a long song.' },
  { pattern: 'nk', sound: '/ŋk/', words: ['pink', 'bank', 'drink', 'think', 'thank'], example_sentence: 'Think and thank at the pink bank.' },
  { pattern: 'kn', sound: '/n/', words: ['know', 'knife', 'knee', 'knight', 'knot'], example_sentence: 'The knight knows how to tie a knot with a knife.' },
  { pattern: 'wr', sound: '/r/', words: ['write', 'wrong', 'wrap', 'wrist', 'wrestle'], example_sentence: 'Write the wrong word on your wrist.' },
  { pattern: 'mb', sound: '/m/', words: ['climb', 'comb', 'thumb', 'bomb', 'lamb'], example_sentence: 'The lamb uses a comb to climb with its thumb.' },
  { pattern: 'gn', sound: '/n/', words: ['sign', 'gnome', 'design', 'gnat', 'align'], example_sentence: 'The sign shows the design for the gnome.' },
  { pattern: 'tch', sound: '/tʃ/', words: ['catch', 'match', 'watch', 'patch', 'hatch'], example_sentence: 'Catch the match and watch the patch hatch.' },
  { pattern: 'dge', sound: '/dʒ/', words: ['bridge', 'judge', 'fudge', 'edge', 'badge'], example_sentence: 'The judge wears a badge on the bridge.' },
  { pattern: 'ss', sound: '/s/', words: ['class', 'glass', 'grass', 'cross', 'kiss'], example_sentence: 'Kiss the class on the grass with a glass.' },
  { pattern: 'll', sound: '/l/', words: ['ball', 'tall', 'wall', 'fall', 'small'], example_sentence: 'A small ball falls from the tall wall.' },

  // ---------- 魔法 e (Magic E) ----------
  { pattern: 'a...e', sound: '/eɪ/', words: ['cake', 'make', 'name', 'game', 'late'], example_sentence: 'Make a cake and name the game late.' },
  { pattern: 'e...e', sound: '/iː/', words: ['these', 'even', 'here', 'theme', 'athlete'], example_sentence: 'These themes are even here for athletes.' },
  { pattern: 'i...e', sound: '/aɪ/', words: ['like', 'five', 'nine', 'time', 'ride'], example_sentence: 'I like five rides at nine times.' },
  { pattern: 'o...e', sound: '/oʊ/', words: ['home', 'nose', 'bone', 'hope', 'rose'], example_sentence: 'I hope the bone and rose are at home near the nose.' },
  { pattern: 'u...e', sound: '/juː/', words: ['use', 'cute', 'rule', 'tube', 'cube'], example_sentence: 'Use the cute cube and tube as a rule.' },

  // ---------- r 控制的元音 (R-controlled Vowels) ----------
  { pattern: 'ar', sound: '/ɑːr/', words: ['car', 'star', 'park', 'farm', 'art'], example_sentence: 'The car parks near the farm art star.' },
  { pattern: 'er', sound: '/ɜːr/', words: ['her', 'term', 'serve', 'fern', 'perfect'], example_sentence: 'Her term serves a perfect fern.' },
  { pattern: 'ir', sound: '/ɜːr/', words: ['bird', 'girl', 'shirt', 'first', 'third'], example_sentence: 'The girl bird wears a shirt first and third.' },
  { pattern: 'or', sound: '/ɔːr/', words: ['for', 'horse', 'short', 'corn', 'fork'], example_sentence: 'The horse eats corn with a fork for a short time.' },
  { pattern: 'ur', sound: '/ɜːr/', words: ['burn', 'turn', 'surf', 'nurse', 'purse'], example_sentence: 'The nurse turns to surf with a purse that can burn.' },
];
