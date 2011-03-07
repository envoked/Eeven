var Eeven = new Class({

	initialize: function(el){
		//initialize ish
		this.container = $(el);
		this.bills = [];
		this.debts ={};
		this.numRows = 0;
		this.createElements();
		this.addLastListener();
		
	},
	
	load:function(){
		
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

        nameField.inject(rowContainer);
		rowContainer.appendText(" paid $");
		amountField.inject(rowContainer);
		rowContainer.appendText(" for ");
		memoField.inject(rowContainer);
		rowContainer.inject(this.container);
		this.numRows++; 		
	},
	
	addLastListener: function(){
		$("name_" + (this.numRows - 1)).addEvent('blur',this.lastListener.bind(this));
	},
	
	lastListener: function(event){
		if(event.target.get("value") == "") return;
		event.target.removeEvent(this.lastListener);
		console.log(event.target.id);
		this.createRow(1);
		this.addLastListener();		
	}                                                                                  
	
});