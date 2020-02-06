const Viz = require('viz.js');
const {Module, render} = require('viz.js/full.render.js');

export class VizVisualizer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private viz: any;

  constructor() {
    this.viz = new Viz({Module, render});
  }

  render(graph: string): Promise<string> {
    return this.viz.renderString(graph, {engine: 'fdp', format: 'svg'});
  }
}
