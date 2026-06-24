// 离线备用故事 — 客户端可读
export interface OfflineStory {
  id: string;
  title: string;
  theme: string;
  fullText: string;
}

export const OFFLINE_STORIES: OfflineStory[] = [
  {
    id: 'offline_01',
    title: '小兔子的彩虹',
    theme: 'animal',
    fullText:
      '雨停了，太阳笑眯眯。\n天上挂着一道彩虹。\n小白兔跳跳抬头看：哇，好漂亮。\n她想摸一摸彩虹。\n跳一跳，没摸到。\n再跳一跳，还是没摸到。\n彩虹说：跳跳，我在这里，你来追我呀。\n跳跳笑着追，咯咯咯。\n彩虹越飘越远，飘到山那边。\n跳跳回到家，跟妈妈说：我今天追彩虹啦。\n妈妈笑着说：彩虹是空气里的小水滴变的。\n跳跳眨眨眼：水滴也会笑吗？\n妈妈笑了：会呀，下雨之后它们就笑。\n跳跳说：那我也笑一笑，咯咯咯。',
  },
  {
    id: 'offline_02',
    title: '小汽车嘀嘀',
    theme: 'car',
    fullText:
      '院子里停着一辆红色小汽车。\n他叫嘀嘀。\n每天他都看见小朋友走来走去。\n嘀嘀想：我也想去外面看看。\n一天，爸爸坐了上来，咔哒。\n嘀嘀好兴奋，发动机轰轰响。\n他开过小桥，开过树林，开过草地。\n他看见蓝蓝的天，白白的云。\n嘀嘀说：外面的世界好大呀。\n回到院子里，嘀嘀甜甜地睡了。\n梦里他还在开，嘟嘟嘟。',
  },
  {
    id: 'offline_03',
    title: '月亮上的朋友',
    theme: 'space',
    fullText:
      '晚上，小兔子跳跳趴在窗台上看月亮。\n月亮好亮好圆。\n跳跳说：月亮，你能下来和我玩吗？\n月亮眨眨眼：我下不来呀。\n跳跳想了想：那我能上去吗？\n月亮笑一笑：等你长大了，坐上飞船就能来。\n跳跳点点头：好，我一定快快长大。\n月亮说：那我每天晚上都等你。\n跳跳挥挥手：晚安月亮。\n月亮也挥挥手：晚安跳跳。\n星星在旁边眨眼睛，闪呀闪。\n跳跳甜甜地笑了。',
  },
];

const STORAGE_KEY = 'fantasy_theater_offline_stories';

export function getOfflineStories(): OfflineStory[] {
  if (typeof window === 'undefined') return OFFLINE_STORIES;
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as OfflineStory[];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(OFFLINE_STORIES));
  } catch {
    // localStorage 不可用时降级
  }
  return OFFLINE_STORIES;
}
