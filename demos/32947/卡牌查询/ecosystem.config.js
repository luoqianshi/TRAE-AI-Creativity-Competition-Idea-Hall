module.exports = {
  apps: [{
    name: 'card-grading',
    script: 'server.js',
    cwd: '/var/www/card-grading',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: '/var/log/card-grading/err.log',
    out_file:   '/var/log/card-grading/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true
  }]
};
