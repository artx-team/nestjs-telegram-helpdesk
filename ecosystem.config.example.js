module.exports = {
  apps: [
    {
      name: 'telegram-helpdesk',
      script: './dist/main.js',
      exp_backoff_restart_delay: 500,
      watch: false,
    },
  ],
};
