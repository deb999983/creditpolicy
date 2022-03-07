function CreditPolicy(creditPolicyData) {
    this.id = creditPolicyData["id"];
    this.name = creditPolicyData["name"];
    this.code = creditPolicyData["code"];
    this.conditionTree = new Condition(creditPolicyData["condition_tree"]);
    this.attributes = creditPolicyData["attributes"];
    this.createdOn = new Date(creditPolicyData["created_on"]);
    this.isComplete = creditPolicyData["is_complete"]

    this.attributeMap = {};
    this.attributes.forEach(function (attribute) {
        this.attributeMap[attribute["name"]] = attribute;
    }.bind(this));
}

CreditPolicy.prototype.getHtml = function () {
    var template = `
        <div id="${this.id}" class="card my-4">
            <div class="cp-title card-header d-flex justify-content-between"> 
                <div> ${this.name} [ ${this.code} ] </div>
                <a href="detail.html?id=${this.id}">See Details</a>
            </div>
            <div class="cp-list-item card-body d-flex justify-content-between">
                <div class="cp-created_on align-self-start"> Created On: <b> ${this.createdOn.toLocaleString()} </b> </div>

                
                <div class="cp-status align-self-end">
                     <i class="fa fa-exclamation-circle text-danger ${this.isComplete ? 'd-none': ''}" aria-hidden="true"> Pending </i>
                     <i class="fa fa-check-circle text-success ${this.isComplete ? '': 'd-none'}" aria-hidden="true"> Complete </i>
                </div>  

            </div>
        </div>
    `
    return template
}


CreditPolicy.prototype.getDetailHtml = function() {

    var attributesTemplate = ''
    this.attributes.forEach(attribute => {
        attributesTemplate = attributesTemplate + `<span class="badge badge-dark mr-2 align-self-center"> ${attribute['name']} </span>`
    });

    var template = `
    <div>
        <div class="detail-info card">
            <div class="cp-title card-header d-flex justify-content-between"> 
                <div>  ${this.name} [ ${this.code} ] </div>
            </div>

            <div class="cp-list-item card-body">
                <div class="d-flex justify-content-between">
                    <div class="cp-created_on align-self-start"> Created On: <b> ${this.createdOn.toLocaleString()} </b> </div>
                
                    <div class="cp-status align-self-end">
                        <i class="fa fa-exclamation-circle text-danger ${this.isComplete ? 'd-none': ''}" aria-hidden="true"> Pending </i>
                        <i class="fa fa-check-circle text-success ${this.isComplete ? '': 'd-none'}" aria-hidden="true"> Complete </i>
                    </div>  
                </div>

                <div id="attributeContainer" class="d-flex cp-attributes my-2">
                    <span class="mr-2"> Attributes </span>
                    ${attributesTemplate}
                </div>
            </div>
        </div>
        <div class="condition-tree card my-4">
            <div class="cp-title card-header d-flex justify-content-between"> 
                <div> ConditionTree </div>
            </div>

            <div id="OrganiseChart-simple"></div>                
        </div>
    </div>
    `

    return template
}


CreditPolicy.prototype.setApplyCreditForm = function () {
    var self = this;    
    $("#applyForCreditContainer").empty();
    $("#applyForCreditContainer")[0].dataset["policyid"] = this.id;
    self.attributes.forEach(function (attribute) {
        var template = `
            <div class="form-group row">
                <label for="${attribute["name"]}" class="col-sm-4 col-form-label"> ${attribute["name"]} </label>
                <div class="col-sm-8">
                    <input type="text" class="form-control" id="${attribute["name"]}" name="${attribute["name"]}" placeholder="Enter ${attribute["name"]}" required>
                </div>
            </div>
        `;

        $("#applyForCreditContainer").append(template);
    });   
}
