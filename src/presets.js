const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets() {
		let self = this
		let presets = []

		presets.plan_index = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Index in Plan',
			style: {
				text: '$(services-live:plan_index) of $(services-live:plan_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item',
			style: {
				text: '$(services-live:plan_currentitem)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem_time_length = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Length',
			style: {
				text: '$(services-live:plan_currentitem_time_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem_time_started = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Started',
			style: {
				text: '$(services-live:plan_currentitem_time_started)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.current_item_time_remaining = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Remaining',
			style: {
				text: '$(services-live:plan_currentitem_time_remaining)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'item_overrun',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets.currentitem_time_shouldfinish = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Should Finish',
			style: {
				text: '$(services-live:plan_currentitem_time_shouldfinish)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'item_overrun',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets.currentitem_key = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Key',
			style: {
				text: '$(services-live:plan_currentitem_key)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item',
			style: {
				text: '$(services-live:plan_nextitem)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem_time_length = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item Time Length',
			style: {
				text: '$(services-live:plan_nextitem_time_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem_key = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item Key',
			style: {
				text: '$(services-live:plan_nextitem_key)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		this.setPresetDefinitions(presets)
	},
}
