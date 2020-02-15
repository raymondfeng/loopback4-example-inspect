// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, JSONObject, Context} from '@loopback/context';
import {
  get,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  param,
  RequestContext,
  ResponseObject,
  RestBindings,
} from '@loopback/rest';

import {renderGraph} from './visualizer';
import {ContextGraph} from './context-graph';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

const INSPECT_RESPONSE: ResponseObject = {
  description: 'Inspect Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'InspectResponse',
        additionalProperties: true,
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(@inject(RestBindings.Http.CONTEXT) private ctx: RequestContext) {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    const req = this.ctx.request;
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: req.url,
      headers: Object.assign({}, req.headers),
    };
  }

  // Map to `GET /inspect`
  @get('/inspect', {
    responses: {
      '200': INSPECT_RESPONSE,
    },
  })
  inspect(
    @param.query.boolean('includeInjections') includeInjections = true,
    @param.query.boolean('includeParent') includeParent = true,
    @param.query.boolean('includeGraph') includeGraph = true,
  ): JSONObject {
    const result = this.ctx.inspect({includeInjections, includeParent});
    if (includeGraph) {
      const graph = new ContextGraph(result).render();
      result.graph = graph;
    }
    return result;
  }

  // Map to `GET /inspect`
  @get('/graph')
  async graph(
    @param.query.boolean('includeInjections') includeInjections = true,
    @param.query.boolean('includeParent') includeParent = true,
    @param.query.string('format') format = 'svg',
  ) {
    const result = this.ctx.inspect({includeInjections, includeParent});
    const graph = new ContextGraph(result).render();

    if (format === 'dot') {
      this.ctx.response.contentType('text/plain').send(graph);
    } else {
      const svg = await renderGraph(graph);
      this.ctx.response.contentType('image/svg+xml').send(svg);
    }
    return this.ctx.response;
  }

  /**
   * Create an array of graphviz dot graphs for d3 animations
   */
  @get('/dots')
  async dots() {
    let ctx: Context | undefined = this.ctx;
    const dots: string[] = [];
    while (ctx != null) {
      // Add one graph with injections
      const ctxData = ctx.inspect({
        includeParent: true,
        includeInjections: true,
      });
      const graph = new ContextGraph(ctxData).render();
      dots.push(graph);
      ctx = ctx.parent;
    }
    // Show app, app+server, and app+server+request
    return dots.reverse();
  }
}
