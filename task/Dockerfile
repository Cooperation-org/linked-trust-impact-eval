FROM node:16.13-buster

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN ["npm", "install"]

COPY ./.next ./.next
COPY ./public ./public
COPY ./pages ./pages
COPY ./styles ./styles
COPY ./next.config.js ./next.config.js

RUN ["npm", "run", "build"]