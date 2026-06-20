// 塔罗牌数据
var tarotData = [
  {id:1,name:"愚者",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbd955ab0_1781849049.webp",isPremium:true},
  {id:2,name:"魔术师",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc20c01b7_1781849120.webp",isPremium:true},
  {id:3,name:"女祭司",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc2cefb9c_1781849132.webp",isPremium:true},
  {id:4,name:"女皇",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc2a8c38c_1781849130.webp",isPremium:true},
  {id:5,name:"皇帝",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbf7c0b5a_1781849079.webp",isPremium:true},
  {id:6,name:"教皇",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc021be8d_1781849090.webp",isPremium:true},
  {id:7,name:"恋人",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc1448683_1781849108.webp",isPremium:true},
  {id:8,name:"战车",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbdbc21c3_1781849051.webp",isPremium:true},
  {id:9,name:"力量",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc0fe60fe_1781849103.webp",isPremium:true},
  {id:10,name:"隐士",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbd10e073_1781849041.webp",isPremium:true},
  {id:11,name:"命运之轮",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc239fec1_1781849123.webp",isPremium:true},
  {id:12,name:"正义",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbe43a0cb_1781849060.webp",isPremium:true},
  {id:13,name:"倒吊人",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbe648abb_1781849062.webp",isPremium:true},
  {id:14,name:"死神",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbb3a8b3b_1781849011.webp",isPremium:true},
  {id:15,name:"节制",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc0787e8c_1781849090.webp",isPremium:true},
  {id:16,name:"恶魔",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbed2590e_1781849069.webp",isPremium:true},
  {id:17,name:"高塔",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbf1abeaa_1781849073.webp",isPremium:true},
  {id:18,name:"星星",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbc2588e7_1781849026.webp",isPremium:true},
  {id:19,name:"月亮",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbcec5dba_1781849038.webp",isPremium:true},
  {id:20,name:"太阳",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbc2ab563_1781849026.webp",isPremium:true},
  {id:21,name:"审判",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dbb49539d_1781849012.webp",isPremium:true},
  {id:22,name:"世界",image:"ht"+"tps:/"+"/img.cdn1.vip/i/6a34dc33dbe93_1781849139.webp",isPremium:true}
];

function loadTarotData() {
    console.log('塔罗牌数据加载成功，共', tarotData.length, '张卡牌');
    return tarotData;
}

window.loadTarotData = loadTarotData;
