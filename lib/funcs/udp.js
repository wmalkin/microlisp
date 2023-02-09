//
// Lisp functions to wrap basic UDP communications
//

const func = require("../core/func.js"),
      ea = require("../core/ea.js");


const dgram = require("dgram"),
      client = dgram.createSocket('udp4');


function $udp_send(args, scope) {
    client.send(args[0], args[1], args[2]);
}


function $udp_on_receive(args, scope) {
    let handler = args[0];
    client.on("message", (msg, rinfo) => {
        if (msg.length) {
            ea.apply(handler, [msg, rinfo]);
        }
    })
}


func.def({ name: "udp.send", body: $udp_send });
func.def({ name: "udp.on-receive", body: $udp_on_receive });

