// PM2 Ecosystem — Bizu! Portal Frontend
module.exports = {
    apps: [
        {
            name: "bizu-frontend",
            script: "node_modules/.bin/next",
            args: "start",
            cwd: "/root/bizu-portal/bizu-frontend",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                PORT: 14900,
                NEXT_PUBLIC_API_URL: "https://bizu.mjolnix.com.br/api/v1",
            },
        },
    ],
};
