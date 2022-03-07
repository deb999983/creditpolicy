function Node(data, isTerminal, isLeaf) {
    var node = `
        <div class="condition-container">
            <div class="condition"> ${data} </div>
            <div class="tf-indicator ${isTerminal ? 'd-none': ''}">
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
        buttons.push(`<button data-id=${condition.id} data-terminalval="REJECT" data-forval=${forval} class="add-child reject"> Reject </button>`);
    }

    buttons.push(`<button data-id=${condition.id} data-condition="CONDITION" data-forval=${forval} class="add-child condition-child" > Add Condition </button>`)

    return `
        <div btn-container>
            ${buttons.join("\n")}
        </div>    
    `
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
    var node = {
        innerHTML: Node(this.expression),
        HTMLid: self.id,
		children: []
	};

    if (!self.tChild && !self.tTerminal) { 
        var forval = true
        self.tTerminal = buttonContainer(self, forval);
        }
    
    if (!self.fChild && !self.fTerminal) {
        var forval = false
        self.fTerminal = buttonContainer(self, forval);
    } 

    var tChilds = ["tChild", "tTerminal"];
    var fChilds = ["fChild", "fTerminal"];

    tChilds.forEach(function(tchild) {       
        if (!self[tchild]) 
            return;

        if (tchild == "tChild")
            node.children.push(self[tchild].getTemplate());
        else 
            node.children.push({innerHTML: Node(self[tchild], true), children: []})
    });

        
    fChilds.forEach(function(fchild) {       
        if (!self[fchild]) 
            return;

        if (fchild == "fChild")
            node.children.push(self[fchild].getTemplate());
        else 
            node.children.push({innerHTML: Node(self[fchild], true), children: []})
    });

    return node;
}


Condition.prototype.hasAcceptTerminal = function() {
    return this.tTerminal == "ACCEPT" || this.fTerminal == "ACCEPT"
}

Condition.prototype.hasRejectTerminal = function() {
    return this.tTerminal == "REJECT" || this.fTerminal == "REJECT"
}