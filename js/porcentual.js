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

function createJoinSQL(prestacion, dinardap) {
    var query = "select count(*)/(SELECT COUNT(*) "
        + "FROM \"" + prestacion + "\" )*100 as porcentaje "
        + ",count(t1._id) as ninos, count(*) as prestacion "
        + "from \"" + prestacion + "\" as t1 "
        + "inner join \"" + dinardap + "\" as t2 "
        + "on t1.\"DOCUMENTOIDENTIDAD\"=t2.\"DOCUMENTOIDENTIDAD\""
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

function getPorcentajes(query) {
    return new Promise((resolve, reject) => {
        console.log(query);
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
    if(number>75){
        text = "text-info";
    }else if(number<75 && number>50){
        text = "text-success";
    }else if(number<50 && number>25){
        text = "text-danger";
    }else{
        text = "text-inverse"
    }
    return text;
}

function progessBarColor(number){
    var text ;
    if(number>75){
        text = "progress-bar-info";
    }else if(number<75 && number>50){
        text = "progress-bar-success";
    }else if(number<50 && number>25){
        text = "progress-bar-danger";
    }else{
        text = "progress-bar-inverse"
    }
    return text;
}


function boxTemplate(name, recurso) {
    var element = `<div class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
    <div class="analytics-sparkle-line reso-mg-b-30">
            <div class="analytics-content">
            <h5>${name}</h5>
            <h2>#<span class="counter" id="${name}">${recurso.prestacion}</span> <span class="tuition-fees">Tuition Fees</span></h2>
            <span class=${fontColor(recurso.porcentaje)}>${recurso.porcentaje}</span>
            <div class="progress m-b-0">
                <div class="progress-bar ${progessBarColor(recurso.porcentaje)}" role="progressbar" aria-valuenow="70"
                    aria-valuemin="0" aria-valuemax="100" style="width:${recurso.porcentaje}%">
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
                    query = createJoinSQL(value.id,values[3]["id"]);
                    getPorcentajes(query).then(result=>{boxTemplate(value.name,result)})
                })
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

function fillTable(){
    $.ajax({
        url: api_url + search,
        type:'POST',
        dataType: 'json',
        data: { resource_id: "b0ee185f-fc8a-4575-8b70-c54c6a3b93a5"},
        headers: {
            authorization: token
        },
        error: (err)=>{
            errorRequest(err)
        },
        success: (response) => {
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
                ],
                data: response.result.records.map(item=>{
                    item.SEXO = sexoDict[item.SEXO];
                    item.FECHANACIMIENTO_NN = item.FECHANACIMIENTO_NN.split(' ')[0];
                    return item;
                })
            })
        }
    })
}
getResources().then((result) => { createBoxes(result); fillTable()});

