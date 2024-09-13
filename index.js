const express = require('express');
const fs = require('fs');
const { exec, execSync } = require('child_process');

const app = express();

app.use(express.json());

app.post('/run', async (req, res) => {
    let code = req.body.code;
    let testcases = req.body.testcases;
    let randomId = Math.floor(Math.random() * 1000000);
    let filename = `./temp/${randomId}.cpp`;
    
    try {
        fs.writeFileSync(filename, code);
    } catch (err) {
        res.status(500).send('Error writing code to file');
    }

    // Compile the code and make it executable
    execSync(`g++ ${filename} -o ./temp/${randomId} && chmod +x ./temp/${randomId}`, (err, stdout, stderr) => {
        if(err) {
            console.log(err);
            res.status(500).send('Error compiling code');
        }
    });

    let results = [];

    for (let i = 0; i < testcases.length; i++) {
        let input = testcases[i].input;
        let expectedOutput = testcases[i].output;
        let output = '';

        console.log(input);

        exec(`echo ${input} | ./temp/${randomId}`, (err, stdout, stderr) => {
            if(err) {
                console.log(err);
                res.status(500).send('Error running code');
            }

            if(stdout) {
                console.log(stdout);
                output = stdout;
            }

            results.push({
                input: input,
                output: output,
                expectedOutput: expectedOutput,
                result: output == expectedOutput
            });

            if(results.length === testcases.length) {
                // cleanup
                execSync(`rm ./temp/${randomId}.cpp ./temp/${randomId}`);
                res.send(results);
            }
        });
    }
    
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});