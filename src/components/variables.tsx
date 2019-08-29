import { DebugProtocol } from "vscode-debugprotocol";

import * as React from "react";

import { ObjectInspector, ObjectLabel, ObjectRootLabel } from "react-inspector";

import { DEBUGGER_HEADER_CLASS } from "./constants";
import { JSONValue } from "@phosphor/coreutils";

const DEBUGGER_VARIABLES_LIST_CLASS = "jp-Debugger-variableList";

const THEME = {
  BASE_FONT_FAMILY: "var(--jp-code-font-family)",
  BASE_FONT_SIZE: "var(--jp-code-font-size)",
  BASE_LINE_HEIGHT: "var(--jp-code-line-height)",

  BASE_BACKGROUND_COLOR: "var(--jp-layout-color0)",
  BASE_COLOR: "var(--jp-content-font-color1)",

  OBJECT_NAME_COLOR: "var(--jp-mirror-editor-attribute-color)",
  OBJECT_VALUE_NULL_COLOR: "var(--jp-mirror-editor-builtin-color)",
  OBJECT_VALUE_UNDEFINED_COLOR: "var(--jp-mirror-editor-builtin-color)",
  OBJECT_VALUE_REGEXP_COLOR: "var(--jp-mirror-editor-string-color)",
  OBJECT_VALUE_STRING_COLOR: "var(--jp-mirror-editor-string-color)",
  OBJECT_VALUE_SYMBOL_COLOR: "var(--jp-mirror-editor-operator-color)",
  OBJECT_VALUE_NUMBER_COLOR: "var(--jp-mirror-editor-number-color)",
  OBJECT_VALUE_BOOLEAN_COLOR: "var(--jp-mirror-editor-builtin-color))",
  OBJECT_VALUE_FUNCTION_KEYWORD_COLOR: "var(--jp-mirror-editor-def-color))",

  ARROW_COLOR: "var(--jp-content-font-color2)",
  ARROW_MARGIN_RIGHT: 3,
  ARROW_FONT_SIZE: 12,

  TREENODE_FONT_FAMILY: "var(--jp-code-font-family)",
  TREENODE_FONT_SIZE: "var(--jp-code-font-size)",
  TREENODE_LINE_HEIGHT: "var(--jp-code-line-height)",
  TREENODE_PADDING_LEFT: 12,

  OBJECT_PREVIEW_ARRAY_MAX_PROPERTIES: 10,
  OBJECT_PREVIEW_OBJECT_MAX_PROPERTIES: 10,
  OBJECT_VALUE_FUNCTION_PREFIX_COLOR: "var(--jp-content-font-color1)"
};

interface IVariablesProps {
  // TODO: handle scopes
  variables: DebugProtocol.Variable[];
}

interface IRendererArgs {
  depth: number;
  name: string;
  data: JSONValue;
  expanded: boolean;
}

function nodeRenderer(args: IRendererArgs) {
  const { name, depth, data } = args;
  if (depth === 0) {
    return <ObjectRootLabel key={`node-label`} name="Scopes" data={data} />;
  }
  if (depth === 1) {
    return <ObjectLabel key={`node-label`} name={name} data={data} />;
  }
  if (depth === 2) {
    const variable = (data as any) as DebugProtocol.Variable;
    let value: number | string = variable.value;
    switch (variable.type) {
      case "int":
        value = parseInt(value, 10);
        break;
      case "float":
        value = parseFloat(value);
        break;
      default:
        break;
    }
    return (
      <ObjectLabel
        key={`node-label`}
        name={variable.name}
        data={value}
        isNonenumerable={true}
      />
    );
  }
  return <ObjectLabel key={`node-label`} name={name} data={data} />;
}

export function VariablesComponent(props: IVariablesProps) {
  return (
    <>
      <div className={DEBUGGER_HEADER_CLASS}>
        <h2>Variables</h2>
      </div>
      <div className={DEBUGGER_VARIABLES_LIST_CLASS}>
        <ObjectInspector
          data={{ Locals: props.variables }}
          theme={THEME}
          nodeRenderer={nodeRenderer}
          showNonenumerable={false}
          expandLevel={2}
        />
      </div>
    </>
  );
}
