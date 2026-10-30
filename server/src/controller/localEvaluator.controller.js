import fs from "fs";
import path from "path";
import { evaluateProject } from "../service/evaluator.service.js";
import {
  readNodeDependencies,
  findUninstalledDependencies,
} from "../service/dependency.service.js";

const LocalEvaluation = async (req, res) => {
  try {
    const projectPath = req.body?.projectPath;
    const clientIp = req.ip;

if (
  clientIp !== "127.0.0.1" &&
  clientIp !== "::1" &&
  clientIp !== "::ffff:127.0.0.1"
) {
  return res.status(403).json({
    message: "Local evaluation is only available from this machine",
  });
}

    if (!projectPath) {
      return res.status(400).json({
        message: "Project path is required",
      });
    }

    const absolutePath = path.resolve(projectPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        message: "Project path does not exist",
      });
    }

    if (!fs.statSync(absolutePath).isDirectory()) {
      return res.status(400).json({
        message: "Project path must be a directory",
      });
    }

    console.log(
      `[Local Evaluation] Started for: ${absolutePath}`
    );

    const result = await evaluateProject(absolutePath, { isLocal: true });

    const nodeDependencies = readNodeDependencies(absolutePath);

    const uninstalledDependencies =
      findUninstalledDependencies(
        absolutePath,
        nodeDependencies
      );
console.log(
  "[DEBUG] Raw uninstalled dependencies from dependency.service:",
  JSON.stringify(uninstalledDependencies, null, 2)
);
    result.localDependencies = {
      uninstalled: uninstalledDependencies,
    };

    console.log(
      `[Local Evaluation] Uninstalled dependencies: ${uninstalledDependencies.length}`
    );

    console.log(
  "[Local Evaluation] Uninstalled dependency details:",
  uninstalledDependencies
);

    console.log(
      `[Local Evaluation] Completed for: ${absolutePath}`
    );

    return res.status(200).json({ result });
  } catch (error) {
    console.error(
      `[Local Evaluation] Error: ${error.message || error}`
    );

    return res.status(500).json({
      message: error.message || "Local evaluation failed",
    });
  }
};

export default LocalEvaluation;