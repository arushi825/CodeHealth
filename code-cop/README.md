# Code-Cop

Code-Cop is a Visual Studio Code extension that connects your local
project to the Code-Cop code quality analysis platform.

It helps developers inspect their projects and view code quality
findings directly inside Visual Studio Code.

## Features

- Connects the currently opened VS Code workspace to the Code-Cop backend.
- Analyses the selected workspace using the Code-Cop evaluation pipeline.
- Displays analysis results in the Code-Cop Output Channel.
- Shows supported code diagnostics in the VS Code Problems panel.
- Provides a command to reanalyse the current project.

## How to Use

1. Open a project folder in Visual Studio Code.
2. Ensure the Code-Cop backend server is running.
3. Run the Code-Cop connect command from the Command Palette.
4. Allow the extension to send the workspace path for analysis.
5. View the results in the Code-Cop Output Channel.
6. Check the Problems panel for supported diagnostics.

## Requirements

- Visual Studio Code
- Node.js
- Code-Cop backend server running and accessible
- An opened project folder in VS Code

## Output

Code-Cop provides:
- Project analysis results.
- Code quality findings.
- Supported diagnostics in the Problems panel.
- Analysis information in the Output Channel.

## Known Limitations

- The extension currently analyses the first workspace folder.
- Analysis depends on the availability of the Code-Cop backend.
- Findings depend on the supported static analysis checks.

## Release Notes

### 0.0.1

Initial development release of the Code-Cop VS Code extension.

- Added local workspace connection.
- Added project analysis command.
- Added reanalysis command.
- Added Output Channel integration.
- Added VS Code Problems panel integration.

---

**Code-Cop — Inspect your code before it ships.**