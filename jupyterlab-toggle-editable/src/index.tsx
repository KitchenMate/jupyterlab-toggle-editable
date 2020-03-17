import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';
import {NotebookPanel, INotebookModel} from '@jupyterlab/notebook';
import { DocumentRegistry} from '@jupyterlab/docregistry';
import React from 'react';
import { ReactWidget} from '@jupyterlab/apputils';
import {IDocumentManager} from '@jupyterlab/docmanager';

const plugin: JupyterFrontEndPlugin<void> = {
	activate,
	id: 's3-versioned-notebooks:dropdownPlugin',
	requires: [NotebookPanel.IContentFactory, IDocumentManager],
	autoStart: true
};

export class S3VersionControl extends ReactWidget {
	constructor(panel: NotebookPanel, docManager: IDocumentManager) {
		super();
		this.panel = panel;
		this.docManager = docManager;
		this.panel.model.metadata.changed.connect(this.metadataChanged, this);
		this.versions = [];
	}
	private panel: NotebookPanel;
	private docManager: IDocumentManager;
	public versions: any;
	public requestedVersion: any;
	public latestVersion: any;
	public currentVersion: any;

	metadataChanged(sender: any, args: any) {
		let versions = this.panel.model.metadata.get("s3_versions");
		this.requestedVersion = this.panel.model.metadata.get("s3_requested_version");
		this.latestVersion = this.panel.model.metadata.get("s3_latest_version");
		this.currentVersion = this.panel.model.metadata.get("s3_current_version");
		if (!versions) return;
		this.versions = versions;
		this.update();
	}
	async versionSelected(version: any) {
		this.panel.model.metadata.set("s3_requested_version", version['version_id']);
		await this.panel.context.save();
		await this.closeDocument();
	}
	async closeDocument() {
		await this.panel.context.sessionContext.shutdown()
		this.panel.dispose();
		this.docManager.open(this.panel.context.path, 'notebook');
	}
	render() {
		const options = this.versions.map((version: any) => {
			return(
				<option key={version.version_id} value={version.version_id} onClick={this.versionSelected.bind(this, version)}>
					{version.timestamp}
				</option>
			);
		});
		return (<div>
			<select value={this.requestedVersion}>{options}</select>
		</div>)	
	}
}

class VersionSelectDropdownExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
	constructor(app: JupyterFrontEnd, docManager: IDocumentManager) {
		this.app = app;
		this.docManager = docManager;
	}
	readonly app: JupyterFrontEnd;
	readonly docManager: IDocumentManager;
	createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): any {
		const s3VersionControl = new S3VersionControl(panel, this.docManager);
		panel.toolbar.insertItem(6, 'version_control', s3VersionControl);
	}
}

function activate (app: JupyterFrontEnd, panel: NotebookPanel, docManager: IDocumentManager) {
	const dropdownExtension = new VersionSelectDropdownExtension(app, docManager);
	app.docRegistry.addWidgetExtension('Notebook', dropdownExtension);
}

export default plugin;
