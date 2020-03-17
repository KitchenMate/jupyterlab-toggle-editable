import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import {INotebookTools, NotebookPanel, INotebookModel} from '@jupyterlab/notebook';
import { DocumentRegistry} from '@jupyterlab/docregistry';
import React from 'react';
import { ReactWidget} from '@jupyterlab/apputils';

const plugin: JupyterFrontEndPlugin<void> = {
	activate,
	id: 'jupyterlab-toggle-editable:buttonPlugin',
	requires: [NotebookPanel.IContentFactory, INotebookTools],
	autoStart: true
};

export class MyDropdown extends ReactWidget {
	constructor(panel: NotebookPanel) {
		super();
		console.log({panel});
		this.panel = panel;	
		this.panel.model.metadata.changed.connect(this.metadataChanged, this);
		this.versions = [];
		this.activeVersion = {};
	}
	private panel: NotebookPanel;
	public versions: any;
	public activeVersion: any;
	metadataChanged(sender: any, args: any) {
		let versions = this.panel.model.metadata.get("s3_versions");
		this.activeVersion = this.panel.model.metadata.get("s3_active_version") || {};
		console.log({activeVersion: this.activeVersion});
		if (!versions) return;
		this.versions = versions;
		console.log("METADATA CHANGED....");
		this.update();
	}
	versionSelected(version: any) {
		this.panel.model.metadata.set("s3_active_version", version);
	}
	render() {
		console.log("Rendering...");
		console.log(this.versions);
		const options = this.versions.map((version: any) => {
			console.log({activeVersion: this.activeVersion, version});
			return(
				<option key={version.version_id} value={version.version_id} onClick={this.versionSelected.bind(this, version)}>
					{version.timestamp}
				</option>
			);
		});
		console.log("LENGTH: ", options.length)
		if (options.length == 0) {
			return (<b>{options.length}</b>)
		} else {
			return (<select value={this.activeVersion.version_id}>{options}</select>)	
		}
	}
}

class VersionSelectDropdownExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
	constructor(app: JupyterFrontEnd) {
		this.app = app;
	}
	readonly app: JupyterFrontEnd;
	createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): any {
		// const versionDropdown = new ToolbarButton({
		// 	className: 'versionSelectDropdown',
		// 	iconClass: 'fa fa-fast-forward',
		// 	onClick: () => {
		// 		console.log("Version Dropdown Clicked!")
		// 	},
		// 	tooltip: 'Run All Cells'
		// });
		const myDropdown = new MyDropdown(panel);
		panel.toolbar.insertItem(6, 'test', myDropdown);
		console.log({panel});
		// panel.toolbar.insertItem(6, 'versionSelectDropdown', versionDropdown);
	}
}

function activate (app: JupyterFrontEnd, cellTools: INotebookTools, panel: NotebookPanel) {

	const commandID = 'toggle-editable';
	console.log({cellTools});
	const dropdownExtension = new VersionSelectDropdownExtension(app);
	app.docRegistry.addWidgetExtension('Notebook', dropdownExtension);
	app.commands.addCommand(commandID, {
		label: 'Toggle Read Only',
		execute: () => {
			console.log({app})
			let activeCell = cellTools.activeCell;
			activeCell.readOnly = !activeCell.readOnly;
		}
	});
	
	app.contextMenu.addItem({
		command: commandID,
		selector: '.jp-Cell'
	});

	console.log({app})
}

export default plugin;
