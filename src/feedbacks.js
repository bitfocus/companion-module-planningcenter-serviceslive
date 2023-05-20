const { combineRgb } = require('@companion-module/base')

module.exports = {
    // ##########################
    // #### Define Feedbacks ####
    // ##########################
    initFeedbacks() {
        let self = this;
        const feedbacks = {};

        const foregroundColorWhite = combineRgb(255, 255, 255) // White
        const foregroundColorBlack = combineRgb(0, 0, 0) // Black
        const backgroundColorRed = combineRgb(255, 0, 0) // Red
        const backgroundColorGreen = combineRgb(0, 255, 0) // Green
        const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		feedbacks.item_overrun = {
			type: 'boolean',
			name: 'Plan Item Time Overrun',
			description: 'Change colors based on if the current Plan Item Time has overrun',
			defaultStyle: {
				color: foregroundColorWhite,
				bgcolor: backgroundColorRed,
			},
			options: [],
			callback: async function(feedback) {
				let timeRemaining = self.currentState.dynamicVariables['plan_currentitem_time_remaining_seconds'];

				if (timeRemaining < 0) {
					return true;
				}

				return false;
			}
		}

        self.setFeedbackDefinitions(feedbacks);
    }
}