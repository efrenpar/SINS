const ninos = "ninos_dinardap"

function createDistinct(id){
    var query;

    query = `select distinct(t1.\"PROVINCIA_CENTRO\") from 
    \"${id}\" as t1 order by t1.\"PROVINCIA_CENTRO\"`

    return query;
}

function createOption(option){

    $("#Provincia").append(`<option value = "">${option}</option>`)
    
}


function getDinardapRecords(id){
    console.log(createDistinct(id));
    $.ajax({
        url:api_url+datastoreSQL,
        type:'POST',
        data:{
            sql:createDistinct(id)
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
                console.log(element);
                createOption(element.PROVINCIA_CENTRO);    
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

getProvincias()