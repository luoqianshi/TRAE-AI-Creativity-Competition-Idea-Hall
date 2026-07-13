class HistoryChapter extends Chapter {
  constructor() {
    super('history', '历史', 'fa-landmark', '#9b59b6');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一单元 中国古代政治制度',
        description: '高一历史第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_001',
            question: '中国历史上第一个统一的封建王朝是（ ）',
            options: [
              { key: 'A', value: '夏朝', explanation: '' },
              { key: 'B', value: '商朝', explanation: '' },
              { key: 'C', value: '周朝', explanation: '' },
              { key: 'D', value: '秦朝', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '秦朝是中国历史上第一个统一的中央集权制封建王朝。'
          },
          {
            id: 'q_history_002',
            question: '秦始皇统一六国的时间是（ ）',
            options: [
              { key: 'A', value: '公元前221年', explanation: '' },
              { key: 'B', value: '公元前206年', explanation: '' },
              { key: 'C', value: '公元前256年', explanation: '' },
              { key: 'D', value: '公元前230年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '秦始皇于公元前221年统一六国。'
          },
          {
            id: 'q_history_003',
            question: '郡县制最早推行于（ ）',
            options: [
              { key: 'A', value: '夏朝', explanation: '' },
              { key: 'B', value: '商朝', explanation: '' },
              { key: 'C', value: '秦朝', explanation: '' },
              { key: 'D', value: '汉朝', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '郡县制是秦朝开始推行的地方行政制度。'
          },
          {
            id: 'q_history_004',
            question: '汉武帝时期，为了加强中央集权，实行的选官制度是（ ）',
            options: [
              { key: 'A', value: '察举制', explanation: '' },
              { key: 'B', value: '九品中正制', explanation: '' },
              { key: 'C', value: '科举制', explanation: '' },
              { key: 'D', value: '世袭制', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '汉武帝时期实行察举制选拔人才。'
          },
          {
            id: 'q_history_005',
            question: '三省六部制确立于（ ）',
            options: [
              { key: 'A', value: '秦朝', explanation: '' },
              { key: 'B', value: '汉朝', explanation: '' },
              { key: 'C', value: '隋朝', explanation: '' },
              { key: 'D', value: '唐朝', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '三省六部制确立于隋朝，完善于唐朝。'
          },
          {
            id: 'q_history_006',
            question: '科举制创立于（ ）',
            options: [
              { key: 'A', value: '隋朝', explanation: '' },
              { key: 'B', value: '唐朝', explanation: '' },
              { key: 'C', value: '宋朝', explanation: '' },
              { key: 'D', value: '明朝', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '科举制创立于隋朝。'
          },
          {
            id: 'q_history_007',
            question: '唐朝的三省不包括（ ）',
            options: [
              { key: 'A', value: '中书省', explanation: '' },
              { key: 'B', value: '门下省', explanation: '' },
              { key: 'C', value: '尚书省', explanation: '' },
              { key: 'D', value: '行省', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '唐朝三省是中书省、门下省、尚书省，行省是元朝的制度。'
          },
          {
            id: 'q_history_008',
            question: '宋朝加强中央集权的措施不包括（ ）',
            options: [
              { key: 'A', value: '杯酒释兵权', explanation: '' },
              { key: 'B', value: '设立三司使', explanation: '' },
              { key: 'C', value: '设立枢密院', explanation: '' },
              { key: 'D', value: '分封诸侯', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '宋朝加强中央集权，不会分封诸侯。'
          },
          {
            id: 'q_history_009',
            question: '元朝实行的地方行政制度是（ ）',
            options: [
              { key: 'A', value: '郡县制', explanation: '' },
              { key: 'B', value: '行省制', explanation: '' },
              { key: 'C', value: '分封制', explanation: '' },
              { key: 'D', value: '郡国并行制', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '元朝实行行省制度管理地方。'
          },
          {
            id: 'q_history_010',
            question: '明朝废除丞相制度的皇帝是（ ）',
            options: [
              { key: 'A', value: '明太祖朱元璋', explanation: '' },
              { key: 'B', value: '明成祖朱棣', explanation: '' },
              { key: 'C', value: '建文帝朱允炆', explanation: '' },
              { key: 'D', value: '崇祯帝朱由检', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '明太祖朱元璋废除了丞相制度。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二单元 近代中国',
        description: '高一历史第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_011',
            question: '鸦片战争爆发的时间是（ ）',
            options: [
              { key: 'A', value: '1839年', explanation: '' },
              { key: 'B', value: '1840年', explanation: '' },
              { key: 'C', value: '1842年', explanation: '' },
              { key: 'D', value: '1856年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第一次鸦片战争爆发于1840年。'
          },
          {
            id: 'q_history_012',
            question: '《南京条约》签订的时间是（ ）',
            options: [
              { key: 'A', value: '1840年', explanation: '' },
              { key: 'B', value: '1841年', explanation: '' },
              { key: 'C', value: '1842年', explanation: '' },
              { key: 'D', value: '1843年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '《南京条约》签订于1842年。'
          },
          {
            id: 'q_history_013',
            question: '太平天国运动爆发于（ ）',
            options: [
              { key: 'A', value: '1840年', explanation: '' },
              { key: 'B', value: '1842年', explanation: '' },
              { key: 'C', value: '1851年', explanation: '' },
              { key: 'D', value: '1856年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '太平天国运动爆发于1851年。'
          },
          {
            id: 'q_history_014',
            question: '第二次鸦片战争爆发于（ ）',
            options: [
              { key: 'A', value: '1856年', explanation: '' },
              { key: 'B', value: '1860年', explanation: '' },
              { key: 'C', value: '1840年', explanation: '' },
              { key: 'D', value: '1894年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '第二次鸦片战争爆发于1856年。'
          },
          {
            id: 'q_history_015',
            question: '火烧圆明园发生在（ ）',
            options: [
              { key: 'A', value: '第一次鸦片战争', explanation: '' },
              { key: 'B', value: '第二次鸦片战争', explanation: '' },
              { key: 'C', value: '甲午中日战争', explanation: '' },
              { key: 'D', value: '八国联军侵华', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '火烧圆明园发生在第二次鸦片战争期间。'
          },
          {
            id: 'q_history_016',
            question: '洋务运动开始于（ ）',
            options: [
              { key: 'A', value: '19世纪60年代', explanation: '' },
              { key: 'B', value: '19世纪70年代', explanation: '' },
              { key: 'C', value: '19世纪80年代', explanation: '' },
              { key: 'D', value: '19世纪90年代', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '洋务运动开始于19世纪60年代。'
          },
          {
            id: 'q_history_017',
            question: '甲午中日战争爆发于（ ）',
            options: [
              { key: 'A', value: '1894年', explanation: '' },
              { key: 'B', value: '1895年', explanation: '' },
              { key: 'C', value: '1900年', explanation: '' },
              { key: 'D', value: '1911年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '甲午中日战争爆发于1894年。'
          },
          {
            id: 'q_history_018',
            question: '《马关条约》签订于（ ）',
            options: [
              { key: 'A', value: '1894年', explanation: '' },
              { key: 'B', value: '1895年', explanation: '' },
              { key: 'C', value: '1900年', explanation: '' },
              { key: 'D', value: '1901年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《马关条约》签订于1895年。'
          },
          {
            id: 'q_history_019',
            question: '戊戌变法发生在（ ）',
            options: [
              { key: 'A', value: '1898年', explanation: '' },
              { key: 'B', value: '1900年', explanation: '' },
              { key: 'C', value: '1901年', explanation: '' },
              { key: 'D', value: '1911年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '戊戌变法发生在1898年。'
          },
          {
            id: 'q_history_020',
            question: '八国联军侵华发生在（ ）',
            options: [
              { key: 'A', value: '1898年', explanation: '' },
              { key: 'B', value: '1900年', explanation: '' },
              { key: 'C', value: '1901年', explanation: '' },
              { key: 'D', value: '1911年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '八国联军侵华发生在1900年。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三单元 现代中国',
        description: '高一历史第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_021',
            question: '辛亥革命爆发于（ ）',
            options: [
              { key: 'A', value: '1911年', explanation: '' },
              { key: 'B', value: '1912年', explanation: '' },
              { key: 'C', value: '1919年', explanation: '' },
              { key: 'D', value: '1921年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '辛亥革命爆发于1911年。'
          },
          {
            id: 'q_history_022',
            question: '中华民国成立于（ ）',
            options: [
              { key: 'A', value: '1911年', explanation: '' },
              { key: 'B', value: '1912年', explanation: '' },
              { key: 'C', value: '1919年', explanation: '' },
              { key: 'D', value: '1921年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '中华民国成立于1912年。'
          },
          {
            id: 'q_history_023',
            question: '新文化运动开始于（ ）',
            options: [
              { key: 'A', value: '1915年', explanation: '' },
              { key: 'B', value: '1919年', explanation: '' },
              { key: 'C', value: '1921年', explanation: '' },
              { key: 'D', value: '1924年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '新文化运动开始于1915年。'
          },
          {
            id: 'q_history_024',
            question: '五四运动爆发于（ ）',
            options: [
              { key: 'A', value: '1918年', explanation: '' },
              { key: 'B', value: '1919年', explanation: '' },
              { key: 'C', value: '1920年', explanation: '' },
              { key: 'D', value: '1921年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '五四运动爆发于1919年。'
          },
          {
            id: 'q_history_025',
            question: '中国共产党成立于（ ）',
            options: [
              { key: 'A', value: '1919年', explanation: '' },
              { key: 'B', value: '1920年', explanation: '' },
              { key: 'C', value: '1921年', explanation: '' },
              { key: 'D', value: '1924年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '中国共产党成立于1921年。'
          },
          {
            id: 'q_history_026',
            question: '第一次国共合作开始于（ ）',
            options: [
              { key: 'A', value: '1921年', explanation: '' },
              { key: 'B', value: '1924年', explanation: '' },
              { key: 'C', value: '1927年', explanation: '' },
              { key: 'D', value: '1937年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第一次国共合作开始于1924年。'
          },
          {
            id: 'q_history_027',
            question: '南昌起义发生在（ ）',
            options: [
              { key: 'A', value: '1927年', explanation: '' },
              { key: 'B', value: '1928年', explanation: '' },
              { key: 'C', value: '1931年', explanation: '' },
              { key: 'D', value: '1934年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '南昌起义发生在1927年。'
          },
          {
            id: 'q_history_028',
            question: '井冈山革命根据地建立于（ ）',
            options: [
              { key: 'A', value: '1927年', explanation: '' },
              { key: 'B', value: '1928年', explanation: '' },
              { key: 'C', value: '1931年', explanation: '' },
              { key: 'D', value: '1934年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '井冈山革命根据地建立于1928年。'
          },
          {
            id: 'q_history_029',
            question: '红军长征开始于（ ）',
            options: [
              { key: 'A', value: '1931年', explanation: '' },
              { key: 'B', value: '1934年', explanation: '' },
              { key: 'C', value: '1935年', explanation: '' },
              { key: 'D', value: '1936年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '红军长征开始于1934年。'
          },
          {
            id: 'q_history_030',
            question: '遵义会议召开于（ ）',
            options: [
              { key: 'A', value: '1934年', explanation: '' },
              { key: 'B', value: '1935年', explanation: '' },
              { key: 'C', value: '1936年', explanation: '' },
              { key: 'D', value: '1937年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '遵义会议召开于1935年。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四单元 中国特色社会主义',
        description: '高一历史第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_031',
            question: '中华人民共和国成立于（ ）',
            options: [
              { key: 'A', value: '1948年', explanation: '' },
              { key: 'B', value: '1949年', explanation: '' },
              { key: 'C', value: '1950年', explanation: '' },
              { key: 'D', value: '1951年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '中华人民共和国成立于1949年。'
          },
          {
            id: 'q_history_032',
            question: '土地改革开始于（ ）',
            options: [
              { key: 'A', value: '1949年', explanation: '' },
              { key: 'B', value: '1950年', explanation: '' },
              { key: 'C', value: '1951年', explanation: '' },
              { key: 'D', value: '1952年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '土地改革开始于1950年。'
          },
          {
            id: 'q_history_033',
            question: '抗美援朝战争开始于（ ）',
            options: [
              { key: 'A', value: '1950年', explanation: '' },
              { key: 'B', value: '1951年', explanation: '' },
              { key: 'C', value: '1952年', explanation: '' },
              { key: 'D', value: '1953年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '抗美援朝战争开始于1950年。'
          },
          {
            id: 'q_history_034',
            question: '第一个五年计划开始于（ ）',
            options: [
              { key: 'A', value: '1952年', explanation: '' },
              { key: 'B', value: '1953年', explanation: '' },
              { key: 'C', value: '1954年', explanation: '' },
              { key: 'D', value: '1955年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第一个五年计划开始于1953年。'
          },
          {
            id: 'q_history_035',
            question: '三大改造完成于（ ）',
            options: [
              { key: 'A', value: '1954年', explanation: '' },
              { key: 'B', value: '1955年', explanation: '' },
              { key: 'C', value: '1956年', explanation: '' },
              { key: 'D', value: '1957年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '三大改造完成于1956年。'
          },
          {
            id: 'q_history_036',
            question: '中共八大召开于（ ）',
            options: [
              { key: 'A', value: '1954年', explanation: '' },
              { key: 'B', value: '1955年', explanation: '' },
              { key: 'C', value: '1956年', explanation: '' },
              { key: 'D', value: '1957年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '中共八大召开于1956年。'
          },
          {
            id: 'q_history_037',
            question: '改革开放开始于（ ）',
            options: [
              { key: 'A', value: '1976年', explanation: '' },
              { key: 'B', value: '1977年', explanation: '' },
              { key: 'C', value: '1978年', explanation: '' },
              { key: 'D', value: '1979年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '改革开放开始于1978年。'
          },
          {
            id: 'q_history_038',
            question: '十一届三中全会召开于（ ）',
            options: [
              { key: 'A', value: '1976年', explanation: '' },
              { key: 'B', value: '1977年', explanation: '' },
              { key: 'C', value: '1978年', explanation: '' },
              { key: 'D', value: '1979年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '十一届三中全会召开于1978年。'
          },
          {
            id: 'q_history_039',
            question: '邓小平南方谈话发生在（ ）',
            options: [
              { key: 'A', value: '1990年', explanation: '' },
              { key: 'B', value: '1991年', explanation: '' },
              { key: 'C', value: '1992年', explanation: '' },
              { key: 'D', value: '1993年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '邓小平南方谈话发生在1992年。'
          },
          {
            id: 'q_history_040',
            question: '香港回归祖国是在（ ）',
            options: [
              { key: 'A', value: '1996年', explanation: '' },
              { key: 'B', value: '1997年', explanation: '' },
              { key: 'C', value: '1998年', explanation: '' },
              { key: 'D', value: '1999年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '香港回归祖国是在1997年。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五单元 古代西方',
        description: '高一历史第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_041',
            question: '古希腊文明发源于（ ）',
            options: [
              { key: 'A', value: '两河流域', explanation: '' },
              { key: 'B', value: '尼罗河流域', explanation: '' },
              { key: 'C', value: '爱琴海地区', explanation: '' },
              { key: 'D', value: '印度河流域', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '古希腊文明发源于爱琴海地区。'
          },
          {
            id: 'q_history_042',
            question: '雅典民主政治达到顶峰是在（ ）',
            options: [
              { key: 'A', value: '梭伦时期', explanation: '' },
              { key: 'B', value: '克里斯提尼时期', explanation: '' },
              { key: 'C', value: '伯里克利时期', explanation: '' },
              { key: 'D', value: '亚历山大时期', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '雅典民主政治在伯里克利时期达到顶峰。'
          },
          {
            id: 'q_history_043',
            question: '古罗马建立于（ ）',
            options: [
              { key: 'A', value: '公元前8世纪', explanation: '' },
              { key: 'B', value: '公元前7世纪', explanation: '' },
              { key: 'C', value: '公元前6世纪', explanation: '' },
              { key: 'D', value: '公元前5世纪', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '古罗马建立于公元前8世纪。'
          },
          {
            id: 'q_history_044',
            question: '罗马共和国建立于（ ）',
            options: [
              { key: 'A', value: '公元前509年', explanation: '' },
              { key: 'B', value: '公元前44年', explanation: '' },
              { key: 'C', value: '公元前27年', explanation: '' },
              { key: 'D', value: '公元1年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '罗马共和国建立于公元前509年。'
          },
          {
            id: 'q_history_045',
            question: '罗马帝国建立于（ ）',
            options: [
              { key: 'A', value: '公元前509年', explanation: '' },
              { key: 'B', value: '公元前44年', explanation: '' },
              { key: 'C', value: '公元前27年', explanation: '' },
              { key: 'D', value: '公元1年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '罗马帝国建立于公元前27年。'
          },
          {
            id: 'q_history_046',
            question: '西罗马帝国灭亡于（ ）',
            options: [
              { key: 'A', value: '公元395年', explanation: '' },
              { key: 'B', value: '公元476年', explanation: '' },
              { key: 'C', value: '公元1453年', explanation: '' },
              { key: 'D', value: '公元1644年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '西罗马帝国灭亡于公元476年。'
          },
          {
            id: 'q_history_047',
            question: '《十二铜表法》颁布于（ ）',
            options: [
              { key: 'A', value: '公元前450年', explanation: '' },
              { key: 'B', value: '公元前44年', explanation: '' },
              { key: 'C', value: '公元前27年', explanation: '' },
              { key: 'D', value: '公元1年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《十二铜表法》颁布于公元前450年左右。'
          },
          {
            id: 'q_history_048',
            question: '古希腊的哲学家不包括（ ）',
            options: [
              { key: 'A', value: '苏格拉底', explanation: '' },
              { key: 'B', value: '柏拉图', explanation: '' },
              { key: 'C', value: '亚里士多德', explanation: '' },
              { key: 'D', value: '莎士比亚', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '莎士比亚是英国文艺复兴时期的作家，不是古希腊哲学家。'
          },
          {
            id: 'q_history_049',
            question: '亚历山大东征开始于（ ）',
            options: [
              { key: 'A', value: '公元前334年', explanation: '' },
              { key: 'B', value: '公元前323年', explanation: '' },
              { key: 'C', value: '公元前300年', explanation: '' },
              { key: 'D', value: '公元前27年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '亚历山大东征开始于公元前334年。'
          },
          {
            id: 'q_history_050',
            question: '拜占庭帝国灭亡于（ ）',
            options: [
              { key: 'A', value: '公元476年', explanation: '' },
              { key: 'B', value: '公元1204年', explanation: '' },
              { key: 'C', value: '公元1453年', explanation: '' },
              { key: 'D', value: '公元1644年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '拜占庭帝国灭亡于公元1453年。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六单元 近代西方',
        description: '高一历史第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_051',
            question: '文艺复兴开始于（ ）',
            options: [
              { key: 'A', value: '13世纪', explanation: '' },
              { key: 'B', value: '14世纪', explanation: '' },
              { key: 'C', value: '15世纪', explanation: '' },
              { key: 'D', value: '16世纪', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '文艺复兴开始于14世纪的意大利。'
          },
          {
            id: 'q_history_052',
            question: '哥伦布发现美洲大陆是在（ ）',
            options: [
              { key: 'A', value: '1492年', explanation: '' },
              { key: 'B', value: '1498年', explanation: '' },
              { key: 'C', value: '1519年', explanation: '' },
              { key: 'D', value: '1522年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '哥伦布于1492年发现美洲大陆。'
          },
          {
            id: 'q_history_053',
            question: '马丁·路德宗教改革开始于（ ）',
            options: [
              { key: 'A', value: '1517年', explanation: '' },
              { key: 'B', value: '1520年', explanation: '' },
              { key: 'C', value: '1530年', explanation: '' },
              { key: 'D', value: '1540年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '马丁·路德宗教改革开始于1517年。'
          },
          {
            id: 'q_history_054',
            question: '英国资产阶级革命爆发于（ ）',
            options: [
              { key: 'A', value: '1640年', explanation: '' },
              { key: 'B', value: '1688年', explanation: '' },
              { key: 'C', value: '1776年', explanation: '' },
              { key: 'D', value: '1789年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '英国资产阶级革命爆发于1640年。'
          },
          {
            id: 'q_history_055',
            question: '《权利法案》颁布于（ ）',
            options: [
              { key: 'A', value: '1688年', explanation: '' },
              { key: 'B', value: '1689年', explanation: '' },
              { key: 'C', value: '1701年', explanation: '' },
              { key: 'D', value: '1714年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《权利法案》颁布于1689年。'
          },
          {
            id: 'q_history_056',
            question: '美国独立战争爆发于（ ）',
            options: [
              { key: 'A', value: '1774年', explanation: '' },
              { key: 'B', value: '1775年', explanation: '' },
              { key: 'C', value: '1776年', explanation: '' },
              { key: 'D', value: '1783年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '美国独立战争爆发于1775年。'
          },
          {
            id: 'q_history_057',
            question: '《独立宣言》发表于（ ）',
            options: [
              { key: 'A', value: '1775年', explanation: '' },
              { key: 'B', value: '1776年', explanation: '' },
              { key: 'C', value: '1783年', explanation: '' },
              { key: 'D', value: '1787年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《独立宣言》发表于1776年。'
          },
          {
            id: 'q_history_058',
            question: '法国大革命爆发于（ ）',
            options: [
              { key: 'A', value: '1787年', explanation: '' },
              { key: 'B', value: '1788年', explanation: '' },
              { key: 'C', value: '1789年', explanation: '' },
              { key: 'D', value: '1792年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '法国大革命爆发于1789年。'
          },
          {
            id: 'q_history_059',
            question: '《人权宣言》颁布于（ ）',
            options: [
              { key: 'A', value: '1789年', explanation: '' },
              { key: 'B', value: '1791年', explanation: '' },
              { key: 'C', value: '1792年', explanation: '' },
              { key: 'D', value: '1793年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《人权宣言》颁布于1789年。'
          },
          {
            id: 'q_history_060',
            question: '拿破仑称帝是在（ ）',
            options: [
              { key: 'A', value: '1799年', explanation: '' },
              { key: 'B', value: '1804年', explanation: '' },
              { key: 'C', value: '1812年', explanation: '' },
              { key: 'D', value: '1815年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '拿破仑称帝是在1804年。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七单元 工业革命',
        description: '高一历史第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_061',
            question: '第一次工业革命开始于（ ）',
            options: [
              { key: 'A', value: '18世纪60年代', explanation: '' },
              { key: 'B', value: '18世纪70年代', explanation: '' },
              { key: 'C', value: '18世纪80年代', explanation: '' },
              { key: 'D', value: '18世纪90年代', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '第一次工业革命开始于18世纪60年代。'
          },
          {
            id: 'q_history_062',
            question: '瓦特改良蒸汽机是在（ ）',
            options: [
              { key: 'A', value: '1765年', explanation: '' },
              { key: 'B', value: '1785年', explanation: '' },
              { key: 'C', value: '1800年', explanation: '' },
              { key: 'D', value: '1815年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '瓦特改良蒸汽机是在1785年。'
          },
          {
            id: 'q_history_063',
            question: '第一次工业革命的标志是（ ）',
            options: [
              { key: 'A', value: '蒸汽机的发明', explanation: '' },
              { key: 'B', value: '电力的广泛应用', explanation: '' },
              { key: 'C', value: '内燃机的发明', explanation: '' },
              { key: 'D', value: '计算机的发明', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '第一次工业革命的标志是蒸汽机的发明和使用。'
          },
          {
            id: 'q_history_064',
            question: '第二次工业革命开始于（ ）',
            options: [
              { key: 'A', value: '19世纪60年代', explanation: '' },
              { key: 'B', value: '19世纪70年代', explanation: '' },
              { key: 'C', value: '19世纪80年代', explanation: '' },
              { key: 'D', value: '19世纪90年代', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二次工业革命开始于19世纪70年代。'
          },
          {
            id: 'q_history_065',
            question: '第二次工业革命的标志是（ ）',
            options: [
              { key: 'A', value: '蒸汽机的发明', explanation: '' },
              { key: 'B', value: '电力的广泛应用', explanation: '' },
              { key: 'C', value: '计算机的发明', explanation: '' },
              { key: 'D', value: '互联网的发明', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二次工业革命的标志是电力的广泛应用。'
          },
          {
            id: 'q_history_066',
            question: '爱迪生发明电灯是在（ ）',
            options: [
              { key: 'A', value: '1877年', explanation: '' },
              { key: 'B', value: '1879年', explanation: '' },
              { key: 'C', value: '1881年', explanation: '' },
              { key: 'D', value: '1883年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '爱迪生发明电灯是在1879年。'
          },
          {
            id: 'q_history_067',
            question: '卡尔·本茨发明汽车是在（ ）',
            options: [
              { key: 'A', value: '1885年', explanation: '' },
              { key: 'B', value: '1890年', explanation: '' },
              { key: 'C', value: '1895年', explanation: '' },
              { key: 'D', value: '1900年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '卡尔·本茨发明汽车是在1885年。'
          },
          {
            id: 'q_history_068',
            question: '莱特兄弟发明飞机是在（ ）',
            options: [
              { key: 'A', value: '1900年', explanation: '' },
              { key: 'B', value: '1903年', explanation: '' },
              { key: 'C', value: '1905年', explanation: '' },
              { key: 'D', value: '1908年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '莱特兄弟发明飞机是在1903年。'
          },
          {
            id: 'q_history_069',
            question: '工业革命最早发生在（ ）',
            options: [
              { key: 'A', value: '美国', explanation: '' },
              { key: 'B', value: '德国', explanation: '' },
              { key: 'C', value: '英国', explanation: '' },
              { key: 'D', value: '法国', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '工业革命最早发生在英国。'
          },
          {
            id: 'q_history_070',
            question: '垄断组织出现于（ ）',
            options: [
              { key: 'A', value: '第一次工业革命', explanation: '' },
              { key: 'B', value: '第二次工业革命', explanation: '' },
              { key: 'C', value: '第三次工业革命', explanation: '' },
              { key: 'D', value: '第四次工业革命', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '垄断组织出现于第二次工业革命时期。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八单元 世界大战',
        description: '高一历史第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_071',
            question: '第一次世界大战爆发于（ ）',
            options: [
              { key: 'A', value: '1912年', explanation: '' },
              { key: 'B', value: '1913年', explanation: '' },
              { key: 'C', value: '1914年', explanation: '' },
              { key: 'D', value: '1915年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '第一次世界大战爆发于1914年。'
          },
          {
            id: 'q_history_072',
            question: '萨拉热窝事件发生在（ ）',
            options: [
              { key: 'A', value: '1914年', explanation: '' },
              { key: 'B', value: '1915年', explanation: '' },
              { key: 'C', value: '1916年', explanation: '' },
              { key: 'D', value: '1917年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '萨拉热窝事件发生在1914年，是一战的导火索。'
          },
          {
            id: 'q_history_073',
            question: '第一次世界大战结束于（ ）',
            options: [
              { key: 'A', value: '1916年', explanation: '' },
              { key: 'B', value: '1917年', explanation: '' },
              { key: 'C', value: '1918年', explanation: '' },
              { key: 'D', value: '1919年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '第一次世界大战结束于1918年。'
          },
          {
            id: 'q_history_074',
            question: '《凡尔赛和约》签订于（ ）',
            options: [
              { key: 'A', value: '1918年', explanation: '' },
              { key: 'B', value: '1919年', explanation: '' },
              { key: 'C', value: '1920年', explanation: '' },
              { key: 'D', value: '1921年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《凡尔赛和约》签订于1919年。'
          },
          {
            id: 'q_history_075',
            question: '第二次世界大战爆发于（ ）',
            options: [
              { key: 'A', value: '1938年', explanation: '' },
              { key: 'B', value: '1939年', explanation: '' },
              { key: 'C', value: '1940年', explanation: '' },
              { key: 'D', value: '1941年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二次世界大战爆发于1939年。'
          },
          {
            id: 'q_history_076',
            question: '德国入侵波兰是在（ ）',
            options: [
              { key: 'A', value: '1938年', explanation: '' },
              { key: 'B', value: '1939年', explanation: '' },
              { key: 'C', value: '1940年', explanation: '' },
              { key: 'D', value: '1941年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '德国入侵波兰是在1939年，标志着二战爆发。'
          },
          {
            id: 'q_history_077',
            question: '日本偷袭珍珠港是在（ ）',
            options: [
              { key: 'A', value: '1940年', explanation: '' },
              { key: 'B', value: '1941年', explanation: '' },
              { key: 'C', value: '1942年', explanation: '' },
              { key: 'D', value: '1943年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '日本偷袭珍珠港是在1941年。'
          },
          {
            id: 'q_history_078',
            question: '斯大林格勒战役发生在（ ）',
            options: [
              { key: 'A', value: '1941年', explanation: '' },
              { key: 'B', value: '1942年', explanation: '' },
              { key: 'C', value: '1943年', explanation: '' },
              { key: 'D', value: '1944年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '斯大林格勒战役发生在1942年至1943年。'
          },
          {
            id: 'q_history_079',
            question: '诺曼底登陆发生在（ ）',
            options: [
              { key: 'A', value: '1943年', explanation: '' },
              { key: 'B', value: '1944年', explanation: '' },
              { key: 'C', value: '1945年', explanation: '' },
              { key: 'D', value: '1946年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '诺曼底登陆发生在1944年。'
          },
          {
            id: 'q_history_080',
            question: '第二次世界大战结束于（ ）',
            options: [
              { key: 'A', value: '1944年', explanation: '' },
              { key: 'B', value: '1945年', explanation: '' },
              { key: 'C', value: '1946年', explanation: '' },
              { key: 'D', value: '1947年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二次世界大战结束于1945年。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九单元 冷战',
        description: '高一历史第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_081',
            question: '冷战开始于（ ）',
            options: [
              { key: 'A', value: '1945年', explanation: '' },
              { key: 'B', value: '1946年', explanation: '' },
              { key: 'C', value: '1947年', explanation: '' },
              { key: 'D', value: '1948年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '冷战开始于1947年杜鲁门主义的提出。'
          },
          {
            id: 'q_history_082',
            question: '杜鲁门主义提出于（ ）',
            options: [
              { key: 'A', value: '1945年', explanation: '' },
              { key: 'B', value: '1946年', explanation: '' },
              { key: 'C', value: '1947年', explanation: '' },
              { key: 'D', value: '1948年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '杜鲁门主义提出于1947年。'
          },
          {
            id: 'q_history_083',
            question: '马歇尔计划提出于（ ）',
            options: [
              { key: 'A', value: '1947年', explanation: '' },
              { key: 'B', value: '1948年', explanation: '' },
              { key: 'C', value: '1949年', explanation: '' },
              { key: 'D', value: '1950年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '马歇尔计划提出于1947年。'
          },
          {
            id: 'q_history_084',
            question: '北约成立于（ ）',
            options: [
              { key: 'A', value: '1948年', explanation: '' },
              { key: 'B', value: '1949年', explanation: '' },
              { key: 'C', value: '1950年', explanation: '' },
              { key: 'D', value: '1951年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '北约成立于1949年。'
          },
          {
            id: 'q_history_085',
            question: '华约成立于（ ）',
            options: [
              { key: 'A', value: '1949年', explanation: '' },
              { key: 'B', value: '1950年', explanation: '' },
              { key: 'C', value: '1954年', explanation: '' },
              { key: 'D', value: '1955年', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '华约成立于1955年。'
          },
          {
            id: 'q_history_086',
            question: '朝鲜战争爆发于（ ）',
            options: [
              { key: 'A', value: '1950年', explanation: '' },
              { key: 'B', value: '1951年', explanation: '' },
              { key: 'C', value: '1952年', explanation: '' },
              { key: 'D', value: '1953年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '朝鲜战争爆发于1950年。'
          },
          {
            id: 'q_history_087',
            question: '古巴导弹危机发生在（ ）',
            options: [
              { key: 'A', value: '1960年', explanation: '' },
              { key: 'B', value: '1961年', explanation: '' },
              { key: 'C', value: '1962年', explanation: '' },
              { key: 'D', value: '1963年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '古巴导弹危机发生在1962年。'
          },
          {
            id: 'q_history_088',
            question: '越南战争爆发于（ ）',
            options: [
              { key: 'A', value: '1955年', explanation: '' },
              { key: 'B', value: '1960年', explanation: '' },
              { key: 'C', value: '1965年', explanation: '' },
              { key: 'D', value: '1970年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '越南战争爆发于1955年。'
          },
          {
            id: 'q_history_089',
            question: '苏联解体于（ ）',
            options: [
              { key: 'A', value: '1989年', explanation: '' },
              { key: 'B', value: '1990年', explanation: '' },
              { key: 'C', value: '1991年', explanation: '' },
              { key: 'D', value: '1992年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '苏联解体于1991年。'
          },
          {
            id: 'q_history_090',
            question: '冷战结束于（ ）',
            options: [
              { key: 'A', value: '1989年', explanation: '' },
              { key: 'B', value: '1990年', explanation: '' },
              { key: 'C', value: '1991年', explanation: '' },
              { key: 'D', value: '1992年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '冷战结束于1991年苏联解体。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十单元 当代世界',
        description: '高一历史第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_history_091',
            question: '联合国成立于（ ）',
            options: [
              { key: 'A', value: '1944年', explanation: '' },
              { key: 'B', value: '1945年', explanation: '' },
              { key: 'C', value: '1946年', explanation: '' },
              { key: 'D', value: '1947年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '联合国成立于1945年。'
          },
          {
            id: 'q_history_092',
            question: '欧盟成立于（ ）',
            options: [
              { key: 'A', value: '1989年', explanation: '' },
              { key: 'B', value: '1990年', explanation: '' },
              { key: 'C', value: '1991年', explanation: '' },
              { key: 'D', value: '1993年', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '欧盟成立于1993年。'
          },
          {
            id: 'q_history_093',
            question: '世界贸易组织成立于（ ）',
            options: [
              { key: 'A', value: '1993年', explanation: '' },
              { key: 'B', value: '1994年', explanation: '' },
              { key: 'C', value: '1995年', explanation: '' },
              { key: 'D', value: '1996年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '世界贸易组织成立于1995年。'
          },
          {
            id: 'q_history_094',
            question: '中国加入世界贸易组织是在（ ）',
            options: [
              { key: 'A', value: '2000年', explanation: '' },
              { key: 'B', value: '2001年', explanation: '' },
              { key: 'C', value: '2002年', explanation: '' },
              { key: 'D', value: '2003年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '中国加入世界贸易组织是在2001年。'
          },
          {
            id: 'q_history_095',
            question: '互联网诞生于（ ）',
            options: [
              { key: 'A', value: '1960年代', explanation: '' },
              { key: 'B', value: '1970年代', explanation: '' },
              { key: 'C', value: '1980年代', explanation: '' },
              { key: 'D', value: '1990年代', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '互联网诞生于1960年代的ARPANET。'
          },
          {
            id: 'q_history_096',
            question: '万维网诞生于（ ）',
            options: [
              { key: 'A', value: '1989年', explanation: '' },
              { key: 'B', value: '1990年', explanation: '' },
              { key: 'C', value: '1991年', explanation: '' },
              { key: 'D', value: '1992年', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '万维网诞生于1990年。'
          },
          {
            id: 'q_history_097',
            question: '全球化的主要推动力不包括（ ）',
            options: [
              { key: 'A', value: '科技进步', explanation: '' },
              { key: 'B', value: '贸易自由化', explanation: '' },
              { key: 'C', value: '文化隔离', explanation: '' },
              { key: 'D', value: '跨国公司', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '文化隔离会阻碍全球化，不是推动力。'
          },
          {
            id: 'q_history_098',
            question: '金砖国家不包括（ ）',
            options: [
              { key: 'A', value: '中国', explanation: '' },
              { key: 'B', value: '印度', explanation: '' },
              { key: 'C', value: '俄罗斯', explanation: '' },
              { key: 'D', value: '日本', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '金砖国家包括中国、印度、俄罗斯、巴西、南非，不包括日本。'
          },
          {
            id: 'q_history_099',
            question: 'APEC成立于（ ）',
            options: [
              { key: 'A', value: '1989年', explanation: '' },
              { key: 'B', value: '1990年', explanation: '' },
              { key: 'C', value: '1991年', explanation: '' },
              { key: 'D', value: '1992年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'APEC成立于1989年。'
          },
          {
            id: 'q_history_100',
            question: 'G20成立于（ ）',
            options: [
              { key: 'A', value: '1995年', explanation: '' },
              { key: 'B', value: '1997年', explanation: '' },
              { key: 'C', value: '1999年', explanation: '' },
              { key: 'D', value: '2001年', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'G20成立于1999年。'
          }
        ]
      }
    ];
  }

  getLevelQuestions(levelNumber) {
    const level = this.getLevel(levelNumber);
    return level ? level.questions : [];
  }
}
