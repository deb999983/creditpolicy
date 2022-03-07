var API_CLIENT = {
	clientId: null,
	base_url: null,

    _resolved_promise: function resolved_promise(value) {
		return new Promise(function (resolve, reject) {resolve (value)});
	},
	checkError: function (response) {
		var self = this
		if (response.status > 204) {
			return response.json().then(function (error) {
				alert(JSON.stringify(error));
				throw error;
			})
		} else {
			return response.json();
		}
	},
	default_headers: function () {
		return {
			"Content-Type": "application/json"
		}
	},
	setBaseUrl: function(url) {
		this.base_url = window.location.protocol + "//" + window.location.host + "/api"
		this.base_url = "http://localhost:9050"
	},
    init: function () {
		this.setBaseUrl()
    },

	// ==================== API Calls ============================ //

	createPolicy: function createPolicy(policyData) {
		var options = {
			method: 'POST', headers: this.default_headers(), body: JSON.stringify(policyData)
		}, self = this;

		return fetch(self.base_url + `/policy/policies/`, options).then(function (response) {
			return self.checkError(response);
		});
	},

    getPolicies: function getPolicies(token) {
		var options = {
			method: 'GET', headers: this.default_headers()
		}, self = this;

		return fetch(self.base_url + "/policy/policies/", options).then(function (response) {
			return self.checkError(response);
		});
	},

    getPolicy: function getPolicy(id) {
		var options = {
			method: 'GET', headers: this.default_headers()
		}, self = this;

		return fetch(self.base_url + `/policy/policies/${id}/`, options).then(function (response) {
			return self.checkError(response);
		});
	},

	
	addChildValue: function addChildValue(data) {
		var parentId = data["id"], postData = {}, forval=data["forval"];
		if (data["terminalval"]) {
			postData["terminal_value"] = data["terminalval"];
			postData["rejection_reason"] = data["rejection_reason"];
		}
		
		if (data["condition"]) {
			postData["condition"] = data["condition"]
		}

		var options = {
			method: 'POST', headers: this.default_headers(), body: JSON.stringify(postData)
		}, self = this;		

		return fetch(self.base_url + `/policy/conditions/${parentId}/${forval}/child/`, options).then(function (response) {
			return self.checkError(response);
		});
	},

	applyForCredit: function applyForCredit(policyId, policyData) {
		var options = {
			method: 'POST', headers: this.default_headers(), body: JSON.stringify({"policy_data": policyData})
		}, self = this;

		return fetch(self.base_url + `/policy/policies/${policyId}/apply/`, options).then(function (response) {
			return self.checkError(response);
		});
	}
}

API_CLIENT.init();
