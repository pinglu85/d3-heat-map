const cellWidth = 5;
const height = 420;
const xMarginLeft = 200;
const xMarginRight = 200;
const yMarginBottom = 200;
const legendWidth = 500;
const legendHeight = 26;
const fontSize = 16;

//colors from colorbrewer
//http://colorbrewer2.org/
const colors = [
  '#a50026',
  '#d73027',
  '#f46d43',
  '#fdae61',
  '#fee090',
  '#ffffbf',
  '#e0f3f8',
  '#abd9e9',
  '#74add1',
  '#4575b4',
  '#313695',
];

const url =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

d3.json(url)
  .then((data) => {
    const baseTemperature = data.baseTemperature;
    const variance = [...data.monthlyVariance];
    const width = Math.floor(variance.length / 12) * cellWidth;
    const svg = d3
      .select('.heat-map')
      .append('svg')
      .attr('width', xMarginLeft + width + xMarginRight)
      .attr('height', height + yMarginBottom);

    // Description
    d3.select('.header')
      .append('p')
      .attr('id', 'description')
      .html(`1753 - 2015: base temperature ${baseTemperature} &#8451;`);

    // Year Scale
    const years = variance.map((val) => val.year);
    const filteredYears = [...new Set(years)];
    const xScale = d3.scaleBand().domain(filteredYears).range([0, width]);

    // Month Scale
    const yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) // months
      .range([0, height]);

    // X axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(filteredYears.filter((year) => year % 10 === 0))
      .tickSizeOuter(0);
    svg
      .append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', `translate(${xMarginLeft}, ${height})`)
      .attr('font-size', fontSize);

    // X axis description
    svg
      .append('text')
      .text('Years')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2 + xMarginLeft)
      .attr('y', height + 45);

    // Y axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((month) => {
        const date = new Date(0);
        date.setUTCMonth(month);
        return d3.utcFormat('%B')(date);
      })
      .tickSize(10, 1)
      .tickSizeOuter(0);
    svg
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', `translate(${xMarginLeft}, 0)`)
      .attr('font-size', fontSize);

    // Y axis description
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .text('Months')
      .attr('text-anchor', 'middle')
      .attr('x', -height / 2)
      .attr('y', 80);

    // Legend threshold
    const legendColors = colors.reverse();
    const minTemp = baseTemperature + d3.min(variance, (d) => d.variance);
    const maxTemp = baseTemperature + d3.max(variance, (d) => d.variance);
    const legendThreshold = d3
      .scaleThreshold()
      .domain(
        ((min, max, count) => {
          const array = [];
          const step = (max - min) / count;
          const base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minTemp, maxTemp, legendColors.length)
      )
      .range(legendColors);

    // Legend X Scale
    const legendXScale = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, legendWidth]);

    const legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr(
        'transform',
        `translate(${xMarginLeft}, ${height + yMarginBottom / 2})`
      );

    // Legend rect
    legend
      .selectAll('rect')
      .data(
        legendThreshold.range().map((color) => {
          const d = legendThreshold.invertExtent(color);
          if (!d[0]) {
            d[0] = legendXScale.domain()[0];
          }
          if (!d[1]) {
            d[1] = legendXScale.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append('rect')
      .attr('fill', (d) => legendThreshold(d[0]))
      .attr('x', (d) => legendXScale(d[0]))
      .attr('y', 0)
      .attr('width', (d) => legendXScale(d[1]) - legendXScale(d[0]))
      .attr('height', legendHeight)
      .attr('stroke', '#000');

    // Legend X axis
    const legendXAxis = d3
      .axisBottom(legendXScale)
      .tickValues(legendThreshold.domain())
      .tickFormat(d3.format('.1f'))
      .tickSize(12)
      .tickSizeOuter(0);

    legend
      .append('g')
      .call(legendXAxis)
      .attr('transform', `translate(0, ${legendHeight})`)
      .attr('font-size', fontSize);

    // Tooltip
    const tooltip = d3
      .select('.heat-map')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    // Cells
    const cells = svg.append('g').attr('id', 'cells');

    cells
      .selectAll('rect')
      .data(variance)
      .enter()
      .append('rect')
      .attr('data-year', (d) => d.year)
      .attr('data-month', (d) => d.month)
      .attr('data-temp', (d) => baseTemperature + d.variance)
      .attr('class', 'cell')
      .attr('x', (d) => xScale(d.year) + xMarginLeft + 1)
      .attr('y', (d) => yScale(d.month - 1))
      .attr('width', cellWidth)
      .attr('height', height / 12)
      .attr('fill', (d) => legendThreshold(baseTemperature + d.variance))
      .on('mouseover', (d) => {
        const date = new Date(d.year, d.month);
        const html = `<p>${d3.timeFormat('%Y - %B')(date)}</p><p>${d3.format(
          '.1f'
        )(baseTemperature + d.variance)} &#8451;</p><p>${d3.format('.1f')(
          d.variance
        )} &#8451;</p>`;
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .attr('data-year', d.year)
          .html(html)
          .style('left', `${xScale(d.year) + xMarginLeft / 2 + 1}px`)
          .style('top', `${yScale(d.month - 1) - height / 12}px`);
      });
  })
  .catch((err) => console.log(err));
