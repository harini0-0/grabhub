const { spawn } = require('child_process');

exports.runKNN = (data) => {
  return new Promise((resolve, reject) => {
    const py = spawn('./venv/bin/python3', [
      'ml/knn.py',
      JSON.stringify(data)
    ]);

    let result = '';
    let errorOutput = '';

    py.stdout.on('data', (data) => {
      result += data.toString();
    });

    py.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    py.on('close', () => {
      if (errorOutput) {
        console.error("Python Error:", errorOutput);
        return reject(errorOutput);
      }

      if (!result) {
        return reject("Empty response from Python");
      }

      try {
        const parsed = JSON.parse(result);
        resolve(parsed);
      } catch (err) {
        console.error("Invalid JSON:", result);
        reject("Invalid JSON from Python");
      }
    });
  });
};