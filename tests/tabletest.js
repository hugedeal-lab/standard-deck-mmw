// Tables: the preview and the export read every table shape agents write, and
// an unreadable table is skipped instead of failing the whole download.
// Regression for a 2026-10 test deck whose export died with PptxGenJS's
// "addTable: Array expected!" -- the agent wrote a tbl in an undocumented shape.
global.window = {}; global.document = { createElement: () => ({ style:{} }), addEventListener(){} };
console.warn = () => {};
require('../standard-deck.js');
const SD = global.window.StandardDeck;
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.log('FAIL  ' + msg); } else console.log('ok    ' + msg); }
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

let t = SD.tableRows({ headers:['A','B'], rows:[['1','2'],['3','4']] });
check(eq(t, { headers:['A','B'], rows:[['1','2'],['3','4']] }), 'documented shape: headers + rows of arrays');
t = SD.tableRows({ data:[['A','B'],['1','2']] });
check(eq(t.rows, [['A','B'],['1','2']]) && !t.headers.length, 'data: 2D array -> rows');
t = SD.tableRows({ columns:[{key:'m',label:'Market'},{key:'s',label:'Spend'}], rows:[{m:'LA',s:'$1M'}] });
check(eq(t, { headers:['Market','Spend'], rows:[['LA','$1M']] }), 'columns objects + rows keyed by column key');
t = SD.tableRows({ headers:['A','B'], rows:[{A:'x',B:'y'}] });
check(eq(t.rows, [['x','y']]), 'rows keyed by header text');
t = SD.tableRows({ headers:['A'], rows:[[{text:'x'}], {cells:['y']}, [3, null]] });
check(eq(t.rows, [['x'],['y'],['3','']]), 'cell objects, {cells}, numbers and nulls');
t = SD.tableRows({ table:{ head:['A'] } });
check(!t.headers.length && !t.rows.length, 'unreadable shape -> empty (export skips it)');

// The exporter guards the empty case and isolates element failures.
const shell = require('fs').readFileSync(require('path').join(__dirname, '..', 'deck-shell.js'), 'utf8');
check(/if \(!tr\.length\)[^\n]*_exportSkipped\.push/.test(shell), 'exportTable skips an empty table instead of calling addTable');
check(/try \{ fn\(slide, el, isDark, accent, pptx\); \}\s*catch/.test(shell), 'exportElement isolates a failing element');

console.log('\n' + (fail ? fail + ' FAILED' : 'all table checks passed'));
process.exit(fail ? 1 : 0);
