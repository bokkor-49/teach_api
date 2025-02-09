const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

const dbFile = 'database.json';
const logFile = 'log.json';

if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ teaches: {} }, null, 2));
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, JSON.stringify([], null, 2));

const loadDatabase = () => JSON.parse(fs.readFileSync(dbFile));
const saveDatabase = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
const loadLogs = () => JSON.parse(fs.readFileSync(logFile));
const saveLogs = (data) => fs.writeFileSync(logFile, JSON.stringify(data, null, 2));

app.get('/teach', (req, res) => {
  try {
    const { text, remove, list, edit, teach, reply, senderID, replace } = req.query;
    let db = loadDatabase();
    let logs = loadLogs();
    
    if (teach && reply) {
      if (!db.teaches[teach]) db.teaches[teach] = [];
      db.teaches[teach].push(reply);
      logs.push({ action: 'teach', teach, reply, senderID, timestamp: new Date().toISOString() });
      saveDatabase(db);
      saveLogs(logs);
      return res.json({ 
        message: `✅ '${teach}' has been added!`, 
        teaches: db.teaches[teach],
        author: "Bokkor",
        status: "success"
      });
    }
    
    if (remove) {
      if (db.teaches[remove]) {
        delete db.teaches[remove];
        logs.push({ action: 'remove', remove, senderID, timestamp: new Date().toISOString() });
        saveDatabase(db);
        saveLogs(logs);
        return res.json({ 
          message: `❌ '${remove}' has been deleted!`,
          author: "Bokkor",
          status: "success"
        });
      }
      return res.json({ 
        message: `❌ '${remove}' not found!`,
        author: "Bokkor",
        status: "success"
      });
    }
    
    if (list) {
      return res.json({ 
        teaches: db.teaches,
        author: "Bokkor",
        status: "success"
      });
    }
    
    if (edit && replace) {
      if (db.teaches[edit]) {
        db.teaches[edit] = [replace];
        logs.push({ action: 'edit', edit, replace, senderID, timestamp: new Date().toISOString() });
        saveDatabase(db);
        saveLogs(logs);
        return res.json({ 
          message: `✏️ '${edit}' has been updated!`, 
          teaches: db.teaches[edit],
          author: "Bokkor",
          status: "success"
        });
      }
      return res.json({ 
        message: `❌ '${edit}' not found!`,
        author: "Bokkor",
        status: "success"
      });
    }
    
    if (text) {
      if (db.teaches[text]) {
        return res.json({ 
          reply: db.teaches[text][Math.floor(Math.random() * db.teaches[text].length)], 
          author: "Bokkor",
          status: "success"
        });
      }
      return res.json({ 
        reply: `I didn't understand!`, 
        author: "Bokkor",
        status: "success"
      });
    }
    
    res.json({ 
      message: '⚡ Use: teach, remove, list, edit, or text!', 
      author: "Bokkor",
      status: "success"
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      author: "Bokkor",
      status: "failed"
    });
  }
});

app.listen(port, () => {
  console.log(`Teach API is running on http://localhost:${port}`);
});
