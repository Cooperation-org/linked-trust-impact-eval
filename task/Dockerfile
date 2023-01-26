FROM node:16.13-buster

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN ["npm", "install"]

COPY ./.next ./.next
COPY ./components ./components
COPY ./public ./public
COPY ./pages ./pages
COPY ./public ./public
COPY ./styles ./styles
COPY ./next.config.js ./next.config.js
COPY ./compose ./compose
COPY ./__generated__ ./__generated__

RUN ["npm", "run", "build"]