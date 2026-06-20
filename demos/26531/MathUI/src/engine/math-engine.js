const MathEngine = (() => {
  const QuestionType = {
    CALCULATION: 'calculation',
    CONCEPT: 'concept',
    COMPARISON: 'comparison',
    DECOMPOSITION: 'decomposition',
    VERTICAL: 'vertical',
    INLINE: 'inline'
  };

  function parseInlineExpr(expr) {
    try {
      const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
      return