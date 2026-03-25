const fs = require('fs');

let raw = fs.readFileSync('tutuonghcmc1,2.json', 'utf8');
raw = raw.replace(/^\uFEFF/, '');
const data = JSON.parse(raw);

console.log('Loaded:', data.length, 'questions');

const keys = ['a', 'b', 'c', 'd'];
const converted = data.map(item => {
  const chooseObj = {};
  item.choose.forEach((val, i) => { chooseObj[keys[i]] = val; });
  const ansIdx = item.choose.indexOf(item.anss);
  const ans = ansIdx >= 0 ? keys[ansIdx] : 'a';
  return { question: item.quest, choose: chooseObj, ans: ans };
});

fs.writeFileSync('tutuonghcmc12.json', JSON.stringify(converted, null, 2), 'utf8');
console.log('Written tutuonghcmc12.json with', converted.length, 'questions');

// Verify
converted.slice(0, 3).forEach((q, i) => {
  console.log(`Q${i+1}: ans=${q.ans}, text="${q.choose[q.ans]}"`);
});
