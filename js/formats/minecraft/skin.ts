import { CanvasFrame } from "../../lib/CanvasFrame"
import StateMemory from "../../util/state_memory";
import { setProjectTitle } from "../../interface/interface"
import { getAllGroups } from "../../outliner/types/group"
import { DefaultCameraPresets } from "../../preview/preview"
import { MinecraftEULA } from "../../preview/preview_scenes"
import { TextureGenerator } from "../../texturing/texture_generator"
import { Panel, Panels } from "../../interface/panels";
import { Blockbench } from "../../api";
import { FormResultValue } from "../../interface/form";

type SkinPreset = {
	display_name: string
	pose?: boolean
	model?: string
	model_java?: string
	model_bedrock?: string
	variants?: {
		[key: string]: {
			name: string
			model: string
		}
	}
}
export const skin_presets: Record<string, SkinPreset> = {};

type SkinPoseData = Record<string, ArrayVector3 | {rotation: ArrayVector3, offset: ArrayVector3}>
const DefaultPoses: Record<string, SkinPoseData> = {
	none: {
		Waist: [0, 0, 0],
		Head: [0, 0, 0],
		Body: [0, 0, 0],
		RightArm: [0, 0, 0],
		LeftArm: [0, 0, 0],
		RightLeg: [0, 0, 0],
		LeftLeg: [0, 0, 0],
	},
	natural: {
		Waist: [0, 0, 0],
		Head: [6, -5, 0],
		Body: [0, 0, 0],
		RightArm: [10, 0, 0],
		LeftArm: [-12, 0, 0],
		RightLeg: [-11, 0, 2],
		LeftLeg: [10, 0, -2],
	},
	walking: {
		Waist: [0, 0, 0],
		Head: [-2, 0, 0],
		Body: [0, 0, 0],
		RightArm: [-35, 0, 0],
		LeftArm: [35, 0, 0],
		RightLeg: [42, 0, 2],
		LeftLeg: [-42, 0, -2]
	},
	crouching: {
		Waist: {rotation: [-28, 0, 0], offset: [0, -1, 1]},
		Head: {rotation: [23, 0, 0], offset: [0, -3, 1]},
		Body: {rotation: [0, 0, 0], offset: [0, -1, 1]},
		RightArm: {rotation: [12, 0, 0], offset: [0, -1, 1]},
		LeftArm: {rotation: [-20, 0, 0], offset: [0, -1, 1]},
		RightLeg: [-14, 0, 0],
		LeftLeg: [14, 0, 0],
	},
	sitting: {
		Waist: [0, 0, 0],
		Head: [5.5, 0, 0],
		Body: [0, 0, 0],
		RightArm: [36, 0, 0],
		LeftArm: [36, 0, 0],
		RightLeg: [72, -18, 0],
		LeftLeg: [72, 18, 0]
	},
	jumping: {
		Waist: [0, 0, 0],
		Head: [20, 0, 0],
		Body: [0, 0, 0],
		RightArm: {rotation: [-175, 0, -20], offset: [0, 2, 0]},
		LeftArm: {rotation: [-170, 0, 15], offset: [0, 2, 0]},
		RightLeg: {rotation: [-5, 0, 15], offset: [0, -1, 0]},
		LeftLeg: {rotation: [2.5, 0, -10], offset: [0, 6, -3.75]}
	},
	aiming: {
		Waist: [0, 0, 0],
		Head: [8, -35, 0],
		Body: [-2, 0, 0],
		RightArm: {rotation: [97, -17, -2], offset: [-1, 1, -1]},
		LeftArm: [104, -44, -10],
		RightLeg: {rotation: [2.5, 0, 0], offset: [0, 1, -2]},
		LeftLeg: [-28, 0, 0]
	},
};

export const codec = new Codec('skin_model', {
	name: 'Skin Model',
	remember: false,
	compile(options) {
		if (options === undefined) options = 0;
		type BoneData = {
			name: string
			parent?: string
			pivot?: ArrayVector3
			rotation?: ArrayVector3
			reset?: boolean
			mirror?: boolean
			cubes?: CubeData[]
		}
		type CubeData = {
			origin: ArrayVector3
			size: ArrayVector3
			inflate?: number
		}
		let entitymodel = {
			name: Project.geometry_name.replace(/\./, '_'),
			texturewidth: Project.texture_width,
			textureheight: Project.texture_height,
			external_textures: Texture.all.filter(t => t.pbr_channel == 'color').map(tex => {
				return tex.path.replace(/\\/g, '/').split('textures/')[1];
			}),
			eyes: [
				[5, 5],
				[9, 5]
			],
			bones: undefined as undefined | BoneData[]
		}
		let bones = []

		let groups = getAllGroups();

		groups.forEach(function(g) {
			if (g.type !== 'group') return;
			//Bone
			let bone: BoneData = {
				name: g.name
			}
			bone.name = g.name
			if (g.parent.type === 'group') {
				bone.parent = g.parent.name
			}
			bone.pivot = g.origin.slice()
			bone.pivot[0] *= -1
			if (!g.rotation.allEqual(0)) {
				bone.rotation = [
					-g.rotation[0],
					-g.rotation[1],
					g.rotation[2]
				]
			}
			if (g.reset) bone.reset = true;
			if (g.mirror_uv) bone.mirror = true;

			//Elements
			let cubes = []
			for (let obj of g.children) {
				if (obj.export && obj instanceof Cube) {
					let template = Codecs.bedrock.compileCube(obj, g);
					cubes.push(template)
				}
			}
			if (cubes.length) {
				bone.cubes = cubes
			}
			bones.push(bone)
		})

		if (bones.length) {
			entitymodel.bones = bones
		}
		this.dispatchEvent('compile', {model: entitymodel, options});
		return entitymodel
	},
	// @ts-ignore
	parse(data: any, resolution: number, texture_file: undefined | false | {name: string, path: string, content: string}, pose = true, layer_template) {
		this.dispatchEvent('parse', {model: data});
		Project.texture_width = data.texturewidth || 64;
		Project.texture_height = data.textureheight || 64;
		if (data.texture_resolution_factor) resolution *= data.texture_resolution_factor;

		Interface.Panels.skin_pose.inside_vue.pose = Project.skin_pose = pose ? 'natural' : 'none';

		let bones = {}
		let template_cubes = {};

		if (data.bones) {
			let included_bones = []
			data.bones.forEach(function(b) {
				included_bones.push(b.name)
			})
			data.bones.forEach(function(b, bi) {
				let group = new Group({
					name: b.name,
					origin: b.pivot,
					rotation: (pose && b.pose) ? b.pose : b.rotation
				}).init()
				group.isOpen = true;
				bones[b.name] = group
				if (b.pivot) {
					group.origin[0] *= -1
				}
				group.rotation[0] *= -1;
				group.rotation[1] *= -1;
				
				group.mirror_uv = b.mirror === true
				group.reset = b.reset === true
				group.skin_original_origin = group.origin.slice() as ArrayVector3;

				if (b.cubes) {
					b.cubes.forEach(function(cube) {

						let base_cube = Codecs.bedrock.parseCube(cube, group);
						template_cubes[Cube.all.indexOf(base_cube)] = cube;

					})
				}
				if (b.children) {
					b.children.forEach(function(cg) {
						cg.addTo(group)
					})
				}
				let parent_group: 'root' | OutlinerNode = 'root';
				if (b.parent) {
					if (bones[b.parent]) {
						parent_group = bones[b.parent]
					} else {
						data.bones.forEach(function(ib) {
							if (ib.name === b.parent) {
								ib.children && ib.children.length ? ib.children.push(group) : ib.children = [group]
							}
						})
					}
				}
				group.addTo(parent_group)
			})
		}
		if (!Cube.all.find(cube => cube.box_uv)) {
			Project.box_uv = false;
		}
		let texture: Texture | undefined;
		if (typeof texture_file == 'object') {
			texture = new Texture().fromFile(texture_file).add(false);
		} else if (texture_file != false && resolution) {
			texture = generateTemplate(
				Project.texture_width*resolution,
				Project.texture_height*resolution,
				template_cubes,
				data.name,
				data.eyes,
				layer_template
			)
		}
		for (let index in template_cubes) {
			if (template_cubes[index].visibility === false) {
				Cube.all[index].visibility = false;
			}
		}
		if (texture) {
			texture.load_callback = function() {
				Modes.options.paint.select();
			}
		}
		if (data.camera_angle) {
			// @ts-ignore
			Preview.selected.loadAnglePreset(DefaultCameraPresets.find(p => p.id == data.camera_angle))
		}
		Canvas.updateAllBones()
		Canvas.updateVisibility()
		setProjectTitle()
		updateSelection()
	},
})
codec.export = null;
codec.rebuild = function(model_id: string, pose?: string, pose_data?: SkinPoseData) {
	let [preset_id, variant] = model_id.split('.');
	let preset = skin_presets[preset_id];
	let model_raw = preset.model || (variant == 'java' ? preset.model_java : preset.model_bedrock) || preset.variants[variant].model;
	let model = JSON.parse(model_raw);
	// @ts-ignore
	codec.parse(model, undefined, true, pose && pose !== 'none');
	if (pose_data) {
		loadPose(pose_data);
		Panels.skin_pose.inside_vue.pose = Project.skin_pose = pose ?? '';
	} else if (pose && pose !== 'none' && pose !== 'natural') {
		setTimeout(() => {
			setDefaultPose(pose);
		}, 1)
	}
}
codec.getPoseData = getPoseData;


export const format = new ModelFormat('skin', {
	name: 'Multicraft Character',
	description: 'Multicraft build and mine game',
	icon: 'icon-player',
	category: 'minecraft',
	target: ['Multicraft build and mine game'],
	format_page: {
		content: [
			{type: 'h3', text: 'Multicraft Character'},
			{text: 'Multicraft build and mine game'}
		]
	},
	can_convert_to: false,
	model_identifier: false,
	bone_rig: true,
	box_uv: true,
	centered_grid: true,
	single_texture: true,
	integer_size: true,
	rotate_cubes: false,
	edit_mode: false,
	pose_mode: true,
	codec
})
format.new = function() {
	skin_dialog.show();
	return true;
}
skin_presets;


function setDefaultPose(pose_id: string) {
	let angles = DefaultPoses[pose_id];
	loadPose(angles);
	Panels.skin_pose.inside_vue.pose = pose_id;
	Project.skin_pose = pose_id;
}
function loadPose(pose_data: SkinPoseData) {
	Panels.skin_pose.inside_vue.pose = '';
	Group.all.forEach(group => {
		if (!group.skin_original_origin) return;

		type BoneData = {rotation: ArrayVector3, offset: ArrayVector3};
		let bone_data: BoneData | ArrayVector3 = pose_data[group.name]
			|| pose_data[group.name.replace(/\s/g, '')]
			|| {rotation: [0, 0, 0], offset: [0, 0, 0]};
		if (bone_data instanceof Array) {
			bone_data = {rotation: bone_data as ArrayVector3, offset: [0, 0, 0]};
		}
		let offset: ArrayVector3 = group.skin_original_origin.slice().V3_subtract(group.origin);
		offset.V3_add(bone_data.offset);
		
		group.extend({rotation: bone_data.rotation});
		group.origin.V3_add(offset);
		let child_cubes = group.children.filter(c => c instanceof Cube);
		for (let cube of child_cubes) {
			cube.origin.V3_add(offset);
			cube.from.V3_add(offset);
			cube.to.V3_add(offset);
		}
	});
	Canvas.updateView({
		groups: Group.all,
		group_aspects: {transform: true},
		elements: Outliner.elements,
		element_aspects: {transform: true},
		selection: true
	})
}
function getPoseData(): SkinPoseData {
	const data: SkinPoseData = {};
	for (let group of Group.all) {
		if (!group.skin_original_origin) continue;
		let offset = group.origin.slice().V3_subtract(group.skin_original_origin);
		let rotation = group.rotation.slice() as ArrayVector3;
		if (offset.allEqual(0) == false) {
			data[group.name] = {
				offset, rotation
			}
		} else if (rotation.allEqual(0) == false) {
			data[group.name] = rotation;
		}
	}
	return data;
}

export function generateTemplate(width = 64, height = 64, cubes, name = 'name', eyes, layer_template): Texture {

	let texture = new Texture({
		internal: true,
		name: name+'.png'
	})

	let canvas = document.createElement('canvas')
	let ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;

	if (Project.box_uv) {
		Cube.all.forEach((cube, i) => {
			let template_cube = cubes[i];
			if (layer_template || !template_cube.layer) {
				TextureGenerator.paintCubeBoxTemplate(cube, texture, canvas, null, template_cube.layer);
			}
		})
	} else if (cubes[0] && !cubes[0].layer) {
		ctx.fillStyle = TextureGenerator.face_data.up.c1;
		ctx.fillRect(0, 0, width, height)
		ctx.fillStyle = TextureGenerator.face_data.up.c2;
		ctx.fillRect(1, 1, width-2, height-2)
	}
	if (eyes) {
		let res_multiple = canvas.width/Project.texture_width;
		ctx.fillStyle = '#cdefff';
		eyes.forEach(eye => {
			ctx.fillRect(
				eye[0]*res_multiple,
				eye[1]*res_multiple,
				(eye[2]||2)*res_multiple,
				(eye[3]||2)*res_multiple
			)
		})
	}
	let dataUrl = canvas.toDataURL();
	texture.fromDataURL(dataUrl).add(false);
	return texture;
}

export const model_options: Record<string, string> = {};
let selected_model = '';
export const skin_dialog = new Dialog({
	title: tl('dialog.skin.title'),
	id: 'skin',
	form: {
		resolution: {label: 'dialog.create_texture.resolution', type: 'select', value: 1, options: {
			1: 'generic.default',
			16: '16x',
			32: '32x',
			64: '64x',
			128: '128x',
		}},
		resolution_warning: {
			type: 'info', text: 'dialog.skin.high_res_texture',
			condition: (form) => form.resolution > 16
		},
		texture_source: {
			label: 'dialog.skin.texture_source',
			type: 'select',
			options: {
				template: 'dialog.skin.texture_source.template',
				upload_texture: 'dialog.skin.texture_file',
			}
		},
		texture_file: {
			label: 'dialog.skin.texture_file',
			condition: result => result.texture_source == 'upload_texture',
			type: 'file',
			extensions: ['png'],
			readtype: 'image',
			filetype: 'PNG',
			return_as: 'file'
		},
		pose: {type: 'checkbox', label: 'dialog.skin.pose', value: true},
		layer_template: {type: 'checkbox', label: 'dialog.skin.layer_template', value: false}
	},
	onConfirm: function(result) {
		result.model = 'steve';
		if (newProject(format)) {
			let preset = skin_presets.steve;
			let model = JSON.parse(preset.model);
			let resolution = result.resolution;
			if (resolution == 1) {
				resolution = 16;
			}
			let texture: string | undefined | false;
			if (result.texture_source == 'upload_texture') {
				texture = result.texture_file;
			}
			// @ts-ignore
			codec.parse(model, resolution / 16, texture, result.pose, result.layer_template);
			Project.skin_model = 'steve';
		}
	},
	onCancel() {
		Blockbench.Format = 0;
		Settings.updateSettingsInProfiles();
	}
});
// @ts-ignore
format.setup_dialog = skin_dialog;

type SkinPose = {
	name: string
	data: SkinPoseData
}
StateMemory.init('skin_poses', 'array');

BARS.defineActions(function() {
	new Mode('pose', {
		icon: 'emoji_people',
		default_tool: 'rotate_tool',
		category: 'navigate',
		condition: () => Format && Format.pose_mode,
	})

	new Action('toggle_skin_layer', {
		icon: 'layers_clear',
		category: 'edit',
		condition: {formats: ['skin']},
		click: function () {
			let edited = [];
			Cube.all.forEach(cube => {
				if (cube.name.toLowerCase().includes('layer')) {
					edited.push(cube);
				}
			})
			if (!edited.length) return;
			Undo.initEdit({elements: edited});
			let value = !edited[0].visibility;
			edited.forEach(cube => {
				cube.visibility = value;
			})
			Undo.finishEdit('Toggle skin layer');
			Canvas.updateVisibility()
		}
	})
	new Action('convert_minecraft_skin_variant', {
		icon: 'compare_arrows',
		category: 'edit',
		condition: () => false,
		click() {
			let is_slim = Cube.all.find(c => c.name.match(/arm/i)).size(0) == 3;
			new Dialog('convert_minecraft_skin_variant', {
				title: 'action.convert_minecraft_skin_variant',
				form: {
					model: {
						label: 'dialog.skin.model',
						type: 'select',
						value: is_slim ? 'steve' : 'alex',
						options: {
							steve: skin_presets.steve.display_name,
							alex: skin_presets.alex.display_name,
						}
					},
					adjust_texture: {
						label: 'dialog.convert_skin.adjust_texture',
						type: 'checkbox',
						value: true,
					}
				},
				onConfirm(result) {
					let right_arm = Group.all.find(g => g.name == 'Right Arm')?.children?.filter(el => el instanceof Cube) ?? [];
					let left_arm = Group.all.find(g => g.name == 'Left Arm')?.children?.filter(el => el instanceof Cube) ?? [];
					let elements = right_arm.concat(left_arm);
					Undo.initEdit({elements});
					for (let cube of right_arm) {
						cube.to[0] = result.model == 'alex' ? 7 : 8;
					}
					for (let cube of left_arm) {
						cube.from[0] = result.model == 'alex' ? -7 : -8;
					}
					Canvas.updateView({elements: right_arm.concat(left_arm), element_aspects: {geometry: true, uv: true}, selection: true});
					Undo.finishEdit('Convert Minecraft skin model');

					if (result.adjust_texture) {
						let textures = Texture.all.filter(tex => tex.selected || tex.multi_selected);
						if (!textures.length) textures = [Texture.getDefault()]
						if (!textures[0]) return;
						
						const arm_uv_positions: [number, number][] = [
							[40, 16],
							[40, 32],
							[32, 48],
							[48, 48],
						];
						type Translation = {area: [number, number, number, number], offset: [number, number]};
						let translations: Translation[];
						if (result.model == 'alex') {
							translations = [
								{area: [6, 0, 10, 16], offset: [-1, 0]},
								{area: [9, 0, 2, 4], offset: [-1, 0]},
								{area: [13, 4, 2, 12], offset: [-1, 0]},
							];
						} else {
							translations = [
								{area: [5, 0, 10, 16], offset: [1, 0]},
								{area: [9, 0, 2, 4], offset: [1, 0]},
								{area: [13, 4, 2, 12], offset: [1, 0]},
							];
						}
						Undo.initEdit({textures, bitmap: true});
						for (let texture of textures) {
							if (texture.layers_enabled) {
								texture.layers_enabled = false;
								texture.selected_layer = null;
								texture.layers.empty();
							}
							texture.edit(() => {
								let ctx = texture.ctx;
								for (let position of arm_uv_positions) {
									for (let translation of translations) {
										let data = ctx.getImageData(
											position[0] + translation.area[0],
											position[1] + translation.area[1],
											translation.area[2],
											translation.area[3],
										);
										ctx.putImageData(data,
											position[0] + translation.area[0] + translation.offset[0],
											position[1] + translation.area[1] + translation.offset[1]
										);
									}
									if (result.model == 'alex') {
										ctx.clearRect(position[0] + 10, position[1] + 0, 2, 4);
										ctx.clearRect(position[0] + 14, position[1] + 4, 2, 12);
									}
								}
							}, {no_undo: true});
						}
						UVEditor.vue.layer = null;
						updateSelection();
						Undo.finishEdit('Convert Minecraft skin texture');
					}
				}
			}).show();
		}
	})
	new Action('export_minecraft_skin', {
		icon: 'icon-player',
		category: 'file',
		condition: () => Format == format && !!Texture.all[0],
		click: function () {
			Texture.all[0].save(true);
		}
	})
	
	let explode_skin_model = new Toggle('explode_skin_model', {
		icon: () => 'open_in_full',
		category: 'edit',
		condition: {formats: ['skin']},
		default: false,
		onChange(exploded_view) {
			Undo.initEdit({elements: Cube.all, exploded_view: !exploded_view});
			Cube.all.forEach(cube => {
				let center = [
					cube.from[0] + (cube.to[0] - cube.from[0]) / 2,
					cube.from[1],
					cube.from[2] + (cube.to[2] - cube.from[2]) / 2,
				]
				let offset = cube.name.toLowerCase().includes('leg') ? 1 : 0.5;
				center.V3_multiply(exploded_view ? offset : -offset/(1+offset));
				cube.from.V3_add(center as ArrayVector3);
				cube.to.V3_add(center as ArrayVector3);
			})
			Project.exploded_view = exploded_view;
			Undo.finishEdit(exploded_view ? 'Explode skin model' : 'Revert exploding skin model', {elements: Cube.all, exploded_view: exploded_view});
			Canvas.updateView({elements: Cube.all, element_aspects: {geometry: true}});
			this.setIcon(this.icon);
		}
	})
	Blockbench.on('select_project', () => {
		explode_skin_model.value = !!Project.exploded_view;
		explode_skin_model.updateEnabledState();
	})

	
	new Action('custom_skin_poses', {
		icon: 'format_list_bulleted',
		category: 'view',
		condition: {formats: ['skin'], modes: ['pose']},
		click(e) {
			new Menu(this.children()).open(e.target as HTMLElement);
		},
		children() {
			let options = [];
			let memory_list = StateMemory.get('skin_poses') as SkinPose[];
			memory_list.forEach((pose: SkinPose, i: number) => {
				let option = {
					name: pose.name,
					icon: 'accessibility',
					id: i.toString(),
					click() {
						loadPose(pose.data);
					},
					children: [
						{icon: 'update', name: 'action.custom_skin_poses.update', description: 'action.custom_skin_poses.update.desc', click() {
							pose.data = getPoseData();
							StateMemory.save('skin_poses');
						}},
						{icon: 'delete', name: 'generic.delete', click() {
							memory_list.remove(pose);
							StateMemory.save('skin_poses');
						}}
					]
				}
				options.push(option);
			})
			
			options.push(
				'_',
				'add_custom_skin_pose'
			);
			return options;
		}
	})
	new Action('add_custom_skin_pose', {
		icon: 'add',
		category: 'view',
		condition: {formats: ['skin'], modes: ['pose']},
		click(e) {
			Blockbench.textPrompt('generic.name', 'new pose', value => {
				let pose: SkinPose = {
					name: value,
					data: getPoseData()
				};
				let memory_list = StateMemory.get('skin_poses') as SkinPose[];
				memory_list.push(pose);
				StateMemory.save('skin_poses');
			})
		}
	})
})

Interface.definePanels(function() {
	new Panel('skin_pose', {
		icon: 'icon-player',
		condition: {modes: ['pose']},
		default_position: {
			slot: 'right_bar',
			float_position: [0, 0],
			float_size: [300, 80],
			height: 80,
			sidebar_index: 1,
		},
		toolbars: [
			new Toolbar('skin_pose', {
				children: [
					'custom_skin_poses',
					'add_custom_skin_pose'
				]
			})
		],
		component: {
			data() {return {
				pose: 'default'
			}},
			methods: {
				setPose(pose) {
					setDefaultPose(pose);
				}
			},
			template: `
				<div>
					<ul id="skin_pose_selector">
						<li :class="{selected: pose == 'none'}" @click="setPose('none')" title="${tl('panel.skin_pose.none')}"><div class="pose_icon" style="mask-image: url('./assets/poses/none.svg');"/></li>
						<li :class="{selected: pose == 'natural'}" @click="setPose('natural')" title="${tl('panel.skin_pose.natural')}"><div class="pose_icon" style="mask-image: url('./assets/poses/natural.svg');"/></li>
						<li :class="{selected: pose == 'walking'}" @click="setPose('walking')" title="${tl('panel.skin_pose.walking')}"><div class="pose_icon" style="mask-image: url('./assets/poses/walking.svg');"/></li>
						<li :class="{selected: pose == 'crouching'}" @click="setPose('crouching')" title="${tl('panel.skin_pose.crouching')}"><div class="pose_icon" style="mask-image: url('./assets/poses/crouching.svg');"/></li>
						<li :class="{selected: pose == 'sitting'}" @click="setPose('sitting')" title="${tl('panel.skin_pose.sitting')}"><div class="pose_icon" style="mask-image: url('./assets/poses/sitting.svg');"/></li>
						<li :class="{selected: pose == 'jumping'}" @click="setPose('jumping')" title="${tl('panel.skin_pose.jumping')}"><div class="pose_icon" style="mask-image: url('./assets/poses/jumping.svg');"/></li>
						<li :class="{selected: pose == 'aiming'}" @click="setPose('aiming')" title="${tl('panel.skin_pose.aiming')}"><div class="pose_icon" style="mask-image: url('./assets/poses/aiming.svg');"/></li>
					</ul>
				</div>
			`
		}
	})
})

// Source: https://github.com/Mojang/bedrock-samples/, licensed under the Minecraft EULA
// With modifications for usability

// Clipbench.setText(compileJSON(Codecs.skin_model.compile({raw: false})).replace(/\n/g, '\n\t'))

skin_presets.steve = {
	display_name: 'Character',
	pose: true,
	model: `{
		"name": "steve",
		"texturewidth": 64,
		"textureheight": 64,
		"eyes": [
			[9, 11],
			[13, 11]
		],
		"bones": [
			{
				"name": "Waist",
				"color": 0,
				"pivot": [0, 12, 0],
				"pose": [0, 0, 0]
			},
			{
				"name": "Head",
				"parent": "Waist",
				"color": 1,
				"pivot": [0, 24, 0],
				"pose": [-6, 5, 0],
				"cubes": [
					{"name": "Head", "origin": [-4, 24, -4], "size": [8, 8, 8], "uv": [0, 0]},
					{"name": "Hat Layer", "visibility": false, "origin": [-4, 24, -4], "size": [8, 8, 8], "uv": [32, 0], "inflate": 0.5, "layer": true}
				]
			},
			{
				"name": "Body",
				"parent": "Waist",
				"color": 3,
				"pivot": [0, 24, 0],
				"cubes": [
					{"name": "Body", "origin": [-4, 12, -2], "size": [8, 12, 4], "uv": [16, 16]},
					{"name": "Body Layer", "visibility": false, "origin": [-4, 12, -2], "size": [8, 12, 4], "uv": [16, 32], "inflate": 0.25, "layer": true}
				]
			},
			{
				"name": "Right Arm",
				"parent": "Waist",
				"color": 5,
				"pivot": [-5, 22, 0],
				"pose": [-10, 0, 0],
				"cubes": [
					{"name": "Right Arm", "origin": [-8, 12, -2], "size": [4, 12, 4], "uv": [40, 16]},
					{"name": "Right Arm Layer", "visibility": false, "origin": [-8, 12, -2], "size": [4, 12, 4], "uv": [40, 32], "inflate": 0.25, "layer": true}
				]
			},
			{
				"name": "Left Arm",
				"parent": "Waist",
				"color": 0,
				"pivot": [5, 22, 0],
				"pose": [12, 0, 0],
				"cubes": [
					{"name": "Left Arm", "origin": [4, 12, -2], "size": [4, 12, 4], "uv": [32, 48]},
					{"name": "Left Arm Layer", "visibility": false, "origin": [4, 12, -2], "size": [4, 12, 4], "uv": [48, 48], "inflate": 0.25, "layer": true}
				]
			},
			{
				"name": "Right Leg",
				"color": 6,
				"pivot": [-1.9, 12, 0],
				"pose": [11, 0, 2],
				"cubes": [
					{"name": "Right Leg", "origin": [-3.9, 0, -2], "size": [4, 12, 4], "uv": [0, 16]},
					{"name": "Right Leg Layer", "visibility": false, "origin": [-3.9, 0, -2], "size": [4, 12, 4], "uv": [0, 32], "inflate": 0.25, "layer": true}
				]
			},
			{
				"name": "Left Leg",
				"color": 7,
				"pivot": [1.9, 12, 0],
				"pose": [-10, 0, -2],
				"cubes": [
					{"name": "Left Leg", "origin": [-0.1, 0, -2], "size": [4, 12, 4], "uv": [16, 48]},
					{"name": "Left Leg Layer", "visibility": false, "origin": [-0.1, 0, -2], "size": [4, 12, 4], "uv": [0, 48], "inflate": 0.25, "layer": true}
				]
			}
		]
	}`
};
model_options.steve = "Character";
