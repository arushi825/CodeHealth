import * as vscode from 'vscode';
import { analyzeLocalProject } from './analyzer/index.js';
const codeCopOutput = vscode.window.createOutputChannel('Code-Cop');
export function activate(context: vscode.ExtensionContext) {
	const diagnostics = vscode.languages.createDiagnosticCollection('code-cop');

	context.subscriptions.push(diagnostics);
    const uriHandler = vscode.window.registerUriHandler({
    handleUri: async (uri) => {
        if (uri.path === '/connect') {
            const workspaceFolders = vscode.workspace.workspaceFolders;

            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage(
                    'Code-Cop: No project folder is currently open.'
                );
                return;
            }

            const workspacePath = workspaceFolders[0].uri.fsPath;
console.log(
    '[DEBUG] Current VS Code workspace:',
    workspaceFolders.map(folder => folder.uri.fsPath)
);

            await analyzeWorkspace(workspacePath, diagnostics);
        }
    }
});

context.subscriptions.push(uriHandler);
    context.subscriptions.push(codeCopOutput);

    console.log('Code-Cop extension is now active.');
const analyzeCommand = vscode.commands.registerCommand(
    'code-cop.analyzeCurrentProject',
    async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(
                'Code-Cop: No project folder is currently open.'
            );
            return;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;

        await analyzeWorkspace(workspacePath, diagnostics);
    }
);

context.subscriptions.push(analyzeCommand);
const reanalyzeCommand = vscode.commands.registerCommand(
    'code-cop.reanalyzeCurrentProject',
    async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(
                'Code-Cop: No project folder is currently open.'
            );
            return;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;

        await analyzeWorkspace(workspacePath, diagnostics);
    }
);

context.subscriptions.push(reanalyzeCommand);   
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
        const workspacePath = workspaceFolders[0].uri.fsPath;

        analyzeWorkspace(workspacePath, diagnostics);
    } 
}

async function analyzeWorkspace(
    workspacePath: string,
    diagnostics: vscode.DiagnosticCollection
) {
    try {
        console.log('Code-Cop: Starting local analysis...');

        const result: any = await analyzeLocalProject(workspacePath);

        codeCopOutput.clear();

        codeCopOutput.appendLine('CODE-COP ANALYSIS');
        codeCopOutput.appendLine('=================');
        codeCopOutput.clear();

codeCopOutput.appendLine('CODE-COP ANALYSIS');
codeCopOutput.appendLine('=================');
codeCopOutput.appendLine('');
codeCopOutput.appendLine(`Project: ${workspacePath}`);
codeCopOutput.appendLine('');

const missingDependencies = result.missingDependencies || [];
const uninstalledDependencies =
    result.localDependencies?.uninstalled || [];

codeCopOutput.appendLine('DEPENDENCY STATUS');
codeCopOutput.appendLine('-----------------');

codeCopOutput.appendLine(
    `Missing dependencies: ${missingDependencies.length}`
);

codeCopOutput.appendLine(
    `Uninstalled dependencies: ${uninstalledDependencies.length}`
);

codeCopOutput.appendLine('');

if (missingDependencies.length > 0) {
    codeCopOutput.appendLine('MISSING DEPENDENCIES');
    codeCopOutput.appendLine('--------------------');

    for (const dependency of missingDependencies) {
        codeCopOutput.appendLine(
            `- ${dependency.package}`
        );

        codeCopOutput.appendLine(
            `  Used in: ${
                dependency.files?.join(', ') || 'unknown file'
            }`
        );

        codeCopOutput.appendLine(
            `  Fix: Add "${dependency.package}" to the appropriate package.json`
        );

        codeCopOutput.appendLine('');
    }
}

if (uninstalledDependencies.length > 0) {
    codeCopOutput.appendLine(
        'DECLARED BUT NOT INSTALLED'
    );
    codeCopOutput.appendLine(
        '--------------------------'
    );

    for (const dependency of uninstalledDependencies) {
        codeCopOutput.appendLine(
            `- ${dependency.package}`
        );

        codeCopOutput.appendLine(
            `  Location: ${dependency.packageFile}`
        );

        const packageDirectory = dependency.packageFile
            ? dependency.packageFile
                .replace(/\\/g, '/')
                .replace(/\/package\.json$/, '')
            : '';

        const installCommand = packageDirectory
            ? `cd ${packageDirectory} && npm install ${dependency.package}`
            : `npm install ${dependency.package}`;

        codeCopOutput.appendLine(
            `  Fix: ${installCommand}`
        );

        codeCopOutput.appendLine('');
    }
}

codeCopOutput.appendLine('OTHER ANALYSIS');
codeCopOutput.appendLine('--------------');

const lintErrors = (result.lintResults || [])
    .reduce(
        (total: number, lint: any) =>
            total + (lint.errors || 0),
        0
    );

const lintWarnings = (result.lintResults || [])
    .reduce(
        (total: number, lint: any) =>
            total + (lint.warnings || 0),
        0
    );

codeCopOutput.appendLine(
    `Lint errors: ${lintErrors}`
);

codeCopOutput.appendLine(
    `Lint warnings: ${lintWarnings}`
);

codeCopOutput.appendLine('');

codeCopOutput.appendLine(
    'Code-Cop analysis completed.'
);

codeCopOutput.show(true);

        diagnostics.clear();

        // Lint diagnostics
        for (const lintResult of result.lintResults || []) {
            for (const detail of lintResult.details || []) {
                const filePath = vscode.Uri.file(
                    vscode.Uri.file(workspacePath).with({
                        path: `${vscode.Uri.file(workspacePath).path}/${detail.file}`
                    }).fsPath
                );

                const severity =
                    detail.severity === 'error'
                        ? vscode.DiagnosticSeverity.Error
                        : vscode.DiagnosticSeverity.Warning;

                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(
                        Math.max((detail.line || 1) - 1, 0),
                        Math.max((detail.column || 1) - 1, 0),
                        Math.max((detail.line || 1) - 1, 0),
                        Math.max((detail.column || 1), 0)
                    ),
                    detail.message,
                    severity
                );

                diagnostic.source = 'Code-Cop';

                const existing = diagnostics.get(filePath) || [];
                diagnostics.set(filePath, [
                    ...existing,
                    diagnostic
                ]);
            }
        }

        // Missing dependency diagnostics
        for (const dependency of result.missingDependencies || []) {
            for (const file of dependency.files || []) {
                const filePath = vscode.Uri.file(
                    vscode.Uri.file(workspacePath).with({
                        path: `${vscode.Uri.file(workspacePath).path}/${file}`
                    }).fsPath
                );

                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(0, 0, 0, 1),
                    `${dependency.package}: ${dependency.explanation}`,
                    vscode.DiagnosticSeverity.Warning
                );

                diagnostic.source = 'Code-Cop';

                const existing = diagnostics.get(filePath) || [];
                diagnostics.set(filePath, [
                    ...existing,
                    diagnostic
                ]);
            }
        }
        // Uninstalled dependency diagnostics
for (const dependency of result.localDependencies?.uninstalled || []) {
    if (!dependency.packageFile) {
        continue;
    }

    const filePath = vscode.Uri.file(
        vscode.Uri.file(workspacePath).with({
            path: `${vscode.Uri.file(workspacePath).path}/${dependency.packageFile}`
        }).fsPath
    );

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        `${dependency.package}: ${dependency.explanation}`,
        vscode.DiagnosticSeverity.Warning
    );

    diagnostic.source = 'Code-Cop';

    const existing = diagnostics.get(filePath) || [];
    diagnostics.set(filePath, [
        ...existing,
        diagnostic
    ]);
}

        vscode.window.showInformationMessage(
            'Code-Cop: Project analysis completed.'
        );
    } catch (error) {
        console.error('Code-Cop analysis error:', error);

        vscode.window.showErrorMessage(
            `Code-Cop analysis failed: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
    }
}
export function deactivate() {}