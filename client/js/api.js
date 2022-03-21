var API_CLIENT = {
	clientId: null,
	base_url: null,

    _resolved_promise: function resolved_promise(value) {
		return new Promise(function (resolve, reject) {resolve (value)});
	},
	checkError: function (response) {
		var self = this
		if (response.status == 204) {
			return response;
		}
		if (response.status > 204) {
			return response.json().then(function (error) {
				setTimeout(function() {
					if (!error.handled) {
						alert(JSON.stringify(error));
					}
				});
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
		// this.base_url = window.locaqtion.protocol + "//" + window.location.host + "/api"
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
	},

	removeCondition: function(conditionId, terminal) {
		var self = this;
		if (!terminal) {
			return fetch(self.base_url + `/policy/conditions/${conditionId}/`, {
				method: "DELETE", headers: this.default_headers()
			}).then(function (r) { return self.checkError(r) });
		}

		var data = (terminal == 'tTerminal') ? {'t_terminal': null} : {'f_terminal': null, 'rejection_reason': null};

		return fetch(self.base_url + `/policy/conditions/${conditionId}/`, {
			method: "PATCH", headers: this.default_headers(), body: JSON.stringify(data)
		}).then(function (r) {return self.checkError(r)});

	}
}

API_CLIENT.init();
