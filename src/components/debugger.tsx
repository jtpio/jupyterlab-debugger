import { ToolbarButtonComponent } from "@jupyterlab/apputils";

import { Signal } from "@phosphor/signaling";

import { DebugProtocol } from "vscode-debugprotocol";

import * as React from "react";

import { BreakpointsComponent } from "./breakpoints";

import { IDebugger } from "../debugger/tokens";
import { IDebugSession, IBreakpoint } from "../debugger/session";
import { VariablesComponent } from "./variables";

const DEBUGGER_HEADER_CLASS = "jp-Debugger-header";

interface IDebuggerProps {
  debugger: IDebugger;
}

interface IDebuggerState {
  started: boolean;
  debugSession: IDebugSession;
  breakpoints: IBreakpoint[];
  variables: DebugProtocol.Variable[];
}

export class DebuggerComponent extends React.Component<
  IDebuggerProps,
  IDebuggerState
> {
  constructor(props: IDebuggerProps) {
    super(props);
    this.state = {
      started: false,
      debugSession: props.debugger.debugSession,
      breakpoints: [],
      variables: []
    };
  }

  componentDidMount = () => {
    this.props.debugger.activeCellChanged.connect(
      this.onActiveCellChanged,
      this
    );
    this.props.debugger.breakpointChanged.connect(
      this.onBreakpointsChanged,
      this
    );
    this.addDebugSessionListeners();
  };

  componentWillUnmount = () => {
    Signal.clearData(this);
  };

  addDebugSessionListeners = () => {
    this.state.debugSession.eventStopped.connect(this.updateVisuals, this);
  };

  onActiveCellChanged = (sender: IDebugger, breakpoints: IBreakpoint[]) => {
    const { debugSession } = this.props.debugger;
    const started = debugSession.started;
    this.setState({ debugSession, breakpoints, started });
    this.addDebugSessionListeners();
  };

  onBreakpointsChanged = (sender: IDebugger, breakpoints: IBreakpoint[]) => {
    this.setState({ breakpoints });
  };

  updateVisuals = async () => {
    const { debugSession } = this.props.debugger;
    const variables = await debugSession.getVariables();
    const { currentLine, started } = debugSession;
    this.setState({ variables, started });
    this.props.debugger.addLineHighlight(currentLine);
  };

  startDebugger = async () => {
    const { debugSession } = this.props.debugger;
    console.log("Start Debugger");
    await debugSession.start();
    this.setState({
      started: debugSession.started
    });
  };

  stopDebugger = async () => {
    const { debugSession } = this.props.debugger;
    console.log("Stop Debugger");
    await debugSession.stop();
    this.setState({
      started: debugSession.started
    });
    await this.updateVisuals();
  };

  debugContinue = async () => {
    console.log("Continue");
    const { debugSession } = this.props.debugger;
    await debugSession.continue();
    await this.updateVisuals();
  };

  render() {
    return (
      <>
        <div className={DEBUGGER_HEADER_CLASS}>
          <h2>Debug</h2>
          <ToolbarButtonComponent
            enabled={!this.state.started}
            tooltip="Start Debugger"
            iconClassName="jp-BugIcon"
            onClick={this.startDebugger}
          />
          <ToolbarButtonComponent
            enabled={this.state.started}
            tooltip="Continue"
            iconClassName="jp-RunIcon"
            onClick={this.debugContinue}
          />
          <ToolbarButtonComponent
            enabled={this.state.started}
            tooltip="Stop Debugger"
            iconClassName="jp-StopIcon"
            onClick={this.stopDebugger}
          />
        </div>
        <VariablesComponent variables={this.state.variables} />
        <BreakpointsComponent
          debugSession={this.state.debugSession}
          breakpoints={this.state.breakpoints}
        />
      </>
    );
  }
}
