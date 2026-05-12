FROM node:22-alpine

WORKDIR /app

COPY NemoClaw-agritwin-dairy-agentic-ai-platform-shared /shared
COPY backend/package*.json ./

RUN node - <<'NODE'
const fs = require('fs');
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  if (!pkg[section]) continue;
  for (const [name, value] of Object.entries(pkg[section])) {
    if (typeof value === 'string' && value.startsWith('workspace:')) {
      pkg[section][name] = 'file:/shared';
    }
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
NODE

RUN npm install --omit=dev --no-audit --no-fund

COPY backend/ .

ENV NODE_ENV=production
ENV PORT=3000
ENV SERVICE_NAME=agritwin-dairy-backend

EXPOSE 3000

CMD ["node", "runtime-server.mjs"]
