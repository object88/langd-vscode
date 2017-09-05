'use strict';

import * as net from 'net';
import * as path from 'path';
import { workspace, DocumentFilter, ExtensionContext } from 'vscode';
import { ExecutableOptions, LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, StreamInfo, TransportKind } from 'vscode-languageclient';

export function activate(context: ExtensionContext) {
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  
  console.log('Activating...');

  const serverConn = () : Thenable<StreamInfo> => {
    let port = 9877;
    return new Promise((res, rej) => {
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
      return client;
    });
  }

  const command = '/Users/bropa18/work/src/github.com/object88/langd/bin/langd';
  const args = ['start'];
  const options: ExecutableOptions = { detached: true, stdio: 'ignore' };
	let serverOptions: ServerOptions = serverConn;

  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: ['go'],
    synchronize: {
      // Synchronize the setting section 'langd' to the server
      configurationSection: 'langd',
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    }
  }
  let disposable = new LanguageClient('langd', 'Language Daemon', serverOptions, clientOptions).start();

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivating.")
}