import './circle-color-graph.css'
import * as d3 from 'd3';

const API_URL = 'public/data/betweenness-centrality.json';

const rgb2hex = rgb => {
	return '#' + rgb.map(value => {
		return ( '0' + value.toString( 16 ) ).slice( -2 ) ;
	}).join('') ;
};

const rgb2hsv = rgb => {
  let rdif;
  let gdif;
  let bdif;
  let h;
  let s;
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const v = Math.max(r, g, b);
  const diff = v - Math.min(r, g, b);
  const diffc = function(c) { return (v - c) / 6 / diff + 1 / 2; };
  if (diff === 0) {
    h = 0;
    s = 0;
  } else {
    s = diff / v;
    rdif = diffc(r);
    gdif = diffc(g);
    bdif = diffc(b);
    if (r === v) { h = bdif - gdif; }
    else if (g === v) { h = (1 / 3) + rdif - bdif; }
    else if (b === v) { h = (2 / 3) + gdif - rdif; }
    if (h < 0) { h += 1; }
    else if (h > 1) { h -= 1; }
  }
  return [h * 360, s * 100, v * 100];
};

const hex2rgb = args => {
  const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
  if (!match) return [0, 0, 0];
  let colorString = match[0];
  if (match[0].length === 3) {
    colorString = colorString.split('').map(char => char + char).join('');
  }
  const integer = parseInt(colorString, 16);
  const r = (integer >> 16) & 0xFF;
  const g = (integer >> 8) & 0xFF;
  const b = integer & 0xFF;
  return [r, g, b];
};

const radians = degree => degree * ( Math.PI / 180 );

const renderGraph = (data) => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const radius = Math.min(window.innerHeight, window.innerWidth) / 2 - 30;
  const nodeRad = 7;
  const linkOpacity = 0.3;
  const chart = (data) => {
    const ang2pos = ang => [Math.cos(ang), Math.sin(ang)];
    const nodes = data.nodes.map(d => Object.create(d));
    nodes.forEach(n => {
      n.rgb = hex2rgb(n.color.slice(1));
      n.hsv = rgb2hsv(n.rgb);
      n.pos = ang2pos(radians(n.hsv[0]));
      // n.pos[0] = n.pos[0] * n.hsv[2] * 0.01 * radius + width / 2;
      // n.pos[1] = n.pos[1] * n.hsv[2] * 0.01 * radius + height / 2;
      n.pos[0] = n.pos[0] * radius + width / 2;
      n.pos[1] = n.pos[1] * radius + height / 2;
    });
    const links = data.links.map(d => Object.create(d));
    links.forEach(l => {
      l.source = nodes.find(n => n.id == l.source);
      l.target = nodes.find(n => n.id == l.target);
    });

    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height]);

    const background = svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'black');

    const zoomLayer = svg.append('g');
    const zoomed = () => {
      node.attr('r', 1 / d3.event.transform.k * nodeRad)
        .attr('stroke-width', 1 / d3.event.transform.k);
      zoomLayer.attr('transform', d3.event.transform);
    };
    svg.call(d3.zoom()
      .scaleExtent([1 / 2, 12])
      .on('zoom', zoomed));

    const link = zoomLayer.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        return 'white'
        return '#64C8FA'
        return rgb2hex([
          (d.source.rgb[0] + d.target.rgb[0]) / 2,
          (d.source.rgb[1] + d.target.rgb[1]) / 2,
          (d.source.rgb[2] + d.target.rgb[2]) / 2
        ]);
      })
      .attr('stroke-opacity', linkOpacity)
      .attr('stroke-width', 1)
      .attr('x1', d => d.source.pos[0])
      .attr('y1', d => d.source.pos[1])
      .attr('x2', d => d.target.pos[0])
      .attr('y2', d => d.target.pos[1]);
    const node = zoomLayer.append('g')
      .attr('stroke', '#DDDDDD')
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(nodes)
      .style('cursor', 'default')
      .join('circle')
      .attr('r', nodeRad)
      .attr('cx', d => d.pos[0])
      .attr('cy', d => d.pos[1])
      .attr('fill', d => d.color);

    const tooltip = zoomLayer.append('text')
      .attr('class', 'tooltip')
      .attr('font-weight', 'bolder')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('stroke', '#DDDDDD')
      .attr('stroke-width', 0.5)
      .attr('x', width / 2)
      .attr('y', height / 2)
      .style('font-size', '34px');
    node.on('mouseleave', d => {
      link.style('visibility', 'visible');
      node.style('visibility', 'visible');
      tooltip.style('visibility', 'hidden');
    });
    node.on('mouseenter', d => {
      const linkedNodeIds = links
        .map(l => [l.source.id, l.target.id])
        .filter(l => l[0] == d.id || l[1] == d.id)
        .flat()
        .filter((x, i, self) => self.indexOf(x) === i);
      node.filter(n => !linkedNodeIds.includes(n.id) && n.id != d.id)
        .style('visibility', 'hidden');
      link.filter(l => l.source.id != d.id && l.target.id != d.id)
        .style('visibility', 'hidden');
      tooltip.style('visibility', 'visible')
        .text(_ => d.name)
        .attr('fill', _ => d.color);
        // .attr('fill', _ => '#DDDDDD')
    });
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
