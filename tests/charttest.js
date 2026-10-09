// Chart colours: opts.colors and opts.highlight on every chart type, with the
// template palette untouched when neither is set.
global.window = { StandardDeck: { SD_CONST: { SLIDE_W:13.33, SLIDE_H:7.5, SAFE_X_MIN:0.5, SAFE_Y_MIN:0.75 },
  PALETTE: { paper:'#EEEEEE', asphalt:'#262626', lt2:'#D5D5D5' } } };
const warnings = [];
global.console = Object.assign(Object.create(console), { warn: (m) => warnings.push(String(m)), error: () => {} });
require('../deck-layouts.js');
const DL = global.window.DeckLayouts;
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.log('FAIL  ' + msg); } else console.log('ok    ' + msg); }
const one = [{ name:'Spend', labels:['Q1','Q2','Q3','Q4'], values:[42,58,35,64] }];
const two = [{ name:'Mazda', labels:['Q1','Q2','Q3'], values:[4,5,6] }, { name:'Segment', labels:['Q1','Q2','Q3'], values:[3,4,5] }];
function chart(layout, type, data, opts) { return DL.dispatch({ layout, chart:{ type, data, opts } }); }
// bars/columns: the plot fills, in drawing order (bars are pills, columns squares; legend swatches have radius 0.03)
const fills = (els) => els.filter((e) => e.type === 's' && e.fill && e.radius !== 0.03 && e.h > 0.05 && e.y > 2).map((e) => e.fill);
const native = (els) => els.find((e) => e.type === 'chart').opts.chartColors;

check(fills(chart('reportGrayChart', 'column', one)).every((c) => c === '#262626'), 'column, one series, no options: template ink');
check(fills(chart('reportDarkChart', 'column', one)).every((c) => c === '#EEEEEE'), 'dark column default: paper ink');
check(fills(chart('reportGrayChart', 'column', one, { colors:['canopy'] })).every((c) => c === '#4A634D'), "colors:['canopy'] -> every column canopy");
check(fills(chart('reportGrayChart', 'bar', one, { colors:['tide', 'tide-light'] })).join() === '#416986,#7CA8C1,#416986,#7CA8C1', 'bar, one series, two colours cycle per category');
check(fills(chart('reportGrayChart', 'column', two, { colors:['aurora', 'aurora-light'] })).join() === '#6D649F,#AFAFC1,#6D649F,#AFAFC1,#6D649F,#AFAFC1', 'two series take one colour each');
let f = fills(chart('reportGrayChart', 'column', one, { highlight:'Q4' }));
check(f[3] === '#BFA588' && f.slice(0, 3).every((c) => c === '#C8C8C8'), "highlight:'Q4' -> Q4 Spark, rest light grey");
f = fills(chart('reportDarkChart', 'bar', one, { highlight:1, colors:['tide-light'] }));
check(f[1] === '#7CA8C1' && f[0] === '#5C5C5C', 'highlight by index uses colors[0]; dark grey on dark slides');
f = fills(chart('reportGrayChart', 'column', two, { highlight:'Mazda' }));
check(f.join() === '#BFA588,#C8C8C8,#BFA588,#C8C8C8,#BFA588,#C8C8C8', 'highlight a series name -> that series Spark');
check(native(chart('reportGrayChart', 'line', two, { colors:['canopy', 'gray'] })).join() === '#4A634D,#808080', 'line takes one colour per series');
const dn = native(chart('reportGrayChart', 'doughnut', one, { highlight:'Q2' }));
check(dn[1] === '#BFA588' && dn[0] !== dn[2] && !dn.includes('#BFA588', 2), 'doughnut highlight: one Spark slice, distinct greys');
check(native(chart('reportGrayChart', 'doughnut', one)).join() === '#7CA8C1,#C4A485,#AFAFC1,#4A634D,#6D649F,#262626', 'doughnut default unchanged');
check(!native(chart('reportGrayChart', 'pie', one)), 'pie default: engine ramp (no override)');
warnings.length = 0;
f = fills(chart('reportGrayChart', 'column', one, { colors:['chartreuse'] }));
check(f.every((c) => c === '#262626') && warnings.some((w) => /not a brand colour/.test(w)), 'unknown colour -> template palette + warning');
warnings.length = 0;
chart('reportDarkChart', 'column', one, { colors:['tide-dark'] });
check(warnings.some((w) => /disappears on a dark slide/.test(w)), '-dark shade on a dark slide warns');
check(fills(chart('reportGrayChart', 'column', one, { colors:['Green'] })).every((c) => c === '#4A634D'), "plain-English 'Green' -> canopy");

console.log('\n' + (fail ? fail + ' FAILED' : 'all chart colour checks passed'));
process.exit(fail ? 1 : 0);
