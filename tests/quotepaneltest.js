// reportQuotePanel: named insights[] cards, the old flat items[] mapping, and
// no empty boxes when there are fewer than four insights.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 }, PALETTE: {} } };
const W = []; console.warn = (m) => W.push(String(m)); console.error = () => {};
require('../deck-layouts.js');
const DL = global.window.DeckLayouts;
let fail = 0;
function check(c, m) { if (!c) { fail++; console.log('FAIL  ' + m); } else console.log('ok    ' + m); }
const txt = (els) => els.filter((e) => e.type === 't').map((e) => e.text);
const at = (els, s) => els.find((e) => e.type === 't' && e.text === s);
let els = DL.dispatch({ layout:'reportQuotePanel', title:'What we learned', insights:[
  { headline:'H1', body:'B1' }, { label:'DEALER · DALLAS', headline:'H2', body:'B2' }, 'H3', { headline:'H4', body:'B4' }] });
check(at(els, 'INSIGHT · #1') && at(els, 'H1').x === 1 && at(els, 'H1').y === 4.16, 'card 1 top-left with default label');
check(at(els, 'DEALER · DALLAS') && at(els, 'H2').x === 6.6, 'card 2 top-right keeps a custom label');
check(at(els, 'H3') && at(els, 'H3').y === 5.81 && at(els, 'H3').x === 1, 'a string insight is the headline of card 3');
check(at(els, 'B4') && at(els, 'B4').x === 6.6 && at(els, 'B4').y === 6.21, 'card 4 body bottom-right');
check(!W.some((w) => /insights/.test(w)), 'insights is a declared field (no unused-key warning)');
els = DL.dispatch({ layout:'reportQuotePanel', title:'T', insights:[{ headline:'A' }, { headline:'B' }, { headline:'C' }] });
check(els.filter((e) => e.type === 's' && e.fill === 'white').length === 3, 'three insights draw three cards, no empty fourth box');
els = DL.dispatch({ layout:'reportQuotePanel', title:'T', tag:'E1', subhead:'H1', items:['E2','H2','B1','B2','E3','E4','H3','H4','B3','B4'] });
check(at(els, 'B1').x === 1 && at(els, 'B1').y === 4.57 && at(els, 'E4').x === 6.6 && at(els, 'E4').y === 5.51 && at(els, 'H3').y === 5.81,
  'old flat items[] still map to the same cards');
check(els.filter((e) => e.type === 's' && e.fill === 'white').length === 4, 'old form keeps all four cards');
console.log('\n' + (fail ? fail + ' FAILED' : 'all quote panel checks passed'));
process.exit(fail ? 1 : 0);
