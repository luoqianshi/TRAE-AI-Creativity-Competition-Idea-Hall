const BOOK_FILES = {
  bec: 'WORDBOOK_bec',
  cet4: 'WORDBOOK_cet4',
  cet6: 'WORDBOOK_cet6',
  chengren: 'WORDBOOK_chengren',
};

async function fetchWordBook(bookId) {
  try {
    const varName = BOOK_FILES[bookId];
    if (!varName) return [];
    const data = window[varName];
    if (!data) {
      console.warn('Word book not loaded:', bookId);
      return [];
    }
    return parseLocalData(data);
  } catch (error) {
    console.warn('Failed to load word book:', error);
    return [];
  }
}

function parseLocalData(data) {
  if (!data || !data.nodes) return [];
  const words = data.nodes.filter(n => n.nodeType === 'word');
  const edges = data.edges || [];

  const relatedMap = {};
  const relatedTypes = ['same_root', 'synonym', 'form_similar', 'derives_from'];

  edges.forEach(edge => {
    if (!relatedTypes.includes(edge.edgeType)) return;
    const source = edge.source;
    const target = edge.target;
    if (!relatedMap[source]) relatedMap[source] = [];
    if (!relatedMap[target]) relatedMap[target] = [];
    relatedMap[source].push(target);
    relatedMap[target].push(source);
  });

  const wordMap = {};
  words.forEach(w => { wordMap[w.id] = w; });

  return words.map(node => {
    const firstScene = node.properties?.scenes?.[0];
    const relatedIds = relatedMap[node.id] || [];
    const related = relatedIds
      .map(id => wordMap[id]?.name)
      .filter(name => name && name !== node.name)
      .slice(0, 6);

    return {
      word: node.name,
      phonetic: node.phonetic || '',
      translation: node.meaning || '',
      example: firstScene ? `${firstScene.sentence}\n${firstScene.translation}` : '',
      related: related
    };
  });
}
