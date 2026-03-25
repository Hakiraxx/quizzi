const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tutuonghcmv2.json', 'utf8'));

const converted = data.map(item => {
  const chooseObj = {};
  item.choose.forEach((val, i) => {
    const key = ['a', 'b', 'c', 'd'][i];
    // Strip "A: ", "B: ", etc. prefix
    chooseObj[key] = val.replace(/^[A-D]:\s*/, '');
  });
  const ans = item.ans.toLowerCase();
  return { question: item.question, choose: chooseObj, ans: ans };
});

fs.writeFileSync('tutuonghcmv2.json', JSON.stringify(converted, null, 2), 'utf8');
console.log('Converted', converted.length, 'questions');
converted.slice(0, 3).forEach((q, i) => console.log(`Q${i+1}: ans=${q.ans} -> "${q.choose[q.ans]}"`));
