const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;

const app = express();
const PORT = 3000;


const logs = [];

app.use(bodyParser.text());

app.use(express.static('public'));

app.post('/compile', async (req, res) => {
    const javaCode = req.body;

    try {
        await fs.writeFile('main.java', javaCode);

        const { stderr: compileError } = await exec('javac main.java');
        if (compileError) {
            console.error(`Compilation Error: ${compileError}`);
            res.status(500).send(`Compilation Error: ${compileError}`);
            logs.push(`Compilation Error: ${compileError}`);
            return;
        }

        const { stdout, stderr: executionError } = await exec('java main');
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
