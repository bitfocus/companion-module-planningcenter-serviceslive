module.exports = {
	initVariables() {
		let self = this

		let variables = [
			{ variableId: 'org_name', name: 'Organization Name' },

			{ variableId: 'plan_title', name: 'Plan Title' },
			{ variableId: 'plan_series', name: 'Plan Series' },
			//{ variableId: 'plan_times', name: 'Plan Times'},
			//{ variableId: 'plan_current_time', name: 'Plan Current Time'},

			{ variableId: 'plan_index', name: 'Plan Current Index' },
			{ variableId: 'plan_length', name: 'Plan Total Items' },

			{ variableId: 'plan_currentitem', name: 'Plan Current Item' },
			{ variableId: 'plan_currentitem_time_length', name: 'Plan Current Item Time Length' },
			{ variableId: 'plan_currentitem_time_started', name: 'Plan Current Item Time Started' },
			{ variableId: 'plan_currentitem_time_remaining', name: 'Plan Current Item Time Remaining' },
			{ variableId: 'plan_currentitem_time_remaining_seconds', name: 'Plan Current Item Time Remaining Seconds' },
			{ variableId: 'plan_currentitem_time_shouldfinish', name: 'Plan Current Item Time Should Finish' },
			{ variableId: 'plan_currentitem_key', name: 'Plan Current Item Key' },

			{ variableId: 'plan_nextitem', name: 'Plan Next Item' },
			{ variableId: 'plan_nextitem_time_length', name: 'Plan Next Item Time Length' },
			{ variableId: 'plan_nextitem_key', name: 'Plan Next Item Key' },

			{ variableId: 'last_servicetype_id', name: 'Last Controlled Service Type Id' },
			{ variableId: 'last_servicetype_name', name: 'Last Controlled Service Type Name' },
			{ variableId: 'last_plan_id', name: 'Last Controlled Plan Id' },
			{ variableId: 'last_plan_name', name: 'Last Controlled Plan Name' },
		]

		if (self.scheduledPeople.length > 0) {
			let lastPosition = ''
			let lastPositionCount = 1
			self.scheduledPeople.forEach((person) => {
				let teamName = person.teamName
				let teamNameId = teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

				let positionName = person.positionName
				let positionNameId = positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

				let teamPositionVariable = {
					variableId: 'scheduled_' + teamNameId + '_' + positionNameId,
					name: teamName + ': ' + positionName,
				}

				if (positionName === lastPosition) {
					lastPositionCount++
					teamPositionVariable.variableId += '_' + lastPositionCount
				} else {
					lastPosition = positionName
					lastPositionCount = 1
				}

				variables.push(teamPositionVariable)
			})
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables() {
		let self = this

		try {
			let variableObj = {}

			variableObj.org_name = this.currentState.dynamicVariables.organization_name

			variableObj.plan_title = this.currentState.dynamicVariables.plan_title
			variableObj.plan_series = this.currentState.dynamicVariables.plan_series
			//variableObj.plan_times = this.currentState.dynamicVariables.plan_times;
			//variableObj.plan_current_time = this.currentState.dynamicVariables.plan_current_time;

			variableObj.plan_index = this.currentState.dynamicVariables.plan_index
			variableObj.plan_length = this.currentState.dynamicVariables.plan_length

			variableObj.plan_currentitem = this.currentState.dynamicVariables.plan_currentitem
			variableObj.plan_currentitem_time_length = this.currentState.dynamicVariables.plan_currentitem_time_length
			variableObj.plan_currentitem_time_started = this.currentState.dynamicVariables.plan_currentitem_time_started
			variableObj.plan_currentitem_time_remaining = this.currentState.dynamicVariables.plan_currentitem_time_remaining
			variableObj.plan_currentitem_time_remaining_seconds =
				this.currentState.dynamicVariables.plan_currentitem_time_remaining_seconds
			variableObj.plan_currentitem_time_shouldfinish =
				this.currentState.dynamicVariables.plan_currentitem_time_shouldfinish
			variableObj.plan_currentitem_key = this.currentState.dynamicVariables.plan_currentitem_key

			variableObj.plan_nextitem = this.currentState.dynamicVariables.plan_nextitem
			variableObj.plan_nextitem_time_length = this.currentState.dynamicVariables.plan_nextitem_time_length
			variableObj.plan_nextitem_key = this.currentState.dynamicVariables.plan_nextitem_key

			variableObj.last_servicetype_id = this.lastServiceTypeId
			variableObj.last_servicetype_name = this.lastServiceTypeId
				? this.currentState.internal.services.find((service) => service.id === this.lastServiceTypeId).attributes.name
				: ''
			variableObj.last_plan_id = this.lastPlanId
			variableObj.last_plan_name = this.lastPlanId
				? this.currentState.internal.plans.find((plan) => plan.id === this.lastPlanId).attributes.dates
				: ''

			if (self.scheduledPeople.length > 0) {
				//lets build the variables for the teams and positions
				let lastPosition = ''
				let lastPositionCount = 1
				self.scheduledPeople.forEach((person) => {
					let teamName = person.teamName
					let teamNameId = teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

					let positionName = person.positionName
					let positionNameId = positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

					let variableId = 'scheduled_' + teamNameId + '_' + positionNameId

					if (positionName === lastPosition) {
						lastPositionCount++
						variableId += '_' + lastPositionCount
					} else {
						lastPosition = positionName
						lastPositionCount = 1
					}

					variableObj[variableId] = person.name
				})
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			//do something with that error
			if (this.config.verbose) {
				this.log('debug', 'Error Updating Variables: ' + error)
			}
		}
	},
}
