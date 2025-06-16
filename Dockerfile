FROM node:16-bullseye-slim as base

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --production=false --legacy-peer-deps

# Setup production node_modules
FROM base as production-deps

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./

# Build the app
FROM base as build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD prisma .
RUN npx prisma generate
ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV production
ENV DATABASE_URL="sqlserver://3.121.250.121:1433;database=DeltaGlobal;user=stms-develop;password=QW3zP3fNERO0ttQ6GKt7;encrypt=true;trustServerCertificate=true;"
ENV SESSION_SECRET="ad642becbacf5978b832de487bb6b030"
RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

CMD ["npm", "run", "start"]
