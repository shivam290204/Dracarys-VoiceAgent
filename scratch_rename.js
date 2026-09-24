const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('e:/Dracarys/dograh/ui/src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace "Dograh" inside JSX text nodes
  // We use a callback to replace all occurrences within the text node
  content = content.replace(/>([^<]+)</g, (match, textNode) => {
    return '>' + textNode.replace(/\bDograh's\b/g, "Dracarys's").replace(/\bDograh\b/g, 'Dracarys') + '<';
  });

  // Replace Exact Strings
  content = content.replace(/"Dograh"/g, '"Dracarys"');
  content = content.replace(/"Dograh /g, '"Dracarys ');
  content = content.replace(/ Dograh"/g, ' Dracarys"');
  content = content.replace(/'Dograh'/g, "'Dracarys'");
  content = content.replace(/'Dograh /g, "'Dracarys ");
  content = content.replace(/ Dograh'/g, " Dracarys'");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log("Updated: " + file);
  }
});

console.log("Total files updated: " + count);
