// PlanningCenterOnline-Services-Live

const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')

const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const api = require('./src/api')

const actions = require('./src/actions')
const variables = require('./src/variables')
const feedbacks = require('./src/feedbacks')
const presets = require('./src/presets')

class PCOLiveInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...api,
			...actions,
			...variables,
			...feedbacks,
			...presets,
		})

		this.currentState = {
			internal: {
				services: [],
				plans: [],
				plan_times: [],
				services_list: [{ id: '', label: 'No Services loaded. Update instance config.' }],
				services_withorg_list: [{ id: '0', label: 'No Services loaded. Update instance config.' }],
				plans_list: [{ id: '', label: 'No Plans loaded. Update instance config.' }],
				currentController: null,
			},
			dynamicVariables: {
				orgnization_name: '',

				plan_title: '',
				plan_series: '',
				plan_times: '',
				plan_current_time: '',

				plan_index: '',
				plan_length: '',

				plan_currentitem: '',
				plan_currentitem_time_length: '',
				plan_currentitem_time_started: '',
				plan_currentitem_time_remaining: '',
				plan_currentitem_time_remaining_seconds: 0,
				plan_currentitem_key: '',

				plan_nextitem: '',
				plan_nextitem_time_length: '',
				plan_nextitem_key: '',
			},
		}

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined

		this.INTERVAL = null
		this.ITEM_TIME_REMAINING_INTERVAL = null

		this.scheduledPeople = [] //array of people scheduled to the current plan being controlled
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.checkVariables()
		this.checkFeedbacks()

		this.updateStatus(InstanceStatus.Connecting)

		this.stopInterval()

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined

		this.initPCOLive()
	}

	async destroy() {
		//close out any connections
		this.stopInterval()

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined
	}
}

runEntrypoint(PCOLiveInstance, UpgradeScripts)
