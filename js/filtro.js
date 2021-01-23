const ninos = "ninos_dinardap"
const ECUAS = "TODO-EL-ECUADOR"

function createDistinctProvincias(id){
    var query;

    query = `select distinct(t1.\"PROVINCIA_CENTRO\") from 
    \"${id}\" as t1 order by t1.\"PROVINCIA_CENTRO\"`

    return query;
}

function createDistinctCanton(provincia){
    var query;

    query = `select distinct(t1.\"CANTON_CENTRO\") 
    from \"${ninos_id}\" as t1 
    where t1.\"PROVINCIA_CENTRO\" = '${provincia}'`

    return query;

}

function cleanCriteria(){
    $("#numberLabel").attr("data-provincia","");
    $("#numberLabel").attr("data-canton","");
}




function createFilterSQL(provincia,canton,sexo){

    var query = `select count(*) from \"${ninos_id}\" as t1`;
    if(provincia != ""|| canton != "" || sexo != ""){
        query +=` where`;
    }

    if(sexo && canton){

        query +=` t1.\"CANTON_CENTRO\" = '${canton}' 
        and t1.\"SEXO\" = ${sexo}`;
    }else if (provincia && sexo){
        query +=` t1.\"PROVINCIA_CENTRO\" = '${provincia}' 
        and t1.\"SEXO\" = ${sexo}`;
    }else if(canton && provincia ){
        query +=` t1.\"CANTON_CENTRO\" = '${canton}'`;
    }else if(!canton && provincia){
        query +=` t1.\"PROVINCIA_CENTRO\" = '${provincia}'`;
    }else if(provincia!="TODO EL ECUADOR" && sexo){
        
        query +=` t1.\"SEXO\" = ${sexo}`;
        
    }else{
        query = `select count(*) from \"${ninos_id}\" as t1`;

    }
    console.log(query);
    return query;
}

function updatePorcentajesSameOrSQL(query,provincia,canton,sexo){

    if(provincia != ""|| canton != "" || sexo != ""){
        query +=` and`;
    }

    

    if(sexo && canton){

        query +=` t1.\"CANTON_CENTRO\" = '${canton}' 
        and t1.\"SEXO\" = ${sexo}`;
    }else if (provincia && sexo){
        query +=` t1.\"PROVINCIA_CENTRO\" = '${provincia}' 
        and t1.\"SEXO\" = ${sexo}`;
    }else if(canton && provincia ){
        query +=` t1.\"CANTON_CENTRO\" = '${canton}'`;
    }else if(!canton && provincia){
        query +=` t1.\"PROVINCIA_CENTRO\" = '${provincia}'`;
    }else if(provincia!="TODO EL ECUADOR" && sexo){
        
        query +=` t1.\"SEXO\" = ${sexo}`;
        
    }

    console.log(query);
    return query;


}

function removeBraces(query){
    query=query.replace(`count`,"")
    query=query.replace(`)`," ")
    query=query.replace(`(`," ")

    return query;
}

function modifyLabel(nuevoValor,label){
   
    
    $("#"+label).empty();
    $("#"+label).text(nuevoValor);
}


function hasWhiteSpace(s,token) {
    return s.indexOf(token) >= 0;
  }

  function createOption(option,id_filter){
    var dict={}
    var id = option;
    if(hasWhiteSpace(option," ")){
        id = option.replace(/\s/g, '-')
    }

    
    $("#"+id_filter).append(`<option value = "" id="${id}" >${option}</option>`)

    dict["id"] = id;
    dict["option"] = option;
    return dict; 

}

function updatePorcentajesSQL(query,id){
    var position=query.indexOf(`"`);
    if(!query.includes("where")){
        query +=` where`;
    }else{
        query +=` and`;
    }
    var newquery=query;

    if(id!=0){
        id = `"${id}" as t2, `  
        newquery = [query.slice(0, position), id, query.slice(position)].join('');
        newquery+=` t1.\"DOCUMENTOIDENTIDAD\"=t2.\"DOCUMENTOIDENTIDAD\"`;
    }
    
    
    return newquery;

}



function getNumeroNinos(Mysql,id){
    
    $.ajax({
        url:api_url+datastoreSQL,
        type:'POST',
        data:{
            sql:Mysql
        },
        headers: {
            authorization: token
        },
        dataType:'json',
        error:function(err){
            errorRequest(err)
        },
        success:function({result}){
            var numeroLabel = result.records[0].count
            modifyLabel(numeroLabel,id);
        }

    });
}

  function getCanton(provincia){
    $.ajax({
        url:api_url+datastoreSQL,
        type:'POST',
        data:{
            sql:createDistinctCanton(provincia)
        },
        headers: {
            authorization: token
        },
        dataType:'json',
        error:function(err){
            errorRequest(err)
        },
        success:function({result}){
            $("#Canton").empty()
            var cantones = result.records
            cantones.forEach((element)=>{
                var result=createOption(element.CANTON_CENTRO,"Canton");
                $("#"+result.id).click((event)=>{
                    
                    $("#numberLabel").attr("data-canton",`${element.CANTON_CENTRO}`);
                })
                
            })
            $("#Canton").removeAttr('disabled');
        }

    });

}

function executeUpPorcen(query,name){
    $.ajax({
        url: api_url + datastoreSQL,
        type: 'POST',
        data: {
            sql: query
        },
        headers: {
            authorization: token
        },
        dataType: 'json',
        error: function (err) {
            errorRequest(err)
        },
        success: function ({ result }) {
            
            var counts = result.records[0].count;
            if("prestacion" in result.records[0]){
                recurso={
                    "ninos": $("#numberLabel").text(),
                    "prestacion": result.records[0].prestacion
                }

            }else{
                recurso={
                    "ninos": $("#numberLabel").text(),
                    "prestacion": counts
                }
            }
            boxTemplate(name,recurso)

        }
    
    });
}



function getDinardapRecords(id){
    
    $.ajax({
        url:api_url+datastoreSQL,
        type:'POST',
        data:{
            sql:createDistinctProvincias(id)
        },
        headers: {
            authorization: token
        },
        dataType:'json',
        error:function(err){
            errorRequest(err)
        },
        success:function({result}){
            var provincias = result.records
            provincias.forEach(element => {
                getCoordenadasProvincias(ninos_id,element.PROVINCIA_CENTRO)
                var result =createOption(element.PROVINCIA_CENTRO,"Provincia");
                $("#"+result.id).click((event)=>{getCanton(result.option);
                    
                    $("#numberLabel").attr("data-provincia",`${element.PROVINCIA_CENTRO}`);
                    $("#numberLabel").attr("data-canton",``);
                    $("#numberLabel").attr("data-sexo",``);
            
                });    
            });
        }

    });
}


function getProvincias(){
    $.ajax({
        url:api_url+accionResourchSearch,
        type:'POST',
        data:{
            query:"name:"+ninos 
        },
        headers: {
            authorization: token
        },
        dataType:'json',
        error:function(err){
            errorRequest(err)
        },
        success:function({result}){
            var id = result.results[0].id
            getDinardapRecords(id)
        }

    });
     
}


var optionDict= createOption("TODO EL ECUADOR","Provincia")
$("#"+optionDict.id).click(function(){
    $("#Canton").prop("disabled","true");
    cleanCriteria();
    $("#numberLabel").attr("data-provincia","TODO EL ECUADOR");
});

Object.entries(sexoDict).forEach(([key, value]) => {
    var result = createOption(value,"Ninos");
    $("#"+result.id).click((event)=>{
        $("#numberLabel").attr("data-sexo",`${key}`);
    });
});

$("#filtro").click(function(){
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    if(provincia =="TODO EL ECUADOR" ){
        provincia = "";
    }
    var query = createFilterSQL(provincia,canton,sexo);
    getNumeroNinos(query,"numberLabel")
    $("#porcentajes").empty();
    id_porcentajes.forEach((element)=>{
        var queryUp = updatePorcentajesSQL(query,element.id);
        executeUpPorcen(queryUp,element.name)
        
    })
    var cequery = createCedulaSQL()
    var newquery = updatePorcentajesSameOrSQL(cequery,provincia,canton,sexo);
    executeUpPorcen(newquery,"Cedulados")
    
    fillTable(datastoreSQL,{"sql":removeBraces(query)});

});

getProvincias()