let s:pluginPath = expand("<sfile>:p:h")

" searches the current buffer for a mongo DSN
" line must be prefixed with //#dsn
function! s:FindDsn()
	let s:dsnLine = search("//#dsn mongodb://.*")
	if s:dsnLine > 0
		let s:dsn = getline(s:dsnLine)
		let s:dsn = matchstr(s:dsn, 'mongodb://.*')
		return s:dsn
	else
		echo "Mongo DSN not found; please prefix a line with: //#dsn mongodb://{server}/{db}"
		return ""
	endif
endfunction

" searches the current buffer for an output file
" line must be prefixed with //#dsn
function! s:FindOutputFile()
	let s:line = search('//#out .*')
	if s:line > 0
		let s:line = getline(s:line)
		let s:line = matchlist(s:line, '//#out \(.*\)')[1]
		return s:line
	else
		echo "Output file not found; please prefix a line with: //#out {output file}"
		return ""
	endif
endfunction

" find the selected query text
" 'range' tells the function to only fire once
" when in visual mode, as opposed to once per line
function! s:FindQuery() range
	" clear line breaks
	let s:query = substitute(s:GetVisualSelection(), "\n", "", "g")
	let s:query = substitute(s:query, "\r", "", "g")
	let s:query = substitute(s:query, "\t", " ", "g")

	" replace double with single quotes
	let s:query = substitute(s:query, "\"", "'", "g")

	let s:dsn = s:FindDsn()

	if (len(s:dsn) > 0 && len(s:query) > 0)
		let s:cmd = "node " . s:pluginPath . "/venode.js -d \"" . s:dsn . "\" -q \"" . s:query . "\" --pretty"
		"echo s:cmd
		let s:results = system(s:cmd)
		"echo s:results
		call s:ShowResultsInSplit(s:results)
	endif
endfunction

" we show the results in a split window
" many thanks to 'Learning Vimscript the Hard Way' by Steve Losh:
" http://learnvimscriptthehardway.stevelosh.com/chapters/52.html
" the book is a great resource
function! s:ShowResultsInSplit(text)
	let windowNum = bufwinnr("__vimongous_results__")
	if windowNum > -1
		execute(windowNum . "wincmd w")
	else
		" name our new split to be clear to the user
		split __vimongous_results__	
	endif

	" set syntax & clear
	setlocal filetype=javascript
	setlocal buftype=nofile
	normal! ggdG

	" add results
	call append(0, split(a:text, "\n"))
	normal! gg
endfunction

" gets the selected text in visual mode
" thank you to the xolox on stackoverflow
" http://stackoverflow.com/questions/1533565/how-to-get-visually-selected-text-in-vimscript
function! s:GetVisualSelection() range
	let [lnum1, col1] = getpos("'<")[1:2]
	let [lnum2, col2] = getpos("'>")[1:2]
	let lines = getline(lnum1, lnum2)
	let lines[-1] = lines[-1][: col2 - 2]
	let lines[0] = lines[0][col1 - 1:]
	return join(lines, "\n")
endfunction

" key mappings
map <silent> <leader>mq :call <SID>FindQuery()<CR>
