//
// Lisp parser
//


const util = require("./util.js");


function Parser() {

    this.sym_open_paren = util.sym('(');
    this.sym_close_paren = util.sym(')');
    this.sym_open_brace = util.sym('{');
    this.sym_close_brace = util.sym('}');
    this.sym_open_bracket = util.sym('[');
    this.sym_close_bracket = util.sym(']');
    this.sym_back_quote = util.sym('`');
    this.sym_comma = util.sym(',');
    this.sym_colon = util.sym(':');
    this.sym_list = util.sym('list');
    this.sym_dict = util.sym('dict');
    this.sym_quote = util.sym('quote');
    this.sym_literal = util.sym('literal');
    this.sym_block = util.sym('block');
    this.sym_get = util.sym('get');
    this.sym_eq = util.sym('eq');
    this.sym_fun = util.sym('fun');
    this.sym_dot = util.sym('.');
    this.sym_dynamic = util.sym('dynamic');
    this.sym_if = util.sym('if');
    this.sym_cond = util.sym('cond');


    // Read and unescape a string, terminated by a character in terms
    //   state: tokenizer state
    this.unescape = (s) => {
        return s.replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\t/g, "\t");
    }


    // read a string up to one of a set of terminating substrings
    this.read_string_to = (state, terms, ec) => {
        var token = "";
        while (state.idx < state.last && terms.indexOf(state.expr[state.idx]) == -1) {
            if (state.expr[state.idx] == "\\")
                token += state.expr[state.idx++];
            token += state.expr[state.idx++];
        }
        if (state.idx < state.last)
            state.idx++;
        return this.unescape(token);
    }


    this.read_multi_line_string_to = (state, term, ec) => {
        var start = state.idx + 2,
            stop = start;
        while (stop < state.last && state.expr.substr(stop, term.length) != term)
            stop++;
        var rs = state.expr.substr(start, stop-start);
        state.idx = stop + term.length;
        if (term == '"""') {
            // Remove leading and trailing CR and adjust for indentation.
            if (rs[0] == '\n')
                rs = rs.substr(1);
            var spc = 0;
            while (rs[spc] == ' ')
                spc++;
            if (spc > 0) {
                rs = rs.substr(spc);
                var srch = RegExp("\n" + " ".repeat(spc), "g");
                rs = rs.replace(srch, "\n");
            }
            while (rs.length && rs[rs.length-1] == '\n')
                rs = rs.substring(0, rs.length-1);
        }
        return this.unescape(rs);
    }


    // Read and return the next primitive token. At this level, any Lisp
    // delimeter (in state.delims) is considered a single character token.
    this.read_next_token = (state, ec) => {
        while (state.idx < state.last && state.whitespace.indexOf(state.expr[state.idx]) != -1)
            state.idx++;
        if (state.idx >= state.last)
            return null;
        if (state.delims.indexOf(state.expr[state.idx]) != -1) {
            // single-character token at state.idx
            return state.expr[state.idx++];
        }
        var start = state.idx;
        while (state.idx < state.last && state.delims.indexOf(state.expr[state.idx]) == -1)
            state.idx++;
        return state.expr.substr(start, state.idx-start);
    }


    // Tokenize a Lisp expression into a list of separated tokens. This
    // function handles string primitives, numbers, booleans, and symbols.
    this.tokenize_expr = (expr, ec) => {
        var state = {
            expr : expr,
            idx : 0,
            last : expr.length,
            delims: " \t\r\n`'\"(){}[],:",
            whitespace: " \t\r\n"
        }
        var tokens = [],
            t = null;
        while ((t = this.read_next_token(state, ec)) != null)
            if (t == '"' || t == "'")
                if (state.expr.charAt(state.idx) == t && state.expr.charAt(state.idx+1) == t)
                    tokens.push(this.read_multi_line_string_to(state,t+t+t, ec));
                else
                    tokens.push(this.read_string_to(state, t, ec));
            else if (util.isNumericString(t))
                tokens.push(util.tonum(t))
            else if (util.isBooleanString(t))
                tokens.push(util.tobool(t))
            else
                tokens.push(util.sym(t));
        return tokens;
    }


    // Return a Lisp form, terminated by a closing paren.
    this.make_lisp_form = (state, ec) => {
        var tok = null,
            rs = [];
        while ((tok = this.parse_at(state, ec)) != null)
            if (tok == this.sym_close_paren)
                return rs;
            else
                rs.push(tok);
        console.log("Unmatched paren", state.file ?  `in : ${state.file}` : "");
        return rs;
    }


    // Return a (list...) form based on input in JSON array syntax.
    // The state is already advanced to the first character after the
    // opening bracket '['. Elements may be separated by white space or
    // commas, which are ignored, and must be terminated by a closing
    // bracket ']'.
    this.make_list_form = (state, ec) => {
        // TODO: handle [a,,,b] => (list a null null b) ???
        var list = [ this.sym_list ],
            tok = null;
        while ((tok = this.parse_at(state, ec)) != null)
            if (tok == this.sym_close_bracket)
                return list;
            else if (tok != this.sym_comma)
                list.push(tok);
    }


    // Return a (dict...) form based on input in JSON object syntax.
    // The state is already advanced to the first character after the
    // opening brace '{'. Elements may be separated by white space,
    // commas, or colons, which are all ignored, and must be terminated
    // by a closing brace '}'.
    this.make_dict_form = (state, ec) => {
        var dict = [ this.sym_dict ],
            key = null,
            val = null,
            ignore = null;
        while ((key = this.parse_at(state,ec)) != null) {
            if (key == this.sym_close_brace)
                return dict;
            if (key != this.sym_comma) {
                if (util.issymbol(key))
                    key = util.tostring(key);
                dict.push(key);
                if ((val = this.parse_at(state,ec)) == this.sym_colon)
                    val = this.parse_at(state,ec);
                dict.push(val);
            }
        }
        return dict;
    }


    // Return a (quote...) form based on backquoted input. If the input
    // is a backquoted symbol `SYM, then return (quote SYM). If the
    // input is a backquoted list `(1 (2) 3), then return (quote 1 (2) 3).
    this.make_quote_form = (state, ec) => {
        var nextForm = this.parse_at(state, ec);
        if (util.islist(nextForm) && nextForm.length > 1)
            nextForm.unshift(this.sym_quote);
        else
            nextForm = [ this.sym_quote, nextForm ];
        return nextForm;
    }


    // Parse the next token at the current state:
    //   If the next token is '(', return a lisp form (...)
    //   If the next token is '[', return a (list ...) form
    //   If the next token is '{', return a (dict ...) form
    //   If the next token is '`', return a (quote ...) form
    this.parse_at = (state, ec) => {
        if (state.idx >= state.tokens.length)
            return null;

        state.depth++;
        state.maxDepth = Math.max(state.depth, state.maxDepth);

        var tok = state.tokens[state.idx++];
        var rs = tok;
        if (tok == this.sym_open_paren)
            rs = this.make_lisp_form(state, this.sym_close_paren);
        else if (tok == this.sym_open_bracket)
            rs = this.make_list_form(state, ec)
        else if (tok == this.sym_open_brace)
            rs = this.make_dict_form(state, ec)
        else if (tok == this.sym_back_quote)
            rs = this.make_quote_form(state,ec);

        state.depth--;
        return rs;
    }


    // Parse an sexpr string by tokenizing the string, then
    // recursively traversing the token array.
    this.parse_str = (expr, ec, filename) => {
        var state = {
            tokens: this.tokenize_expr(expr, ec),
            idx: 0,
            depth: 0,
            maxDepth: 0
        }
        if (filename) {
            state.file = filename
        }
        var rs = this.parse_at(state);
        return rs;
    }


    // Top level parse
    this.parse = (expr, ec, filename) => {
        return this.parse_str(expr, ec, filename);
    }
}


exports.Parser = Parser;
exports.parse = (str) => { return new Parser().parse(str) }

