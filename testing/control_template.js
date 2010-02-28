
    var NewControl = Control.extend({

		// Class name for string representation and id generation
		class_name: "NewControl",

    	// Constructs a control.

    	constructor: function (options) {
    		this.base(options);
    	},

    	// Set the control's model.

    	setModel: function (model) {
    		this.model = model;

    		// Add listeners here
    	},

		// Creates a new default model object if none has been specified.

		makeModel: function () {
    		throw new Error("Implement makeModel in subclasses");
		},

    	// Generates HTML for the control and appends it to the container.
    	// Returns the top level element for the control.

    	generate: function (container) {
    	},

    	// Attach event handling to the dom_element created by the generate
    	// method.

    	attach: function () {
    	},

    	// Update HTML to match the current state of the control and model.

    	update: function () {
    	}
    });

