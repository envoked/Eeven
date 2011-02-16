
window.addEvent('domready', function(){
	
	
	$("calculate").addEvent('click',function(){
		// $("drawer").set('tween',{duration:'long'});
		// $("drawer").tween('margin-left',-15);
		var i = 0;
		
		
		var matrix = {};
		
		
		
		var names = $$(".name").map(function(el,index){
						return el.get('value');
					}).filter(function(item,index){
						return item != 0 //ignore any possible blank lines
					});
					
		var amounts = $$(".amount").map(function(el,index){
						return el.get('value').toInt();
					}).filter(function(item,index){
						return item > 0 //ignore any possible blank lines
					});
		
		//create owing matrix matrix
		names.unique().each(function(ower,index){
			matrix[ower] = {};
			names.each(function(collector,i){
				// you can't owe money to yourself
				if(ower!=collector){
					matrix[ower][collector] = 0;
				}
				
			});
		});
		
		//iterate through all amounts and calculate who owes who and how much
		amounts.each(function(amount,index){
			Object.each(matrix,function(value,key){
				if(key != names[index]){ // you don't owe money to yourself
					eachOwes = Number.from(amount / Object.getLength(matrix)).round();
					matrix[key][names[index]] += eachOwes;
				}
			});
			
		});
		
		//simple calculations
		Object.each(matrix,function(payees,ower){
			Object.each(payees,function(amount,payee){
				if(amount > 0 && matrix[ower][payee] >= matrix[payee][ower] ){
						matrix[ower][payee]-= matrix[payee][ower];
						matrix[payee][ower] = 0;
				}		
			});
		});
		
		//remove any empty entries 
		Object.each(matrix,function(payees,ower){
			matrix[ower] = Object.filter(payees,function(value,key){
				return value.toInt(	) > 0;
			});
		});

		
		//remove any people who don't owe anyone
		matrix = Object.filter(matrix,function(payees,key){
			return Object.getLength(payees) > 0;
		});		
		
	    $("drawer").empty(); 		
		var list = new Element('ul',{'class':'sum'});
		Object.each(matrix,function(payees,ower){
			var li = new Element('li',{'class':'person','html': ower});
			var payeeUL = new Element('ul');
			  	    
			Object.each(payees,function(amount,payee){
				var pLi = new Element('li',{'html': payee + ": $" + amount});
				pLi.inject(payeeUL);
			});
			
			payeeUL.inject(li);
			li.inject(list);
		});
		list.inject($("drawer"));
	});
  });