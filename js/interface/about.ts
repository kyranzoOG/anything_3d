import VersionUtil from '../util/version_util'

BARS.defineActions(() => {
	new Action('about_window', {
		name: tl('dialog.settings.about') + '...',
		description: `Workbench ${Blockbench.version}`,
		icon: 'info',
		category: 'blockbench',
		click: function () {
			const data = {
				isApp,
				version_label: Blockbench.version
			};

			new Dialog({
				id: 'about',
				title: 'dialog.settings.about',
				width: 640,
				title_menu: new Menu([
					'settings_window',
					'keybindings_window',
					'about_window',
				]),
				buttons: [],
				component: {
					data() {return data},
					template: `
						<div>
							<div class="workbench_about_logo" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin: 12px auto 20px auto; text-align: center;">
								<img src="workbench_assets/workbench_grid.svg" alt="Workbench" style="width: 88px; height: 88px; filter: drop-shadow(0 0 16px rgba(190, 242, 100, 0.55));" />
								<span style="font-weight: 900; font-size: 24px; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">WORK<span style="color: #BEF264;">BENCH</span></span>
							</div>
							<p>Version <span>{{ version_label }}</span></p>

							<p style="color: var(--color-subtle_text); font-size: 1.05em; line-height: 1.6; margin: 16px 0;">
								Workbench is a dedicated low-poly 3D modeling and animation software designed for Multicraft build and mine game, stylized 3D art, and indie games. Create custom characters, textures, and models with ease.
							</p>

							<h4>SPECIAL THANKS TO</h4>
							<ul class="multi_column_list special_thanks_mentions">
								<li>Multicraft build and mine game</li>
								<li>All contributors</li>
								<li>The open-source community</li>
								<li>All translators</li>
							</ul>

							<h4>FRAMEWORKS, LIBRARIES, AND ICONS</h4>

							<p style="margin-bottom: 16px" v-if="isApp">This program is powered by <a class="open-in-browser" href="https://electronjs.org">Electron</a></p>

							<ul class="multi_column_list">
								<li><a class="open-in-browser" href="https://material.io/icons/">Material Icons</a></li>
								<li><a class="open-in-browser" href="https://fontawesome.com/icons/">Font Awesome</a></li>
								<li><a class="open-in-browser" href="https://github.com/microsoft/vscode-codicons">VSCode Codicons</a></li>
								<li><a class="open-in-browser" href="https://electronjs.org">Electron</a></li>
								<li><a class="open-in-browser" href="https://vuejs.org">Vue</a></li>
								<li><a class="open-in-browser" href="https://github.com/weibangtuo/vue-tree">Vue Tree</a></li>
								<li><a class="open-in-browser" href="https://github.com/sagalbot/vue-sortable">Vue Sortable</a></li>
								<li><a class="open-in-browser" href="https://threejs.org">ThreeJS</a></li>
								<li><a class="open-in-browser" href="https://bgrins.github.io/spectrum">Spectrum</a></li>
								<li><a class="open-in-browser" href="https://github.com/jnordberg/gif.js">gif.js</a></li>
								<li><a class="open-in-browser" href="https://github.com/mattdesl/gifenc">gifenc</a></li>
								<li><a class="open-in-browser" href="https://stuk.github.io/jszip/">JSZip</a></li>
								<li><a class="open-in-browser" href="https://github.com/rotemdan/lzutf8.js">LZ-UTF8</a></li>
								<li><a class="open-in-browser" href="https://jquery.com">jQuery</a></li>
								<li><a class="open-in-browser" href="https://jqueryui.com">jQuery UI</a></li>
								<li><a class="open-in-browser" href="https://github.com/furf/jquery-ui-touch-punch">jQuery UI Touch Punch</a></li>
								<li><a class="open-in-browser" href="https://github.com/eligrey/FileSaver.js">FileSaver.js</a></li>
								<li><a class="open-in-browser" href="https://github.com/AndrewRayCode/easing-utils">easing-utils</a></li>
								<li><a class="open-in-browser" href="https://peerjs.com">PeerJS</a></li>
								<li><a class="open-in-browser" href="https://github.com/markedjs/marked">Marked</a></li>
								<li><a class="open-in-browser" href="https://github.com/cure53/DOMPurify">DOMPurify</a></li>
								<li><a class="open-in-browser" href="https://prismjs.com">Prism</a></li>
								<li><a class="open-in-browser" href="https://github.com/akalverboer/canvas2apng">Canvas2APNG</a></li>
								<li><a class="open-in-browser" href="https://github.com/lunapaint/tga-codec">lunapaint/tga-codec</a></li>
								<li><a class="open-in-browser" href="https://github.com/koca/vue-prism-editor">Vue Prism Editor</a></li>
								<li><a class="open-in-browser" href="https://github.com/JannisX11/molangjs">MolangJS</a></li>
								<li><a class="open-in-browser" href="https://github.com/JannisX11/wintersky">Wintersky</a></li>
							</ul>

							<p style="margin-top: 20px">Released under the GPL 3.0 license</p>
						</div>`
				}
			}).show()
		}
	})
})
