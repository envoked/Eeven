/*
  name :    Eeven
  author :  Adrian Wisernig
  description: The main class for the Eeven application. To use simply attach it to an element
*/
var Eeven = new Class({
    Binds:["lastListener","setSync"],

	initialize: function(el,id,data){
		//initialize ish 
		this.container = $(el);
		this.splitId = id;
		this.bills = [];
		this.debts ={};
		
		if(data != 'null'){
		    this.load(data);
		}else{
		    this.createElements();
    		this.addLastListener();
		}
		this.isActive = true;
		this.focusedField = undefined;
    	
    	//create the Polls
    	 
    	this.poll = new Request.JSON({
    		url: '/split/' + this.splitId,
    		method: 'get',
    		delay: 1000,
    		initialDelay: 2000,
    		
    		onComplete:function(split){
    		    if(split && split['bills'] && split['debts']){
    		    	this.bills = split['bills'];
        			this.debts = split['debts'];
        			this.refreshBills();
        			this.showResults();   
    		    }
    		}.bind(this)
    	});      
    	this.activePoll = new Request({
    		url: '/split/isActive/' + this.splitId,
    		method: 'get',
    		delay: 10000,
    		initialDelay: 2000,
    		onComplete: this.setSync
    	});
             
        this.startUpdate();
        this.activePoll.startTimer();
        this.addFX();  
    	    			
	},
	
	addFX: function(){
	    var smoothScroll = new Fx.SmoothScroll({
            links: '.smooth',
            wheelStops: false
        });

        new MooClip(document.id('shareLink'), {
          moviePath: '/js/ZeroClipboard.swf',
              onCopy: function(e){
               document.id('shareLink').highlight("#b31221");
              }
          });        

	},
	
	load: function(split){
	    var split = JSON.decode(split);
    	this.bills = split['bills'];
		this.debts = split['debts'];
		this.refreshBills();
		this.showResults();	    
	},
	
	
	/*
	  See if there are multiple clients viewing the split to start auto sync
	
	*/
	setSync: function(bool,responseXML){
	    
	    this.isActive = (bool == "true");
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
		                                    'class':'deleteRow',
										 	'type': 'text',
										 	'html' : "Delete",
											events:{
												click: this.deleteRow.bind(this),
										        
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
	
	/*
	    add a listener on the last row
	
	*/

	addLastListener: function(){
	   this.container.getLast(".row").getElement(".name").addEvent('blur',this.lastListener);
	},
	
	
	/*
	  if the last row isn't blank, add another one chap
	*/
	
	lastListener: function(event){
		if(event.target.get("value") == "") return;
		event.target.removeEvent('blur',this.lastListener);
		this.createRow();
		this.addLastListener();		
	},
	
	
	/*
	  Remove the listener from this last one
	*/                                      
	
	removeLastListener: function(){
	     this.container.getLast(".row").getElement(".name").removeEvent('blur',this.lastListener);
	},
	
	addAmountEvents: function(el){
		el.addEvent("blur",function(event){
			var val = Number.from(this.get("value"))==null ? 0 : Number.from(this.get("value"));
			this.set("value",val);
		});
		
	},
	
	deleteRow:function(event){
	    var row = event.target.getParent(".row");
	    
	    row.set("slide",{duration:400,onComplete:function(){
	     	        row.destroy();
	    }});
	    
	    row.slide();
		this.bills = null;
		this.debts = null;
		this.calculate();
		this.save();
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
			url: '/split/' + this.splitId,
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
        // console.log(this.bills);     
        this.container.getChildren(".row").each(function(row,index){
            if(row.getElement(".amount").get("value").toInt() > 0){
    			this.bills.push({
    				'name': row.getElement(".name").get('value').capitalize(),
    				'amount': row.getElement(".amount").get('value').toInt(), 
    				'memo': row.getElement(".memo").get('value') 	
    			});  
		    }
        }.bind(this));
	},
	
	showResults: function(){
        var debts = $("debts");
        debts.empty();
        
        Object.each(this.debts,function(payees,ower){
            var li = new Element('li',{'class':'person'});
            var payeeUL = new Element('ul');
                 
            var totalOwed = 0; // total amount this person owes
            Object.each(payees,function(debt,payee){
                var pLi = new Element('li',{'class':'toPay','html': payee + ": $" + debt['amount']});
                totalOwed += debt['amount'];
                pLi.inject(payeeUL);
            });
            
            li.set("html","<h2>" + ower + "</h2> owes <h3>$" + totalOwed + "</h3>");
         
            payeeUL.inject(li);
            li.inject(debts);
        }.bind(this)); 
	},
	
	sync: function(event){
	    row = event.target.getParent(".row");
	    if(row.getElement(".amount").get("value") >= 0){
	        this.calculate();
	        this.save();
	    }
	}
  
});