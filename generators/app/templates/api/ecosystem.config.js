'use strict';

require('dotenv').config();

module.exports = {
  apps: [
    {
      name: '<%= appName %>',
      script: './bin/server.js',
      instances: process.env.WEB_CONCURRENCY || 1,
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        DEV: '<%= appName %>:server',
      },
      env_production: {
        NODE_ENV: 'production',
        DEV: '<%= appName %>:server',
      },
    },
  ],
};
