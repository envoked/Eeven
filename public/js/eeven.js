var Eeven = new Class({
    Binds:["lastListener"],

	initialize: function(el){
		//initialize ish
		this.container = $(el);
		this.bills = [];
		this.debts ={};
		this.numRows = 0;
		this.createElements();
		this.addLastListener();
		
	},
	

	
	createElements: function(){
		for(var i = 0; i < 2; i++){
			this.createRow();
		}
	},
	
	createRow: function(){
		var nameField = new Element('input',{	'class':'name',
											 	'type': 'text',
											    'id': "name_" + this.numRows	
											});
		var amountField = new Element('input',{	'class':'amount money',
											 	'type': 'text',
											    'id': "amount_" + this.numRows 
											});
		var memoField = new Element('input',{	'class':'memo',
											 	'type': 'text',
											    'id': "memo_i" + this.numRows 
						 	
											});
    	var rowContainer = new Element('div',{'class': 'row'});

		//add events for amount Field
	   	this.addAmountEvents(amountField);

        nameField.inject(rowContainer);
		rowContainer.appendText(" paid $");
		amountField.inject(rowContainer);
		rowContainer.appendText(" for ");
		memoField.inject(rowContainer);
		rowContainer.inject(this.container);
		this.numRows++; 		
	},
	
	addLastListener: function(){
		$("name_" + (this.numRows - 1)).addEvent('blur',this.lastListener);
	},
	
	lastListener: function(event){
		if(event.target.get("value") == "") return;
		console.log(event.target.id);
		this.createRow();
		this.addLastListener();		
	},
	
	addAmountEvents: function(el){
		el.addEvent("blur",function(event){
			var val = Number.from(this.get("value"))==null ? 0 : Number.from(this.get("value"));
			this.set("value",val);
			// if name is blank on current row, use the name of the previous payer if possible

		
		});
		
	},
	
	getElementNum: function(el){
		var split = el.get("id").split("_");
		return split[split.length - 1];
	}
	
	calculate: function(){
		
	},
	
	save: function(){
		
	},
	
	load: function(){
		
	}
	
	                                                                                  
	
});