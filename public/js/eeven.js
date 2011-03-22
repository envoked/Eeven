/*
  name :    Eeven
  author :  Adrian Wisernig
  



*/
var Eeven = new Class({
    Binds:["lastListener","setSync"],

	initialize: function(el,id){
		//initialize ish
		this.container = $(el);
		this.splitId = id;
		this.bills = [];
		this.debts ={};
		this.createElements();
		this.addLastListener();
		this.isActive = true;
		
    	 
    	this.poll = new Request.JSON({
    		url: '/split/get/' + this.splitId,
    		method: 'get',
    		delay: 1000,
    		initialDelay: 2000,
    		onComplete:function(split){
    		    if(split && split['bills'] && split['debts']){
    		        console.log(split);
    		    	this.bills = split['bills'];
        			this.debts = split['debts'];
        			this.refreshBills();
        			this.showResults();   
    		    }
    		}.bind(this)
    	});
    	this.focusedField = undefined;
      
    	this.activePoll = new Request({
    		url: '/split/isActive/' + this.splitId,
    		method: 'get',
    		delay: 10000,
    		initialDelay: 100,
    		onComplete: this.setSync
    	});
    	this.startUpdate();
    	this.activePoll.startTimer();
    	    			
	},
	
	
	/*
	  See if there are multiple clients viewing the split to start auto sync
	
	*/
	setSync: function(bool,responseXML){
	    
	    this.isActive = bool == "true";
        this.isActive ? this.poll.startTimer() : this.poll.stopTimer();
	},
	
	/*
	  Start Autosync
	
	*/
	
	startUpdate: function(){
	    if(this.isActive){
	        this.poll.startTimer();
	    }
	},
 
	
	/*
	  Stop Autosync
	
	*/  
	stopUpdate:function(){
	    if(this.isActive) this.poll.stopTimer();
	},
	

	
	/*
		Start each new split with two empty rows
	*/   
	createElements: function(){
		for(var i = 0; i < 2; i++){
			this.createRow();
		}
	},
	
	
	/*
	  creates a new row, adds the appropriate events and adds it to the DOM
	
	
	*/
	createRow: function(){ 
		var nameField = new Element('input',{	'class':'name',
											 	'type': 'text',
											    events:{
											        change: this.sync.bind(this),
											        focus:  this.getFocusField.bind(this),
											        blur:   this.loseFieldFocus.bind(this)
											        
											    }	
											});
		var amountField = new Element('input',{	'class':'amount money',
											 	'type': 'text', 
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.getFocusField.bind(this),
											        blur:   this.loseFieldFocus.bind(this)
											         
											    } 
											});
		var memoField = new Element('input',{	'class':'memo',
											 	'type': 'text',
											    events:{
											        change: this.sync.bind(this),
                                                    focus:  this.getFocusField.bind(this),
											        blur:   this.loseFieldFocus.bind(this)
											    } 
						 	
											});
		var deleteButton = new Element('a',{	
		                                    'class':'memo',
										 	'type': 'text',
										 	'html' : "Delete",
											events:{
												click: this.deleteRow.bind(this),
                                                focus:  this.getFocusField.bind(this),
										        blur:   this.loseFieldFocus.bind(this)
										        
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
		rowContainer.inject(this.container);
		return rowContainer;
	},
	

	addLastListener: function(){
	   this.container.getLast(".row").getElement(".name").addEvent('blur',this.lastListener);
	},
	
	lastListener: function(event){
		if(event.target.get("value") == "") return;
		event.target.removeEvent('blur',this.lastListener);
		this.createRow();
		this.addLastListener();		
	},
	
	removeLastListener: function(){
	     this.container.getLast(".row").getElement(".name").removeEvent('blur',this.lastListener);
	},
	
	addAmountEvents: function(el){
		el.addEvent("blur",function(event){
			var val = Number.from(this.get("value"))==null ? 0 : Number.from(this.get("value"));
			this.set("value",val);
			// if name is blank on current row, use the name of the previous payer if possible
		});
		
	},
	
	deleteRow:function(event){
	    event.target.getParent(".row").destroy();
		this.bills = null;
		this.debts = null;
		this.calculate();
		this.save();
		this.addLastListener();t
	},

	calculate: function(){
		this.makeBills();
		this.debts = {};
		//find all the unique people
		var names = this.bills.map(function(bill,index)
			{return bill['name'];
			}).unique();
		this.bills.each(function(bill,index){
			var eachOwes = Number.from(bill['amount'] / names.length).round() || 0;
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
	
	getFocusField: function(event){
	    this.focusedField = event.target;
	},
	
	loseFieldFocus: function(event){
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
				 this.startUpdate();
			}.bind(this)
		});     
		this.stopUpdate();
		request.send();		
	},
	
	
	refreshBills: function(){
        this.bills.each(function(bill,index){
                    row = this.container.getChildren(".row")[index]; // bad design
                    if(!row){
                        row = this.createRow();     
                    }
                    
                    Object.each(bill,function(value,fieldName){
                        if(row.getElement("." + fieldName) != this.focusedField){
                            row.getElement("." + fieldName).set('value', value);
                        }
                    }.bind(this));
                    
         }.bind(this));
         
         if(this.container.getChildren(".row").length > (Object.getLength(this.bills) + 1)){
             this.container.getLast(".row").getPrevious(".row").destroy();
         }         
         
         // add a blank row if needed
         if(this.container.getChildren(".row").length < (Object.getLength(this.bills) + 1)){
             this.removeLastListener();
             this.createRow();
         }
         
        this.addLastListener();
	},
	
	
	makeBills: function(){
		this.bills = new Array();
		console.log(this.bills);		
        this.container.getChildren(".row").each(function(row,index){
            if(row.getElement(".amount").get("value").toInt() > 0){
    			this.bills.push({
    				'name': row.getElement(".name").get('value'),
    				'amount': row.getElement(".amount").get('value').toInt(), 
    				'memo': row.getElement(".memo").get('value') 	
    			});  
		    }
        }.bind(this));
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
	    row = event.target.getParent(".row");
	    if(row.getElement(".amount").get("value") >= 0){
	        this.calculate();
	        this.save();
	    }
	}
  
});