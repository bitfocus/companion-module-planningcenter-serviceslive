const { combineRgb } = require('@companion-module/base')

const { graphics } = require('companion-module-utils')

module.exports = {
	initFeedbacks() {
		let self = this
		const feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		feedbacks.item_overrun = {
			type: 'boolean',
			name: 'Plan Item Time Overrun',
			description: 'Change colors based on if the current Plan Item Time has overrun',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [],
			callback: async function (feedback) {
				let timeRemaining = self.currentState.dynamicVariables['plan_currentitem_time_remaining_seconds']

				if (timeRemaining < 0) {
					return true
				}

				return false
			},
		}

		feedbacks.showPersonPhoto = {
			name: 'Show Person Photo based on Position',
			type: 'advanced',
			options: [
				{
					type: 'dropdown',
					label: 'Position',
					id: 'position',
					default: self.CHOICES_POSITIONS[0].id,
					choices: self.CHOICES_POSITIONS,
				},
			],
			callback: async (feedback) => {
				const position = feedback.options.position

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.id === position)

				if (person && person.photo) {
					//return the png64 of the person
					return {
						png64: person.photo,
					}
				}
				//if no person found return the default image
				let defaultImage = ''

				return {
					png64: defaultImage,
				}
			},
		}

		feedbacks.showPersonPhotoWithStatus = {
			name: 'Show Person Photo based on Position (With Status)',
			type: 'advanced',
			options: [
				{
					type: 'dropdown',
					label: 'Position',
					id: 'position',
					default: self.CHOICES_POSITIONS[0].id,
					choices: self.CHOICES_POSITIONS,
				},
				{
					type: 'dropdown',
					label: 'Border Type',
					id: 'borderType',
					default: 'border',
					choices: [
						{ id: 'border', label: 'Border' },
						{ id: 'top', label: 'Top' },
						{ id: 'bottom', label: 'Bottom' },
						{ id: 'right', label: 'Right' },
						{ id: 'left', label: 'Left' },
					],
				},
				{
					type: 'number',
					label: 'Border Width',
					id: 'borderWidth',
					default: 5,
					min: 0,
					max: 25,
				},
				{
					type: 'number',
					label: 'Border Opacity',
					id: 'borderOpacity',
					default: 255,
					min: 0,
					max: 255,
				},
			],
			callback: async (feedback) => {
				const position = feedback.options.position

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.id === position)

				if (person && person.photo) {
					try {
						//return the png64 of the person
						let png64 = person.photo

						let status = person.status //C, U, D

						const photoBuffer = await graphics.parseBase64(png64, { alpha: true })

						//create the status overlay
						let statusColor = combineRgb(0, 255, 0) // Green
						if (status === 'U') {
							statusColor = combineRgb(255, 255, 0) // Yellow
						}
						if (status === 'D') {
							statusColor = combineRgb(255, 0, 0) // Red
						}

						const statusBorder = graphics.border({
							width: 224,
							height: 224,
							color: statusColor,
							size: feedback.options.borderWidth,
							opacity: feedback.options.borderOpacity,
							type: feedback.options.borderType,
							customWidth: 72,
							customHeight: 72,
						})

						//now stack them
						const stackedBuffer = graphics.stackImage([photoBuffer, statusBorder])

						//convert buffer back to png64
						const png64_new = graphics.toPNG64({ image: stackedBuffer, width: 224, height: 224 })

						return {
							png64: png64_new,
						}
					} catch (error) {
						self.log('error', 'Error building feedback: ' + error)
						console.log(error)
						console.log('person', person)
					}
				}
				//if no person found return the default image
				console.log('no person found')
				let defaultImage = ''

				return {
					png64: defaultImage,
				}
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
