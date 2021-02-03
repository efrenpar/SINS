
var datita=[];
var recursos=[];
var chart;

function mixLabelWithFilter(label,dict){
    

    Object.entries(dict).forEach(([key,value])=>{
        if(value!==''){
            
            if(key=="sexo"){
                label+=`|${sexoDict[value]}`;
            }else{
                label+=`|${value}`;
            }
        }
    })

    return label;
}

function agregarFeature(nombre,id_source){

    var cadena = $(`#features`).attr("data-checks");
    if($(`#${nombre}`).attr("checked")!="checked"){
        cadena+=` ${id_source.name}`
        $(`#${nombre}`).attr("checked","true");
        $(`#features`).attr("data-checks",cadena);
    }else{
        cadena=cadena.replace(` ${id_source.name}`,'');
        console.log(cadena)
        $(`#${nombre}`).removeAttr("checked");
        $(`#features`).attr('data-checks',cadena);
    }


}

function generateCheckbox(prestacion,id){
    var Newname=prestacion.name.replace(/-/g," ");
        if(Newname==="ninos_dinardap"){
            Newname = "Cedulados"
        }
    var id_Checkbox = upperCAseFirst(Newname.substring(0, 2));
    var checkbox = `<li  >
    <label>${upperCAseFirst(Newname)} 
    (${id_Checkbox})
    <input id="${id_Checkbox}" 
    data-nombre = "${prestacion}"
    class="pull-left radio-checked"  
    type="checkbox"></label></li>`;

    $(`#${id}`).append(checkbox);
    $(`#${id_Checkbox}`).click(element=>
        agregarFeature(id_Checkbox,prestacion));
}


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
            Newname = "Ce"
        }
        label += `|${upperCAseFirst(Newname.substring(0, 2))}`;
    })

    console.log(label)
    return label;
}

function createPieSQL(array){

    

    var query = `select count(*) from \"${ninos_id}\" as t1 `
    var number=2;
    var cedulado;
    array.forEach(element=>{
        
        if(element.id!==ninos_id){
            query=createJoinpiece(element.id,query,number,number-1)
        //console.log(element)
            number++;
        }else{
            cedulado = element.id;
            
        }
        
    })
    if(cedulado===ninos_id){
        query = createCedulaPart(query)
    }
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

function createFilterDict(){
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    var dict = {

        sexo :sexo,
        provincia:provincia,
        canton:canton


    }

    return dict;

}

function createFilterPart(query,dict){
    var quericito = query;

    if(dict.provincia =="TODO EL ECUADOR" ){
        dict.provincia = "";
    }
    if(dict.sexo && dict.canton){

        query +=` and t1.\"CANTON_CENTRO\" = '${dict.canton}' 
        and t1.\"SEXO\" = ${dict.sexo}`;
    }else if (dict.provincia && dict.sexo){
        query +=` and t1.\"PROVINCIA_CENTRO\" = '${dict.provincia}' 
        and t1.\"SEXO\" = ${dict.sexo}`;
    }else if(dict.canton && dict.provincia ){
        query +=` and t1.\"CANTON_CENTRO\" = '${dict.canton}'`;
    }else if(!dict.canton && dict.provincia){
        query +=` and t1.\"PROVINCIA_CENTRO\" = '${dict.provincia}'`;
    }else if(dict.provincia!="TODO EL ECUADOR" && dict.sexo){
        
        query +=` and t1.\"SEXO\" = ${dict.sexo}`;
        
    }
    else if(dict.provincia==='TODO EL ECUADOR'){
        query = quericito
    }

    console.log(query);
    return query;
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
                generateCheckbox(dict,"features");
                
                
            });
            generarButton(dictList)
            
        }
        
    });


}

function createPie(label,datita,colors){
    Chart.defaults.scale.ticks.beginAtZero=true;
    var ctx = document.getElementById("piechart");
	var piechart = new Chart(ctx, {
		type: 'bar',
		data: {
			datasets: [{
                label: "Niños dinardap",
                backgroundColor: "blue",
                
            },
            ]
		},
		options: {
			responsive: true
        }
        
    });
    
    return piechart;

}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

function generarButton(dictList){

    $("#generar").click((event)=>{
        var cadenaChecks = $("#features").attr("data-checks");
        var tokens = cadenaChecks.split(" ");
        var Resourcesdict = {}
        var myarray=[]
        var query;
        var label=[]

        if(tokens.length==2){
            mostrarModalInformation()
            return;
        }else if(tokens.length==1){
            myarray = dictList
        }else{
            dictList.forEach(element=>{
                Resourcesdict[element.name]=element.id
            })
            tokens.forEach(element=>{
                if(element!==""){
                    myarray.push({
                        name:element,
                        id:Resourcesdict[element]
                    })
                }
            })
            
        }
        query = createPieSQL(myarray)
        label.push(createLabel(myarray));
        var filterDict = createFilterDict()
        label=mixLabelWithFilter(label,filterDict)
        query=createFilterPart(query,filterDict)
    
        execpieSQL(query).then(result=>{
            addData(chart,label,result)
        })
    
        console.log(myarray)
        console.log(dictList)
        console.log(tokens)

        
    });

}

function LimpiarButton(chart){
    $("#Limpiar").click((event)=>{
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
        chart.update();
    })

}

function mostrarModalInformation(){
    $(`#InformationproModalalert`).modal("show");
}

$("#allChecks").change((event)=>{
    if($("#allChecks").attr("checked")!="checked"){
        id_porcentajes.forEach(element=>{
            $(`#${upperCAseFirst(element.name.substring(0, 2))}`).prop("hidden","true");
            $(`#${upperCAseFirst(element.name.substring(0, 2))}`).removeAttr('checked');
            $("#features").attr("data-checks","");
            $("#allChecks").attr("checked","true");
        })
        $(`#Ce`).removeAttr('checked');
        $(`#Ce`).prop("hidden","true");
    }else{
        id_porcentajes.forEach(element=>{
            $(`#${upperCAseFirst(element.name.substring(0, 2))}`).removeAttr('hidden');
            $("#allChecks").removeAttr("checked");
        })
        $(`#Ce`).removeAttr("hidden");
    }
});



chart = createPie()
LimpiarButton(chart)
getResourcesnoPromise()