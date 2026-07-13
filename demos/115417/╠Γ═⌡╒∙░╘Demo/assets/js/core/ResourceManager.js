class ResourceManager {
  constructor() {
    this.cache = {};
  }

  loadCSS(url) {
    return new Promise((resolve, reject) => {
      if (this.cache[url]) {
        resolve(this.cache[url]);
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        this.cache[url] = link;
        resolve(link);
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  loadJS(url) {
    return new Promise((resolve, reject) => {
      if (this.cache[url]) {
        resolve(this.cache[url]);
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onload = () => {
        this.cache[url] = script;
        resolve(script);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      if (this.cache[url]) {
        resolve(this.cache[url]);
        return;
      }
      const img = new Image();
      img.onload = () => {
        this.cache[url] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async preloadResources(resources) {
    const promises = resources.map(resource => {
      switch (resource.type) {
        case 'css':
          return this.loadCSS(resource.url);
        case 'js':
          return this.loadJS(resource.url);
        case 'image':
          return this.loadImage(resource.url);
        default:
          return Promise.resolve();
      }
    });
    await Promise.all(promises);
  }
}
