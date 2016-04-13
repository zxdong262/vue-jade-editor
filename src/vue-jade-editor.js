var jadeEditor = {

	default: {

		indent: '    '
		,template: 
			'<div class="jade-editor-box">' +
				'<div class="jade-editor">' +
					'<textarea @keyup="keyup($event)" @keydown="keydown($event)">{{content}}</textarea>' +
					'<pre class="jade-editor-syntax prettyprint" lang="{{lang}}"></pre>' +
				'</div>' +
			'</div>' 
		,data: function() {
			return {
				_textarea: false
				,_pre : false
				,nSelStart: 0
				,nSelEnd: 0
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

jadeEditor.install = function(Vue) {

	// define & register
	Vue.component('jadeeditor', {

		template: jadeEditor.default.template
		,props: {
			content: String
			,lang: String
		}
		,data: jadeEditor.default.data
		,events: {

			'je-insert-content': function(content, select) {

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
				this._textarea = this.$el.children[0].children[0]
				return this._textarea
			}

			,getPre: function() {
				if(this._pre) return this._pre
				this._pre = this.$el.children[0].children[1]
				return this._pre
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
				,pre = this.getPre()

				if(!pre) return
				pre.innerHTML = dom.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
				pre.classList.remove('prettyprinted')

				this.syncSelection()
				prettyPrint(null, this.$el)
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
					dom.value = 
						sOldText.substring(0, nSelStart) +
						charOpen + 
						targetText + 
						charClose +
						sOldText.substring(nSelEnd)
					dom.selectionStart = nSelStart === nSelEnd?nSelStart + 1:nSelStart
					dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?1:2)
					return cb.call(th)
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

			,handleKeyEvt_single_quote: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				,char = event.shiftKey?'"':"'"

				event.preventDefault()

				dom.value = 
					sOldText.substring(0, nSelStart) +
					char + 
					sOldText.substring(nSelStart, nSelEnd) + 
					char +
					sOldText.substring(nSelEnd)

				dom.selectionStart = nSelStart === nSelEnd?nSelStart + 1:nSelStart
				dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?1:2)
				cb.call(th)
				//end

			}

			,handleKeyEvt_left_bracket: function(event, cb) {

				var th = this
				,dom = this.getTextArea()
				,nSelStart = dom.selectionStart
				,nSelEnd = dom.selectionEnd
				,sOldText = dom.value

				,char = event.shiftKey?'"':"'"

				if(!event.shiftKey) return cb.call(th)

				event.preventDefault()

				dom.value = 
					sOldText.substring(0, nSelStart) +
					'(' + 
					sOldText.substring(nSelStart, nSelEnd) + 
					')' +
					sOldText.substring(nSelEnd)

				dom.selectionStart = nSelStart === nSelEnd?nSelStart + 1:nSelStart
				dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?1:2)
				cb.call(th)
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

					dom.value = 
						sOldText.substring(0, nSelStart) + 
						'<i>' + 
						sOldText.substring(nSelStart, nSelEnd) + 
						'</i>' + 
						sOldText.substring(nSelEnd)

					dom.selectionStart = nSelStart === nSelEnd?nSelStart + 3:nSelStart
					dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?3:7)
					cb.call(th)

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

				dom.value = 
					sOldText.substring(0, nSelStart) + 
					'<b>' + 
					sOldText.substring(nSelStart, nSelEnd) + 
					'</b>' + 
					sOldText.substring(nSelEnd)

				dom.selectionStart = nSelStart === nSelEnd?(nSelStart + 3):nSelStart
				dom.selectionEnd = nSelEnd + (nSelStart === nSelEnd?3:7)
				cb.call(th)

				//end
			}
		}

	})
}


if (typeof exports == "object") {
	module.exports = jadeEditor
} else if (typeof define == "function" && define.amd) {
	define([], function(){ return jadeEditor })
} else if (window.Vue) {
	Vue.use(jadeEditor)
}