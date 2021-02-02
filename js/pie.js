
var datita=[];

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


function createLabel(array){
    if(array.length==1){
        return null;
    }

    var label=``;
    array.forEach(element=>{
        var Newname=element.name.replace(/-/g," ");
        if(Newname==="ninos_dinardap"){
            Newname = "Cedulados"
        }
        label += `| ${upperCAseFirst(Newname)} `;
    })

    console.log(label)
    return label;
}

function createPieSQL(array){

    

    var query = `select count(*) from \"${ninos_id}\" as t1 `
    var number=2;
    array.forEach(element=>{
        
        if(element.id!==ninos_id){
            query=createJoinpiece(element.id,query,number,number-1)
        //console.log(element)
            number++;
        }else{
            query = createCedulaPart(query)
        }
        
    })
    /*console.log(array)*/
    console.log(query)
    return query;

}

function createJoinpiece(id,query,number,numberPrevious){

        query+=` inner join \"${id}\" as t${number}
        ON t${numberPrevious}.\"DOCUMENTOIDENTIDAD\"=t${number}.\"DOCUMENTOIDENTIDAD\"`
    
        return query;

}

function createCedulaPart(query){

    return query +=` where t1.\"TIPODOCUMENTOIDENTIFICACION\" <> 5`;

}

function execpieSQL(query){

    return new Promise((resolve,reject)=>{
        $.ajax({
            url:api_url+datastoreSQL,
            type:'POST',
            data:{
                sql:query
            },
            headers: {
                authorization: token
            },
            dataType:'json',
            error:function(err){
                errorRequest(err)
            },
            success:function({result}){
                resolve(result.records[0].count)
                
            }
    
        });
    })
}

function removeList(list,elemento){
    var temp=[]

    if(list.length==1 ){
        return temp
    }

    for (let i = 0; i < list.length; i++) {
        if(elemento == list[i]){
            list[i]="any"
        }
        
    }

    for (let i = 0; i< list.length; i++) {
        if(list[i]!=="any"){
            temp.push(list[i])
        }
       
    }

    //console.log(temp);
    return temp;
}

function combi(list){
    var temp=[] ;
    var combi=[];
    var first = list[0];
    combi.push(first) 
    for (let i = 0; i < list.length; i++) {
        
        
        if( first.name!==list[i].name){
            combi.push(list[i])   
        }
    }

    temp.push(combi) 
    if(list.length==2 ){
        return temp
    }

    for (let i = 0; i < list.length; i++) {
        
        var combi=[];
        if( first.name!==list[i].name){
            combi.push(first)
            combi.push(list[i])
            temp.push(combi)    
        }
    }
    console.log(temp)
    return temp;
}

function generateCombinations(dictList){

    var size = dictList.length
    var allCombinations = {};
    var index=0;
    while(index<size){
        allCombinations["combi"+index]=combi(dictList)
        dictList = removeList(dictList,dictList[0])
        index++
    }
    return allCombinations;
}

function getResourcesnoPromise() {
        var recursos;
        $.ajax({
            url: api_url + accionBuscarRecursos,
            type: 'GET',
            dataType: 'json',
            error: function (err) {
                errorRequest(err)
            },
            success: function (result) {
                var recursos = result.result[0].resources;
                var dictList=[];
                recursos.forEach(element => {
                    dict = {
                        name:element.name,
                        id:element.id
                    }
                    dictList.push(dict)
                    
                });
                var all;
                var label=[];
                var query;
                var promesaList=[]
                var colors=[]
                var index;
                all = generateCombinations(dictList);
                Object.entries(all).forEach(([key,value])=>{
                    value.forEach(element=>{
                       if(element.length!=1){
                            query = createPieSQL(element)
                            label.push(createLabel(element));
                            promesaList.push(execpieSQL(query))
                            colors.push(getRandomColor())
                       }
                        
                    })
                })
                Promise.all(promesaList).then((values)=>{
                    
                    createPie(label,values,colors)
                })
            }
            
        });


}

function createPie(label,datita,colors){
    var ctx = document.getElementById("piechart");
	var piechart = new Chart(ctx, {
		type: 'pie',
		data: {
			labels: label,
			datasets: [{
				label: 'pie Chart',
                backgroundColor: colors,
				data: datita
            }]
		},
		options: {
			responsive: true
		}
	});

}

getResourcesnoPromise()