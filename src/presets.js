const { combineRgb } = require('@companion-module/base')

const png64 = require('./png64')

async function generateImages(count) {
	const imagePromises = Array.from({ length: count }, (_, i) => {
		return png64[i+1]
	})

	const images = await Promise.all(imagePromises);
	return images;
}

module.exports = {
	async initPresets() {
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

		//scheduled people feedbacks

		//first build them for the generic position number - this is for recycleable presets where you may not know the position name from plan to plan, but you want to populate buttons

		//need to generate the preset numbers for the buttons first
		let PRESET_NUMBERS = await generateImages(50)

		//let's make 1-50

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Photo Only`,
			type: 'text',
			text: `Show the photo of the person scheduled to the position number.`,
		})

		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Photo Only`,
				style: {
					text: '',
					png64: PRESET_NUMBERS[i - 1],
					pngalignment: 'center:center',
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
						feedbackId: 'showPersonPhotoPositionNumber',
						options: {
							positionNumber: i,
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Photo With Status`,
			type: 'text',
			text: `Show the photo of the person scheduled to the position number, with their status (confirmed, unconfirmed, declined).`,
		})

		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Photo With Status`,
				style: {
					text: '',
					png64: PRESET_NUMBERS[i - 1],
					pngalignment: 'center:center',
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
						feedbackId: 'showPersonPhotoPositionNumberWithStatus',
						options: {
							positionNumber: i,
							borderType: 'bottom',
							borderWidth: 25,
							borderOpacity: 255,
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Name Only`,
			type: 'text',
			text: `Presets for Generic Position Number with Person Name Only`,
		})
		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Person Name`,
				style: {
					text: `$(services-live:scheduled_position_${i})`,
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
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Name with Status Feedback`,
			type: 'text',
			text: `Shows the name of the person scheduled to the position number with status feedback (green, yellow, or red depending on if confirmed, unconfirmed, or declined).`,
		})

		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Person Name with Status`,
				style: {
					text: `$(services-live:scheduled_position_${i})`,
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
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'C', // Confirmed
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 255, 0),
						},
					},
					{
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'U', // Unconfirmed
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 255, 0),
						},
					},
					{
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'D', // Declined
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Position Name Only`,
			type: 'text',
			text: `Show the position name of the person scheduled to the position number.`,
		})
		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Position Name`,
				style: {
					text: `$(services-live:scheduled_position_${i}_position)`,
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
			presets.push(presetObj)
		}

		//now build them for team generic position number - sorted by team
		//let's make 1-30
		for (team in self.CHOICES_TEAMS) {
			let teamId = self.CHOICES_TEAMS[team].id
			let teamName = self.CHOICES_TEAMS[team].label

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Photo Only`,
				type: 'text',
				text: `Show the photo of the person scheduled to the position number for ${teamName}`,
			})

			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Photo Only`,
					style: {
						text: '',
						png64: PRESET_NUMBERS[i - 1],
						pngalignment: 'center:center',
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
							feedbackId: 'showPersonPhotoPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Photo with Status`,
				type: 'text',
				text: `Show the photo of the person scheduled to the position number for ${teamName} with status`,
			})
			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Photo with Status`,
					style: {
						text: '',
						png64: PRESET_NUMBERS[i - 1],
						pngalignment: 'center:center',
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
							feedbackId: 'showPersonPhotoPositionNumberByTeamWithStatus',
							options: {
								team: teamId,
								positionNumber: i,
								borderType: 'bottom',
								borderWidth: 25,
								borderOpacity: 255,
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Person Name Only`,
				type: 'text',
				text: `Show the name of the person scheduled to the position number for ${teamName}`,
			})

			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Person Name`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i})`,
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
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Person Name with Status`,
				type: 'text',
				text: `Shows the name of the person scheduled to the position number for ${teamName} with status feedback (green, yellow, or red depending on if confirmed, unconfirmed, or declined).`,
			})
			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Person Name with Status`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i})`,
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
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'C', // Confirmed
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 255, 0),
							},
						},
						{
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'U', // Unconfirmed
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(255, 255, 0),
							},
						},
						{
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'D', // Declined
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(255, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Position Name Only`,
				type: 'text',
				text: `Show the position name of the person scheduled to the position number for ${teamName}`,
			})

			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Position Name`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i}_position)`,
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
				presets.push(presetObj)
			}
		}

		this.setPresetDefinitions(presets)
	},
}
