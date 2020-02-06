// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JSONObject, JSONArray} from '@loopback/context';

/**
 * A filter function to control if a binding is to be rendered
 */
export type BindingNodeFilter = (binding: JSONObject) => boolean;

/**
 * A graph for context hierarchy
 */
export class ContextGraph {
  /**
   * Class nodes
   */
  private readonly classes: string[] = [];

  /**
   * Context json objects in the chain from root to leaf
   */
  private readonly contextChain: JSONObject[] = [];

  constructor(ctx: JSONObject) {
    let current: JSONObject | undefined = ctx;
    while (current != null) {
      this.contextChain.unshift(current);
      current = current.parent as JSONObject | undefined;
    }
    this.indexBindings();
  }

  /**
   * Assign a unique id for each bindings
   */
  private indexBindings() {
    for (let level = 0; level < this.contextChain.length; level++) {
      const ctx = this.contextChain[level];
      let index = 0;
      const bindings = ctx.bindings as JSONObject;
      for (const key in bindings) {
        const binding = bindings[key] as JSONObject;
        const id = `Binding_${level}_${index++}`;
        binding.id = id;
      }
    }
  }

  /**
   * Recursive render the chain of contexts as subgraphs
   * @param level - Level of the context in the chain
   */
  private renderContextChain(level: number, bindingFilter: BindingNodeFilter) {
    const ctx = this.contextChain[level];
    const nodes: string[] = [];
    const bindings = ctx.bindings as JSONObject;
    for (const key in bindings) {
      const binding = bindings[key] as JSONObject;
      if (!bindingFilter(binding)) continue;
      nodes.push(
        `  ${binding.id} [label="{${key}|${binding.type}|${binding.scope}}" fillcolor=cyan3]`,
      );
      const edges = this.renderBindingInjections(binding, level);
      nodes.push(...edges);
    }
    let child = '';
    if (level + 1 < this.contextChain.length) {
      child = this.renderContextChain(level + 1, bindingFilter);
      child = child.replace(/^/gm, '  ');
    }
    const graph = `subgraph cluster_ContextGraph_${level} {
  label = "${ctx.name}"
  labelloc = "t";
  rankdir = "LR";
  node [shape = record style=filled];
${nodes.join(';\n')}

${child}
}`;
    return graph;
  }

  /**
   * Find the binding id by key
   * @param key - Binding key
   * @param level - Context level
   */
  private getBinding(key: string, level: number) {
    for (let i = level; i >= 0; i--) {
      const bindings = this.contextChain[i].bindings as JSONObject;
      const binding = bindings?.[key] as JSONObject;
      if (binding) return binding;
    }
    return undefined;
  }

  /**
   * Render injections for a binding
   * @param binding - Binding object
   * @param level - Context level
   */
  private renderBindingInjections(binding: JSONObject, level: number) {
    const edges: string[] = [];
    const ctor = binding.valueConstructor ?? binding.providerConstructor;
    if (ctor) {
      const injections = [];
      if (binding.injections) {
        const args = (binding.injections as JSONObject)
          .constructorArguments as JSONArray;
        const props = (binding.injections as JSONObject)
          .properties as JSONObject;
        if (args) {
          let i = 0;
          args.forEach(arg => {
            injections.push(`[${i++}]`);
            const argInjection = arg as JSONObject;
            const target = this.getBindingForInjection(argInjection, level);
            if (target) {
              edges.push(`  Class_${ctor} -> ${target.id}`);
            }
          });
        }
        if (props) {
          for (const p in props) {
            injections.push(`${p}`);
            const propInjection = props[p] as JSONObject;
            const target = this.getBindingForInjection(propInjection, level);
            if (target) {
              edges.push(`  Class_${ctor} -> ${target.id}`);
            }
          }
        }
      }
      let label = ctor;
      if (injections.length) {
        label += '|{' + injections.join('|') + '}';
      }
      this.classes.push(
        `  Class_${ctor} [label="${label}" shape=record fillcolor=green2]`,
      );
      edges.push(`  ${binding.id} -> Class_${ctor}`);
    }
    return edges;
  }

  /**
   * Find target binding for an injection
   * @param injection - Injection object
   * @param level - Context level
   */
  private getBindingForInjection(injection: JSONObject, level: number) {
    if (injection.bindingKey) {
      const binding = this.getBinding(injection.bindingKey as string, level);
      return binding;
    }
    return undefined;
  }

  /**
   * Render the context graph in graphviz dot format
   * @param bindingFilter - Binding filter function
   */
  render(bindingFilter: BindingNodeFilter = () => true) {
    const contextClusters = this.renderContextChain(0, bindingFilter);
    const graph = `digraph ContextGraph {
${this.classes.join('\n')}
${contextClusters.replace(/^/gm, '  ')}
}`;
    return graph;
  }
}
