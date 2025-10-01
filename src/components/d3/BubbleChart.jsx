import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../utils/useResizeObserver';

const BubbleChart = ({ data }) => {
    const wrapperRef = useRef();
    const svgRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        if (!dimensions) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const maxVal = d3.max(data, d => d.value);

        // Color scale

        // const colorMethod = d3.interpolateBlues
        // const colorMethod = d3.interpolateViridis
        const colorMethod = d3.interpolateCool
        // const colorMethod = d3.interpolateYlGnBu
        const color = d3.scaleSequential(colorMethod)
            .domain([0, maxVal]);


        // Radius scale
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxVal])
            .range([5, 45]);

        // Force simulation
        // const simulation = d3.forceSimulation(data)
        //     .force('center', d3.forceCenter(width / 2, height / 2))
        //     .force('charge', d3.forceManyBody().strength(5))
        //     .force('collision', d3.forceCollide(d => radiusScale(d.value) + 2))
        //     .on('tick', () => {
        //         bubbles
        //             .attr('cx', d => d.x)
        //             .attr('cy', d => d.y);
        //
        //         labels
        //             .attr('x', d => d.x)
        //             .attr('y', d => d.y + 4);
        //     });
        const simulation = d3.forceSimulation(data)
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('charge', d3.forceManyBody().strength(5))
            .force('collision', d3.forceCollide(d => radiusScale(d.value) + 4))

            .on('tick', () => {
                bubbles
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);

                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y + 4);
            });

        // Bubbles
        const bubbles = svg.selectAll('circle')
            .data(data)

            .enter()
            .append('circle')
            .attr('r', d => radiusScale(d.value))
            .attr('fill', d => color(d.value))
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition().duration(200)
                    .attr('r', radiusScale(d.value) * 1.2);

                setTooltip({
                    x: d.x,
                    y: d.y,
                    content: `${d.name}: ${d.value}`,
                });
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition().duration(200)
                    .attr('r', radiusScale(d.value));

                setTooltip(null);
            })
            .on('click', (event, d) => {
                console.log('Bubble clicked:', d);
                alert(`You clicked on "${d.name}" with value ${d.value}`);
            });

        // Labels
        const labels = svg.selectAll('text')
            .data(data)

            .enter()
            .append('text')
            .text(d => d.name)
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            // .attr('fill', 'white')
            // .attr('fill', 'red')
            .attr('fill', 'black')
            .style('pointer-events', 'none');

        return () => simulation.stop();
    }, [data, dimensions]);

    return (
        <div
            ref={wrapperRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                touchAction: 'manipulation',
            }}
        >
            <svg ref={svgRef} width={dimensions?.width || 0} height={dimensions?.height || 0} />
            {/*<svg ref={svgRef} width={dimensions?.width || 0} height={dimensions?.height || 0} />*/}
            {tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        transform: 'translate(-50%, -120%)',
                    }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default BubbleChart;
