'use strict';

import { window, Disposable, StatusBarItem, StatusBarAlignment } from 'vscode';
import { RequestType } from 'vscode-jsonrpc';
import { LanguageClient } from 'vscode-languageclient/lib/main';

export class Load {
  private _statusBarItem: StatusBarItem;

  public updateLoad(cpu: number, memory: number) {
    if (!this._statusBarItem) {
      this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    let editor = window.activeTextEditor;
    if (!editor) {
      this._statusBarItem.hide();
      return;
    }

    let doc = editor.document;
    if (doc.languageId !== "go") {
      this._statusBarItem.hide();
      return;
    }

    this._statusBarItem.text = `$(dashboard) ${(cpu*100).toFixed(0)}% ${memory} MB`;
    this._statusBarItem.show();
  }

  public dispose() {
    this._statusBarItem.dispose();
  }
}

export class LoadController {
  private _load: Load;
  private _disposable: Disposable;
  private _timerId: NodeJS.Timer;

  private _currentCpu: number;
  private _currentMemory: number;

  constructor(load: Load, langdClient: LanguageClient) {
    this._load = load;
    this._load.updateLoad(0, 0)

    let f = () => {
      
      langdClient.sendRequest(LoadMessageRequest.type, null).then((resp) => {
        this._currentCpu = resp.cpu;
        this._currentMemory = resp.memory;
      }, (err) => {
        // Should swallow this error?
      });

      this._onEvent();
      this._timerId = setTimeout(f, 3000);
    }
    f();

    let subscriptions: Disposable[] = [];
    window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

    this._disposable = Disposable.from(...subscriptions);
  }

  private _onEvent() {
    this._load.updateLoad(this._currentCpu, this._currentMemory);
  }

  public dispose() {
    clearTimeout(this._timerId);
    this._disposable.dispose();
  }
}

export namespace LoadMessageRequest {
  export const type = new RequestType<null, LoadResponse | null, void, void>('health/instant');
}

export interface LoadResponse {
  cpu: number;
  memory: number;
}