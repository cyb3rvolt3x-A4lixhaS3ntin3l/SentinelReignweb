module.exports = {
  apps: [
    {
      name: "sentinel-backend",
      cwd: "./backend",
      script: "../venv/bin/uvicorn",
      args: "main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "sentinel-frontend",
      cwd: "./v3-frontend",
      script: "npm",
      args: "start -- -p 3001",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "sentinel-celery",
      cwd: "./backend",
      script: "../venv/bin/celery",
      args: "-A core.queue worker --loglevel=info",
      interpreter: "none",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
