'use strict';

import * as cp from 'child_process';
import * as net from 'net';
import * as path from 'path';
import { window, workspace, Disposable, DocumentFilter, ExtensionContext } from 'vscode';
import { ExecutableOptions, LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, StreamInfo, TransportKind } from 'vscode-languageclient';
import { Load, LoadController } from './load';

export function activate(context: ExtensionContext) {
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  
  console.log('Activating...');

  const serverConn = () : Thenable<StreamInfo> => {
    let editor = window.activeTextEditor;
    const langdConfig = workspace.getConfiguration('langd', editor.document.uri);
    const langdPath = langdConfig.server.path;
    let command = 'langd';
    if (!!langdPath) {
      command = path.join(langdPath, 'langd');
    }
    const args = ['start'];

    let port = 9877;

    return new Promise((res, rej) => {
      const options: cp.SpawnOptions = {
        env: {
          "LANGD_GRPC_PORT": 9876
        }
      }
      const process = cp.spawn(command, args, options);

      process.on('error', (err: Error) => {
        if (err['code'] === "ENOENT") {
          // Failed to find the binary; suggest setting the location.
        }
        console.log(err);
      });

      process.on('exit', (code, signal) => {
        if (code !== 0 || signal !== null) {
          const message = `Completed start command with code ${code} and signal ${signal}`;
          rej(new Error(message))
        }

        const client = net.createConnection({ port }, () => {
          console.log('connected to server!');
          res({ reader: client, writer: client });
        });
        // client.on('data', (data) => {
        //   console.log(data.toString());
        //   client.end();
        // });
        client.on('end', () => {
          console.log('disconnected from server');
        });
      });
    });
  }

  const options: ExecutableOptions = { detached: true, stdio: 'ignore' };
	let serverOptions: ServerOptions = serverConn;

  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: ['go'],
    synchronize: {
      // Synchronize the setting section 'langd' to the server
      configurationSection: ['langd', 'go'],
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    }
  }
  let langdClient = new LanguageClient('langd', 'Language Daemon', serverOptions, clientOptions);
  let langdClientDisposable = langdClient.start();

  langdClient.onReady().then(() => {
    let load = new Load()
    let loadController = new LoadController(load, langdClient);
  
    context.subscriptions.push(loadController);
    context.subscriptions.push(load);
  })

  context.subscriptions.push(langdClientDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivating.")
}
