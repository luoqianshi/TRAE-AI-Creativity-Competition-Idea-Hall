(function () {
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      securityLevel: "loose",
      flowchart: {
        curve: "basis",
        nodeSpacing: 42,
        rankSpacing: 56
      }
    });
  }
})();
