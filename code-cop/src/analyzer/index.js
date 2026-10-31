import { evaluateProject } from "../service/evaluator.service.js";

import {
    readNodeDependencies,
    findUninstalledDependencies,
} from "../service/dependency.service.js";

export const analyzeLocalProject = async (projectPath) => {
    const result = await evaluateProject(projectPath, {
        isLocal: true,
    });

    const nodeDependencies = readNodeDependencies(projectPath);

    const uninstalledDependencies = findUninstalledDependencies(
        projectPath,
        nodeDependencies
    );

    result.localDependencies = {
        uninstalled: uninstalledDependencies,
    };

    return result;
};