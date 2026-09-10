# --- build stage --------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Install only production deps in a separate folder, copied into the
# runtime stage below so dev dependencies never ship in the final image.
RUN mkdir /prod && cp package.json package-lock.json /prod/ \
	&& npm ci --omit=dev --prefix /prod

# --- runtime stage --------------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
	PORT=3000 \
	HOST=0.0.0.0

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /prod/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

CMD ["node", "build"]
