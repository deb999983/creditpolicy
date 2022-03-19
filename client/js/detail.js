var currentPolicy = null;

function addConditionChild(data) {
    API_CLIENT.addChildValue(data).then(function (response) {
        location.reload();
    })
}


function applyForCredit() {
    var form = document.getElementById("applyForCreditContainer");
    var formData = new FormData(form);

    var data = {};
    formData.forEach(function(value, key){
        if (currentPolicy.attributeMap[key]["type"] == 'str') {
            data[key] = "'" + value + "'";
        } else {
            data[key] = value;
        }
    });

    console.log(form, formData);
    API_CLIENT.applyForCredit(form.dataset["policyid"], data).then(
        function (response){
            alert("ACCEPT");
        }, function(error) {
            if (typeof error == "object" && error["rejection_reason"]) {
                alert(`REJECT \n ${error["rejection_reason"]}`);
            }
        }
    );
}


window.onload = function() {
    API_CLIENT.init();
    var urlParams = new URLSearchParams(location.search);

    getPolicyDetail(urlParams.get("id"));

    // hide any open popovers when the anywhere else in the body is clicked
    $('body').on('click', function (e) {
        $('[data-toggle=popover]').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });
}


function getPolicyDetail(policyId) {
    return API_CLIENT.getPolicy(policyId).then(function(policyData) {
        var policy = new CreditPolicy(policyData);
        currentPolicy = policy;

        $("#detailContainer").append(policy.getDetailHtml());

        buildTreeConfig(policy.conditionTree);
        Condition.bindEvents();

        $('#applyForCreditModal').on('shown.bs.modal', function (e) {
            policy.setApplyCreditForm();
        });
        
    })
}