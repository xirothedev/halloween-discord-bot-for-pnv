export default {
    apps: [
        {
            name: "tsm payment supporter",
            script: "./src/index.ts",
            exec_mode: "cluster",
            max_memory_restart: "2G",
            autorestart: false,
        },
    ],
};
