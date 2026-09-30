const fs = require('fs');
const path = require('path');

const dir = './controllers';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file === 'dashboardController.js' || file === 'performanceController.js' || file === 'employeeController.js') return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace save
  content = content.replace(/const saved\w+ = await \w+\.save\(\);\n\s+res\.status\(201\)\.json/g, (match) => {
    return match.replace('res.status(201).json', `if (req.io) req.io.emit('dataChanged', { action: 'refresh' });\n    res.status(201).json`);
  });

  // Replace update
  content = content.replace(/const updated\w+ = await \w+\.save\(\);\n\s+res\.json/g, (match) => {
    return match.replace('res.json', `if (req.io) req.io.emit('dataChanged', { action: 'refresh' });\n    res.json`);
  });

  // Replace delete
  content = content.replace(/res\.json\(\{ message: '[^']+' \}\);/g, (match) => {
    return `if (req.io) req.io.emit('dataChanged', { action: 'refresh' });\n    ${match}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Controllers updated');
