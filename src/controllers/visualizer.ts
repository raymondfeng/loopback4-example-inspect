// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const Viz = require('viz.js');
const {Module, render} = require('viz.js/full.render.js');

const viz = new Viz({Module, render});

/**
 * Render a graphviz dot string
 * @param graph - A graph in dot format
 * @param options - Options for the rendering
 */
export function renderGraph(
  graph: string,
  options: {engine?: string; format?: string} = {},
): Promise<string> {
  options = {
    engine: 'fdp',
    format: 'svg',
    ...options,
  };
  return viz.renderString(graph, options);
}
