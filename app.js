const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(bodyParser.text());

app.post('/compile', async (req, res) => {
    const javaCode = req.body;

    try {
        await fs.writeFile('main.java', javaCode);

        const { stderr: compileError } = await exec('javac main.java');
        if (compileError) {
            console.error(`Compilation Error: ${compileError}`);
            res.status(500).send(`Compilation Error: ${compileError}`);
            return;
        }

        const { stdout, stderr: executionError } = await exec('java main');
        if (executionError) {
            console.error(`Execution Error: ${executionError}`);
            res.status(500).send(`Execution Error: ${executionError}`);
            return;
        }

        console.log(`Output: ${stdout}`);
        res.send(`Output: ${stdout}`);
    } catch (error) {
        console.error(`Server Error: ${error.message}`);
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
