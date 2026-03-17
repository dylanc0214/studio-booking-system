module.exports = {
    apps: [
        {
            name: 'underrated-api',
            script: 'node_modules/.bin/tsx',
            args: 'server/index.ts',
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            }
        }
    ]
};
