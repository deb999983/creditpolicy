function setPolicyList() {
    API_CLIENT.getPolicies().then(function (policies) {
        policies.forEach(policyData => {
            var policy = new CreditPolicy(policyData);
            $("#cpListContainer").append(policy.getHtml());
        });
    })
}


window.onload = function() {
    setPolicyList();
}