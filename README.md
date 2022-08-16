# Introduction

Hello world!
This is a small ora sdk challenge and so I decided to use javascript to write this.
This project has 3 folders with their respective functonalties:
    - ora-sdk: contains the source code of the ora sdk written in javascript.
    - ora-frontend: contains the source code of the ora frontend written in React and Typescript.
    - ora-api: contains the source code of the ora backend written in Node.js.

## Installation and usage

cd to the ora-sdk folder and run the following command:

    `npm install`
    
    since this is a small project it isn't published on npm

cd  to the ora-api folder and run the following command:
    
    `npm install`
    
    `npm link ../ora-sdk` - to install the sdk package locally

    **NOTE**: Ensure you have valid credentials in files with names `certficate.pem` and `client.json` in the root of the ORASDKCHALLENGE folder.

    `npm start` - to start the server

    You don't need to run the frontend code as the server was written to handle both monolith and decoupled states.

    visit http://localhost:8080/ to see the result.

cd to the ora-frontend folder and run the following command:
    
    `npm install`
    
    Ensure the ora-api server is running and change the REDIRECT_BASE constant to `http://localhost:3000`
    
    `npm start` - to start the frontend
    
    visit http://localhost:3000/ to see the result.