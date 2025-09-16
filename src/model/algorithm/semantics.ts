import { assert } from "@/common";
import * as ohm from "ohm-js";

/**
 * Type-safe semantics object that can take actions on a parse result
 * @template TOperations Mapping between operation names and their return types
 * @template TAttributes Mapping between attribute names and their value types
 */
export type _SemanticExecutor<
  TOperations extends Record<string, unknown>,
  TAttributes extends Record<string, unknown>,
> = {
  (result: ohm.MatchResult): SemanticAdapter<TOperations, TAttributes>;
};

type SemanticAdapter<
  TOperations extends Record<string, unknown>,
  TAttributes extends Record<string, unknown>,
> = {
  [TOperationKey in keyof TOperations]: () => TOperations[TOperationKey];
} & {
  [TAttributeKey in keyof TAttributes]: TAttributes[TAttributeKey];
};

/**
 * Type-safe semantic action parsing node that requires strongly-typed children
 * and operations
 * @template TCtorName The name of the parse node that applies here
 * @template TOperationName The name of the operation
 * @template TOperationReturnType The return type of the operation
 * @template TChildrenType The child nodes that are expected to be had
 */
export type _SemanticParseNode<
  TCtorName extends string,
  TOperationName extends string,
  TOperationReturnType,
  TChildrenType extends ohm.Node[],
> =
  // this looks useless, but actually serves to make this distributive,
  // i.e. a given _SemanticParseNode with a union TChildrenType will result in a
  // union of possible result types. This means that _GetFrameworkExecuteCallback
  // will yield a union type as well. This allows us to have multiple labels per
  // node constructor, and have each satisfy a different callback signature
  TChildrenType extends ohm.Node[]
    ? ohm.Node & {
        ctorName: TCtorName;
        children: TChildrenType;
      } & {
        [Key in TOperationName]: () => TOperationReturnType;
      }
    : never;

/**
 * Assert that a node is the strongly-typed node we think it is
 * @param node The node that should be strongly typed
 * @param ctorName The name of the constructor of this node
 */
export function _assertNodeIsStronglyTyped<
  TNode extends _SemanticParseNode<string, string, unknown, ohm.Node[]>,
>(node: ohm.Node, ctorName: TNode["ctorName"]): asserts node is TNode {
  assert(node.ctorName === ctorName);
}

/**
 * A terminal iteration node
 * @template TChildren The type of node this iteration should have as children
 */
export type _Iter<TChildren extends ohm.Node> = _SemanticParseNode<
  "_iter",
  string,
  unknown,
  TChildren[]
>;

/**
 * A terminal node (i.e. one that is just a literal)
 */
export type _Terminal = ohm.Node;

/**
 * Get the appropriate callback type for this particular semantic action's ActionDict
 * @template TSemanticParseNode The semantic action node type
 */
export type _FrameworkVisitorCallback<TSemanticParseNode> =
  TSemanticParseNode extends _SemanticParseNode<
    string,
    string,
    infer TReturnType,
    infer TChildrenType
  >
    ? TChildrenType extends ohm.Node[]
      ? (...args: TChildrenType) => TReturnType
      : never
    : never;
