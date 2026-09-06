const state = {
  data: [],
  columns: [],
  numericColumns: [],
  categoricalColumns: [],
  mode: 'distribution',
  orientation: 'upright',
  scatterAxis: 'x',
  distributionVariable: 'market_value',
  scatterA: 'market_value',
  scatterB: 'goals'
};

const svg = d3.select('#chart');
const chartWrap = document.querySelector('#chart-wrap');
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none');

function numericValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(number) ? number : null;
}

function inferColumns(rows) {
  const columns = rows.columns || Object.keys(rows[0] || {});
  const numeric = columns.filter(column => {
    const values = rows.map(row => numericValue(row[column])).filter(value => value !== null);
    return values.length >= Math.max(3, rows.length * 0.7);
  });
  state.columns = columns;
  state.numericColumns = numeric;
  state.categoricalColumns = columns.filter(column => !numeric.includes(column));
}

function labelFor(column) {
  return column.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function fillSelect(selector, columns, selected) {
  const select = d3.select(selector);
  select.selectAll('option').remove();
  select.selectAll('option').data(columns).join('option').attr('value', value => value).text(labelFor).property('selected', value => value === selected);
}

function updateSelectors() {
  fillSelect('#distribution-variable', state.columns, state.distributionVariable);
  fillSelect('#scatter-variable-a', state.columns, state.scatterA);
  fillSelect('#scatter-variable-b', state.columns, state.scatterB);
}

function dimensions() {
  const width = chartWrap.clientWidth || 760;
  const height = chartWrap.clientWidth < 600 ? 430 : 550;
  return { width, height, margin: { top: 42, right: 30, bottom: 72, left: 76 } };
}

function startChart(title, xLabel, yLabel) {
  const { width, height, margin } = dimensions();
  svg.attr('viewBox', `0 0 ${width} ${height}`).selectAll('*').remove();
  svg.append('text').attr('class', 'chart-title-svg').attr('x', margin.left).attr('y', 21).text(title);
  return { width, height, margin, innerWidth: width - margin.left - margin.right, innerHeight: height - margin.top - margin.bottom, xLabel, yLabel };
}

function addAxisLabels(chart, xLabel, yLabel) {
  chart.svg.append('text').attr('class', 'axis-label').attr('x', chart.margin.left + chart.innerWidth / 2).attr('y', chart.height - 13).attr('text-anchor', 'middle').text(xLabel);
  chart.svg.append('text').attr('class', 'axis-label').attr('transform', `translate(16 ${chart.margin.top + chart.innerHeight / 2}) rotate(-90)`).attr('text-anchor', 'middle').text(yLabel);
}

function renderBarChart(variable) {
  const counts = Array.from(d3.rollup(state.data, values => values.length, row => row[variable]), ([key, count]) => ({ key: key || 'Unknown', count })).sort((a, b) => d3.descending(a.count, b.count));
  const chart = startChart(`${labelFor(variable)} by player records`, state.orientation === 'upright' ? labelFor(variable) : 'Player records', state.orientation === 'upright' ? 'Player records' : labelFor(variable));
  chart.svg = svg.append('g');
  const x = state.orientation === 'upright' ? d3.scaleBand().domain(counts.map(d => d.key)).range([chart.margin.left, chart.margin.left + chart.innerWidth]).padding(0.18) : d3.scaleLinear().domain([0, d3.max(counts, d => d.count) || 1]).nice().range([chart.margin.left, chart.margin.left + chart.innerWidth]);
  const y = state.orientation === 'upright' ? d3.scaleLinear().domain([0, d3.max(counts, d => d.count) || 1]).nice().range([chart.margin.top + chart.innerHeight, chart.margin.top]) : d3.scaleBand().domain(counts.map(d => d.key)).range([chart.margin.top, chart.margin.top + chart.innerHeight]).padding(0.18);
  const xAxis = state.orientation === 'upright' ? d3.axisBottom(x).tickSizeOuter(0) : d3.axisBottom(x).ticks(5);
  const yAxis = state.orientation === 'upright' ? d3.axisLeft(y).ticks(5) : d3.axisLeft(y).tickSizeOuter(0);
  chart.svg.append('g').attr('class', 'grid').attr('transform', `translate(0 ${chart.margin.top + chart.innerHeight})`).call(d3.axisBottom(x).tickSize(-chart.innerHeight).tickFormat(''));
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(0 ${chart.margin.top + chart.innerHeight})`).call(xAxis);
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(${chart.margin.left} 0)`).call(yAxis);
  chart.svg.selectAll('.bar').data(counts).join('rect').attr('class', 'bar').attr('x', d => state.orientation === 'upright' ? x(d.key) : x(0)).attr('y', d => state.orientation === 'upright' ? y(d.count) : y(d.key)).attr('width', d => state.orientation === 'upright' ? x.bandwidth() : x(d.count) - x(0)).attr('height', d => state.orientation === 'upright' ? y(0) - y(d.count) : y.bandwidth()).on('mousemove', (event, d) => showTooltip(event, `<strong>${d.key}</strong><br>${d.count} player records`)).on('mouseleave', hideTooltip);
  addAxisLabels(chart, chart.xLabel, chart.yLabel);
}

function renderHistogram(variable) {
  const values = state.data.map(row => numericValue(row[variable])).filter(value => value !== null);
  if (!values.length) return showEmpty();
  const extent = d3.extent(values);
  const bins = d3.bin().domain(extent).thresholds(12)(values);
  if (extent[0] === extent[1]) bins[0].x1 = extent[1] + 1;
  const chart = startChart(`${labelFor(variable)} distribution`, state.orientation === 'upright' ? labelFor(variable) : 'Player records', state.orientation === 'upright' ? 'Player records' : labelFor(variable));
  chart.svg = svg.append('g');
  const maxCount = d3.max(bins, d => d.length) || 1;
  const x = state.orientation === 'upright' ? d3.scaleLinear().domain([bins[0].x0, bins.at(-1).x1]).nice().range([chart.margin.left, chart.margin.left + chart.innerWidth]) : d3.scaleLinear().domain([0, maxCount]).nice().range([chart.margin.left, chart.margin.left + chart.innerWidth]);
  const y = state.orientation === 'upright' ? d3.scaleLinear().domain([0, maxCount]).nice().range([chart.margin.top + chart.innerHeight, chart.margin.top]) : d3.scaleBand().domain(bins.map(d => d.x0)).range([chart.margin.top, chart.margin.top + chart.innerHeight]).padding(0.12);
  const xAxis = state.orientation === 'upright' ? d3.axisBottom(x).ticks(6) : d3.axisBottom(x).ticks(5);
  const yAxis = state.orientation === 'upright' ? d3.axisLeft(y).ticks(5) : d3.axisLeft(y).tickFormat(value => d3.format('.3~s')(value));
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(0 ${chart.margin.top + chart.innerHeight})`).call(xAxis);
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(${chart.margin.left} 0)`).call(yAxis);
  chart.svg.selectAll('.bar').data(bins).join('rect').attr('class', 'bar').attr('x', d => state.orientation === 'upright' ? x(d.x0) + 1 : x(0)).attr('y', d => state.orientation === 'upright' ? y(d.length) : y(d.x0)).attr('width', d => state.orientation === 'upright' ? Math.max(0, x(d.x1) - x(d.x0) - 2) : x(d.length) - x(0)).attr('height', d => state.orientation === 'upright' ? y(0) - y(d.length) : y.bandwidth()).on('mousemove', (event, d) => showTooltip(event, `<strong>${d.x0.toFixed(1)} - ${d.x1.toFixed(1)}</strong><br>${d.length} player records`)).on('mouseleave', hideTooltip);
  addAxisLabels(chart, chart.xLabel, chart.yLabel);
}

function axisFor(values, range, categorical) {
  return categorical ? d3.scalePoint().domain(values).range(range).padding(0.5) : d3.scaleLinear().domain(d3.extent(values)).nice().range(range);
}

function renderScatterplot() {
  const selected = state.scatterAxis === 'x' ? state.scatterA : state.scatterB;
  const other = state.scatterAxis === 'x' ? state.scatterB : state.scatterA;
  const xColumn = state.scatterAxis === 'x' ? selected : other;
  const yColumn = state.scatterAxis === 'x' ? other : selected;
  const rows = state.data.map(row => ({ row, x: numericValue(row[xColumn]) ?? row[xColumn], y: numericValue(row[yColumn]) ?? row[yColumn] })).filter(d => d.x !== null && d.x !== '' && d.y !== null && d.y !== '');
  const xCategorical = state.categoricalColumns.includes(xColumn);
  const yCategorical = state.categoricalColumns.includes(yColumn);
  const chart = startChart(`${labelFor(xColumn)} vs ${labelFor(yColumn)}`, labelFor(xColumn), labelFor(yColumn));
  chart.svg = svg.append('g');
  const xDomain = xCategorical ? [...new Set(rows.map(d => d.x))] : rows.map(d => Number(d.x));
  const yDomain = yCategorical ? [...new Set(rows.map(d => d.y))] : rows.map(d => Number(d.y));
  const x = axisFor(xDomain, [chart.margin.left, chart.margin.left + chart.innerWidth], xCategorical);
  const y = axisFor(yDomain, [chart.margin.top + chart.innerHeight, chart.margin.top], yCategorical);
  chart.svg.append('g').attr('class', 'grid').attr('transform', `translate(0 ${chart.margin.top + chart.innerHeight})`).call((xCategorical ? d3.axisBottom(x) : d3.axisBottom(x).ticks(6)).tickSize(-chart.innerHeight).tickFormat(''));
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(0 ${chart.margin.top + chart.innerHeight})`).call(xCategorical ? d3.axisBottom(x) : d3.axisBottom(x).ticks(6));
  chart.svg.append('g').attr('class', 'axis').attr('transform', `translate(${chart.margin.left} 0)`).call(yCategorical ? d3.axisLeft(y) : d3.axisLeft(y).ticks(6));
  chart.svg.selectAll('.point').data(rows).join('circle').attr('class', 'point').attr('cx', d => (xCategorical ? x(d.x) + (Math.random() - 0.5) * 18 : x(Number(d.x)))).attr('cy', d => (yCategorical ? y(d.y) + (Math.random() - 0.5) * 18 : y(Number(d.y)))).attr('r', 4.5).on('mousemove', (event, d) => showTooltip(event, `<strong>${d.row.player_name || 'Player'}</strong><br>${labelFor(xColumn)}: ${d.x}<br>${labelFor(yColumn)}: ${d.y}<br>${d.row.team || ''} · ${d.row.season || ''}`)).on('mouseleave', hideTooltip);
  addAxisLabels(chart, chart.xLabel, chart.yLabel);
}

function showTooltip(event, html) { tooltip.html(html).style('display', 'block').style('left', `${event.clientX + 14}px`).style('top', `${event.clientY + 14}px`); }
function hideTooltip() { tooltip.style('display', 'none'); }
function showEmpty() { svg.selectAll('*').remove(); document.querySelector('#empty-state').hidden = false; }
function render() { document.querySelector('#empty-state').hidden = true; if (state.mode === 'scatter') renderScatterplot(); else if (state.numericColumns.includes(state.distributionVariable)) renderHistogram(state.distributionVariable); else renderBarChart(state.distributionVariable); }

function bindEvents() {
  d3.select('#distribution-variable').on('change', event => { state.distributionVariable = event.target.value; render(); });
  d3.select('#scatter-variable-a').on('change', event => { state.scatterA = event.target.value; render(); });
  d3.select('#scatter-variable-b').on('change', event => { state.scatterB = event.target.value; render(); });
  d3.selectAll('input[name="orientation"]').on('change', event => { state.orientation = event.target.value; render(); });
  d3.selectAll('input[name="scatter-axis"]').on('change', event => { state.scatterAxis = event.target.value; render(); });
  d3.select('#toggle-chart').on('click', () => { state.mode = state.mode === 'distribution' ? 'scatter' : 'distribution'; document.querySelector('#toggle-chart').textContent = state.mode === 'distribution' ? 'Show scatterplot' : 'Show distribution'; render(); });
  window.addEventListener('resize', render);
}

d3.csv('data/fused_players.csv').then(rows => {
  state.data = rows;
  inferColumns(rows);
  state.distributionVariable = state.numericColumns.includes('market_value') ? 'market_value' : state.columns[0];
  state.scatterA = state.numericColumns.includes('market_value') ? 'market_value' : state.columns[0];
  state.scatterB = state.numericColumns.includes('goals') ? 'goals' : state.columns[1];
  updateSelectors();
  bindEvents();
  document.querySelector('#data-status').textContent = 'Fused dataset loaded';
  document.querySelector('#record-count').textContent = `${state.data.length.toLocaleString()} player-season records`;
  render();
}).catch(error => {
  document.querySelector('#data-status').textContent = 'Data failed to load';
  document.querySelector('#data-status').style.background = '#ad4537';
  console.error(error);
});
