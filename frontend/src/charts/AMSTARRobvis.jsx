import { onCleanup, onMount } from 'solid-js';
import * as d3 from 'd3';

/**
 * Props:
 * - data: Array of { label: string, questions: Array<"yes"|"partial yes"|"no"|"no ma"> }
 * - width: number (default: 900)
 * - height: number (default: 600)
 * - title: string (default: "AMSTAR-2 Quality Assessment")
 */
export default function AMSTARRobvis(props) {
  let ref;
  const data = props.data ?? [];
  const nQuestions = 16;
  const width = props.width ?? 900;
  const height = props.height ?? 600;
  const title = props.title ?? 'AMSTAR-2 Quality Assessment';

  const margin = { top: 60, right: 170, bottom: 60, left: 100 };

  // Calculate max cell size that keeps squares and fits both axes
  const cellSizeX = (width - margin.left - margin.right) / nQuestions;
  const cellSizeY = (height - margin.top - margin.bottom) / data.length;
  const cellSize = Math.min(cellSizeX, cellSizeY);

  // Adjust chart area to fit grid
  const chartWidth = cellSize * nQuestions;
  const chartHeight = cellSize * data.length;
  const svgWidth = margin.left + chartWidth + margin.right;
  const svgHeight = margin.top + chartHeight + margin.bottom;

  const colorMap = {
    yes: '#10b981',
    'partial yes': '#facc15',
    no: '#ef4444',
    'no ma': '#9ca3af',
  };

  onMount(() => {
    const svg = d3
      .select(ref)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('background', '#ffffff')
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

    svg.selectAll('*').remove();

    // Add subtle background grid
    const gridGroup = svg.append('g').attr('class', 'grid');

    // // Vertical grid lines
    // for (let i = 0; i <= nQuestions; i++) {
    //   gridGroup
    //     .append('line')
    //     .attr('x1', margin.left + i * cellSize)
    //     .attr('x2', margin.left + i * cellSize)
    //     .attr('y1', margin.top)
    //     .attr('y2', margin.top + chartHeight)
    //     .attr('stroke', '#f3f4f6')
    //     .attr('stroke-width', 1);
    // }

    // // Horizontal grid lines
    // for (let i = 0; i <= data.length; i++) {
    //   gridGroup
    //     .append('line')
    //     .attr('x1', margin.left)
    //     .attr('x2', margin.left + nQuestions * cellSize)
    //     .attr('y1', margin.top + i * cellSize)
    //     .attr('y2', margin.top + i * cellSize)
    //     .attr('stroke', '#f3f4f6')
    //     .attr('stroke-width', 1);
    // }

    // Column headers at bottom
    const footerGroup = svg.append('g').attr('class', 'footer');

    // footerGroup
    //   .selectAll('rect')
    //   .data(d3.range(1, nQuestions + 1))
    //   .enter()
    //   .append('rect')
    //   .attr('x', (d, i) => margin.left + i * cellSize)
    //   .attr('y', margin.top + chartHeight)
    //   .attr('width', cellSize)
    //   .attr('height', margin.bottom - 20)
    //   .attr('fill', '#f9fafb')
    //   .attr('stroke', '#e5e7eb')
    //   .attr('stroke-width', 1);

    footerGroup
      .selectAll('text')
      .data(d3.range(1, nQuestions + 1))
      .enter()
      .append('text')
      .attr('x', (d, i) => margin.left + i * cellSize + cellSize / 2)
      .attr('y', margin.top + chartHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.max(10, cellSize * 0.4))
      .attr('font-weight', '600')
      .attr('fill', '#374151')
      .text((d) => `Q${d}`);

    // Row labels with alternating background
    const rowGroup = svg.append('g').attr('class', 'rows');

    // rowGroup
    //   .selectAll('rect')
    //   .data(data)
    //   .enter()
    //   .append('rect')
    //   .attr('x', 0)
    //   .attr('y', (_, i) => margin.top + i * cellSize)
    //   .attr('width', margin.left)
    //   .attr('height', cellSize)
    //   .attr('fill', (_, i) => (i % 2 === 0 ? '#ffffff' : '#f9fafb'))
    //   .attr('stroke', '#e5e7eb')
    //   .attr('stroke-width', 1);

    rowGroup
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', margin.left - 15)
      .attr('y', (_, i) => margin.top + i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('font-size', Math.max(10, cellSize * 0.45))
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('dominant-baseline', 'middle')
      .text((d) => d.label);

    // Traffic light cells
    const cellGroup = svg.append('g').attr('class', 'cells');

    data.forEach((row, rowIdx) => {
      for (let colIdx = 0; colIdx < nQuestions; colIdx++) {
        const value = row.questions[colIdx]?.toLowerCase?.() ?? '';
        const cellColor = colorMap[value] ?? '#e5e7eb';

        // Traffic light cell - filled rectangle
        cellGroup
          .append('rect')
          .attr('x', margin.left + colIdx * cellSize + 2)
          .attr('y', margin.top + rowIdx * cellSize + 2)
          .attr('width', cellSize - 4)
          .attr('height', cellSize - 4)
          .attr('fill', cellColor)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1)
          .attr('rx', Math.max(2, cellSize * 0.12))
          .style('filter', 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))');
      }
    });

    // Legend
    const legendData = [
      { key: 'yes', label: 'Yes' },
      { key: 'partial yes', label: 'Partial Yes' },
      { key: 'no', label: 'No' },
      { key: 'no ma', label: 'No MA' },
    ];

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${svgWidth - margin.right + 20}, ${margin.top + 20})`);

    const legendItems = legend
      .selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);

    legendItems
      .append('rect')
      .attr('x', 0)
      .attr('y', -8)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 2)
      .attr('fill', (d) => colorMap[d.key])
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    legendItems
      .append('text')
      .attr('x', 24)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .text((d) => d.label);

    // Title
    svg
      .append('text')
      .attr('x', svgWidth / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', '600')
      .attr('fill', '#111827')
      .text(title);

    // Cleanup function
    onCleanup(() => {
      svg.selectAll('*').remove();
    });
  });

  return (
    <div style="background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 16px; margin: 16px 0;">
      <svg ref={ref} style={`width: 100%; height: ${svgHeight}px; max-width: 100%; display: block;`} />
    </div>
  );
}
