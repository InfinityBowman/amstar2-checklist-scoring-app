import { onCleanup, createEffect, createSignal, onMount } from 'solid-js';
import * as d3 from 'd3';

/**
 * Props:
 * - data: Array of { label: string, questions: Array<"yes"|"partial yes"|"no"|"no ma"> }
 * - width: number (default: 900)
 * - height: number (default: 600)
 * - title: string (default: "Distribution of AMSTAR Ratings on Each Item Across Included Reviews")
 */
export default function AMSTARDistribution(props) {
  let ref, containerRef;
  const data = () => props.data ?? [];
  const [containerSize, setContainerSize] = createSignal({ width: 900, height: 600 });

  // Observe parent container size
  onMount(() => {
    const resize = () => {
      if (containerRef) {
        const rect = containerRef.getBoundingClientRect();
        setContainerSize({
          width: Math.max(rect.width, 400),
          height: Math.max(rect.height, 400),
        });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    onCleanup(() => window.removeEventListener('resize', resize));
  });

  // Trigger resize when data changes
  createEffect(() => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      setContainerSize({
        width: Math.max(rect.width, 400),
        height: Math.max(rect.height, 400),
      });
    }
  });

  const width = () => props.width ?? containerSize().width;
  const height = () => props.height ?? containerSize().width / 1.5;
  const title = () => props.title ?? 'Distribution of AMSTAR Ratings on Each Item Across Included Reviews';

  const margin = { top: 50, right: 150, bottom: 60, left: 80 };
  const chartWidth = () => width() - margin.left - margin.right;
  const chartHeight = () => height() - margin.top - margin.bottom;
  // Responsive font size based on width
  const titleFont = () => Math.max(Math.round(width() / 50), 12) + 1; // e.g. 900px => 18px, 400px => 10px

  const colorMap = {
    yes: '#10b981',
    'partial yes': '#facc15',
    no: '#ef4444',
    'no ma': '#9ca3af',
  };

  createEffect(() => {
    if (!data().length) return;

    const svg = d3
      .select(ref)
      .attr('width', width())
      .attr('height', height())
      .style('background', '#ffffff')
      .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');

    svg.selectAll('*').remove();

    // Process data to calculate percentages for each question
    const processedData = [];
    const nQuestions = Math.max(...data().map((d) => d.questions?.length || 0));
    const totalStudies = data().length;

    for (let q = 0; q < nQuestions; q++) {
      const questionData = {
        question: q + 1,
        label: `Q${q + 1}`, // You can customize these labels
        counts: { yes: 0, 'partial yes': 0, no: 0, 'no ma': 0 },
      };

      // Count responses for this question
      data().forEach((study) => {
        const response = study.questions[q]?.toLowerCase?.() ?? 'no ma';
        if (questionData.counts.hasOwnProperty(response)) {
          questionData.counts[response]++;
        }
      });

      // Convert to percentages
      questionData.percentages = {};
      Object.keys(questionData.counts).forEach((key) => {
        questionData.percentages[key] = (questionData.counts[key] / totalStudies) * 100;
      });

      processedData.push(questionData);
    }

    // Create scales
    const yScale = d3
      .scaleBand()
      .domain(processedData.map((d) => d.label))
      .range([0, chartHeight()])
      .padding(0.1);

    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth()]);

    // Create main chart group
    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add title
    svg
      .append('text')
      .attr('x', width() / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', titleFont() + 'px')
      .attr('font-weight', '600')
      .attr('fill', '#111827')
      .text(title());

    // Create stacked bars
    processedData.forEach((d) => {
      let cumulativePercent = 0;
      const barHeight = yScale.bandwidth();
      const y = yScale(d.label);

      // Draw each segment
      ['yes', 'partial yes', 'no ma', 'no'].forEach((category) => {
        const percent = d.percentages[category];
        const segmentWidth = xScale(percent);

        if (percent > 0) {
          // Bar segment
          chartGroup
            .append('rect')
            .attr('x', xScale(cumulativePercent))
            .attr('y', y)
            .attr('width', segmentWidth)
            .attr('height', barHeight)
            .attr('fill', colorMap[category])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1);

          // Add percentage label if segment is large enough
          if (percent >= 5) {
            chartGroup
              .append('text')
              .attr('x', xScale(cumulativePercent) + segmentWidth / 2)
              .attr('y', y + barHeight / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('font-size', '12px')
              .attr('font-weight', '600')
              .attr('fill', category === 'partial yes' ? '#000000' : '#ffffff')
              .text(`${percent.toFixed(1)}`);
          }
        }

        cumulativePercent += percent;
      });
    });

    // Add Y-axis labels (question labels)
    chartGroup
      .selectAll('.y-label')
      .data(processedData)
      .enter()
      .append('text')
      .attr('class', 'y-label')
      .attr('x', -10)
      .attr('y', (d) => yScale(d.label) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .text((d) => d.label);

    // Add X-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => `${d}`)
      .ticks(5);

    chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight()})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#374151');

    // Add X-axis label
    chartGroup
      .append('text')
      .attr('x', chartWidth() / 2)
      .attr('y', chartHeight() + 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .text(`Percentage of SRs (%), N=${totalStudies}`);

    // Add Y-axis label
    svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -height() / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .text('Items of AMSTAR-2');

    // Add legend
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width() - margin.right + 20}, ${margin.top + 20})`);

    const legendData = [
      { key: 'yes', label: 'Yes' },
      { key: 'partial yes', label: 'Partial Yes' },
      { key: 'no', label: 'No' },
      { key: 'no ma', label: 'No MA' },
    ];

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

    // Cleanup
    onCleanup(() => {
      svg.selectAll('*').remove();
    });
  });

  return (
    <div
      ref={containerRef}
      style="background: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); padding: 16px; margin: 16px 0;"
    >
      <svg ref={ref} style={`width: 100%; height: ${height()}px; max-width: 100%; display: block;`} />
    </div>
  );
}
