
function addConditionChild(data) {
    API_CLIENT.addChildValue(data).then(function (response) {
        return response.policy;
    }).then(function(policyId) {
        return getPolicyDetail(policyId);
    });
}



window.onload = function() {
    API_CLIENT.init();
    getPolicyDetail(10);
}


function getPolicyDetail(policyId) {
    return API_CLIENT.getPolicy(policyId).then(function(policy) {
        buildTreeConfig(policy.condition_tree);

        $('.add-child').off("click.add-child");

        $('.add-child').on("click.add-child", function (event) {
            console.log(event);
            if (event.currentTarget.dataset["condition"]) {
                event.preventDefault();
                return;
            }
            addConditionChild(event.currentTarget.dataset);
        });

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
            }
,  
            html: true
        })        

        $('.add-child.condition').on('hidden.bs.popover', function () {
            $(".condition-submit").off('click.condition-submit');
        })        
        
    })
}
