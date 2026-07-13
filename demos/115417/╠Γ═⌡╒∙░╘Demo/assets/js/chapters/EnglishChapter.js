class EnglishChapter extends Chapter {
  constructor() {
    super('english', '英语', 'fa-language', '#2ecc71');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: 'Unit 1 Teenage Life',
        description: '高一英语第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_001',
            question: 'Choose the correct word: He is a ______ student.',
            options: [
              { key: 'A', value: 'teenage', explanation: '' },
              { key: 'B', value: 'teenager', explanation: '' },
              { key: 'C', value: 'teenageer', explanation: '' },
              { key: 'D', value: 'teen', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Teenage" is an adjective meaning relating to teenagers.'
          },
          {
            id: 'q_english_002',
            question: 'The word "challenging" means:',
            options: [
              { key: 'A', value: 'easy', explanation: '' },
              { key: 'B', value: 'difficult but interesting', explanation: '' },
              { key: 'C', value: 'boring', explanation: '' },
              { key: 'D', value: 'funny', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Challenging" means difficult in a way that tests your ability.'
          },
          {
            id: 'q_english_003',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'I enjoy to read.', explanation: '' },
              { key: 'B', value: 'I enjoy reading.', explanation: '' },
              { key: 'C', value: 'I enjoy read.', explanation: '' },
              { key: 'D', value: 'I enjoy reads.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'After "enjoy", we use the -ing form of the verb.'
          },
          {
            id: 'q_english_004',
            question: 'Choose the correct preposition: I am good ______ math.',
            options: [
              { key: 'A', value: 'at', explanation: '' },
              { key: 'B', value: 'in', explanation: '' },
              { key: 'C', value: 'on', explanation: '' },
              { key: 'D', value: 'for', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Good at" is the correct collocation.'
          },
          {
            id: 'q_english_005',
            question: 'The opposite of "optimistic" is:',
            options: [
              { key: 'A', value: 'positive', explanation: '' },
              { key: 'B', value: 'pessimistic', explanation: '' },
              { key: 'C', value: 'optimist', explanation: '' },
              { key: 'D', value: 'hopeful', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Pessimistic" means expecting the worst outcome.'
          },
          {
            id: 'q_english_006',
            question: 'Choose the correct form: She ______ to school every day.',
            options: [
              { key: 'A', value: 'go', explanation: '' },
              { key: 'B', value: 'goes', explanation: '' },
              { key: 'C', value: 'going', explanation: '' },
              { key: 'D', value: 'went', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Third person singular present tense: "goes".'
          },
          {
            id: 'q_english_007',
            question: 'What does "extracurricular" mean?',
            options: [
              { key: 'A', value: 'inside the classroom', explanation: '' },
              { key: 'B', value: 'outside regular school hours', explanation: '' },
              { key: 'C', value: 'difficult', explanation: '' },
              { key: 'D', value: 'easy', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Extracurricular" means outside the regular curriculum.'
          },
          {
            id: 'q_english_008',
            question: 'Choose the correct article: ______ apple a day keeps the doctor away.',
            options: [
              { key: 'A', value: 'A', explanation: '' },
              { key: 'B', value: 'An', explanation: '' },
              { key: 'C', value: 'The', explanation: '' },
              { key: 'D', value: '-', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"An" is used before vowel sounds.'
          },
          {
            id: 'q_english_009',
            question: 'The word "curriculum" means:',
            options: [
              { key: 'A', value: 'a type of fruit', explanation: '' },
              { key: 'B', value: 'a course of study', explanation: '' },
              { key: 'C', value: 'a building', explanation: '' },
              { key: 'D', value: 'a vehicle', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Curriculum" refers to the courses offered by a school.'
          },
          {
            id: 'q_english_010',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'He plays basketball good.', explanation: '' },
              { key: 'B', value: 'He plays basketball well.', explanation: '' },
              { key: 'C', value: 'He plays basketball goodly.', explanation: '' },
              { key: 'D', value: 'He plays basketball better.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'We use "well" (adverb) to modify the verb "plays".'
          }
        ]
      },
      {
        levelNumber: 2,
        name: 'Unit 2 Travelling Around',
        description: '高一英语第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_011',
            question: 'Choose the correct word: I want to ______ around the world.',
            options: [
              { key: 'A', value: 'travel', explanation: '' },
              { key: 'B', value: 'trip', explanation: '' },
              { key: 'C', value: 'journey', explanation: '' },
              { key: 'D', value: 'voyage', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Travel" is the verb meaning to go from one place to another.'
          },
          {
            id: 'q_english_012',
            question: 'The word "destination" means:',
            options: [
              { key: 'A', value: 'starting point', explanation: '' },
              { key: 'B', value: 'final place', explanation: '' },
              { key: 'C', value: 'vehicle', explanation: '' },
              { key: 'D', value: 'map', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Destination" is the place you are going to.'
          },
          {
            id: 'q_english_013',
            question: 'Choose the correct form: We ______ to Beijing last summer.',
            options: [
              { key: 'A', value: 'go', explanation: '' },
              { key: 'B', value: 'goes', explanation: '' },
              { key: 'C', value: 'went', explanation: '' },
              { key: 'D', value: 'going', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Past tense of "go" is "went".'
          },
          {
            id: 'q_english_014',
            question: 'What does "sightseeing" mean?',
            options: [
              { key: 'A', value: 'looking at famous places', explanation: '' },
              { key: 'B', value: 'reading books', explanation: '' },
              { key: 'C', value: 'watching movies', explanation: '' },
              { key: 'D', value: 'eating food', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Sightseeing" means visiting famous places.'
          },
          {
            id: 'q_english_015',
            question: 'Choose the correct preposition: We arrived ______ the airport.',
            options: [
              { key: 'A', value: 'at', explanation: '' },
              { key: 'B', value: 'in', explanation: '' },
              { key: 'C', value: 'on', explanation: '' },
              { key: 'D', value: 'to', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'We use "at" for specific places like airports.'
          },
          {
            id: 'q_english_016',
            question: 'The word "route" means:',
            options: [
              { key: 'A', value: 'a type of food', explanation: '' },
              { key: 'B', value: 'a path or way', explanation: '' },
              { key: 'C', value: 'a hotel', explanation: '' },
              { key: 'D', value: 'a ticket', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Route" is the path taken to get somewhere.'
          },
          {
            id: 'q_english_017',
            question: 'Choose the correct form: She has ______ to Paris twice.',
            options: [
              { key: 'A', value: 'been', explanation: '' },
              { key: 'B', value: 'gone', explanation: '' },
              { key: 'C', value: 'went', explanation: '' },
              { key: 'D', value: 'go', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Has been" means she went and came back.'
          },
          {
            id: 'q_english_018',
            question: 'What does "accommodation" mean?',
            options: [
              { key: 'A', value: 'food', explanation: '' },
              { key: 'B', value: 'a place to stay', explanation: '' },
              { key: 'C', value: 'transportation', explanation: '' },
              { key: 'D', value: 'money', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Accommodation" refers to a place to stay, like a hotel.'
          },
          {
            id: 'q_english_019',
            question: 'Choose the correct word: I need to ______ a hotel room.',
            options: [
              { key: 'A', value: 'book', explanation: '' },
              { key: 'B', value: 'buy', explanation: '' },
              { key: 'C', value: 'sell', explanation: '' },
              { key: 'D', value: 'rent', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Book" means to reserve in advance.'
          },
          {
            id: 'q_english_020',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'I look forward to meet you.', explanation: '' },
              { key: 'B', value: 'I look forward to meeting you.', explanation: '' },
              { key: 'C', value: 'I look forward meet you.', explanation: '' },
              { key: 'D', value: 'I look forward meets you.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'After "look forward to", we use the -ing form.'
          }
        ]
      },
      {
        levelNumber: 3,
        name: 'Unit 3 Sports and Fitness',
        description: '高一英语第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_021',
            question: 'Choose the correct word: Regular ______ is good for health.',
            options: [
              { key: 'A', value: 'exercise', explanation: '' },
              { key: 'B', value: 'exercises', explanation: '' },
              { key: 'C', value: 'exercising', explanation: '' },
              { key: 'D', value: 'exercised', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Exercise" as a noun is uncountable.'
          },
          {
            id: 'q_english_022',
            question: 'The word "fitness" means:',
            options: [
              { key: 'A', value: 'being ill', explanation: '' },
              { key: 'B', value: 'being healthy and strong', explanation: '' },
              { key: 'C', value: 'being lazy', explanation: '' },
              { key: 'D', value: 'being tired', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Fitness" refers to physical health and strength.'
          },
          {
            id: 'q_english_023',
            question: 'Choose the correct form: He ______ every morning.',
            options: [
              { key: 'A', value: 'run', explanation: '' },
              { key: 'B', value: 'runs', explanation: '' },
              { key: 'C', value: 'running', explanation: '' },
              { key: 'D', value: 'ran', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Third person singular present tense: "runs".'
          },
          {
            id: 'q_english_024',
            question: 'What does "workout" mean?',
            options: [
              { key: 'A', value: 'a period of exercise', explanation: '' },
              { key: 'B', value: 'a type of work', explanation: '' },
              { key: 'C', value: 'a meal', explanation: '' },
              { key: 'D', value: 'a rest', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Workout" is a period of physical exercise.'
          },
          {
            id: 'q_english_025',
            question: 'Choose the correct preposition: She is good ______ swimming.',
            options: [
              { key: 'A', value: 'at', explanation: '' },
              { key: 'B', value: 'in', explanation: '' },
              { key: 'C', value: 'on', explanation: '' },
              { key: 'D', value: 'for', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Good at" is used for skills.'
          },
          {
            id: 'q_english_026',
            question: 'The word "athlete" means:',
            options: [
              { key: 'A', value: 'a sports player', explanation: '' },
              { key: 'B', value: 'a doctor', explanation: '' },
              { key: 'C', value: 'a teacher', explanation: '' },
              { key: 'D', value: 'a student', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Athlete" is a person who is trained in sports.'
          },
          {
            id: 'q_english_027',
            question: 'Choose the correct form: They ______ basketball now.',
            options: [
              { key: 'A', value: 'play', explanation: '' },
              { key: 'B', value: 'plays', explanation: '' },
              { key: 'C', value: 'are playing', explanation: '' },
              { key: 'D', value: 'played', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Present continuous tense: "are playing".'
          },
          {
            id: 'q_english_028',
            question: 'What does "jogging" mean?',
            options: [
              { key: 'A', value: 'running slowly', explanation: '' },
              { key: 'B', value: 'running fast', explanation: '' },
              { key: 'C', value: 'walking', explanation: '' },
              { key: 'D', value: 'jumping', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Jogging" is running at a slow steady pace.'
          },
          {
            id: 'q_english_029',
            question: 'Choose the correct word: I want to ______ weight.',
            options: [
              { key: 'A', value: 'lose', explanation: '' },
              { key: 'B', value: 'loose', explanation: '' },
              { key: 'C', value: 'lost', explanation: '' },
              { key: 'D', value: 'losed', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Lose weight" means to become thinner.'
          },
          {
            id: 'q_english_030',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'He is interested in play football.', explanation: '' },
              { key: 'B', value: 'He is interested in playing football.', explanation: '' },
              { key: 'C', value: 'He is interested in plays football.', explanation: '' },
              { key: 'D', value: 'He is interested in played football.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'After "interested in", we use the -ing form.'
          }
        ]
      },
      {
        levelNumber: 4,
        name: 'Unit 4 Natural Disasters',
        description: '高一英语第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_031',
            question: 'Choose the correct word: A ______ is a sudden violent shaking of the ground.',
            options: [
              { key: 'A', value: 'flood', explanation: '' },
              { key: 'B', value: 'earthquake', explanation: '' },
              { key: 'C', value: 'hurricane', explanation: '' },
              { key: 'D', value: 'drought', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Earthquake" is a sudden shaking of the ground.'
          },
          {
            id: 'q_english_032',
            question: 'The word "disaster" means:',
            options: [
              { key: 'A', value: 'a happy event', explanation: '' },
              { key: 'B', value: 'a terrible event', explanation: '' },
              { key: 'C', value: 'a normal event', explanation: '' },
              { key: 'D', value: 'a planned event', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Disaster" is a sudden event that causes great damage.'
          },
          {
            id: 'q_english_033',
            question: 'Choose the correct form: The earthquake ______ last night.',
            options: [
              { key: 'A', value: 'happen', explanation: '' },
              { key: 'B', value: 'happens', explanation: '' },
              { key: 'C', value: 'happened', explanation: '' },
              { key: 'D', value: 'happening', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Past tense of "happen" is "happened".'
          },
          {
            id: 'q_english_034',
            question: 'What does "flood" mean?',
            options: [
              { key: 'A', value: 'too much water covering land', explanation: '' },
              { key: 'B', value: 'lack of water', explanation: '' },
              { key: 'C', value: 'strong wind', explanation: '' },
              { key: 'D', value: 'big fire', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Flood" is an overflow of water onto normally dry land.'
          },
          {
            id: 'q_english_035',
            question: 'Choose the correct preposition: The building collapsed ______ the earthquake.',
            options: [
              { key: 'A', value: 'because', explanation: '' },
              { key: 'B', value: 'because of', explanation: '' },
              { key: 'C', value: 'due', explanation: '' },
              { key: 'D', value: 'thanks to', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Because of" is followed by a noun phrase.'
          },
          {
            id: 'q_english_036',
            question: 'The word "survive" means:',
            options: [
              { key: 'A', value: 'to die', explanation: '' },
              { key: 'B', value: 'to live through', explanation: '' },
              { key: 'C', value: 'to escape', explanation: '' },
              { key: 'D', value: 'to hide', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Survive" means to continue to live after a difficult situation.'
          },
          {
            id: 'q_english_037',
            question: 'Choose the correct form: Many people ______ in the flood.',
            options: [
              { key: 'A', value: 'lose', explanation: '' },
              { key: 'B', value: 'lost', explanation: '' },
              { key: 'C', value: 'losing', explanation: '' },
              { key: 'D', value: 'loser', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Past tense of "lose" is "lost".'
          },
          {
            id: 'q_english_038',
            question: 'What does "damage" mean?',
            options: [
              { key: 'A', value: 'to help', explanation: '' },
              { key: 'B', value: 'to harm or destroy', explanation: '' },
              { key: 'C', value: 'to build', explanation: '' },
              { key: 'D', value: 'to repair', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Damage" means to harm or destroy something.'
          },
          {
            id: 'q_english_039',
            question: 'Choose the correct word: We need to ______ for natural disasters.',
            options: [
              { key: 'A', value: 'prepare', explanation: '' },
              { key: 'B', value: 'preparation', explanation: '' },
              { key: 'C', value: 'prepared', explanation: '' },
              { key: 'D', value: 'preparing', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Prepare" is the verb meaning to get ready.'
          },
          {
            id: 'q_english_040',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'The storm caused many damages.', explanation: '' },
              { key: 'B', value: 'The storm caused much damage.', explanation: '' },
              { key: 'C', value: 'The storm caused many damage.', explanation: '' },
              { key: 'D', value: 'The storm caused much damages.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Damage" is uncountable, so we use "much".'
          }
        ]
      },
      {
        levelNumber: 5,
        name: 'Unit 5 Languages Around the World',
        description: '高一英语第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_041',
            question: 'Choose the correct word: English is a ______ language.',
            options: [
              { key: 'A', value: 'global', explanation: '' },
              { key: 'B', value: 'globally', explanation: '' },
              { key: 'C', value: 'globe', explanation: '' },
              { key: 'D', value: 'globing', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Global" is an adjective meaning worldwide.'
          },
          {
            id: 'q_english_042',
            question: 'The word "dialect" means:',
            options: [
              { key: 'A', value: 'a type of food', explanation: '' },
              { key: 'B', value: 'a variation of a language', explanation: '' },
              { key: 'C', value: 'a country', explanation: '' },
              { key: 'D', value: 'a book', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Dialect" is a form of a language spoken in a particular area.'
          },
          {
            id: 'q_english_043',
            question: 'Choose the correct form: Chinese ______ by millions of people.',
            options: [
              { key: 'A', value: 'speak', explanation: '' },
              { key: 'B', value: 'speaks', explanation: '' },
              { key: 'C', value: 'is spoken', explanation: '' },
              { key: 'D', value: 'was spoken', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Passive voice: "is spoken".'
          },
          {
            id: 'q_english_044',
            question: 'What does "official" mean?',
            options: [
              { key: 'A', value: 'unofficial', explanation: '' },
              { key: 'B', value: 'relating to the government', explanation: '' },
              { key: 'C', value: 'private', explanation: '' },
              { key: 'D', value: 'secret', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Official" means relating to an authority or government.'
          },
          {
            id: 'q_english_045',
            question: 'Choose the correct preposition: She is fluent ______ English.',
            options: [
              { key: 'A', value: 'at', explanation: '' },
              { key: 'B', value: 'in', explanation: '' },
              { key: 'C', value: 'on', explanation: '' },
              { key: 'D', value: 'for', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Fluent in" is the correct collocation.'
          },
          {
            id: 'q_english_046',
            question: 'The word "vocabulary" means:',
            options: [
              { key: 'A', value: 'grammar rules', explanation: '' },
              { key: 'B', value: 'words in a language', explanation: '' },
              { key: 'C', value: 'pronunciation', explanation: '' },
              { key: 'D', value: 'writing', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Vocabulary" is all the words used in a language.'
          },
          {
            id: 'q_english_047',
            question: 'Choose the correct form: He ______ three languages.',
            options: [
              { key: 'A', value: 'speak', explanation: '' },
              { key: 'B', value: 'speaks', explanation: '' },
              { key: 'C', value: 'speaking', explanation: '' },
              { key: 'D', value: 'spoke', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Third person singular present tense: "speaks".'
          },
          {
            id: 'q_english_048',
            question: 'What does "accent" mean?',
            options: [
              { key: 'A', value: 'a type of music', explanation: '' },
              { key: 'B', value: 'the way someone pronounces words', explanation: '' },
              { key: 'C', value: 'a type of dance', explanation: '' },
              { key: 'D', value: 'a type of food', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Accent" is the way someone pronounces words.'
          },
          {
            id: 'q_english_049',
            question: 'Choose the correct word: I need to ______ my vocabulary.',
            options: [
              { key: 'A', value: 'increase', explanation: '' },
              { key: 'B', value: 'decrease', explanation: '' },
              { key: 'C', value: 'increaseing', explanation: '' },
              { key: 'D', value: 'increased', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Increase" means to make larger.'
          },
          {
            id: 'q_english_050',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'He can to speak English.', explanation: '' },
              { key: 'B', value: 'He can speak English.', explanation: '' },
              { key: 'C', value: 'He can speaking English.', explanation: '' },
              { key: 'D', value: 'He can speaks English.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'After modal verbs like "can", we use the base form.'
          }
        ]
      },
      {
        levelNumber: 6,
        name: 'Unit 6 At the Gym',
        description: '高一英语第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_051',
            question: 'Choose the correct word: I go to the ______ every day.',
            options: [
              { key: 'A', value: 'gym', explanation: '' },
              { key: 'B', value: 'gyms', explanation: '' },
              { key: 'C', value: 'gymming', explanation: '' },
              { key: 'D', value: 'gymed', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Gym" is short for "gymnasium".'
          },
          {
            id: 'q_english_052',
            question: 'The word "equipment" means:',
            options: [
              { key: 'A', value: 'clothes', explanation: '' },
              { key: 'B', value: 'tools or machines', explanation: '' },
              { key: 'C', value: 'food', explanation: '' },
              { key: 'D', value: 'books', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Equipment" refers to the tools or machines used for a purpose.'
          },
          {
            id: 'q_english_053',
            question: 'Choose the correct form: I ______ weights every morning.',
            options: [
              { key: 'A', value: 'lift', explanation: '' },
              { key: 'B', value: 'lifts', explanation: '' },
              { key: 'C', value: 'lifting', explanation: '' },
              { key: 'D', value: 'lifted', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'First person present tense: "lift".'
          },
          {
            id: 'q_english_054',
            question: 'What does "cardio" mean?',
            options: [
              { key: 'A', value: 'strength training', explanation: '' },
              { key: 'B', value: 'heart and lung exercise', explanation: '' },
              { key: 'C', value: 'flexibility training', explanation: '' },
              { key: 'D', value: 'balance training', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Cardio" refers to exercise that strengthens the heart and lungs.'
          },
          {
            id: 'q_english_055',
            question: 'Choose the correct preposition: I work out ______ an hour every day.',
            options: [
              { key: 'A', value: 'for', explanation: '' },
              { key: 'B', value: 'since', explanation: '' },
              { key: 'C', value: 'during', explanation: '' },
              { key: 'D', value: 'while', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"For" is used to indicate duration.'
          },
          {
            id: 'q_english_056',
            question: 'The word "trainer" means:',
            options: [
              { key: 'A', value: 'a type of shoe', explanation: '' },
              { key: 'B', value: 'a person who teaches fitness', explanation: '' },
              { key: 'C', value: 'a type of food', explanation: '' },
              { key: 'D', value: 'a machine', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Trainer" is a person who helps people with fitness.'
          },
          {
            id: 'q_english_057',
            question: 'Choose the correct form: She ______ running for 30 minutes.',
            options: [
              { key: 'A', value: 'do', explanation: '' },
              { key: 'B', value: 'does', explanation: '' },
              { key: 'C', value: 'doing', explanation: '' },
              { key: 'D', value: 'did', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Third person singular present tense: "does".'
          },
          {
            id: 'q_english_058',
            question: 'What does "stretching" mean?',
            options: [
              { key: 'A', value: 'making muscles longer', explanation: '' },
              { key: 'B', value: 'making muscles shorter', explanation: '' },
              { key: 'C', value: 'making muscles stronger', explanation: '' },
              { key: 'D', value: 'making muscles weaker', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Stretching" is making muscles longer and more flexible.'
          },
          {
            id: 'q_english_059',
            question: 'Choose the correct word: I use a ______ to run on.',
            options: [
              { key: 'A', value: 'treadmill', explanation: '' },
              { key: 'B', value: 'dumbbell', explanation: '' },
              { key: 'C', value: 'barbell', explanation: '' },
              { key: 'D', value: 'bench', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Treadmill" is a machine for running or walking.'
          },
          {
            id: 'q_english_060',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'I am going to gym tomorrow.', explanation: '' },
              { key: 'B', value: 'I am going to the gym tomorrow.', explanation: '' },
              { key: 'C', value: 'I am going to a gym tomorrow.', explanation: '' },
              { key: 'D', value: 'I am going to gyms tomorrow.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'We use "the" before "gym" when referring to a specific place.'
          }
        ]
      },
      {
        levelNumber: 7,
        name: 'Unit 7 Art',
        description: '高一英语第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_061',
            question: 'Choose the correct word: Picasso was a famous ______.',
            options: [
              { key: 'A', value: 'artist', explanation: '' },
              { key: 'B', value: 'art', explanation: '' },
              { key: 'C', value: 'artistic', explanation: '' },
              { key: 'D', value: 'artistry', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Artist" is a person who creates art.'
          },
          {
            id: 'q_english_062',
            question: 'The word "exhibition" means:',
            options: [
              { key: 'A', value: 'a sale', explanation: '' },
              { key: 'B', value: 'a display of art', explanation: '' },
              { key: 'C', value: 'a concert', explanation: '' },
              { key: 'D', value: 'a party', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Exhibition" is a public display of art or artifacts.'
          },
          {
            id: 'q_english_063',
            question: 'Choose the correct form: She ______ beautiful paintings.',
            options: [
              { key: 'A', value: 'paint', explanation: '' },
              { key: 'B', value: 'paints', explanation: '' },
              { key: 'C', value: 'painting', explanation: '' },
              { key: 'D', value: 'painted', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Third person singular present tense: "paints".'
          },
          {
            id: 'q_english_064',
            question: 'What does "sculpture" mean?',
            options: [
              { key: 'A', value: 'a painting', explanation: '' },
              { key: 'B', value: 'a three-dimensional work of art', explanation: '' },
              { key: 'C', value: 'a song', explanation: '' },
              { key: 'D', value: 'a book', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Sculpture" is a three-dimensional work of art.'
          },
          {
            id: 'q_english_065',
            question: 'Choose the correct preposition: The painting is ______ the wall.',
            options: [
              { key: 'A', value: 'in', explanation: '' },
              { key: 'B', value: 'on', explanation: '' },
              { key: 'C', value: 'at', explanation: '' },
              { key: 'D', value: 'above', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'We use "on" for things attached to a wall.'
          },
          {
            id: 'q_english_066',
            question: 'The word "gallery" means:',
            options: [
              { key: 'A', value: 'a store', explanation: '' },
              { key: 'B', value: 'a place where art is shown', explanation: '' },
              { key: 'C', value: 'a school', explanation: '' },
              { key: 'D', value: 'a hospital', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Gallery" is a room or building for displaying art.'
          },
          {
            id: 'q_english_067',
            question: 'Choose the correct form: They ______ to the museum yesterday.',
            options: [
              { key: 'A', value: 'go', explanation: '' },
              { key: 'B', value: 'goes', explanation: '' },
              { key: 'C', value: 'went', explanation: '' },
              { key: 'D', value: 'going', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Past tense of "go" is "went".'
          },
          {
            id: 'q_english_068',
            question: 'What does "abstract" mean?',
            options: [
              { key: 'A', value: 'representing real objects', explanation: '' },
              { key: 'B', value: 'not representing real objects', explanation: '' },
              { key: 'C', value: 'very detailed', explanation: '' },
              { key: 'D', value: 'very simple', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Abstract" art does not represent real objects.'
          },
          {
            id: 'q_english_069',
            question: 'Choose the correct word: Van Gogh used ______ colors in his paintings.',
            options: [
              { key: 'A', value: 'bright', explanation: '' },
              { key: 'B', value: 'brightly', explanation: '' },
              { key: 'C', value: 'brighter', explanation: '' },
              { key: 'D', value: 'brightest', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Bright" is an adjective describing colors.'
          },
          {
            id: 'q_english_070',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'I am interesting in art.', explanation: '' },
              { key: 'B', value: 'I am interested in art.', explanation: '' },
              { key: 'C', value: 'I am interest in art.', explanation: '' },
              { key: 'D', value: 'I am interests in art.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'We use "interested" to describe how we feel.'
          }
        ]
      },
      {
        levelNumber: 8,
        name: 'Unit 8 Science',
        description: '高一英语第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_071',
            question: 'Choose the correct word: Einstein was a famous ______.',
            options: [
              { key: 'A', value: 'scientist', explanation: '' },
              { key: 'B', value: 'science', explanation: '' },
              { key: 'C', value: 'scientific', explanation: '' },
              { key: 'D', value: 'scientifical', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Scientist" is a person who does scientific research.'
          },
          {
            id: 'q_english_072',
            question: 'The word "experiment" means:',
            options: [
              { key: 'A', value: 'a test to discover something', explanation: '' },
              { key: 'B', value: 'a type of music', explanation: '' },
              { key: 'C', value: 'a type of food', explanation: '' },
              { key: 'D', value: 'a type of book', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Experiment" is a scientific test to discover something.'
          },
          {
            id: 'q_english_073',
            question: 'Choose the correct form: Scientists ______ new discoveries every day.',
            options: [
              { key: 'A', value: 'make', explanation: '' },
              { key: 'B', value: 'makes', explanation: '' },
              { key: 'C', value: 'making', explanation: '' },
              { key: 'D', value: 'made', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'Plural subject takes base form: "make".'
          },
          {
            id: 'q_english_074',
            question: 'What does "research" mean?',
            options: [
              { key: 'A', value: 'playing games', explanation: '' },
              { key: 'B', value: 'studying to discover new knowledge', explanation: '' },
              { key: 'C', value: 'watching TV', explanation: '' },
              { key: 'D', value: 'sleeping', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Research" is careful study to discover new knowledge.'
          },
          {
            id: 'q_english_075',
            question: 'Choose the correct preposition: The study is ______ climate change.',
            options: [
              { key: 'A', value: 'about', explanation: '' },
              { key: 'B', value: 'on', explanation: '' },
              { key: 'C', value: 'in', explanation: '' },
              { key: 'D', value: 'at', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"About" is used to indicate the subject.'
          },
          {
            id: 'q_english_076',
            question: 'The word "theory" means:',
            options: [
              { key: 'A', value: 'a proven fact', explanation: '' },
              { key: 'B', value: 'an explanation based on evidence' },
              { key: 'C', value: 'a guess', explanation: '' },
              { key: 'D', value: 'a question', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Theory" is an explanation based on evidence and reasoning.'
          },
          {
            id: 'q_english_077',
            question: 'Choose the correct form: The experiment ______ successful.',
            options: [
              { key: 'A', value: 'was', explanation: '' },
              { key: 'B', value: 'were', explanation: '' },
              { key: 'C', value: 'is', explanation: '' },
              { key: 'D', value: 'are', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'Singular past tense: "was".'
          },
          {
            id: 'q_english_078',
            question: 'What does "hypothesis" mean?',
            options: [
              { key: 'A', value: 'a final conclusion', explanation: '' },
              { key: 'B', value: 'an educated guess', explanation: '' },
              { key: 'C', value: 'a proven fact', explanation: '' },
              { key: 'D', value: 'a question', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Hypothesis" is an educated guess that can be tested.'
          },
          {
            id: 'q_english_079',
            question: 'Choose the correct word: The ______ of the experiment was surprising.',
            options: [
              { key: 'A', value: 'result', explanation: '' },
              { key: 'B', value: 'results', explanation: '' },
              { key: 'C', value: 'resulting', explanation: '' },
              { key: 'D', value: 'resulted', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Result" is singular here because it refers to one experiment.'
          },
          {
            id: 'q_english_080',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'Science explain how things work.', explanation: '' },
              { key: 'B', value: 'Science explains how things work.', explanation: '' },
              { key: 'C', value: 'Science explaining how things work.', explanation: '' },
              { key: 'D', value: 'Science explained how things work.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Singular subject takes "explains".'
          }
        ]
      },
      {
        levelNumber: 9,
        name: 'Unit 9 Technology',
        description: '高一英语第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_081',
            question: 'Choose the correct word: Technology has changed our ______ lives.',
            options: [
              { key: 'A', value: 'everyday', explanation: '' },
              { key: 'B', value: 'every day', explanation: '' },
              { key: 'C', value: 'everydays', explanation: '' },
              { key: 'D', value: 'everydays\'' }
            ],
            correctAnswer: 'A',
            explanation: '"Everyday" is an adjective meaning ordinary.'
          },
          {
            id: 'q_english_082',
            question: 'The word "digital" means:',
            options: [
              { key: 'A', value: 'using numbers', explanation: '' },
              { key: 'B', value: 'using letters', explanation: '' },
              { key: 'C', value: 'using pictures', explanation: '' },
              { key: 'D', value: 'using sounds', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Digital" means using digits (numbers) to represent data.'
          },
          {
            id: 'q_english_083',
            question: 'Choose the correct form: My phone ______ yesterday.',
            options: [
              { key: 'A', value: 'break', explanation: '' },
              { key: 'B', value: 'breaks', explanation: '' },
              { key: 'C', value: 'broke', explanation: '' },
              { key: 'D', value: 'broken', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Past tense of "break" is "broke".'
          },
          {
            id: 'q_english_084',
            question: 'What does "innovate" mean?',
            options: [
              { key: 'A', value: 'to copy', explanation: '' },
              { key: 'B', value: 'to create something new', explanation: '' },
              { key: 'C', value: 'to destroy', explanation: '' },
              { key: 'D', value: 'to repair', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Innovate" means to create or introduce something new.'
          },
          {
            id: 'q_english_085',
            question: 'Choose the correct preposition: I communicate ______ my friends online.',
            options: [
              { key: 'A', value: 'with', explanation: '' },
              { key: 'B', value: 'to', explanation: '' },
              { key: 'C', value: 'at', explanation: '' },
              { key: 'D', value: 'on', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Communicate with" is the correct collocation.'
          },
          {
            id: 'q_english_086',
            question: 'The word "access" means:',
            options: [
              { key: 'A', value: 'to deny', explanation: '' },
              { key: 'B', value: 'to get into or use', explanation: '' },
              { key: 'C', value: 'to hide', explanation: '' },
              { key: 'D', value: 'to forget', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Access" means to get into or use something.'
          },
          {
            id: 'q_english_087',
            question: 'Choose the correct form: The internet ______ us to connect with others.',
            options: [
              { key: 'A', value: 'allow', explanation: '' },
              { key: 'B', value: 'allows', explanation: '' },
              { key: 'C', value: 'allowing', explanation: '' },
              { key: 'D', value: 'allowed', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Singular subject takes "allows".'
          },
          {
            id: 'q_english_088',
            question: 'What does "automate" mean?',
            options: [
              { key: 'A', value: 'to do manually', explanation: '' },
              { key: 'B', value: 'to make automatic', explanation: '' },
              { key: 'C', value: 'to destroy', explanation: '' },
              { key: 'D', value: 'to build', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Automate" means to make a process automatic.'
          },
          {
            id: 'q_english_089',
            question: 'Choose the correct word: I use ______ to send messages.',
            options: [
              { key: 'A', value: 'technology', explanation: '' },
              { key: 'B', value: 'technologies', explanation: '' },
              { key: 'C', value: 'technological', explanation: '' },
              { key: 'D', value: 'technologically', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Technology" is uncountable here.'
          },
          {
            id: 'q_english_090',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'I spend too much time on phone.', explanation: '' },
              { key: 'B', value: 'I spend too much time on the phone.', explanation: '' },
              { key: 'C', value: 'I spend too much time on phones.', explanation: '' },
              { key: 'D', value: 'I spend too much time on a phone.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'We use "the" before "phone" when referring to a specific device.'
          }
        ]
      },
      {
        levelNumber: 10,
        name: 'Unit 10 Culture',
        description: '高一英语第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_english_091',
            question: 'Choose the correct word: Different countries have different ______.',
            options: [
              { key: 'A', value: 'cultures', explanation: '' },
              { key: 'B', value: 'culture', explanation: '' },
              { key: 'C', value: 'cultural', explanation: '' },
              { key: 'D', value: 'cultured', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Cultures" is plural because we are talking about different countries.'
          },
          {
            id: 'q_english_092',
            question: 'The word "tradition" means:',
            options: [
              { key: 'A', value: 'something new', explanation: '' },
              { key: 'B', value: 'something passed down', explanation: '' },
              { key: 'C', value: 'something forgotten', explanation: '' },
              { key: 'D', value: 'something invented', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Tradition" is something passed down from generation to generation.'
          },
          {
            id: 'q_english_093',
            question: 'Choose the correct form: People ______ traditions for many years.',
            options: [
              { key: 'A', value: 'keep', explanation: '' },
              { key: 'B', value: 'keeps', explanation: '' },
              { key: 'C', value: 'keeping', explanation: '' },
              { key: 'D', value: 'kept', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'Plural subject takes base form: "keep".'
          },
          {
            id: 'q_english_094',
            question: 'What does "custom" mean?',
            options: [
              { key: 'A', value: 'a habit or practice', explanation: '' },
              { key: 'B', value: 'a type of food', explanation: '' },
              { key: 'C', value: 'a type of clothing', explanation: '' },
              { key: 'D', value: 'a type of music', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Custom" is a traditional way of doing things.'
          },
          {
            id: 'q_english_095',
            question: 'Choose the correct preposition: I am interested ______ different cultures.',
            options: [
              { key: 'A', value: 'at', explanation: '' },
              { key: 'B', value: 'in', explanation: '' },
              { key: 'C', value: 'on', explanation: '' },
              { key: 'D', value: 'for', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Interested in" is the correct collocation.'
          },
          {
            id: 'q_english_096',
            question: 'The word "festival" means:',
            options: [
              { key: 'A', value: 'a day of work', explanation: '' },
              { key: 'B', value: 'a celebration', explanation: '' },
              { key: 'C', value: 'a day of rest', explanation: '' },
              { key: 'D', value: 'a type of food', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Festival" is a celebration or holiday.'
          },
          {
            id: 'q_english_097',
            question: 'Choose the correct form: We ______ the Spring Festival every year.',
            options: [
              { key: 'A', value: 'celebrate', explanation: '' },
              { key: 'B', value: 'celebrates', explanation: '' },
              { key: 'C', value: 'celebrating', explanation: '' },
              { key: 'D', value: 'celebrated', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'First person plural present tense: "celebrate".'
          },
          {
            id: 'q_english_098',
            question: 'What does "heritage" mean?',
            options: [
              { key: 'A', value: 'something new', explanation: '' },
              { key: 'B', value: 'something inherited from the past', explanation: '' },
              { key: 'C', value: 'something modern', explanation: '' },
              { key: 'D', value: 'something forgotten', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"Heritage" is something inherited from the past.'
          },
          {
            id: 'q_english_099',
            question: 'Choose the correct word: Respect for ______ is important.',
            options: [
              { key: 'A', value: 'elders', explanation: '' },
              { key: 'B', value: 'elder', explanation: '' },
              { key: 'C', value: 'elderly', explanation: '' },
              { key: 'D', value: 'old', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"Elders" means older people in a society.'
          },
          {
            id: 'q_english_100',
            question: 'Which is correct?',
            options: [
              { key: 'A', value: 'Each culture have its own traditions.', explanation: '' },
              { key: 'B', value: 'Each culture has its own traditions.', explanation: '' },
              { key: 'C', value: 'Each culture having its own traditions.', explanation: '' },
              { key: 'D', value: 'Each culture had its own traditions.', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'Singular subject "each culture" takes "has".'
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
