// get the code mirror editor of a curently selected cell
function C() { return IPython.notebook.get_selected_cell().code_mirror; };

// Change the mode of all current and future CodeMirror instances
// Emacs users can use this function as just to('emacs') so long as they've
// required/loaded emacs.js from CodeMirror
function to(mode) {
    var mode = mode || 'vim'
    // first let's apply vim mode to all current cells
    function to_mode(c) { return c.code_mirror.setOption('keyMap', mode);};
    IPython.notebook.get_cells().map(to_mode);
    // apply the mode to future cells created
    IPython.Cell.options_default.cm_config.keyMap = mode;
}

function getCSS(path) {
    $('<link/>', {
       rel: 'stylesheet',
       type: 'text/css',
       href: path
    }).appendTo('head');
}

// I messed around with trying to get requireJS going here, but gave up and
// just using this answer from SO 
// http://stackoverflow.com/questions/11803215/how-to-include-multiple-js-files-using-jquery-getscript-method

require(['codemirror/lib/codemirror','codemirror/keymap/vim', 'codemirror/addon/search/search', 
        'codemirror/addon/search/searchcursor', 'codemirror/addon/wrap/hardwrap', 'codemirror/addon/selection/active-line',
        'codemirror/addon/dialog/dialog'], function init_vimception(CodeMirror) { 

var p = "/static/components/codemirror/addon/";

//$.when(
// Grab the CodeMirror vim keymap
//$.getScript(p + "../keymap/vim.js"),
// also make search work via /
//$.getScript(p + "search/search.js"),
//$.getScript(p + "search/searchcursor.js"),

// TODO: hook-up gq to perform a harwrap
//$.getScript(p + "wrap/hardwrap.js"),
//$.getScript(p + "selection/active-line.js"),

//$.getScript(p + "display/fullscreen.js"),
getCSS(p + "display/fullscreen.css");
getCSS(p + "dialog/dialog.css");
//$.getScript(p + "dialog/dialog.js"),


    //$.Deferred(function( deferred ){
        //$( deferred.resolve );
    //})
//).then(function success()

console.log('Great success');

IPython.CodeCell.options_default.cm_config.foldGutter = true;
IPython.CodeCell.options_default.cm_config.gutters =  ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];

IPython.Cell.prototype.at_top = function () {
    var cm = this.code_mirror;
    var cursor = cm.getCursor();
    if (cursor.line === 0) {
        return true;
    }
    return false;
};


IPython.Cell.prototype.at_bottom = function () {
    var cm = this.code_mirror;
    var cursor = cm.getCursor();
    if (cursor.line === (cm.lineCount()-1)) {
        return true;
    }
    return false;
};
// on all code mirror instances on this page, apply the function f
function all_cm(f) {
    // apply f to every code mirror instance. f takes one parameter
    IPython.notebook.get_cells().map(function (c) { f(c.code_mirror); } );
}


to('vim');

function vim_up(env, event) {
    //debugger;
    var cell = IPython.notebook.get_selected_cell();
    if (cell.code_mirror.options.keyMap === 'vim-insert' && cell.code_mirror.state.vim.insertMode) { 
        cell.code_mirror.replaceSelection(event.shiftKey ? String.fromCharCode(event.keyCode).toUpperCase() 
                : String.fromCharCode(event.keyCode).toLowerCase())
        return true;
    }else{
        if (cell && cell.at_top() && cell.code_mirror.options.keyMap === 'vim') {
            //console.log('inside the business logic k');
            //event.preventDefault();
            IPython.notebook.command_mode();
            IPython.notebook.select_prev();
            IPython.notebook.edit_mode();
            var newcell = IPython.notebook.get_selected_cell();

            if ( newcell.code_mirror.state.vim.insertMode ) {
                // do magic here to get out of insert mode
                CodeMirror.Vim.handleKey(newcell.code_mirror, '<Esc>');
            }
            return false;
        } else {
            cell.code_mirror.execCommand('goLineUp');
            return false;
            //return CodeMirror.Pass;
        }
    }
}

function vim_down(env, event) {
    //debugger;
    var cell = IPython.notebook.get_selected_cell();
    if (cell.code_mirror.options.keyMap === 'vim-insert' && cell.code_mirror.state.vim.insertMode) { 
        cell.code_mirror.replaceSelection(event.shiftKey ? String.fromCharCode(event.keyCode).toUpperCase() 
                : String.fromCharCode(event.keyCode).toLowerCase())
        return true;
    } else {
        if (cell && cell.at_bottom() && cell.code_mirror.options.keyMap === 'vim') {
            //event.preventDefault();
            IPython.notebook.command_mode();
            IPython.notebook.select_next();
            IPython.notebook.edit_mode();
            var newcell = IPython.notebook.get_selected_cell();

            if ( newcell.code_mirror.state.vim.insertMode ) {
                // do magic here to get out of insert mode
                CodeMirror.Vim.handleKey(newcell.code_mirror, '<Esc>');
            }
            return false;
        } else {
            cell.code_mirror.execCommand('goLineDown');
            return false;
            //return CodeMirror.Pass;
        }
    }
}

var cmd = IPython.keyboard_manager.command_shortcuts;
var edit = IPython.keyboard_manager.edit_shortcuts;
var def_cmd = IPython.keyboard_manager.get_default_command_shortcuts();
var def_edit = IPython.keyboard_manager.get_default_edit_shortcuts();

var m = '(vim) ';
var edit_shortcuts = {
    'k' : {
        help    : m + 'up a line, even across cells',
        help_index : 'AA',
        handler : vim_up
    },
    'j' : {
        help    : m + 'down a line, even across cells',
        help_index : 'AA',
        handler : vim_down
    }

};
var command_shortcuts = {
/*
    'y' :  {
        help    : m + def_cmd['y'].help,
        help_index : 'AA',
        handler : def_cmd['y'].handler
    }

*/

};

edit.add_shortcuts(edit_shortcuts);
cmd.add_shortcuts(command_shortcuts);
//edit.add_shortcuts('k', def_edit['up'].handler);
//edit.add_shortcut('j', def_edit['down'].handler);

// N.B. This code looks fairly simple, but it took me forever to 
// figure out how to do this, 
// 
// there's a problem here, Ctrl-[ is already handled by CodeMirror by the time we 
// (IPython.keyboard_manager) get it CodeMirror issues signals on mode change, 
// so we have to hook into that to get Ctrl-[
//edit.remove_shortcut('Ctrl-[');
try {
    edit.remove_shortcut('Esc');
} catch(err) {
    console.log("Error removing Esc shortcut; ignoring");
}

CodeMirror.commands.leaveInsertOrEdit = function (cm) {
    if ( cm.state.vim.insertMode ) {
        // do magic here to get out of insert mode
        CodeMirror.Vim.handleKey(cm, '<Esc>');
    } else {
        IPython.notebook.command_mode();
        IPython.notebook.focus_cell();
    }
};
        
//C().options.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
all_cm( function (cm) {
    cm.options.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
    cm.options.extraKeys['Esc'] = 'leaveInsertOrEdit';
    if ( CodeMirror.defaults.extraKeys === null ) { 
        CodeMirror.defaults.extraKeys = {};
    }
    // TODO: make this change permanent
    // this part seems to be ignore when adding a new cell
    // - alternative solution would be to listen for NewCell events and rerun the CM function on it
    // - it could also be the case that when we instatiate CodeMirror, we somehow leave out CM.defaults.extraKeys
    IPython.CodeCell.options_default.cm_config.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
    IPython.TextCell.options_default.cm_config.extraKeys['Ctrl-['] = 'leaveInsertOrEdit';
    IPython.CodeCell.options_default.cm_config.extraKeys['Esc'] = 'leaveInsertOrEdit';
    IPython.TextCell.options_default.cm_config.extraKeys['Esc'] = 'leaveInsertOrEdit';
});

// On blur, make sure we go back to command mode for CodeMirror (in case user clicked away)
// TODO: Make this permanent - how to get CodeMirror to do this for new cells created after
all_cm( function (cm) {
    cm.on('blur', function(cm) {
        // TODO: I wish I understood a better way to do this, but fake pressing Escape work
        try {
            CodeMirror.keyMap['vim-insert']['Esc'](cm);
        } catch (err) {}
        try {
            CodeMirror.keyMap['vim']['Esc'](cm);
        } catch (err) {}
        cm.setOption('styleActiveLine', false);
        if (cm.getOption("fullScreen")) {
            cm.setOption('fullScreen', false); 
            // fullScreen the newly selected code mirror (doesn't work)
            //setTimeout(100, function() {
            //    console.log(IPython.notebook.get_selected_cell().code_mirror);
            //    IPython.notebook.get_selected_cell().code_mirror.setOption('fullScreen', true); 
            //});
        }
    });
    cm.on('focus', function(cm) {
        // RW - Changed to false.  I don't like it.
        cm.setOption('styleActiveLine', false);
    });
});

// 'i' by default interrupts the kernel (what Ctrl-C does at the terminal)
//cmd.remove_shortcut('i');
cmd.add_shortcut('i', def_cmd.enter);

// Delete this crap -- I want my copy / paste back
delete CodeMirror.keyMap['vim']['Ctrl-C'];

// not quite what we want - 'i' requires a double-tap
// add documentation for this.
cmd.add_shortcut('ctrl-i' /* was ctrl-c */, function(e) { IPython.notebook.kernel.interrupt(); return false});


function focus_last(e) {
    var cells = IPython.notebook.get_cells();
    cells[cells.length-1].focus_cell();
};

function focus_first(e) {
    var cells = IPython.notebook.get_cells();
    cells[0].focus_cell();
};

function combo_tap(combo, action) {
    var that = this;
    var timeout;
    function f() {
        console.log('f called once');
        
        // redo this so that when an action is performed, we restore the original combo
        cmd.add_shortcut(combo[1], 
                function() { console.log("doing action", combo); reset(); action(); timeout.clear();} );
        timeout = setTimeout(function () {
            console.log('resetting f');
            reset();
            //cmd.add_shortcut(combo[0], reset)
        }, 800);
    }
    function reset(e) {
        //cmd.remove_shortcut(combo[0]);
        console.log('reset called');
        //if (timeout) {
        //    console.log('resetting aborted');
        //    clearTimeout(timeout);
        //    timeout = null;
        //}
        //that(combo, action); 
        cmd.add_shortcut(combo[0], f);
    }
    console.log("combo tap for", combo);
    
    reset();
};
cmd.add_shortcut('shift-g', focus_last);
//combo_tap('gg', focus_first);
cmd.add_shortcut('g,g', focus_first);

// XXX: the way combo tap is currently implemented, this won't work
// need a more generic mechanism for combo-taps with common prefixes
// combo_tap('gq', f();
//cmd.remove_shortcut('d');
// cut
//combo_tap('dd', IPython.notebook.cut_cell);
cmd.add_shortcut('d,d', "ipython.cut-selected-cell");
//$.proxy(function() { 
 //   console.log("Here!"); IPython.notebook.cut_cell(); 
  //  }, 
   //         IPython.notebook));

// copy
//combo_tap('yy', IPython.notebook.copy_cell);
try {
    cmd.remove_shortcut('y');
} catch (err) {}
cmd.add_shortcut('y,y', "ipython.copy-selected-cell");

// paste
cmd.add_shortcut('p', "ipython.paste-cell-after");
cmd.add_shortcut('shift-p', "ipython.paste-cell-before");

// undo
cmd.add_shortcut('u', "ipython.undo-last-cell-deletion");

// Join (merge down with cell below)
cmd.add_shortcut('shift-j', IPython.notebook.merge_cell_below);

//edit.add_shortcut('k', def_edit['up'].handler);
//[edit.add_shortcut('j', def_edit['down'].handler);

CodeMirror.prototype.save = function() { 
    IPython.notebook.save_checkpoint()
};

function focus_last(e) {
    var cells = IPython.notebook.get_cells();
    cells[cells.length-1].focus_cell();
};

function focus_first(e) {
    console.log('focus first called');
    var cells = IPython.notebook.get_cells();
    cells[0].focus_cell();
};


cmd.add_shortcut('shift-g', focus_last);
//combo_tap('gg', focus_first);

// get rid of the default Ctrl-W binding
// this only works for Firefox
$(document).ready(function() {
	$(this).bind('keypress', function(e) {
		var key = (e.keyCode ? e.keyCode : e.charCode);
		if (key == '119' && e.ctrlKey) {
			return false;
		}
	});
});

/*
window.addEventListener("beforeunload", function( event ) {
    var press = jQuery.Event("keypress");
    press.ctrlKey = false;
    press.which = 27; // escape
    $(document).trigger(press);
    event.returnValue = "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    event.returnValue +="\nX  Chrome sucks at captruring Ctrl-W, sorry  X";
    event.returnValue += "\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
});*/

// update the keyboard shortcuts
//IPython.quick_help = new IPython.QuickHelp();

//IPython.CodeCell.options_default.cm_config.styleActiveLine = true;

all_cm( function (cm) {
    cm.setOption('foldGutter', true);
    cm.setOption('gutters',  ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]);
    cm.options.extraKeys["Ctrl-F"] = function(cm){ cm.foldCode(cm.getCursor()); };
    var wrapOptions = {column: 78, killTrailingSpace: true, wrapOn: /\s\S|[^\.\d]/ };
    // XXX: add a hardwrap-range to this as well
    cm.options.extraKeys["F2"] =  function(cm) { cm.wrapParagraph(cm.getCursor(), wrapOptions); };
    //cm.options.extraKeys["["] =  function(cm) { cm.setOption("fullScreen", !cm.getOption("fullScreen"))};
    IPython.CodeCell.options_default.cm_config.extraKeys['Ctrl-F'] = function(cm){ cm.foldCode(cm.getCursor()); };
    IPython.TextCell.options_default.cm_config.extraKeys['Ctrl-F'] = function(cm){ cm.foldCode(cm.getCursor()); };

    // todo - do this for new cells as well
    // support this a :only? turn off full screen on blur
    cm.options.extraKeys["F11"] =  function(cm) { cm.setOption("fullScreen", !cm.getOption("fullScreen"))};
    cm.options.extraKeys["Ctrl-A"] =  function(cm) {
          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        };
    //all_cm( function (cm) {
});

//setTimeout(function() {IPython.notebook.get_selected_cell().set_input_prompt('vim');}, 200)

/*
$("#ipython_notebook").find('img').remove('#vim');
$("#ipython_notebook").append('<img id="vim" src="http://www.vim.org/images/vim_on_fire.gif"'
        // XXX: add it to the distribution
        // /static/custom/vim_on_fire.gif" 
    + ' style="'
    + 'position: absolute; left: 51px; top: -10px; height: initial;">');
$("#vim").click( function () {$(this).hide()});
*/


// XXX: Autowrapping is kind of broken - you can write a line that will have
// its last word (if it's 1 or 2 characters just go back and forth between the
// current and the next lines)
//all_cm(function (cm) {
//    var wait, options = {column: 78, killTrailingSpace: true, wrapOn: /\s\S|[^\.\d]/};
//    cm.on("change", function(cm, change) {
//      clearTimeout(wait);
//      wait = setTimeout(function() {
//        console.log(cm.wrapParagraphsInRange(change.from, CodeMirror.changeEnd(change), options));
//      }, 300);
//    });
//});

});


// at_top  and at_bottom methods for ipython-vimception
/**
 * @method at_top
 * @return {Boolean}
 */
Cell.prototype.at_top = function () {
    var cm = this.code_mirror;
    var cursor = cm.getCursor();
    if (cursor.line === 0 && cm.findPosV(cursor, -1, 'line').hitSide) {
        return true;
    } else {
        return false;
    }
};

/**
 * @method at_bottom
 * @return {Boolean}
 * */
Cell.prototype.at_bottom = function () {
    var cm = this.code_mirror;
    var cursor = cm.getCursor();
    if (cursor.line === (cm.lineCount()-1) && cm.findPosV(cursor, 1, 'line').hitSide) {
        return true;
    } else {
        return false;
    }
};
