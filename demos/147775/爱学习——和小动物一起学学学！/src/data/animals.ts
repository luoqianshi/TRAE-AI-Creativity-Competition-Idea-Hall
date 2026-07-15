import { Animal } from '../types';

export const initialAnimals: Animal[] = [
  {
    id: 'rabbit-1',
    type: 'rabbit',
    name: '小白兔',
    emoji: '🐰',
    level: 1,
    exp: 0,
    maxExp: 100,
    rewards: [],
  },
  {
    id: 'squirrel-1',
    type: 'squirrel',
    name: '小松鼠',
    emoji: '🐿️',
    level: 1,
    exp: 0,
    maxExp: 100,
    rewards: [],
  },
  {
    id: 'bird-1',
    type: 'bird',
    name: '小鸟儿',
    emoji: '🐦',
    level: 1,
    exp: 0,
    maxExp: 100,
    rewards: [],
  },
];

export const animalColors: Record<string, string> = {
  rabbit: 'bg-bunny-pink',
  squirrel: 'bg-squirrel-orange',
  bird: 'bg-bird-blue',
};

export const animalBgColors: Record<string, string> = {
  rabbit: 'bg-pink-100',
  squirrel: 'bg-orange-100',
  bird: 'bg-blue-100',
};
