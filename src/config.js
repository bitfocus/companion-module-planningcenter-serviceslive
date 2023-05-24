const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will control PCO Live for your PCO Services Plan.'
			},
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'You will need to setup a Personal Access Token in your PCO account. More info <a href="https://api.planningcenteronline.com/oauth/applications">here</a>'
			},
			{
				type: 'textinput',
				id: 'applicationid',
				label: 'Application ID',
				width: 12
			},
			{
				type: 'textinput',
				id: 'secretkey',
				label: 'Secret Key',
				width: 12
			},
			{
				type: 'textinput',
				id: 'parentfolder',
				label: 'Parent Folder within PCO to limit service type choices for this instance.',
				width: 3,
				default: ''
			},
			{
				type: 'textinput',
				id: 'servicetypeid',
				label: 'Restrict plans to choose from to a specific service type id for this instance.',
				width: 3,
				default: ''
			},
			{
				type: 'textinput',
				id: 'perpage',
				label: 'The number of plans to return per service type. Default is 7.',
				width: 3,
				default: 7,
				regex: Regex.NUMBER
			},
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Polling',
				value: 'Enabling polling will allow for better feedbacks and variables, however it may cause the API to be rate-limited.'
			},
			{
				type: 'checkbox',
				label: 'Polling',
				id: 'polling',
				width: 1,
				default: true
			},
			{
				type: 'number',
				label: 'Polling Rate (ms)',
				id: 'pollingRate',
				tooltip: 'The polling rate does not need to be very fast. 3000ms is recommended. A faster rate may cause the API to be rate-limited.',
				width: 2,
				min: 1000,
				max: 30000,
				default: 3000,
				required: true,
				isVisible: (configValues) => configValues.polling == true,
			},
			{
				type: 'textinput',
				id: 'servicetypeid_polling',
				label: 'Automatically start polling the next plan of a specific service type id.',
				width: 3,
				default: '',
				isVisible: (configValues) => configValues.polling == true,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false
			}
		]
	},
}