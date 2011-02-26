
window.addEvent('domready', function(){
	
	
	$("calculate").addEvent('click',function(){
		// $("drawer").set('tween',{duration:'long'});
		// $("drawer").tween('margin-left',-15);
		var i = 0;
		
		//get a list of all the bills
		var bills=[];
		var i = 0;
		while($("name_"+ i)){
			bills[i]={
				'name': $("name_" + i).get('value'),
				'amount': $("amount_" + i).get('value').toInt(), 
				'memo': $("memo_" + i).get('value')		
			}
			i++; //we don't want any infinite loops
		}
		
		
		
		var debts = new Hash({});
		//get unique names
		var names = bills.map(function(bill,index)
			{return bill['name'];
			});
		
		
		bills.each(function(bill,index){
			var eachOwes = Number.from(bill['amount'] / names.length).round();
			names.each(function(ower,index){
			    //you can't owe yourself money
				if(ower != bill['name']){
					debts[ower] = debts[ower] == undefined ? new Hash({}) : debts[ower];
					
					if(debts[ower][bill['name']] != undefined){
						debts[ower][bill['name']]['amount'] += eachOwes;
					}else{
						debts[ower][bill['name']]= new Hash({'amount': eachOwes,'paid': false});
					}
				} 
			});			
		});		
		Object.each(debts,function(payees,ower){
			Object.each(payees,function(debt,payee){
				if(debt['amount'] > 0 && debts[ower][payee] >= debts[payee][ower] ){
						debts[ower][payee]['amount']-= debts[payee][ower]['amount'];
						debts[payee][ower]['amount'] = 0 ;
				}		
			});
		});
		   
		//remove any empty entries
		Object.each(debts,function(payees,ower){
			debts[ower] = Object.filter(payees,function(debt,key){
				return debt['amount'].toInt() > 0;
			});
		});  
		
		debts = Object.filter(debts,function(payees,key){
			return Object.getLength(payees) > 0;
		}); 
		
		console.log(debts);
		
		
		
		

		// //simple calculations
		// Object.each(debts,function(payees,ower){
		// 	Object.each(payees,function(debt,payee){
		// 		if(debt['amount'] > 0 && debts[ower][payee] >= debts[payee][ower] ){
		// 				debts[ower][payee]['amount']-= debts[payee][ower]['amount'];
		// 				debts[payee][ower]['amount'] = 0 ;
		// 		}		
		// 	});
		// });
		// 
		// //remove any empty entries 
		// Object.each(debts,function(payees,ower){
		// 	debts[ower] = Object.filter(payees,function(debt,key){
		// 		return debt['amount'].toInt() > 0;
		// 	});
		// });    
		// 
		// 
		// //remove any people who don't owe anyone
		// debts = Object.filter(debts,function(payees,key){
		// 	return Object.getLength(payees) > 0;
		// }); 
		// 
		// 
		// 		
		// var list = new Element('ul',{'class':'sum'});
		// Object.each(debts,function(payees,ower){
		// 	var li = new Element('li',{'class':'person','html': ower});
		// 	var payeeUL = new Element('ul');
		// 	  	    
		// 	Object.each(payees,function(debt,payee){
		// 		var pLi = new Element('li',{'html': payee + ": $" + debt['amount']});
		// 		pLi.inject(payeeUL);
		// 	});
		// 	
		// 	payeeUL.inject(li);
		// 	li.inject(list);
		// });
		// $("drawer").empty();
		// list.inject($("drawer"));
		// //send the request
		// var request = new Request.JSON({
		// 	url: '/split/save',
		// 	data:'data=' + JSON.encode(debts),
		// 	complete:function(){
		// 		console.log("Posted");
		// 	}
		// });
		// 
		// request.send(); 
		
		
  	});
  });