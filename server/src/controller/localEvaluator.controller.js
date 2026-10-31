import { evaluateProject } from "../service/evaluator.service.js";

import {
    readNodeDependencies,
    findUninstalledDependencies,
} from "../service/dependency.service.js";


export const analyzeLocalProject = async (projectPath) => {

    // Run the main project evaluation locally
    const result = await evaluateProject(projectPath, {
        isLocal: true,
    });

    // Read dependencies declared in package.json
    const nodeDependencies = readNodeDependencies(projectPath);

    // Identify dependencies that are not installed
    const uninstalledDependencies = findUninstalledDependencies(
        projectPath,
        nodeDependencies
    );

    // Return the evaluation result with local dependency details
    return {
        ...result,
        localDependencies: {
            uninstalled: uninstalledDependencies,
        },
    };
};
