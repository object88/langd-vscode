'use strict';

import * as path from 'path';
import { workspace, DocumentFilter, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';

const GO_MODE: DocumentFilter = { language: 'go', scheme: 'file' };

export function activate(context: ExtensionContext) {
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  
  console.log('Activating...');

	let serverOptions: ServerOptions = {  
		run : { command: '/Users/bropa18/work/src/github.com/object88/langd/langd', args: [] },
		debug: { command: '/Users/bropa18/work/src/github.com/object88/langd/langd', args: [] }
  }

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

  // // Use the console to output diagnostic information (console.log) and errors (console.error)
  // // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "langd-vscode" is now active!');

  // // The command has been defined in the package.json file
  // // Now provide the implementation of the command with  registerCommand
  // // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
  //     // The code you place here will be executed every time your command is executed

  //     // Display a message box to the user
  //     vscode.window.showInformationMessage('Hello World!');
  // });

  // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log("Deactivating.")
}