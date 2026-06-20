const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('[FATAL] JWT_SECRET 环境变量未设置，服务器拒绝启动。请在 .env 文件中配置 JWT_SECRET。');
}

export const JWT_CONFIG = {
  SECRET: JWT_SECRET,
  EXPIRES_IN_SECONDS: 24 * 60 * 60,
};
