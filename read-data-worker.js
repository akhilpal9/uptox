/**
 * Reads JSON file line by line and passes to parent worker
 * Author: Akhilesh Pal
 */
const readline = require('readline');
const fs = require('fs');

const readInterface = readline.createInterface({
    input: fs.createReadStream('trades-data/trades.json'),
    // output: process.stdout,
    console: false
});

line_processed = 0;
readInterface.on('line', function (line) {
    ++line_processed;
    //Setting timeout of 1s
    // await new Promise(r => setTimeout(r, 1000));

    // console.log(line);
    // data = JSON.parse(line);


    // if(line_processed > 10) 
    //     process.exit(0)
    parentPort.postMessage(line);
})

readInterface.on('close', function () {
    console.log('line_processed: ', line_processed)
})
const { worker, parentPort } = require('worker_threads');