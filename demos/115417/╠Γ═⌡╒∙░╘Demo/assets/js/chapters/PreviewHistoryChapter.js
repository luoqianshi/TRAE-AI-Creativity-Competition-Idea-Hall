class PreviewHistoryChapter extends PreviewChapter {
  constructor() {
    super('preview_history', '历史', 'fa-landmark', '#e67e22');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一单元 中华文明的起源与早期国家',
        description: '分封制与宗法制',
        knowledgePoints: [
          {
            id: 'kp_history_001',
            title: '分封制与宗法制',
            content: '分封制：目的为稳定周初的政治形势，巩固疆土；对象包括王族、功臣、先代帝王的后代；内容为周天子把土地和人民分封给诸侯，诸侯在封国内再分封给卿大夫，卿大夫再分封给士；义务为诸侯需向周王进献贡物，服从周王调兵。宗法制：核心是嫡长子继承制；作用为保证各级贵族在政治上的垄断和特权地位，有利于统治集团内部的稳定和团结。'
          }
        ],
        questions: [
          {
            id: 'pq_history_001',
            knowledgePointId: 'kp_history_001',
            question: '关于西周分封制和宗法制，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '分封制的对象包括王族、功臣和先代帝王的后代', explanation: '西周分封的对象主要有三类：同姓王族、异姓功臣和先代贵族，正确。' },
              { key: 'B', value: '宗法制的核心是嫡长子继承制', explanation: '宗法制以嫡长子继承制为核心，正确。' },
              { key: 'C', value: '分封制和宗法制互为表里', explanation: '分封制是宗法制在政治上的体现，宗法制是分封制的血缘基础，互为表里，正确。' },
              { key: 'D', value: '分封制下诸侯可以世袭', explanation: '诸侯的爵位和封地可以世袭，正确。' },
              { key: 'E', value: '宗法制确立了严格的大宗小宗关系', explanation: '宗法制规定周天子为天下大宗，诸侯为小宗；诸侯在封国内为大宗，卿大夫为小宗，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，分封制和宗法制是西周最重要的政治制度，互为表里，选A。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二单元 秦汉统一多民族封建国家的建立与巩固',
        description: '秦朝中央集权制度',
        knowledgePoints: [
          {
            id: 'kp_history_002',
            title: '秦朝中央集权制度',
            content: '秦朝中央集权制度的内容：1. 皇帝制度——嬴政自称"始皇帝"，总揽全国军政大权；2. 三公九卿制（中央）——三公为丞相（行政）、太尉（军事）、御史大夫（监察）；3. 郡县制（地方）——废除分封制，全国分36郡，郡下设县，官员由中央任免。秦统一的意义：结束了诸侯割据局面，建立了中国历史上第一个统一的中央集权封建国家；统一文字、货币、度量衡、车轨，有利于经济文化交流。'
          }
        ],
        questions: [
          {
            id: 'pq_history_002',
            knowledgePointId: 'kp_history_002',
            question: '关于秦朝的中央集权制度，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '秦朝在中央实行三公九卿制', explanation: '秦朝中央政府设三公九卿，三公为丞相、太尉、御史大夫，正确。' },
              { key: 'B', value: '秦朝在地方实行郡县制', explanation: '秦朝废除分封制，在全国推行郡县制，正确。' },
              { key: 'C', value: '郡县长官由皇帝直接任免', explanation: '郡县制下，郡守和县令由皇帝直接任免，加强了中央集权，正确。' },
              { key: 'D', value: '秦朝统一了文字、货币和度量衡', explanation: '秦始皇统一了文字（小篆）、货币（圆形方孔钱）和度量衡，正确。' },
              { key: 'E', value: '秦朝是中国历史上第一个统一的封建王朝', explanation: '秦朝结束了春秋战国诸侯割据，建立了第一个统一的封建王朝，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，秦朝建立了中国历史上第一个统一的中央集权封建国家，选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三单元 隋唐统一多民族封建国家的发展',
        description: '科举制与三省六部制',
        knowledgePoints: [
          {
            id: 'kp_history_003',
            title: '科举制与三省六部制',
            content: '科举制：创立——隋文帝开始用分科考试的方法选拔官员；隋炀帝设进士科，科举制正式诞生。完善——唐太宗增加考试科目；武则天创立殿试和武举；唐玄宗以诗赋为进士科主要考试内容。意义——加强了皇帝选官和用人的权力；扩大了官吏选拔的范围；促进了社会阶层的流动；推动了教育的发展。三省六部制：三省——中书省（决策）、门下省（审核）、尚书省（执行）；六部——吏部、户部、礼部、兵部、刑部、工部。特点——三省分工明确，相互牵制，提高了行政效率，加强了皇权。'
          }
        ],
        questions: [
          {
            id: 'pq_history_003',
            knowledgePointId: 'kp_history_003',
            question: '关于隋唐科举制和三省六部制，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '科举制诞生于隋朝', explanation: '隋炀帝设进士科，标志着科举制正式诞生，正确。' },
              { key: 'B', value: '武则天创立了殿试制度', explanation: '武则天创立了殿试制度，亲自面试考生，正确。' },
              { key: 'C', value: '三省六部制中，中书省负责决策', explanation: '中书省负责起草政令（决策），门下省负责审核，尚书省负责执行，正确。' },
              { key: 'D', value: '科举制促进了社会阶层的流动', explanation: '科举制使平民可以通过考试进入仕途，促进了社会流动，正确。' },
              { key: 'E', value: '尚书省下辖六部', explanation: '尚书省下设吏、户、礼、兵、刑、工六部，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，选A。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四单元 辽宋夏金元多民族政权的并立与元朝的统一',
        description: '经济重心南移',
        knowledgePoints: [
          {
            id: 'kp_history_004',
            title: '经济重心南移',
            content: '经济重心南移的过程：东汉末年——经济重心开始南移；唐朝安史之乱后——经济重心加速南移；南宋——经济重心南移完成（"苏湖熟，天下足"）。经济重心南移的原因：北方战乱频繁，南方相对安定；北民南迁，带来先进技术和劳动力；南方自然条件优越。'
          }
        ],
        questions: [
          {
            id: 'pq_history_004',
            knowledgePointId: 'kp_history_004',
            question: '关于经济重心南移，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '经济重心南移开始于东汉末年', explanation: '东汉末年开始，北方战乱，经济重心开始南移，正确。' },
              { key: 'B', value: '北民南迁是经济重心南移的重要原因', explanation: '北民南迁带来了先进生产技术和大量劳动力，是重要原因，正确。' },
              { key: 'C', value: '南宋时经济重心南移完成', explanation: '南宋时期，经济重心南移最终完成，正确。' },
              { key: 'D', value: '"苏湖熟，天下足"反映了南方农业的发达', explanation: '南宋谚语"苏湖熟，天下足"，说明南方农业在全国的地位，正确。' },
              { key: 'E', value: '经济重心南移后，南方成为全国经济中心', explanation: '南移完成后，南方成为全国经济中心，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，选A。'
          }
        ]
      }
    ];
  }
}