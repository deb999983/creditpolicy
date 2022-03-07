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
}


function getPolicyDetail(policyId) {
    return API_CLIENT.getPolicy(policyId).then(function(policyData) {
        var policy = new CreditPolicy(policyData);
        currentPolicy = policy;

        $("#detailContainer").append(policy.getDetailHtml());
        
        buildTreeConfig(policy.conditionTree);

        $('.add-child').off("click.add-child");

        $('.add-child.accept').on("click.add-child", function (event) {
            console.log(event);
            addConditionChild(event.currentTarget.dataset);
        });


        $('.add-child.condition-child').popover({
            container: 'body',
            content: function() {
                var data = $(this).data();
                return `
                    <div class="form-group">
                        <input type="text" name="conditionName" class="form-control" placeholder="Condition Name">
                    </div>
                    <div class="form-group">
                        <input type="text" name="conditionExpression" class="form-control" placeholder="Expression">
                    </div>
                    <button data-id=${data['id']} data-forval=${data['forval']} class="btn btn-primary condition-submit">Submit</button>
                `
            },  
            html: true
        })        
        $('.add-child.condition-child').on('shown.bs.popover', function () {
            $(".condition-submit").on('click.condition-submit', function (event) {
                var conditionName = $('[name="conditionName"]').val();
                var conditionExpression = $('[name="conditionExpression"]').val();

                var params = $(this).data();
                var data = {
                    "id": params["id"], 
                    "forval": params["forval"],
                    "condition": {"name": conditionName, "expression": conditionExpression}
                }
                
                console.log(data)
                addConditionChild(data);
                
                $('.add-child.condition-child').popover('hide');
            });    
        })       
        $('.add-child.condition').on('hidden.bs.popover', function () {
            $(".condition-submit").off('click.condition-submit');
        })       
        
        $('.add-child.reject').popover({
            container: 'body',
            content: function() {
                var data = $(this).data();
                return `
                    <div class="form-group">
                        <input type="text" name="conditionRejectionReason" class="form-control" placeholder="RejectionReason">
                    </div>
                    <button data-id=${data['id']} data-forval=${data['forval']} class="btn btn-primary rejection-submit">Submit</button>
                `
            },
            html: true            
        })

        $('.add-child.reject').on('shown.bs.popover', function () {
            $(".rejection-submit").on('click.reject', function (event) {
                var rejectionReason = $('[name="conditionRejectionReason"]').val();

                var params = $(this).data();
                var data = {
                    "id": params["id"], 
                    "forval": params["forval"],
                    "terminalval": "REJECT",
                    "rejection_reason": rejectionReason
                }
                
                console.log(data)
                addConditionChild(data);
                
                $('.add-child.reject').popover('hide');
            });    
        })       
        $('.add-child.reject').on('hidden.bs.popover', function () {
            $(".rejection-submit").off('click.reject');
        })          

        $('#applyForCreditModal').on('shown.bs.modal', function (e) {
            policy.setApplyCreditForm();
        });
        
    })
}
