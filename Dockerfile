FROM node

WORKDIR /app

CMD ["serve", "-s", "build"]

RUN npm install -g serve

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build
