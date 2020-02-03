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
    return this.ctx.inspect({includeInjections, includeParent});
  }
}
