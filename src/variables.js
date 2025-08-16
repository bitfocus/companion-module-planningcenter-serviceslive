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
			{ variableId: 'plan_currentitem_description', name: 'Plan Current Item Description' },

			{ variableId: 'plan_nextitem', name: 'Plan Next Item' },
			{ variableId: 'plan_nextitem_time_length', name: 'Plan Next Item Time Length' },
			{ variableId: 'plan_nextitem_key', name: 'Plan Next Item Key' },
			{ variableId: 'plan_nextitem_description', name: 'Plan Next Item Description' },

			{ variableId: 'last_servicetype_id', name: 'Last Controlled Service Type Id' },
			{ variableId: 'last_servicetype_name', name: 'Last Controlled Service Type Name' },
			{ variableId: 'last_plan_id', name: 'Last Controlled Plan Id' },
			{ variableId: 'last_plan_name', name: 'Last Controlled Plan Name' },
		]

		if (self.planItemNoteCategories.length > 0) {
			//if we have note categories, then lets add them to the variables
			//console.log('planItemNoteCategories', self.planItemNoteCategories)
			self.planItemNoteCategories.forEach((category) => {
				let variableId = 'plan_currentitem_notes_' + self.sanitize(category.name)
				let variableName = 'Plan Current Item Notes - ' + category.name
				variables.push({ variableId: variableId, name: variableName })
				variableId = 'plan_nextitem_notes_' + self.sanitize(category.name)
				variableName = 'Plan Next Item Notes - ' + category.name
				variables.push({ variableId: variableId, name: variableName })
			})
		}

		if (self.scheduledPeople.length > 0) {
			let positionCount = 0
			let teamPositionCount = 1
			let lastTeamPositionName = ''

			let lastPosition = ''
			let lastPositionCount = 1

			self.scheduledPeople.forEach((person) => {
				positionCount++

				//team name and position name are used to build the variable names
				let teamName = person.teamName
				let teamNameId = teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

				//this is the position name - this is used to build the variable names
				let positionName = person.positionName
				let positionNameId = positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

				//first just build a generic position number variable - this is for recycleable presets where you may not know the position name from plan to plan, but you want to populate buttons
				let positionNumberVariable = {
					variableId: 'scheduled_position_' + positionCount,
					name: 'Scheduled Position ' + positionCount,
				}
				variables.push(positionNumberVariable)
				//now make their status variable
				let positionStatusVariable = {
					variableId: 'scheduled_position_' + positionCount + '_status',
					name: 'Scheduled Position ' + positionCount + ' Status',
				}
				variables.push(positionStatusVariable)
				//make a variable for the position name
				let positionVariable = {
					variableId: 'scheduled_position_' + positionCount + '_position',
					name: 'Scheduled Position ' + positionCount + ' Position Name',
				}
				variables.push(positionVariable)

				//variable for photo thumbnail
				let positionPhotoThumbnailVariable = {
					variableId: 'scheduled_position_' + positionCount + '_photo_thumbnail',
					name: 'Scheduled Position ' + positionCount + ' Photo Thumbnail',
				}
				variables.push(positionPhotoThumbnailVariable)

				//now build position number - but by team
				if (teamName !== lastTeamPositionName) {
					//reset the team position count
					teamPositionCount = 1
					lastTeamPositionName = teamName
				} else {
					//increment the team position count
					teamPositionCount++
				}

				let teamPositionNumberVariable = {
					variableId: 'scheduled_' + teamNameId + '_position_' + teamPositionCount,
					name: teamName + ': Scheduled Position ' + teamPositionCount,
				}

				let teamPositionStatusNumberVariable = {
					variableId: 'scheduled_' + teamNameId + '_position_' + teamPositionCount + '_status',
					name: teamName + ': Scheduled Position ' + teamPositionCount + ' Status',
				}

				let teamPositionNameVariable = {
					variableId: 'scheduled_' + teamNameId + '_position_' + teamPositionCount + '_position',
					name: teamName + ': Scheduled Position ' + teamPositionCount + ' Position Name',
				}

				let teamPositionPhotoThumbnailNumberVariable = {
					variableId: 'scheduled_' + teamNameId + '_position_' + teamPositionCount + '_photo_thumbnail',
					name: teamName + ': Scheduled Position ' + teamPositionCount + ' Photo Thumbnail',
				}
				variables.push(teamPositionNumberVariable)
				variables.push(teamPositionStatusNumberVariable)
				variables.push(teamPositionNameVariable)
				variables.push(teamPositionPhotoThumbnailNumberVariable)

				//then build the position variable based on the name of the person and the team they are on
				let teamPositionVariable = {
					variableId: 'scheduled_' + teamNameId + '_' + positionNameId,
					name: teamName + ': ' + positionName,
				}

				let teamPositionStatusVariable = {
					variableId: 'scheduled_' + teamNameId + '_' + positionNameId,
					name: teamName + ': ' + positionName + ' Status',
				}

				//photo thumbnail variable
				let teamPositionPhotoThumbnailVariable = {
					variableId: 'scheduled_' + teamNameId + '_' + positionNameId + '_photo_thumbnail',
					name: teamName + ': ' + positionName + ' Photo Thumbnail',
				}

				if (positionName === lastPosition) {
					//if the position name is the same as the last one, then we need to increment the variable id
					//this is to allow for multiple people in the same position
					lastPositionCount++
					teamPositionVariable.variableId += '_' + lastPositionCount
					teamPositionVariable.name += ' (' + lastPositionCount + ')'
				} else {
					lastPosition = positionName
					lastPositionCount = 1
				}

				teamPositionStatusVariable.variableId = teamPositionVariable.variableId + '_status'
				teamPositionStatusVariable.name = teamPositionVariable.name + ' Status'

				teamPositionPhotoThumbnailVariable.variableId = teamPositionVariable.variableId + '_photo_thumbnail'
				teamPositionPhotoThumbnailVariable.name = teamPositionVariable.name + ' Photo Thumbnail'

				teamPositionByNumberVariable = {
					variableId: 'scheduled_' + teamNameId + '_' + positionNameId,
					name: teamName + ': ' + positionName,
				}

				variables.push(teamPositionVariable)
				variables.push(teamPositionStatusVariable)
				variables.push(teamPositionPhotoThumbnailVariable)
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
			variableObj.plan_currentitem_description = this.currentState.dynamicVariables.plan_currentitem_description

			variableObj.plan_nextitem = this.currentState.dynamicVariables.plan_nextitem
			variableObj.plan_nextitem_time_length = this.currentState.dynamicVariables.plan_nextitem_time_length
			variableObj.plan_nextitem_key = this.currentState.dynamicVariables.plan_nextitem_key
			variableObj.plan_nextitem_description = this.currentState.dynamicVariables.plan_nextitem_description

			variableObj.last_servicetype_id = this.lastServiceTypeId
			variableObj.last_servicetype_name = this.lastServiceTypeId
				? this.currentState.internal.services.find((service) => service.id === this.lastServiceTypeId)?.attributes?.name
				: ''
			variableObj.last_plan_id = this.lastPlanId
			variableObj.last_plan_name = this.lastPlanId
				? this.currentState.internal.plans.find((plan) => plan.id === this.lastPlanId)?.attributes?.dates
				: ''

			if (self.scheduledPeople.length > 0) {
				//lets populate the variables for the teams and positions
				let positionCount = 1
				let teamPositionCount = 0
				let lastTeamPositionName = ''

				let lastPosition = ''
				let lastPositionCount = 1
				self.scheduledPeople.forEach((person) => {
					let teamName = person.teamName
					let teamNameId = teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

					let positionName = person.positionName
					let positionNameId = positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

					let personStatus = ''
					if (person.status === 'C') {
						personStatus = 'Confirmed'
					}
					if (person.status === 'U') {
						personStatus = 'Unconfirmed'
					}
					if (person.status === 'D') {
						personStatus = 'Declined'
					}

					//populate generic position number ones first
					variableObj['scheduled_position_' + positionCount] = person.name
					variableObj['scheduled_position_' + positionCount + '_status'] = personStatus
					variableObj['scheduled_position_' + positionCount + '_position'] = positionName
					variableObj['scheduled_position_' + positionCount + '_photo_thumbnail'] = person.photoThumbnail
					positionCount++
					//populate team position number ones next
					if (teamName !== lastTeamPositionName) {
						//reset the team position count
						teamPositionCount = 0
						lastTeamPositionName = teamName
					}
					//increment the team position count
					teamPositionCount++
					variableObj['scheduled_' + teamNameId + '_position_' + teamPositionCount] = person.name
					variableObj['scheduled_' + teamNameId + '_position_' + teamPositionCount + '_status'] = personStatus
					variableObj['scheduled_' + teamNameId + '_position_' + teamPositionCount + '_position'] = positionName
					variableObj['scheduled_' + teamNameId + '_position_' + teamPositionCount + '_photo_thumbnail'] =
						person.photoThumbnail

					let variableId = 'scheduled_' + teamNameId + '_' + positionNameId

					if (positionName === lastPosition) {
						lastPositionCount++
						variableId += '_' + lastPositionCount
					} else {
						lastPosition = positionName
						lastPositionCount = 1
					}

					variableObj[variableId] = person.name
					variableObj[`${variableId}_status`] = personStatus
					variableObj[`${variableId}_photo_thumbnail`] = person.photoThumbnail
				})
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			//do something with that error
			if (this.config.verbose) {
				this.log('debug', 'Error Updating Variables: ' + error)
				console.log(error)
			}
		}
	},
}
