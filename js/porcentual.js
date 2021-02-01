//const api_url = 'http://192.168.100.28:5000/api/3/action'
const api_url = 'http://localhost:5000/api/3/action'
const accionBuscarRecursos = '/current_package_list_with_resources'
const accionBuscarDatastore = '/datastore_search'
const accionResourchSearch = "/resource_search"
const organization = 'sistema-seguimiento'
const token = 'c35c1d70-45c8-40d7-a19f-c8cc0a4fa53a'
const search = '/datastore_search'
const datastoreSQL = '/datastore_search_sql'
const sexoDict = { 16:"MASCULINO", 17:"FEMENINO", 144: "INTERSEXUAL"}
const ninos_id = "b0ee185f-fc8a-4575-8b70-c54c6a3b93a5"; 
const documentIdTyipo = {5:"No Identificado", 6:"Cédula de Identidad",
    7:"Pasaporte",8:"Visa",9:"Carnet de Refugiado" }
const parentesco = {63:"Padre o madre",67:"Hermano/a",68:"Otro familiar",
    69:"No familiar",4763:"Abuelo/a",4764:"Tio/a",4765:"Primo/a"}
const longitud_talla_edad = {343:"Alta Talla para Edad",344:"Normal",345:"Normal/Seguimiento",
    346:"Normal/Intervención inmediata",347:"Baja Talla",348:"Baja Talla Severa"}
const imc_edad = {369:"Obesidad",370:"Sobrepeso",371:"Normal/Intervención inmediata (Riesgo de sobrepeso)"
    ,372:"Normal/Seguimiento (Riesgo de sobrepeso)",373:"Normal",374:"Normal/Seguimiento (Riesgo de emaciación)"
    ,375:"Normal/Intervención inmediata (Riesgo de emaciación)",376:"Emaciado",377:"Severamente Emaciado"}
const indicador_anemia = {319:"Anemia severa",320:"Anemia moderada",321:"Anemia leve",322:"Sin anemia"}
const indicador_peso_talla = {360:"Obesidad",361:"Sobrepeso",362:"Normal/Intervención inmediata (Riesgo de sobrepeso)"
    ,363:"Normal/Seguimiento (Riesgo de sobrepeso)",364:"Normal",365:"Normal/Seguimiento (Riesgo de emaciación)"
    ,366:"Normal/Intervención inmediata (Riesgo de emaciación)",367:"Emaciado",368:"Severamente Emaciado"}
const prescripcion = {null:"vacío/no aplica",1:"si",2:"no"}
const peso_edad = {
    349:"Peso Elevado para la Edad",350:"Normal",351:"Normal/Seguimiento"
    ,352:"Bajo Peso",353:"Bajo Peso Severo",354:"Peso Elevado para la Edad"
    ,355: "Normal/Seguimiento (Riesgo de Sobrepeso)",356:"Normal"
    ,357: "Normal/Seguimiento (Riesgo de Bajo peso)",358:"Bajo Peso"
    ,359:"Bajo Peso Severo"
}


var id_porcentajes=[];

function createJoinSQL(prestacion, dinardap) {
    var query = `select (select count(*) from "${dinardap}") as ninos, 
    count(*) as prestacion from "${prestacion}" as t1 
    inner join "${dinardap}" as t2 
    on t1."DOCUMENTOIDENTIDAD"=t2."DOCUMENTOIDENTIDAD"`

    return query;
}

function createCedulaSQL() {
    var query = `select count(*) as prestacion, 
    (select count (*) from \"${ninos_id}\") as ninos from 
    \"${ninos_id}\" as t1 
    where t1.\"TIPODOCUMENTOIDENTIFICACION\" <> 5`

    return query;
}

function getdatesByNinoSQL(idNino,idPrestacion){
    var query = `select ne.\"FDESDEOPTIMO\",ne.\"FHASTAOPTIMO\", 
    ne.\"RESULTADOFECHAENTREGA\", ne.\"RESULTADO\" 
    from \"${ninos_id}\" as t1, 
    \"${idPrestacion}\" as ne 
    where t1.\"DOCUMENTOIDENTIDAD\"=ne.\"DOCUMENTOIDENTIDAD\" 
    AND t1.\"DOCUMENTOIDENTIDAD\"= '${idNino}'`

    return query;
}


function errorRequest(err) {
    switch (err.status) {
        case "400":
            console.log("bad request")
            break
        case "401":
            console.log("unauthorized");
            break;
        case "403":
            console.log("forbidden");
            break;
        default:
            console.log("unknown error");
            break;
    }
}

function headerTabalePres(){
    var component=`<col>
    <colgroup span="2"></colgroup>
    <colgroup span="2"></colgroup>
    <tr>
    <td rowspan="2"></td>
    </tr>
    <tr>
    <th scope="col">Fecha desde optimo</th>
    <th scope="col">Fecha hasta optimo</th>
    <th scope="col">Fecha de entrega</th>
    <th scope="col">Resultado</th>
    </tr>
    `
    $("#prestacionCom").append(component)
}

function thumbsUp(idLabel,prescripcion){

    $("#"+idLabel).empty()
    var signUp = `<i class="fa fa-thumbs-up" style="font-size:36px;color:green"></i>`;
    var signdown = `<i class="fa fa-thumbs-down" style="font-size:36px;color:red"></i>`;
    if("si"==prescripcion || "Óptimo"==prescripcion){
        $("#"+idLabel).append(signUp);

    }else if("no"==prescripcion || "Oportuno"==prescripcion){
        $("#"+idLabel).append(signdown);
    }else{
        $("#"+idLabel).text("No hay registro");
    }

}


function crateTableComponent(record,name){
    var Newname=name.replace(/-/g," ");
    var component = `
    
    
    <tr>
    <th scope="row">${upperCAseFirst(Newname)}</th>
    <td>${record.FDESDEOPTIMO.split(" ")[0]}</td>
    <td>${record.FHASTAOPTIMO.split(" ")[0]}</td>
    <td>${record.RESULTADOFECHAENTREGA.split(" ")[0]}</td>
    <td id="P${name}"></td>
  </tr>`

  $("#prestacionCom").append(component)
  thumbsUp(`P${name}`,record.RESULTADO)
}

function makeDates(dateString){
    var date;
    var format;
    format = dateString.split(" ")[0].split("/")
    date = new Date("20"+format[2],format[1],format[0]);
    return date;

}

function execGetNinos(query,name){

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
            crateTableComponent(result.records[0],name)
            
        }

    });
}

function getPorcentajes(query) {
    return new Promise((resolve, reject) => {
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
                resolve(result.records[0])
            }

        });
    })
}

function fontColor(number){
    var text ;
    if(number>=75){
        text = "text-info";
    }else if(number<=75 && number>=50){
        text = "text-success";
    }else if(number<=50 && number>=25){
        text = "text-danger";
    }else{
        text = "text-inverse"
    }
    return text;
}

function progessBarColor(number){
    var text ;
    if(number>=75){
        text = "progress-bar-info";
    }else if(number<=75 && number>=50){
        text = "progress-bar-success";
    }else if(number<=50 && number>=25){
        text = "progress-bar-danger";
    }else{
        text = "progress-bar-inverse"
    }
    return text;
}

function upperCAseFirst(word){
    var result=word.charAt(0).toUpperCase()+word.slice(1);
    return result
}

function generarDireccionNino(idTag,columns){
    var direccion;

    direccion=`${columns.DIRECCION_DOMICILIO}, ${columns.CANTON_CENTRO}
                , ${columns.PROVINCIA_CENTRO}. "${columns.REFERENCIA_DOMICILIO}"`

    $("#"+idTag).text(direccion);

}




function boxTemplate(name, recurso) {
    var Newname=name.replace(/-/g," ");
    var porcentaje = (recurso.prestacion/recurso.ninos*100).toFixed(2);
    if(recurso.prestacion==0 && recurso.ninos==0){
        porcentaje=0.001;
    }

    var element = `<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
    <div class="analytics-sparkle-line reso-mg-b-30">
            <div class="analytics-content">
            <h5>${upperCAseFirst(Newname)}:<sapn>(${recurso.prestacion})</sapn></h5>
            <h2><span class="counter ${fontColor(porcentaje)}" id="${name}">${porcentaje}</span><span class="${fontColor(porcentaje)}">%</span></h2>
            <div class="progress m-b-0">
                <div class="progress-bar ${progessBarColor(porcentaje)}" role="progressbar" aria-valuenow="70"
                    aria-valuemin="0" aria-valuemax="100" style="width:${porcentaje}%">
                    <span class="sr-only">70% Complete</span>
                </div>            
            </div>
        </div>
    </div>
    </div>`
    $("#porcentajes").append(element);
    $(`#${name}`).counterUp({
        delay: 10,
        time: 1000
    })
}

function getResourceId(recurso) {
    return new Promise((resolve, reject) => {
        var name = recurso;
        var result = {};
        $.ajax({
            url: api_url + accionResourchSearch,
            type: 'POST',
            data: { query: "name:" + name },
            headers: {
                authorization: token
            },
            dataType: 'json',
            error: function (err) {
                errorRequest(err)
            },
            success: function ({ result }) {
                //var id = result.results[0].id;
                var id = result.results[0].id
                result = {
                    "name": name,
                    "id": id
                }
                resolve(result);
            }

        });
    })

}

function createBoxes({ result }) {
    idList = []
    resourcesDict = {}
    var organizationName = result[0].organization.name;
    promesaList = [];
    var lengthRecursos = result[0].resources.length;
    var recurso = result[0].resources;
    if (organization == organizationName) {
        recurso.forEach(element => {
            promesaList.push(getResourceId(element.name))
        });
        if (promesaList.length > 0) {
            Promise.all(promesaList).then((values) => {
                values.forEach(value => {
                    var query;
                    if(value.name!="ninos_dinardap"){
                        query = createJoinSQL(value.id,values[3]["id"]);
                        getPorcentajes(query).then(result=>{
                            boxTemplate(value.name,result);
                            $("#numberLabel").text(result.ninos);
                        })
                        dict={
                            "name": value.name,
                            "id": value.id
                        }
                        id_porcentajes.push(dict);
                        
                    }
                })
                var query = createCedulaSQL();
                getPorcentajes(query).then(result=>{boxTemplate("Cedulados",result)})
            })
        }
    }


}


function getResources() {
    return new Promise((resolve, reject) => {
        var recursos;
        $.ajax({
            url: api_url + accionBuscarRecursos,
            type: 'GET',
            dataType: 'json',
            error: function (err) {
                errorRequest(err)
            },
            success: function (result) {
                resolve(result);
            }

        });
    })


}



function headerTable(){
    
    $('#table').bootstrapTable('refresh')
    $('#table').bootstrapTable({
        columns:[
            {
                field: 'DOCUMENTOIDENTIDAD',
                title: 'Identificación'
            },
            {
                field: 'APELLIDOSNOMBRESNINO',
                title: 'Apellidos y Nombres'
            },
            {
                field: 'FECHANACIMIENTO_NN',
                title: 'Fecha Nacimiento'
            },
            {
                field: 'SEXO',
                title: 'Sexo'
            }
        ]
    })

}

function populateRows(response){

    $('#table').bootstrapTable('load',{
            data: response.result.records.map(item=>{
            item.SEXO = sexoDict[item.SEXO];
            item.SEXO_RL = sexoDict[item.SEXO_RL];
            item.TIPODOCUMENTOIDENTIFICACION = documentIdTyipo[item.TIPODOCUMENTOIDENTIFICACION];
            item.TIPODOCUMENTOIDENTIFICACION_RL = documentIdTyipo[item.TIPODOCUMENTOIDENTIFICACION];
            item.PARENTESCO_RL = parentesco[item.PARENTESCO_RL];
            item.LONGITUD_TALLA_EDAD = longitud_talla_edad[item.LONGITUD_TALLA_EDAD];
            item.IMC_EDAD = imc_edad[item.IMC_EDAD];
            item.INDICADOR_ANEMIA = indicador_anemia[item.INDICADOR_ANEMIA];
            item.INDICADOR_PESO_TALLA = indicador_peso_talla[item.INDICADOR_PESO_TALLA];
            item.PRESCRIPCION_CHISPAS = prescripcion[item.PRESCRIPCION_CHISPAS]; 
            item.PRESCRIPCION_VITAMINA_A = prescripcion[item.PRESCRIPCION_VITAMINA_A];
            item.PESO_EDAD = peso_edad[item.PESO_EDAD]
            item.FECHANACIMIENTO_NN = item.FECHANACIMIENTO_NN.split(' ')[0];
            return item;
        })
    })
    

}

function fillTable(search,datita){
    
    $.ajax({
        url: api_url + search,
        type:'POST',
        dataType: 'json',
        data: datita,
        headers: {
            authorization: token
        },
        error: (err)=>{
            errorRequest(err)
        },
        success: (response) => {
            
            populateRows(response)
        }
    })
}



$("#table").on("click-row.bs.table",function(editable, columns){
    $('#PrimaryModalhdbgcl').modal('show');
    $('#nombreNino').text(columns.APELLIDOSNOMBRESNINO)
    $("#TipoIdent").text(columns.TIPODOCUMENTOIDENTIFICACION);
    $("#DocumenIdent").text(columns.DOCUMENTOIDENTIDAD);
    $("#FechaNac").text(columns.FECHANACIMIENTO_NN);
    $("#TeleCelular").text(columns.TELEFONO_CELULAR);
    $("#TeleDomicilio").text(columns.TELEFONO_DOMICILIO);
    $("#fechaNaci").text(columns.FECHANACIMIENTO_RL);
    $("#nombreRL").text(columns.NOMBRECOMPLETO_RL);
    $("#documentoIdenRL").text(columns.DOCUMENTOIDENTIDAD_RL);
    $("#sexoRL").text(columns.SEXO_RL);
    $("#parentescoRL").text(columns.PARENTESCO_RL);
    $("#nombreCen").text(columns.NOMBRE_CENTRO_SALUD);
    $("#provinCentro").text(columns.PROVINCIA_CENTRO);
    $("#cantonCentro").text(columns.CANTON_CENTRO);
    $("#parroquiaCentro").text(columns.PARROQUIA_CENTRO);
    $("#direccionCentro").text(columns.DIRECCION_CENTRO);
    $("#fechaToma").text(columns.FECHA_TOMA);
    $("#peso").text(columns.PESO);
    $("#estatura").text(columns.ESTATURA);
    $("#lon-tal-edad").text(columns.LONGITUD_TALLA_EDAD);
    $("#pes-edad").text(columns.PESO_EDAD);
    $("#imc-edad").text(columns.IMC_EDAD);
    $("#ind-anemia").text(columns.INDICADOR_ANEMIA);
    $("#ind-peso-talla").text(columns.INDICADOR_PESO_TALLA);
    thumbsUp("vitA",columns.PRESCRIPCION_VITAMINA_A);
    thumbsUp("chipas",columns.PRESCRIPCION_CHISPAS);
    generarDireccionNino("direccionN",columns);
    $("#prestacionCom").empty()
    headerTabalePres()
    id_porcentajes.forEach(element=>{
        execGetNinos(getdatesByNinoSQL(columns.DOCUMENTOIDENTIDAD,element.id),element.name)
    })
})

headerTable();
getResources().then((result) => { createBoxes(result); fillTable(search,{ "resource_id": ninos_id})});



