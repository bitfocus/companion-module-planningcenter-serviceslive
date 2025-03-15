const { combineRgb } = require('@companion-module/base')

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
			callback: (feedback) => {
				const position = feedback.options.position

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.personId === position)
				
				if (person) {
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

		self.setFeedbackDefinitions(feedbacks)
	},
}
