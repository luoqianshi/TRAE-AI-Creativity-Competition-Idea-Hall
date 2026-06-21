const APP_PREFIX = 'app_';

export function getItem(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(APP_PREFIX + key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(APP_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(APP_PREFIX + key);
    return true;
  } catch {
    return false;
  }
}

export function getAllKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(APP_PREFIX)) {
      keys.push(key.slice(APP_PREFIX.length));
    }
  }
  return keys;
}
