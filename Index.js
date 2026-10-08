const express = require("express");
const app = express();

// Home route - All Story FM Loading Page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>All Story FM - Loading...</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ffffff;
          overflow: hidden;
        }
        .loading-container {
          text-align: center;
          padding: 20px;
        }
        .logo-box {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 20px auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 0, 128, 0.4);
          animation: pulse 1.8s infinite ease-in-out;
        }
        .icon {
          font-size: 50px;
          z-index: 2;
        }
        h1 {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 2px;
          background: linear-gradient(45deg, #ff007f, #7928ca);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        p {
          font-size: 0.95rem;
          color: #a0a0c0;
          margin-bottom: 25px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid #ff007f;
          border-radius: 50%;
          margin: 0 auto;
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="loading-container">
        <div class="logo-box">
          <div class="pulse-ring"></div>
          <div class="icon">🎧</div>
        </div>
        <h1>ALL STORY FM</h1>
        <p>Aapki manpasand kahaniyan load ho rahi hain...</p>
        <div class="spinner"></div>
      </div>
    </body>
    </html>
  `);
});

// Vercel Serverless Export
module.exports = app;
