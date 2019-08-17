import * as d3 from 'd3';

const API_URL = 'public/data/betweenness-centrality.json';

const renderGraph = (data) => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const drag = (simulation) => {

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  const chart = (data) => {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .velocityDecay(0.5)
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height]);


    const zoomLayer = svg.append('g');
    const zoomed = () => {
      zoomLayer.attr('transform', d3.event.transform);
    };
    svg.call(d3.zoom()
      .scaleExtent([1 / 2, 12])
      .on('zoom', zoomed));

    const link = zoomLayer.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => 0.5);

    const connectionMin = d3.min(nodes, d => {
      return d.value;
    });
    const connectionMax = d3.max(nodes, d => {
      return d.value;
    });
    const nodeScale = d3.scaleLinear()
      .domain([connectionMin, connectionMax])
      .range([5, 15])
      .nice();
    const node = zoomLayer.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => nodeScale(d.value))
      .attr('fill', d => d.color)
      .call(drag(simulation));

    // node.append('title')
    //   .text(d => d.name);
    const tooltip = zoomLayer.append('text')
      .attr('class', 'tooltip')
      .attr('font-weight', 'bolder');
    node.on('mousemove', d => {
      tooltip.style('visibility', 'visible')
        .text(_ => d.name)
        // .attr('fill', _ => d.color)
        .attr('fill', _ => '#333333')
        .attr('x', _ => d.x + 20)
        .attr('y', _ => d.y - 20);
    });
    node.on('mouseout', d => {
      tooltip.style('visibility', 'hidden');
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    //  invalidation.then(() => simulation.stop());

    return svg.node();
  }
  return chart(data);
};

d3.json(API_URL).then(data => {
  data.nodes = data.nodes.map(d => {
    return {
      'id': d.id,
      'name': d.name,
      'color': d.color,
      'value': d.betweenness_centrality,
    };
  });
  const graph = renderGraph(data);
  document.body.appendChild(graph);
});
