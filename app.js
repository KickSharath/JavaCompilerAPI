const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const app = express();
const PORT = 3000;

const logs = [];
const tempDir = path.join(os.tmpdir(), 'java_compiler_temp');

// Create a temporary directory if it doesn't exist
fs.mkdir(tempDir, { recursive: true }).catch((err) => {
    console.error(`Error creating temporary directory: ${err.message}`);
});

app.use(bodyParser.text());
app.use(express.static('public'));

app.post('/compile', async (req, res) => {
    const javaCode = req.body;

    const tempFile = path.join(tempDir, 'main.java');

    try {
        await fs.writeFile(tempFile, javaCode);

        const { stderr: compileError } = await exec(`javac ${tempFile}`);
        if (compileError) {
            console.error(`Compilation Error: ${compileError}`);
            res.status(500).send(`Compilation Error: ${compileError}`);
            logs.push(`Compilation Error: ${compileError}`);
            return;
        }

        const { stdout, stderr: executionError } = await exec(`java -classpath ${tempDir} main`);
        if (executionError) {
            console.error(`Execution Error: ${executionError}`);
            res.status(500).send(`Execution Error: ${executionError}`);
            logs.push(`Execution Error: ${executionError}`);
            return;
        }

        console.log(`Output: ${stdout}`);
        res.send(`Output: ${stdout}`);
        logs.push(`Output: ${stdout}`);
    } catch (error) {
        console.error(`Server Error: ${error.message}`);
        res.status(500).send(`Server Error: ${error.message}`);
        logs.push(`Server Error: ${error.message}`);
    }
});

app.get('/logs', (req, res) => {
    res.json(logs);
});

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || PORT}`);
});
