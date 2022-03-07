function buildTreeStructure(rootCondition) {
    return rootCondition.getTemplate();

}

function buildTreeConfig(condition_tree) {
    $("#OrganiseChart-simple").empty();
	var config = {
		chart: {
			container: "#OrganiseChart-simple",
            rootOrientation: "NORTH",
            connectors: {"type": "step", "style": {"stroke": "red"}}
		},
		nodeStructure: buildTreeStructure(condition_tree),
        node: {"collapsable": true}
	}
	var t = new Treant( config );
	return t;
}
