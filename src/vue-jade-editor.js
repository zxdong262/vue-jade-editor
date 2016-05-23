var jadeEditor = {

	default: {

		indent: '    '
		,template: 
			'<div class="jade-editor">' +
				'<textarea rows="{{rows}}" class="{{cls}}" @keyup="keyup($event)" @keydown="keydown($event)" @click="syncSelection()" @change="syncSelection()">{{content}}</textarea>' +
			'</div>'

		,data: function() {
			return {
				_textarea: false
				,nSelStart: 0
				,nSelEnd: 0
				,cls: 'form-control'
			}
		}
		,methods: {

			keyup: function(event) {

				var keycode = event.keyCode

				,kf = jadeEditor.keycodes.keyup[keycode]

				if(!kf) return this.updateSyntax()

				this['handleKeyEvt_' + kf](event, this.updateSyntax)

			}

			,keydown: function(event) {

				var keycode = event.keyCode

				,kf = jadeEditor.keycodes.keydown[keycode]

				if(!kf) return

				this['handleKeyEvt_' + kf](event, this.updateSyntax)

			}

			,getTextArea: function() {
				if(this._textarea) return this._textarea 
				this._textarea = this.$el.children[0]
				return this._textarea
			}

			,syncSelection: function() {
				var
				dom = this.getTextArea()
				,nSelStart = dom.selectionStart

				this.nSelStart = dom.selectionStart
				this.nSelEnd = dom.selectionEnd
			}

			,updateSyntax: function() {
				var
				dom = this.getTextArea()
				this.content = dom.value
				this.syncSelection()
				this.autoGrow()
			}

			,autoGrow: function() {

				var dom = this.getTextArea()

				if (dom.scrollHeight > dom.clientHeight) {
					dom.style.height = (dom.scrollHeight + 10) + 'px'
				}
				//end
			}

			,handleKeyEvt_tab: function(event, cb) {

				event.preventDefault()

				var th = this
				,dom = this.getTextArea()
				,indent = jadeEditor.default.indent
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				,targetText = sOldText.substring(nSelStart, nSelEnd)
				,formerChar = sOldText.substring(nSelStart - 1, nSelStart)

				//press tab with no selection
				if(formerChar !== '\n' && formerChar !== '') {
					dom.value = sOldText.substring(0, nSelStart) + indent + sOldText.substring(nSelEnd)
				}

				else {
					targetText = indent + targetText.replace(/\n/g, '\n' + indent)
					dom.value = sOldText.substring(0, nSelStart) + targetText + sOldText.substring(nSelEnd)
					dom.selectionStart = nSelStart === nSelEnd?nSelStart + indent.length:nSelStart
					dom.selectionEnd = nSelStart === nSelEnd?nSelStart + indent.length:nSelStart + targetText.length
				}

				cb.call(th)
				//end
			}

			,handleKeyEvt_enter: function(event, cb) {

				var th = this
				,indent = jadeEditor.default.indent
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				,targetTextArr = sOldText.substring(0, nSelStart).split('\n')
				,len = targetTextArr.length
				,currentLine = targetTextArr[len - 2]
				,spaceReg = /^( *)/
				,matchArr = currentLine.match(spaceReg)
				,spaces = matchArr[1]

				dom.value = sOldText.substring(0, nSelStart) + spaces + indent + sOldText.substring(nSelEnd)
				dom.selectionStart = nSelStart + spaces.length + indent.length
				dom.selectionEnd = dom.selectionStart
				

				cb.call(th)
				//end
			}

			,handleKeyEvt_backspace: function(event, cb) {

				var th = this
				,indent = jadeEditor.default.indent
				,indentLength = indent.length
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value
				,targetText = sOldText.substring(0, nSelStart)
				,targetTextArr = targetText.split('\n')
				,len = targetTextArr.length
				,currentLine = targetTextArr[len - 1]
				,isEmptyLine = /^ *$/.test(currentLine)
				,currentLineStart = nSelStart - currentLine.length
				,currentLineToSelStartText = sOldText.substring(currentLineStart, nSelStart)
				,currentLineToSelStartTextLen = currentLineToSelStartText.length

				if(!isEmptyLine || currentLineToSelStartTextLen < indentLength) return

				event.preventDefault()

				dom.value = 
					sOldText.substring(0, currentLineStart) + 
					currentLineToSelStartText.replace(indent, '') + 
					sOldText.substring(nSelEnd)

				cb.call(th)
				//end
			}

			,handleKeyEvt_open_bracket: function(event, cb) {

				var th = this
				,indent = jadeEditor.default.indent
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value
				,targetText = sOldText.substring(nSelStart, nSelEnd)

				,charOpen = event.shiftKey?'{':"["
				,charClose = event.shiftKey?'}':"]"

				event.preventDefault()

				if(!event.ctrlKey) {
					return th.insertParedContent(charOpen, charClose, cb)
				}

				var noSel = !targetText.length

				if(noSel) {
					var tarr = sOldText.substring(0, nSelStart).split('\n')
					,lent = tarr.length
					targetText = tarr[lent - 1]
					var startp = nSelStart - targetText.length
					,btext = sOldText.substring(0, startp)
				}

				var targetTextArr = targetText.split('\n')
				,len = targetTextArr.length
				,res = []
				,reg = new RegExp('^' + indent)
				for(var i = 0;i < len;i ++) {
					res.push(targetTextArr[i].replace(reg, ''))
				}
				targetText = res.join('\n')

				if(noSel) {
					dom.value = 
						btext +
						targetText + 
						sOldText.substring(nSelEnd)

					dom.selectionStart = btext.length
					dom.selectionEnd = btext.length
				}

				else {
					dom.value = 
						sOldText.substring(0, nSelStart) +
						targetText + 
						sOldText.substring(nSelEnd)


					dom.selectionStart = nSelStart
					dom.selectionEnd = nSelStart + (nSelStart === nSelEnd?0:targetText.length + 1)
				}

				cb.call(th)
				//end
			}

			,handleKeyEvt_close_bracket: function(event, cb) {

				if(event.ctrlKey) return this.handleKeyEvt_tab(event, cb)

			}

			//insert paired tag, like i, b, small, span...
			//<i> + selection + </i>
			,insertParedTag: function(tag, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value
				,len1 = tag.length + 2
				,len2 = len1 * 2 + 1

				dom.value = 
					sOldText.substring(0, nSelStart) + 
					'<' + tag + '>' + 
					sOldText.substring(nSelStart, nSelEnd) + 
					'</' + tag + '>' + 
					sOldText.substring(nSelEnd)

				dom.selectionStart = nSelStart === nSelEnd?nSelStart + len1:nSelStart
				dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?len1:len2)
				cb.call(th)

				//end

			}

			//insert paired content, like '' "" [], {}
			//' + selection + '
			,insertParedContent: function(contentLeft, contentRight, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value
				,len1 = contentLeft.length
				,len2 = len1 + contentRight.length

				dom.value = 
					sOldText.substring(0, nSelStart) +
					contentLeft + 
					sOldText.substring(nSelStart, nSelEnd) + 
					contentRight +
					sOldText.substring(nSelEnd)

				dom.selectionStart = nSelStart === nSelEnd?nSelStart + len1:nSelStart
				dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?len1:len2)
				cb.call(th)

				//end

			}

			,handleKeyEvt_single_quote: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				,char = event.shiftKey?'"':"'"

				event.preventDefault()

				th.insertParedContent(char, char, cb)
				//end

			}

			,handleKeyEvt_left_bracket: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				if(!event.shiftKey) return cb.call(th)

				event.preventDefault()

				th.insertParedContent('(', ')', cb)
				//end

			}

			,handleKeyEvt_i: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				if(!event.ctrlKey) return cb.call(th)

				event.preventDefault()

				th.insertParedTag('i', cb)

				//end
			}

			,handleKeyEvt_b: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				if(!event.ctrlKey) return cb.call(th)
					
				event.preventDefault()

				th.insertParedTag('b', cb)

				//end
			}
		}
		,events: {

			'je-insert-content': function(content, id, select) {

				if(id !== this.id) return

				var
				dom = this.getTextArea()
				,nSelStart = this.nSelStart
				,nSelEnd = this.nSelEnd
				,sOldText = dom.value

				dom.value = 
					sOldText.substring(0, nSelStart) +
					content + 
					sOldText.substring(nSelEnd)

				dom.selectionStart = select?nSelStart:nSelEnd + content.length
				dom.selectionEnd = nSelEnd + content.length
				this.updateSyntax()
			}
			
			,'je-tab': function(id) {

					if(id !== this.id) return

					this.handleKeyEvt_tab({
						preventDefault: function() {}
					}, this.updateSyntax)
				
			}
			,'je-untab': function(id) {

					if(id !== this.id) return

					this.handleKeyEvt_open_bracket({
						preventDefault: function() {}
						,ctrlKey: true
					}, this.updateSyntax)
				
			}
			,'je-paired-tag': function(tag, id) {

					if(id !== this.id) return

					this.insertParedTag(tag, this.updateSyntax)

			}
			,'je-paired-content': function(contentLeft, contentRight, id) {

					if(id !== this.id) return

					this.insertParedContent(contentLeft, contentRight, this.updateSyntax)

			}
		}

		
	}
	,keycodes: {

		keyup: {
			13: 'enter'
			,73: 'i'
			,66: 'b'
		}

		,keydown: {
			9: 'tab'
			,8: 'backspace'
			,222: 'single_quote'
			,57: 'left_bracket'
			,219: 'open_bracket'
			,221: 'close_bracket'
		}

	}
}

jadeEditor.base = function() {

	return {

		template: jadeEditor.default.template
		,props: {
			content: String
			,rows: Number
			,id: String
		}
		,data: jadeEditor.default.data
		,events: jadeEditor.default.events
		,methods: jadeEditor.default.methods
	}

}


jadeEditor.install = function(Vue) {

	// define & register
	Vue.component('jadeeditor', jadeEditor.base())

}


if (typeof exports == "object") {
	module.exports = jadeEditor
} else if (typeof define == "function" && define.amd) {
	define([], function(){ return jadeEditor })
} else if (window.Vue) {
	window.jadeEditor = jadeEditor
}