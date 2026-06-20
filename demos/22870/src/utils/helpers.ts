// 格式化距离
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// 格式化价格
export function formatPrice(price: number, unit: string): string {
  return `¥${price}/${unit}`;
}

// 格式化日期
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`;
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

// 格式化服务时间
export function formatServiceTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`;
}

// 生成星级评分
export function renderStars(rating: number): { filled: number; half: boolean } {
  const filled = Math.floor(rating);
  const half = rating - filled >= 0.5;
  return { filled, half };
}

// 计算平均评分
export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}