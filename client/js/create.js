var creditPolicyData = {
    "name": "",
    "root_condition": {
        "name": "",
        "expression": "",
    },
    "attributes": []
}


function attributeTemplate(attributeData) {
    var template = `
        <span id="${attributeData['name']}" class="badge badge-dark mr-2"> 
            ${attributeData['name']} 
            <i class="fa fa-times-circle" style="cursor:pointer"> </i>
        </span>
    `
    return template;
}


function addAttribute() {
    var attributeData = {}
    attributeData["name"] = $("#attributeName").val();
    attributeData["type"] = $("#attributeType").val();
    attributeData["example_value"] = $("#attributeExValue").val();

    if (attributeData["type"] == "int") {
        try {
            attributeData["example_value"] = parseInt(attributeData["example_value"]);
        } catch (e) {
            alert("Please provide a number for example value.");
        }
    }

    creditPolicyData.attributes.push(attributeData);
    
    $("#attributeContainer").append(attributeTemplate(attributeData));
    $(`#${attributeData["name"]}`).on("click.removeattr", function(event) {
        removeAttribute(attributeData["name"], event);
    });

    $("#attributeName").val('');
    $("#attributeType").val('');
    $("#attributeExValue").val('')
}

function removeAttribute(attributeName, event) {
    var attributes = creditPolicyData.attributes, index = -1;
    for (var i = 0; i < creditPolicyData.attributes.length; i++) {
        if (attributes[i]['name'] == attributeName) {
            index = i;
            break
        }
    }

    attributes.splice(i, 1);
    $(`#${attributeName}`).off("click.removeattr");
    $(`#${attributeName}`).remove();
}


function createPolicy() {
    creditPolicyData["name"] = $("#policyName").val();

    creditPolicyData["root_condition"]["name"] = $("#rootConditionName").val();
    creditPolicyData["root_condition"]["expression"] = $("#rootConditionExpression").val();

    console.log(creditPolicyData);
    API_CLIENT.createPolicy(creditPolicyData).then(function (policy){
        location.href = `detail.html?id=${policy.id}`;
        location.replace();
    })
}