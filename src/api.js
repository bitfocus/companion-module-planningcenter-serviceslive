const { InstanceStatus } = require('@companion-module/base')

const Client = require('node-rest-client').Client

const baseAPIUrl = 'https://api.planningcenteronline.com/services/v2'

module.exports = {
	initPCOLive: function () {
		let self = this

		try {
			if (
				self.config.applicationid !== '' &&
				self.config.applicationid !== undefined &&
				self.config.secretkey !== '' &&
				self.config.secretkey !== undefined
			) {
				//get Organization info
				let organization_url = `${baseAPIUrl}`
				self.updateStatus(InstanceStatus.Ok, 'Getting Organization data...')
				self
					.doRest('GET', organization_url, {})
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok, 'Processing Oranization data...')
						if (result.data && result.data.attributes && result.data.attributes.name) {
							self.currentState.dynamicVariables.organization_name = result.data.attributes.name
						} else {
							self.currentState.dynamicVariables.organization_name = 'All'
						}

						self.checkVariables()
					})
					.catch(function (message) {
						self.log('error', 'Error getting Services data: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})

				//get Service Types
				let services_url = `${baseAPIUrl}/service_types`

				if (self.config.servicetypeid !== '') {
					let serviceTypeId = self.config.servicetypeid
					services_url += `/${serviceTypeId}`
					self.lastServiceTypeId = serviceTypeId
				} else if (self.config.parentfolder !== '') {
					services_url += `?where[parent_id]=${self.config.parentfolder}`
				}

				let defaultPlanListObj = {}
				defaultPlanListObj.id = '0'
				defaultPlanListObj.label = `(select a plan)`

				self.updateStatus(InstanceStatus.Ok, 'Getting Services data...')
				self.log('info', 'Getting Services data...')
				self
					.doRest('GET', services_url, {})
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok, 'Processing Services data...')
						self.log('info', 'Processing Services data...')
						if (result.data.length > 0) {
							self.currentState.internal.plans_list = []
							self.currentState.internal.plans_list.push(defaultPlanListObj)
							self.processServicesData(result.data)
						} else if (result.data.id) {
							//just one service type returned
							self.currentState.internal.plans_list = []
							self.currentState.internal.plans_list.push(defaultPlanListObj)
							let serviceArray = []
							serviceArray.push(result.data)
							self.processServicesData(serviceArray)
						}

						if (self.config.polling && self.config.servicetypeid_polling && self.config.servicetypeid_polling !== '') {
							self.log('debug', 'Getting Plan Id from Service Type for Polling...')
							self
								.getPlanIdOfServiceType(self.config.servicetypeid_polling)
								.then(function (planId) {
									self.lastServiceTypeId = self.config.servicetypeid_polling
									self.lastPlanId = planId
									self.startInterval()
								})
								.catch(function (message) {
									self.log('error', 'Error getting Plan Id from Service Type for Polling: ' + message)
									self.updateStatus(InstanceStatus.UnknownError, message)
								})
						}
					})
					.catch(function (message) {
						self.log('error', 'Error getting Services data: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})
			} else {
				self.log('error', 'Error Initializing: Application ID and Secret Key are required.')
				self.updateStatus(InstanceStatus.BadConfig, 'Application ID and Secret Key are required.')
			}
		} catch (error) {
			self.log('error', 'Error initializing: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error initializing: ' + error)
		}
	},

	processServicesData: function (result) {
		let self = this

		try {
			self.currentState.internal.services = result

			let perpage = self.config.perpage

			if (result.length > 0) {
				self.currentState.internal.services_list = []

				self.currentState.internal.services_withorg_list = []
				let orgListObj = {
					id: '0',
					label: self.currentState.dynamicVariables.organization_name,
				}
				self.currentState.internal.services_withorg_list.push(orgListObj)
			}

			for (let i = 0; i < result.length; i++) {
				let serviceTypeId = result[i].id
				let plans_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans?include=plan_times&filter=future&per_page=${perpage}&order=sort_date`

				let serviceListObj = {}
				serviceListObj.id = result[i].id
				serviceListObj.label = result[i].attributes.name
				self.currentState.internal.services_list.push(serviceListObj)
				self.currentState.internal.services_withorg_list.push(serviceListObj)

				self.initActions() //update the actions because the dropdown values have changed

				self
					.doRest('GET', plans_url, {})
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok, 'Processing Plans data...')
						if (result.data) {
							self.processPlansData(result.data)
						}

						if (result.included) {
							self.processPlanIncludedData(result.included)
						}
					})
					.catch(function (message) {
						self.log('error', 'Error processing Services data: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})
			}

			self.updateStatus(InstanceStatus.Ok)
		} catch (error) {
			self.log('error', 'Error processing Services data: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error processing Services data: ' + error)
		}
	},

	processPlansData: function (result) {
		let self = this

		try {
			let services = self.currentState.internal.services

			for (let j = 0; j < result.length; j++) {
				self.currentState.internal.plans.push(result[j])

				let planListObj = {}
				planListObj.id = result[j].id
				planListObj.serviceTypeId = result[j].relationships.service_type.data.id
				let serviceObj = services.find((s) => s.id === planListObj.serviceTypeId)
				planListObj.label = `${serviceObj.attributes.name} - ${result[j].attributes.dates} (${result[j].id})`
				self.currentState.internal.plans_list.push(planListObj)
			}

			self.initActions() //update the actions because the dropdown values have changed

			self.updateStatus(InstanceStatus.Ok)
		} catch (error) {
			self.log('error', 'Error processing Plans data: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error processing Plans data: ' + error)
		}
	},

	processPlanIncludedData: function (result) {
		let self = this

		try {
			//just push the plan times into an array for now, we will process them later
			for (let j = 0; j < result.length; j++) {
				if (result[j].type == 'PlanTime') {
					self.currentState.internal.plan_times.push(result[j])
				}
				//could maybe do something with another included type here
			}
		} catch (error) {
			self.log('error', 'Error processing Plan Included data: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error processing Plan Included data: ' + error)
		}
	},

	doRest: function (method, url, body) {
		let self = this

		return new Promise(function (resolve, reject) {
			function handleResponse(err, result) {
				if (
					err === null &&
					typeof result === 'object' &&
					(result.response.statusCode === 200 || result.response.statusCode === 201)
				) {
					// A successful response

					let objJson = {}

					if (result.data.length > 0) {
						try {
							objJson = JSON.parse(result.data.toString())
						} catch (error) {
							reject('Unable to parse JSON.')
						}
					}

					resolve(objJson)
				} else {
					// Failure. Reject the promise.
					let message = 'Unknown error'

					if (result !== undefined) {
						if (result.response !== undefined) {
							message = result.response.statusCode + ': ' + result.response.statusMessage
						} else if (result.error !== undefined) {
							// Get the error message from the object if present.
							message = result.error.code + ': ' + result.error.message
						}
					}

					reject(message)
				}
			}

			if (self.config.applicationid === '' || self.config.secretkey === '') {
				reject('Invalid Application ID/Secret Key.')
			} else {
				let options_auth = {
					user: self.config.applicationid,
					password: self.config.secretkey,
				}

				let args = {}

				if (body) {
					args = {
						data: body,
					}
				}

				let client = new Client(options_auth)

				switch (method) {
					case 'POST':
						client
							.post(url, function (data, response) {
								handleResponse(null, { data: data, response: response })
							})
							.on('error', function (error) {
								handleResponse(true, { error: error })
							})
						break
					case 'GET':
						client
							.get(url, function (data, response) {
								handleResponse(null, { data: data, response: response })
							})
							.on('error', function (error) {
								handleResponse(true, { error: error })
							})
						break
					default:
						throw new Error('Invalid method')
						break
				}
			}
		})
	},

	/* Takes control of the PCO plan which is needed before the plan can be changed. */
	takeControl: function (serviceTypeId, planId) {
		let self = this

		try {
			let live_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`

			let toggle_url = live_url + '/toggle_control'

			return new Promise(function (resolve, reject) {
				self
					.doRest('GET', live_url, {})
					.then(function (result) {
						if (result.data.links.controller === null) {
							//no one is controlling this plan, so let's take control
							self
								.doRest('POST', toggle_url, {})
								.then(function (result) {
									resolve(result)
								})
								.catch(function (message) {
									self.log('error', 'Error togggling control: ' + message)
									self.updateStatus(InstanceStatus.ConnectionFailure, 'Error toggling control: ' + message)
								})
						} else {
							//someone is in control, so let's check to see who it is
							if (result.data.links.controller === self.currentState.internal.currentController) {
								//no need to do anything, we are currently in control
								resolve(result)
							} else {
								//we aren't in control, so we need to take control by first toggling the controller to null
								self
									.doRest('POST', toggle_url, {})
									.then(function (result) {
										//now toggle it back to us
										self
											.doRest('POST', toggle_url, {})
											.then(function (result) {
												//we should be in control now, let's save the controller to an internal variable so we know who "we" are next time
												self.currentState.internal.currentController = result.data.links.controller
												resolve(result)
											})
											.catch(function (message) {
												self.log('error', 'Error togggling control: ' + message)
												self.updateStatus(InstanceStatus.ConnectionFailure, 'Error toggling control: ' + message)
											})
									})
									.catch(function (message) {
										self.log('error', 'Error togggling control: ' + message)
										self.updateStatus(InstanceStatus.ConnectionFailure, 'Error toggling control: ' + message)
									})
							}
						}
					})
					.catch(function (message) {
						self.log('error', 'Error Taking Control of Plan: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})
			})
		} catch (error) {
			self.log('error', 'Error controlling plan: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error controlling plan: ' + error)
		}
	},

	/* Releases control of the PCO plan */
	releaseControl: function (serviceTypeId, planId) {
		let self = this

		try {
			let live_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`
			let toggle_url = live_url + '/toggle_control'

			return new Promise(function (resolve, reject) {
				self
					.doRest('GET', live_url, {})
					.then(function (result) {
						if (result.data.links.controller !== null) {
							//let's release control
							self
								.doRest('POST', toggle_url, {})
								.then(function (result) {
									resolve(result)
								})
								.catch(function (message) {
									self.log('error', message)
									self.updateStatus(InstanceStatus.ConnectionFailure, message)
								})
						}
					})
					.catch(function (message) {
						self.log('error', 'Error Releasing Control of Plan: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})
			})
		} catch (error) {
			self.log('error', 'Error controlling plan: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error controlling plan: ' + error)
		}
	},

	controlLive: function (serviceTypeId, planId, direction) {
		let self = this

		try {
			let baseUrl = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live`

			let url

			switch (direction) {
				case 'next':
					url = baseUrl + '/go_to_next_item?include=items,current_item_time'
					break
				case 'previous':
					url = baseUrl + '/go_to_previous_item?include=items,current_item_time'
					break
			}

			self
				.doRest('POST', url, {})
				.then(function (result) {
					//plan was moved, let's process the results
					self.lastServiceTypeId = serviceTypeId
					self.lastPlanId = planId
					self.processLiveData(result)
					self.startInterval()
				})
				.catch(function (message) {
					self.log('error', 'Error Controlling LIVE: ' + message)
					self.updateStatus(InstanceStatus.ConnectionFailure, message)
				})
		} catch (error) {
			self.log('error', 'Error controlling plan: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error controlling plan: ' + error)
		}
	},

	getCurrentLive: function () {
		let self = this

		try {
			let serviceTypeId = self.lastServiceTypeId
			let planId = self.lastPlanId

			if (serviceTypeId && planId) {
				let url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/live?include=items,current_item_time`

				self
					.doRest('GET', url, {})
					.then(function (result) {
						self.processLiveData(result)
					})
					.catch(function (message) {
						self.log('error', 'Error Getting LIVE data: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, 'Error Getting LIVE data: ' + message)
						if (self.config.verbose) {
							self.log('debug', 'Stopping Update Interval.')
						}
						self.stopInterval()
						self.restartModule()
					})
			} else {
				//we can't get the current live data because we don't know what plan they are controlling
			}
		} catch (error) {
			self.log('error', 'Error getting current live data: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error getting current live data: ' + error)
		}
	},

	restartModule: function () {
		let self = this
		
		if (self.config.verbose) {
			self.log('debug', 'Restarting Connection Logic in 15 seconds...');
		}
		setTimeout(function () {
			self.initPCOLive()
		}, 15000)
	},

	processLiveData: function (result) {
		let self = this

		try {
			if (result.errors) {
				self.log('error', result.errors)
				self.updateStatus(InstanceStatus.ConnectionFailure, result.errors)
			} else {
				if (result.data && result.data.attributes) {
					self.currentState.dynamicVariables['plan_title'] = result.data.attributes.title
					self.currentState.dynamicVariables['plan_series'] = result.data.attributes.series_title
				}

				let items = result.included

				let currentItemTimeId =
					result.data.relationships.current_item_time.data && result.data.relationships.current_item_time.data.id
				let currentItemTime = result.included.find((res) => res.type === 'ItemTime' && res.id === currentItemTimeId)
				let currentItemId =
					currentItemTime &&
					currentItemTime.relationships &&
					currentItemTime.relationships.item.data &&
					currentItemTime.relationships.item.data.id

				if (currentItemId) {
					let index = items.findIndex((i) => i.id === currentItemId)
					let item = items.find((i) => i.id === currentItemId)

					//if the item type is ItemTime, then this is "END OF SERVICE"
					if (item.type === 'ItemTime') {
						self.lastPlanItemId = item.id
					} else {
						//current plan time id
						let planTimeId = item.relationships.plan_time
						//with a servicetype id and a plan time id, we can find the current plan name

						let dtTimeStarted = new Date(currentItemTime.attributes.live_start_at)
						let timeStarted_formatted = dtTimeStarted.toLocaleTimeString()
						let dtTimeShouldFinish = new Date(dtTimeStarted.getTime() + item.attributes.length * 1000)

						if (item.id !== self.lastPlanItemId) {
							//start the interval to calculate time remaining
							//this will make it look nicer displaying the time rather than only updating whenever the polling updates
							self.lastPlanItemId = item.id
							self.startPlanItemTimeRemainingInterval(dtTimeStarted, dtTimeShouldFinish)
						}

						let timeLength = item.attributes.length
						let timeLength_formatted = Math.floor(timeLength / 60) + ':' + ('0' + Math.floor(timeLength % 60)).slice(-2)

						//get the length of only the ones without type of header
						let itemsWithoutHeader = items.filter(
							(item) => item.attributes.item_type !== 'header' && item.type === 'Item'
						)

						if (itemsWithoutHeader) {
							let indexWithoutHeader = itemsWithoutHeader.findIndex((i) => i.id === currentItemId)
							self.currentState.dynamicVariables['plan_index'] = indexWithoutHeader + 1
							self.currentState.dynamicVariables['plan_length'] = itemsWithoutHeader.length
						} else {
							self.currentState.dynamicVariables['plan_index'] = index + 1
							self.currentState.dynamicVariables['plan_length'] = items.length
						}

						self.currentState.dynamicVariables['plan_currentitem'] = item.attributes.title
						self.currentState.dynamicVariables['plan_currentitem_time_length'] = timeLength_formatted
						self.currentState.dynamicVariables['plan_currentitem_time_started'] = timeStarted_formatted
						self.currentState.dynamicVariables['plan_currentitem_time_shouldfinish'] =
							dtTimeShouldFinish.toLocaleTimeString()

						//if the item type is a song, grab the key name and other stuff
						if (item.attributes.item_type == 'song') {
							self.currentState.dynamicVariables['plan_currentitem_key'] = item.attributes.key_name
						} else {
							self.currentState.dynamicVariables['plan_currentitem_key'] = ''
						}

						self.currentState.dynamicVariables['plan_nextitem'] = ''
						self.currentState.dynamicVariables['plan_nextitem_time_length'] = ''
						self.currentState.dynamicVariables['plan_nextitem_key'] = ''

						if (index < items.length) {
							for (let i = index + 1; i < items.length; i++) {
								//if next thing is an item, not a header, grab the title
								//if the next thing is an ItemTime, not an Item, it's likely the "END OF SERVICE"

								if (items[i].attributes.item_type == 'item' || items[i].attributes.item_type == 'song') {
									self.currentState.dynamicVariables['plan_nextitem'] = items[i].attributes.title
									let timeLength = items[i].attributes.length
									let timeLength_formatted =
										Math.floor(timeLength / 60) + ':' + ('0' + Math.floor(timeLength % 60)).slice(-2)
									self.currentState.dynamicVariables['plan_nextitem_time_length'] = timeLength_formatted
									break
								}

								//if the item type is a song, grab the key name and other stuff
								if (item.attributes.item_type == 'song') {
									self.currentState.dynamicVariables['plan_nextitem_key'] = item.attributes.key_name
								}

								if (items[i].type == 'ItemTime') {
									self.currentState.dynamicVariables['plan_nextitem'] = 'END OF SERVICE'
									self.currentState.dynamicVariables['plan_nextitem_time_length'] = ''
									break
								}
							}
						}
					}
				} else {
					//no current item, so we must be at the beginning of the plan
					clearInterval(self.ITEM_TIME_REMAINING_INTERVAL) //stop the interval that shows the time remaining
					self.ITEM_TIME_REMAINING_INTERVAL = null

					//get the service start time
					let dtTimeStarted = new Date(result.data.attributes.live_start_at)

					//get the length of all the pre-service items
					let preServiceItems = items.filter(
						(item) =>
							item.attributes.item_type !== 'header' &&
							item.type === 'Item' &&
							item.attributes.service_position == 'pre'
					)
					let preServiceItemsLength = 0
					if (preServiceItems) {
						preServiceItemsLength = preServiceItems.reduce((a, b) => a + b.attributes.length, 0)
					}

					self.currentState.dynamicVariables['plan_index'] = ''
					self.currentState.dynamicVariables['plan_currentitem_time_length'] = '' //show the service time start here
					self.currentState.dynamicVariables['plan_currentitem_time_started'] = ''
					self.currentState.dynamicVariables['plan_currentitem_time_shouldfinish'] = ''
					self.currentState.dynamicVariables['plan_currentitem_time_remaining_seconds'] = ''
					self.currentState.dynamicVariables['plan_currentitem_time_remaining'] = '' //show the countdown to service start here (it's not a countdown to the service start time but a countdown to the service start time minus whatever pre service item lengths exist)
					self.currentState.dynamicVariables['plan_currentitem'] = 'START OF SERVICE'

					self.currentState.dynamicVariables['plan_nextitem'] = ''
					self.currentState.dynamicVariables['plan_nextitem_time_length'] = ''
					self.currentState.dynamicVariables['plan_nextitem_key'] = ''

					self.lastPlanItemId = null
				}

				self.updateStatus(InstanceStatus.Ok)
				self.checkVariables()
				self.checkFeedbacks()
			}
		} catch (error) {
			self.log('error', 'Error processing LIVE data: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error processing LIVE data: ' + error)
		}
	},

	startPlanItemTimeRemainingInterval: function (dtTimeStarted, dtTimeShouldFinish) {
		let self = this

		clearInterval(self.ITEM_TIME_REMAINING_INTERVAL)

		self.ITEM_TIME_REMAINING_INTERVAL = setInterval(function () {
			try {
				let dtNow = new Date()
				let timeRemaining = Math.floor((dtTimeShouldFinish.getTime() - dtNow.getTime()) / 1000)
				let timeRemaining_formatted =
					Math.floor(Math.abs(timeRemaining) / 60) + ':' + ('0' + Math.floor(Math.abs(timeRemaining) % 60)).slice(-2)
				if (timeRemaining < 0) {
					timeRemaining_formatted = '-' + timeRemaining_formatted
				}
				self.currentState.dynamicVariables['plan_currentitem_time_remaining_seconds'] = timeRemaining
				self.currentState.dynamicVariables['plan_currentitem_time_remaining'] = timeRemaining_formatted
				self.checkVariables()
				self.checkFeedbacks()
			} catch (error) {
				//just silently fail to the terminal because it's just a variable update
				console.log('Error updating plan item time remaining: ')
				console.log(error)
			}
		}, 1000)
	},

	getPlanIdOfServiceType: function (serviceTypeId) {
		let self = this

		try {
			let plans_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans?filter=future&per_page=1&order=sort_date`

			return new Promise(function (resolve, reject) {
				self
					.doRest('GET', plans_url, {})
					.then(function (result) {
						resolve(result.data[0].id)
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.ConnectionFailure, message)
					})
			})
		} catch (error) {
			self.log('error', 'Error getting Plan Id of service type: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error getting next Plan Id by Service Type Id: ' + error)
		}
	},

	getServiceIdFromPlanId: function (planId) {
		let self = this
		let serviceTypeId = null

		try {
			let planObj = self.currentState.internal.plans_list.find((p) => p.id === planId)
			if (planObj) {
				if (planObj.serviceTypeId) {
					serviceTypeId = planObj.serviceTypeId
				}
			}
		} catch (error) {
			self.log('error', 'Error getting Service Type Id from Plan Id: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error getting Service Type Id from Plan Id: ' + error)
		} finally {
			return serviceTypeId
		}
	},

	startInterval: function () {
		let self = this

		if (self.INTERVAL) {
			clearInterval(self.INTERVAL)

			if (self.config.verbose == true && self.config.polling == true) {
				self.log('debug', 'Starting Update Interval.')
			}
		}

		try {
			if (self.config.polling == true) {
				if (self.lastServiceTypeId && self.lastPlanId) {
					self.INTERVAL = setInterval(function () {
						self.getCurrentLive()
						self.getTeamPositions()
					}, self.config.pollingRate)
				} else {
					self.log(
						'error',
						'Cannot start polling because we do not know what plan is being controlled yet. Start controlling a plan first.'
					)
				}
			} else {
				self.getCurrentLive()
				self.getTeamPositions()
			}
		} catch (error) {
			self.log('error', 'Error starting interval: ' + error)
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error starting interval: ' + error)
		}
	},

	stopInterval: function () {
		let self = this

		if (self.INTERVAL) {
			clearInterval(self.INTERVAL)
			self.INTERVAL = null
		}

		if (self.ITEM_TIME_REMAINING_INTERVAL) {
			clearInterval(self.ITEM_TIME_REMAINING_INTERVAL)
			self.ITEM_TIME_REMAINING_INTERVAL = null
		}
	},

	getTeamPositions: function () {
		let self = this

		try {
			let serviceTypeId = self.lastServiceTypeId
			let planId = self.lastPlanId

			if (serviceTypeId && planId) {
				let url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans/${planId}/team_members?include=person,team&per_page=100`

				if (self.config.verbose) {
					self.log('debug', 'Getting Team Positions data...')
				}

				self
					.doRest('GET', url, {})
					.then(function (result) {
						self.processTeamPositions(result)
					})
					.catch(function (message) {
						self.log('warn', 'Error Getting Team Positions: ' + message)
					})
			} else {
				//we can't get the current team and position data because we don't know what plan they are controlling
			}
		} catch (error) {
			self.log('warn', 'Error getting current team/position data: ' + error)
		}
	},

	processTeamPositions: function (result) {
		let self = this

		try {
			const { data, included } = result
			const newScheduledPeople = []
			const positionCounters = {} // now keyed by team and position

			// Process each person from the result data
			data.forEach((person) => {
				const personId = person.relationships.person.data.id
				const personName = person.attributes.name
				const teamId = person.relationships.team.data.id
				const team = included.find((res) => res.type === 'Team' && res.id === teamId)
				const teamName = team?.attributes.name || ''
				const teamNameId = teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
				const positionName = person.attributes.team_position_name
				const positionNameId = positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

				// Create a composite key that includes both team and position
				const compositeKey = `${teamNameId}-${positionNameId}`
				positionCounters[compositeKey] = (positionCounters[compositeKey] || 0) + 1

				const personObj = {
					id: `${compositeKey}-${positionCounters[compositeKey]}`, // Unique display ID
					personId, // unique identifier from the data
					name: personName,
					teamId,
					teamName,
					teamNameId,
					positionName,
					status: person.attributes.status, // Only property we care about for change comparison
					photoThumbnail: person.attributes.photo_thumbnail,
				}

				newScheduledPeople.push(personObj)

				// Asynchronously fetch the person photo (not used in core comparison)
				if (personObj.photoThumbnail && personObj.photoThumbnail.length > 0) {
					self
						.getPersonPhoto(personObj.photoThumbnail)
						.then(function (result) {
							if (result) {
								personObj.photo = result
							}
						})
						.catch(function (message) {
							self.log('error', 'Error getting person photo: ' + message)
						})
				} else {
					personObj.photo = null
				}
			})

			// Sort newScheduledPeople by teamName and then by positionName
			newScheduledPeople.sort((a, b) => {
				const teamDiff = a.teamName.localeCompare(b.teamName)
				if (teamDiff !== 0) return teamDiff
				return a.positionName.localeCompare(b.positionName)
			})

			// Create a summary mapping personId to status for the new data
			const newSummary = {}
			newScheduledPeople.forEach((p) => {
				newSummary[p.personId] = p.status
			})

			// Create the summary for the previously stored scheduledPeople
			const oldSummary = {}
			;(self.scheduledPeople || []).forEach((p) => {
				oldSummary[p.personId] = p.status
			})

			// Compare the two summaries to see if any person has been added, removed, or if their status changed.
			const summariesEqual = (a, b) => {
				const aKeys = Object.keys(a).sort()
				const bKeys = Object.keys(b).sort()
				if (aKeys.length !== bKeys.length) return false
				for (let i = 0; i < aKeys.length; i++) {
					if (aKeys[i] !== bKeys[i] || a[aKeys[i]] !== b[bKeys[i]]) {
						return false
					}
				}
				return true
			}

			const coreChanged = !summariesEqual(newSummary, oldSummary)

			// Build POSITION_CHOICES for feedbacks.
			const newChoicesPositions = []
			const choicesCounters = {}
			newScheduledPeople.forEach((person) => {
				const teamNameId = person.teamName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
				const positionNameId = person.positionName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
				const compositeKey = `${teamNameId}-${positionNameId}`
				choicesCounters[compositeKey] = (choicesCounters[compositeKey] || 0) + 1
				const id = `${compositeKey}-${choicesCounters[compositeKey]}`
				const label =
					`${person.teamName} - ${person.positionName}` +
					(choicesCounters[compositeKey] > 1 ? ` (${choicesCounters[compositeKey]})` : '')
				newChoicesPositions.push({ id, label })
			})

			newChoicesPositions.sort((a, b) => a.label.localeCompare(b.label))

			// Compare choices arrays (simple string comparison is sufficient for simple objects)
			const choicesChanged = JSON.stringify(newChoicesPositions) !== JSON.stringify(self.CHOICES_POSITIONS || [])

			// Only update if core data or choices have changed
			if (coreChanged || choicesChanged) {
				self.scheduledPeople = newScheduledPeople
				self.CHOICES_POSITIONS =
					newScheduledPeople.length > 0
						? newChoicesPositions
						: [{ id: 'scheduled_no_people', label: 'No people scheduled' }]

				//build CHOICES_TEAMS based on the unique team names
				const uniqueTeams = new Set()
				newScheduledPeople.forEach((person) => {
					uniqueTeams.add(person.teamName)
				})
				const newChoicesTeams = Array.from(uniqueTeams).map((team) => ({
					id: team.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
					label: team,
				}))
				newChoicesTeams.sort((a, b) => a.label.localeCompare(b.label))
				self.CHOICES_TEAMS = newChoicesTeams

				self.initVariables()
				self.initFeedbacks()
				self.initPresets()
			}

			self.checkVariables()
			self.checkFeedbacks()
		} catch (error) {
			self.log('warn', 'Error processing team positions: ' + error)
		}
	},

	async getPersonPhoto(personPhotoUrl) {
		let self = this
		try {
			const response = await fetch(personPhotoUrl)
			if (!response.ok) {
				self.log('error', `Error getting person photo: ${response.status} ${response.statusText}`)
				return null
			}
			const arrayBuffer = await response.arrayBuffer()
			let buffer = Buffer.from(arrayBuffer)

			// Optionally, use file-type to detect the image format
			const fileType = await import('file-type').then((module) => module.fileTypeFromBuffer(buffer))
			if (fileType && fileType.ext !== 'png') {
				// Convert non-PNG images (like JPEG) to PNG using sharp
				const sharp = require('sharp')
				buffer = await sharp(buffer).png().toBuffer()
			}

			return self.bufferToBase64(buffer)
		} catch (error) {
			self.log('error', `Error getting person photo: ${error.message}`)
			return null
		}
	},

	// Convert a Buffer to a base64 string
	bufferToBase64: function (buffer) {
		return buffer.toString('base64')
	},

	/***** This doesn't work so I commented it out for possible future fix. Need to be able to authenticate as an actual user, not just an API account. ******/
	/*sendChatMessage: function(serviceTypeId, planId, message) {
		let self = this;

		let body = {
			message: message,
			ministry_id: serviceTypeId
		}

		let chat_url = `https://services.planningcenteronline.com/live/${planId}/chat_messages.json`;

		console.log('chat url: ' + chat_url);

		self.doRest('POST', chat_url, body)
		.then(function (result) {
			resolve(result);
		})
		.catch(function (message) {
			self.log('error', 'Error sending chat message: ' + message);
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Error sending chat message: '  + message);
		});
	}*/
}
