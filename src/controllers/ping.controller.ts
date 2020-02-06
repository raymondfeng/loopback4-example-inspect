import {inject, JSONObject} from '@loopback/context';
import {
  get,
  param,
  RequestContext,
  ResponseObject,
  RestBindings,
} from '@loopback/rest';

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
  ): JSONObject {
    const result = this.ctx.inspect({includeInjections, includeParent});
    console.log();
    console.log(renderAsGraph(result));
    return result;
  }
}

/**
 * Recursive render the chain of contexts as subgraphs
 * @param chain - Context level
 * @param level - Index
 */
function renderContextChain(chain: JSONObject[], level = 0) {
  const ctx = chain[level];
  let index = 0;
  const nodes: string[] = [];
  const bindings = ctx.bindings as JSONObject;
  for (const key in bindings) {
    const binding = bindings[key] as JSONObject;
    nodes.push(
      `  Binding_${level}_${index++} [label="{${key}|${binding.type}|${
        binding.scope
      }}"]`,
    );
    const ctor = binding.valueConstructor ?? binding.providerConstructor;
    if (ctor) {
      nodes.push(`  Class_${ctor} [label="${ctor}" shape=component]`);
      nodes.push(`  Binding_${level}_${index - 1} -> Class_${ctor}`);
    }
  }
  let child = '';
  if (level + 1 < chain.length) {
    child = renderContextChain(chain, level + 1);
    child = child.replace(/^/gm, '  ');
  }
  const graph = `subgraph cluster_ContextGraph_${level} {
  label = "${ctx.name}"
  labelloc = "t";
  rankdir = "LR";
  node [shape = record];
${nodes.join(';\n')}

${child}
}`;
  return graph;
}

/**
 * Render the ctx chain in graphviz dot format
 * @param ctx - Context json object
 */
function renderAsGraph(ctx: JSONObject) {
  const chain: JSONObject[] = [];
  let current: JSONObject | undefined = ctx;
  while (current != null) {
    chain.unshift(current);
    current = current.parent as JSONObject | undefined;
  }
  const contextClusters = renderContextChain(chain, 0);
  const graph = `digraph ContextChain {
${contextClusters.replace(/^/gm, '  ')}
}`;
  return graph;
}
