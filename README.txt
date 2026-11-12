ONLINE MOCK LOGIN DEMO

This is a clearly labelled practice login page. It is not for real accounts and must not be used to collect real credentials.

Deploy on Render:
1. In your GitHub repository, replace the old server.js and package.json with the ones in this folder.
2. Create a folder named public and upload index.html into it.
3. Commit all changes to the main branch.
4. In Render, choose Manual Deploy > Deploy latest commit.
5. Open your existing Render URL. The login page will appear.
6. Sample demo credentials:
   Username: demo
   Password: welcome123

Health check: /health

Render settings:
Build command: npm install
Start command: npm start

No database is used. The demo checks a fixed sample username/password and does not save submitted values.
