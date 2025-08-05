const { spawn } = require("child_process");
const path = require("path");

const pythonScriptPath = path.join(__dirname, "audio-analyser.py");
function getAudioFeatures(filePath) {
  return new Promise((resolve, reject) => {
    // Spawn a new Python process
    const pythonProcess = spawn("python", [pythonScriptPath, filePath]);

    let result = "";
    let error = "";

    // Collect data from the Python script's standard output
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    // Collect any errors from the script's standard error
    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        try {
          const errorJson = JSON.parse(error);
          return reject(errorJson.error || "Unknown Python script error");
        } catch (e) {
          return reject(error || `Python script exited with code ${code}`);
        }
      }

      try {
        const features = JSON.parse(result);
        resolve(features);
      } catch (e) {
        reject("Failed to parse JSON from Python script.");
      }
    });
  });
}

module.exports = getAudioFeatures;
