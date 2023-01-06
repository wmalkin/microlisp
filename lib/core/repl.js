//
// Simple REPL interface for node.js application.
//


const readline = require("readline"),
      path = require("path"),
      fs = require("fs"),
      util = require("./util.js");


function readline_history(rl) {
    let history_path = path.resolve(process.cwd(), '.history')

    let oldAddHistory = rl._addHistory;

    rl._addHistory = function() {
        let last = rl.history[0];
        let line = oldAddHistory.call(rl);

        if (line.length > 0 && line != last) {
            fs.appendFileSync(history_path, `${line}\n`)
        }
        return line;
    }
    let history = []
    try {
        history = fs.readFileSync(history_path, 'utf8').split('\n').reverse().slice(0, rl.historySize)
    } catch (e) { }

    history = [... new Set(history)];
    fs.writeFileSync(history_path, `${[... history].reverse().join('\n')}\n`)
    rl.history = history
}


function prepare_lisp(line) {
    line = line.trim();
    if (line.length) {
        if (line[0] == '!')
            line = '(prt ' + line.substr(1) + ')';
        else if (line[0] != '(')
            line = '(' + line + ')';
    }
    console.log(">>", line);
    return line;
}


let repl = null;
function repl_start(process_line) {
    let self = this
    if (repl) {
        repl.close()
    }
    // process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");

    repl = readline.createInterface({
        prompt: 'ml > ',
        input: process.stdin,
        output: process.stdout,
        historySize: 5000
    });
    readline_history(repl)
    repl.prompt();

    repl.on('line', async function(line) {
        line = prepare_lisp(line);
        let result = await process_line(line)
        if (result != null && result != undefined)
        	console.log(util.form_to_str(result));
        repl.prompt();
    })

    let signintCount = 0
    let sigintTimer = null
    repl.on('SIGINT', ()=> {
        signintCount++;
        if (signintCount >= 2) {
            console.log("exit");
            process.exit();
        }
        clearTimeout(sigintTimer)
        sigintTimer = setTimeout(() => signintCount = 0, 1500)
    });
    return repl
}


module.exports = {
    start: repl_start
}

