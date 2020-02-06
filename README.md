# loopback4-example-inspect

This example demonstrates the inspection of LoopBack 4 application context hierarchy.

The [PingController](https://github.com/raymondfeng/loopback4-example-inspect/blob/master/src/controllers/ping.controller.ts#L73-L85) now exposes the `/inspect` and `/graph` endpoint.

## Try out

```sh
npm i
npm start
```

Go to http://localhost:3000/inspect to fetch a JSON document for the context hierarchy.

The following query parameters are supported:

- includeParent: include parent contexts
- includeInjections: include injections
- includeGraph: include a graph in graphviz dot format

Go to http://localhost:3000/graph to render the LoopBack application as a SVG diagram.

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
