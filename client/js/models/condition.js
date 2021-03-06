function Node(data, terminal, condition) {
    var node = `
        <div class="condition-container">
            <div data-id="${condition.id}" data-terminal=${terminal} class="remove-condition ${(!terminal) || (condition.showTRemove && terminal == 'tTerminal')  || (terminal == 'fTerminal' && condition.showFRemove) ? '': 'd-none'}">
                <i class="fa fa-times-circle"></i>
            </div>
            <div class="condition"> ${data} </div>
            <div class="tf-indicator ${terminal ? 'd-none': ''}">
                <div class="true"> T </div>
                <div class="false"> F </div>
            </div>
        </div>
    `

    return node
}

function buttonContainer(condition, forval) {

    var buttons = []
    if (!condition.hasAcceptTerminal()){
        buttons.push(`<button data-id=${condition.id} data-terminalval="ACCEPT" data-forval=${forval} class="add-child accept"> Accept </button>`);
    }

    if (!condition.hasRejectTerminal()){
        buttons.push(`<button data-id=${condition.id} data-terminalval="REJECT" data-forval=${forval} data-toggle=popover class="add-child reject"> Reject </button>`);
    }

    buttons.push(`<button data-id=${condition.id} data-condition="CONDITION" data-forval=${forval} data-toggle=popover class="add-child condition-child" > Add Condition </button>`)

    var template = `
        <div class="btn-container">
            ${buttons.join("\n")}
        </div>    
    `

    return template;
}


function addConditionChildContainer(id, forval) {
    var template = `
        <div class="form-group">
            <input type="text" name="conditionName" class="form-control" placeholder="Condition Name">
        </div>
        <div class="form-group">
            <input type="text" name="conditionExpression" class="form-control" placeholder="Expression">
        </div>
        <button data-id=${id} data-forval=${forval} class="btn btn-primary condition-submit">Submit</button>
    `
    return template;
}


function bindAddConditionChildEvents() {
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
}


function rejectionReasonContainer(id, forval) {
    var template = `
        <div class="form-group">
            <input type="text" name="conditionRejectionReason" class="form-control" placeholder="RejectionReason">
        </div>
        <button data-id=${id} data-forval=${forval} class="btn btn-primary rejection-submit">Submit</button>
    `

    return template 
}

function bindRejectionReasonEvents() {
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
}



function Condition(conditionData) {

    this.id = conditionData.id;
    this.name = conditionData.name;
    this.expression = conditionData.expression;

    this.tChild = conditionData.t_child && new Condition(conditionData.t_child);
    this.fChild = conditionData.f_child && new Condition(conditionData.f_child);

    this.tTerminal = conditionData.t_terminal;
    this.fTerminal = conditionData.f_terminal;

    this.policy = conditionData.policy;
}

Condition.prototype.getTemplate = function () {
    var self = this;
    self.showTRemove = true;
    self.showFRemove = true;

    var node = {
        innerHTML: Node(this.expression, false, this),
        HTMLid: self.id,
		children: [],
        context: self,
        onAdded: null
	};    
    if (!self.tChild && !self.tTerminal) { 
        var forval = true
        self.tTerminal = buttonContainer(self, forval);
        self.showTRemove = false;
    }
    
    if (!self.fChild && !self.fTerminal) {
        var forval = false
        self.fTerminal = buttonContainer(self, forval);
        self.showFRemove = false;
    } 

    var tChilds = ["tChild", "tTerminal"];
    var fChilds = ["fChild", "fTerminal"];

    tChilds.forEach(function(tchild) {       
        if (!self[tchild]) 
            return;

        if (tchild == "tChild")
            node.children.push(self[tchild].getTemplate());
        else 
            node.children.push({innerHTML: Node(self[tchild], tchild, self), children: []})
    });

        
    fChilds.forEach(function(fchild) {       
        if (!self[fchild]) 
            return;

        if (fchild == "fChild")
            node.children.push(self[fchild].getTemplate());
        else 
            node.children.push({innerHTML: Node(self[fchild], fchild, self), children: []})
    });

    return node;
}


Condition.prototype.hasAcceptTerminal = function() {
    return this.tTerminal == "ACCEPT" || this.fTerminal == "ACCEPT"
}

Condition.prototype.hasRejectTerminal = function() {
    return this.tTerminal == "REJECT" || this.fTerminal == "REJECT"
}

Condition.bindEvents = function () {
    $('.add-child').off("click.add-child");
    $('.remove-condition').off('click.remove');

    $('.add-child.accept').on("click.add-child", function (event) {
        addConditionChild(event.currentTarget.dataset);
    });           
    
    $('.add-child.condition-child').popover({
        container: 'body',
        content: function() {
            var data = $(this).data();
            return addConditionChildContainer(data.id, data.forval);
        },  
        html: true
    });
    bindAddConditionChildEvents();
    
    $('.add-child.reject').popover({
        container: 'body',
        content: function() {
            var data = $(this).data();
            return rejectionReasonContainer(data.id, data.forval);
        },
        html: true            
    })
    bindRejectionReasonEvents();

    $('.remove-condition').on('click.remove', function(event) {
        var data = $(this).data();
        console.log("To Remove Condition:", data.id);
        API_CLIENT.removeCondition(data.id, data.terminal).then(function() {
            location.reload();
        });
    });
}