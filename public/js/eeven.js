/*
  name :    Eeven
  author :  Adrian Wisernig
  



*/
var Eeven = new Class({
    Binds:["lastListener"],

	initialize: function(el,id){
		//initialize ish
		this.container = $(el);
		this.splitId = id;
		this.bills = [];
		this.debts ={};
		this.lastIndex = 0;
		this.createElements();
		this.addLastListener();  
    	this.poll = new Request.JSON({
    		url: '/split/get/' + this.splitId,
    		method: 'get',
    		delay: 2000,
    		initialDelay: 2000,
    		onComplete:function(split){
    			this.bills = split['bills'];
    			this.debts = split['debts'];
    			this.refreshBills();
    			this.showResults();
    		}.bind(this)
    	});
    	this.focusedField = undefined;
    	
        this.poll.startTimer(); 
		
	},
	

	
	createElements: function(){
		for(var i = 0; i < 2; i++){
			this.createRow();
		}
	},
	/*
	  creates a new row, adds the appropriate events and adds it to the DOM
	
	
	*/
	createRow: function(){ 
	    this.lastIndex++; 		
		var nameField = new Element('input',{	'class':'name',
											 	'type': 'text',
											    'id': "name_" + this.lastIndex,
											    'data-id': this.lastIndex,
											    events:{
											        change: this.sync.bind(this),
											        focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											        
											    }	
											});
		var amountField = new Element('input',{	'class':'amount money',
											 	'type': 'text',
											    'id': "amount_" + this.lastIndex,
											    'data-id': this.lastIndex, 
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											         
											    } 
											});
		var memoField = new Element('input',{	'class':'memo',
											 	'type': 'text',
											    'id': "memo_" + this.lastIndex,
											    'data-id': this.lastIndex, 
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											    } 
						 	
											});
		var deleteButton = new Element('a',{	'class':'memo',
										 	'type': 'text',
										 	'html' : "Delete",
											'data-id': this.lastIndex,
											events:{
												click: this.deleteRow.bind(this),
                                                focus:  this.makeActive.bind(this),
										        blur:   this.makeInActive.bind(this)
										        
											}

										});   										
										  
    	var rowContainer = new Element('div',{'class': 'row','id': 'row_' + this.lastIndex});

		//add events for amount Field
	   	this.addAmountEvents(amountField);

        nameField.inject(rowContainer);
		rowContainer.appendText(" paid $");
		amountField.inject(rowContainer);
		rowContainer.appendText(" for ");
		memoField.inject(rowContainer);
		deleteButton.inject(rowContainer);   
		rowContainer.inject(this.container)
		return rowContainer;
	},
	createRowId: function(id){  	
		var nameField = new Element('input',{	'class':'name',
											 	'type': 'text',
											    events:{
											        change: this.sync.bind(this),
											        focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											        
											    }	
											});
		var amountField = new Element('input',{	'class':'amount money',
											 	'type': 'text',
											    'id': "amount_" + id,
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											         
											    } 
											});
		var memoField = new Element('input',{	'class':'memo',
											 	'type': 'text',
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.makeActive.bind(this),
											        blur:   this.makeInActive.bind(this)
											    } 
						 	
											});
		var deleteButton = new Element('a',{	'class':'memo',
										 	    'type': 'text',
										 	    'html' : "Delete",
											events:{
												click: this.deleteRow.bind(this),
                                                focus:  this.makeActive.bind(this),
										        blur:   this.makeInActive.bind(this)
										        
											}

										});   										
										  
    	var rowContainer = new Element('div',{'class': 'row'});

		//add events for amount Field
	   	this.addAmountEvents(amountField);

        nameField.inject(rowContainer);
		rowContainer.appendText(" paid $");
		amountField.inject(rowContainer);
		rowContainer.appendText(" for ");
		memoField.inject(rowContainer);
		deleteButton.inject(rowContainer);   
		rowContainer.inject(this.container)
		return rowContainer;
	},
	
	addLastListener: function(){
		$("name_" + this.lastIndex).addEvent('blur',this.lastListener);
	},
	
	lastListener: function(event){
		if(event.target.get("value") == "") return;
		event.target.removeEvent('blur',this.lastListener);
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
	
	deleteRow:function(event){
		var rowId = event.target.get("data-id");
		console.log(this.bills);		
		$("row_" + rowId).destroy();
		this.bills = null;
		this.debts = null;
		this.calculate();
		this.save();
		this.createRow();
		this.addLastListener();
	},
	
	
	calculate: function(){
		this.makeBills();
		this.debts = {};
		//find all the unique people
		var names = this.bills.map(function(bill,index)
			{return bill['name'];
			}).unique();
		this.bills.each(function(bill,index){
			var eachOwes = Number.from(bill['amount'] / names.length).round();
			names.each(function(ower,index){
			    //you can't owe yourself money
				if(ower != bill['name']){
					this.debts[ower] = (this.debts[ower] == undefined) ? {} : this.debts[ower];					 				
					if(this.debts[ower][bill['name']] != undefined){
						this.debts[ower][bill['name']]['amount'] += eachOwes;
					}else{
						this.debts[ower][bill['name']]= {'amount': eachOwes,'paid': false};
					}
				} 
			}.bind(this));// this is eevennn			
		}.bind(this));// this is eeven as well
		
		
		Object.each(this.debts,function(payees,ower){
			Object.each(payees,function(debt,payee){
				if(debt['amount'] > 0 &&
				   this.debts[ower][payee] != null && 
				   this.debts[payee][ower] && 
				   this.debts[ower][payee]['amount'] >= this.debts[payee][ower]['amount']){
						this.debts[ower][payee]['amount']-= this.debts[payee][ower]['amount'];
						this.debts[payee][ower]['amount'] = 0 ;
				}		
			}.bind(this));
		}.bind(this));
		   
		//remove any empty entries
		Object.each(this.debts,function(payees,ower){
			this.debts[ower] = Object.filter(payees,function(debt,key){
				return debt['amount'].toInt() > 0;
			});
		}.bind(this));  
		
		this.debts = Object.filter(this.debts,function(payees,key){
			return Object.getLength(payees) > 0 && key != undefined;
		}); 
		
		this.showResults();				
		
	},
	
	makeActive: function(event){
	    this.focusedField = event.target;
	},
	
	makeInActive: function(event){
	    this.focusedField = undefined;
	},
	
	save: function(){
	   	var bill = {'id' : this.splitId,
					'bills': this.bills,
					'debts': this.debts};
					 
		var request = new Request.JSON({
			url: '/split/save',
			data:'data=' + JSON.encode(bill),
			onComplete:function(){
				 this.poll.startTimer();//
			}.bind(this)
		});     
		console.log(bill);
		request.send();
		this.poll.stopTimer();		
	},
	
	load: function(){
		this.poll.startTimer();		
	},
	
	refreshBills: function(){
	    console.log(this.bills);
		this.bills.each(function(bill,index){
		    var i = index +1;
            if($("name_" + i) == undefined){
                this.createRowId(i);     
            }
            
            Object.each(bill,function(value,fieldName){
                if($(fieldName + "_" + i) && $(fieldName + "_" + i) != this.focusedField){
                    $(fieldName + "_" + i).set('value', value);
                }
            }.bind(this));
            
             
            // $("name_" + i).set('value',bill['name']);
            // $("amount_" + i).set('value',bill['amount']);
            // $("memo_" + i).set('value',bill['memo']);   
			
			}.bind(this));
		
		this.addLastListener();
	},
	
	
	makeBills: function(){
		this.bills = new Array();
		console.log(this.bills);
		
		// create the bills data structure
		for(var i = 0; i<= this.lastIndex; i++){
			// make utility class to check whether a form is empty
			if($("name_" + i) && $("name_" + i).get("value") !=""){
				console.log("name_" + i + " exists");
				this.bills.push({
					'name': $("name_" + i).get('value'),
					'amount': $("amount_" + i).get('value').toInt(), 
					'memo': $("memo_" + i).get('value')		
				});
			} 
		}
	},
	
	showResults: function(){
		var list = new Element('ul',{'class':'sum'});
		Object.each(this.debts,function(payees,ower){
			var li = new Element('li',{'class':'person','html': ower});
			var payeeUL = new Element('ul');
			  	    
			Object.each(payees,function(debt,payee){
				var pLi = new Element('li',{'html': payee + ": $" + debt['amount']});
				pLi.inject(payeeUL);
			});
			
			payeeUL.inject(li);
			li.inject(list);
		}.bind(this));
		$("drawer").empty();
		list.inject($("drawer"));
	},
	
	sync: function(event){
	    var rowId = event.target.get("data-id");
	    if($("amount_" + rowId).get("value") >= 0){
	        this.calculate();
	        this.save();
	    }
	}
  
});