var mymap = L.map('mapid').setView([-1.36569,-79.90075], 6);
const attribution = ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl,{attribution}); 
const colors ={
    red:"red",
    blue:"blue",
    green:"#8eefa1",
    violet:"#a02adb"
}
tiles.addTo(mymap);

function shapeColor(number){
    var text ;
    if(number>=75){
        text = colors.green;
    }else if(number<=75 && number>=50){
        text = colors.blue;
    }else if(number<=50 && number>=25){
        text = colors.violet;
    }else{
        text = colors.red;
    }
    return text;
}



function createShapes(coordenadas, porcentaje, texto){
    var colorShape = shapeColor(porcentaje);
    var circle = L.circle([coordenadas.x_axis, coordenadas.y_axis], {
        color: colorShape,
        fillColor: colorShape,
        fillOpacity: 0.5,
        radius: 30000
    }).addTo(mymap);
    circle.bindPopup(`Esta es la provincia: ${texto}`);
}

function createCoordenadasProvinciaSQL(ninos_id,provincia){
    var query;
    query = `select AVG(t1.\"COORDENADA_X_CENTRO\") as y_axis, 
    (select  AVG(\"COORDENADA_Y_CENTRO\") from \"${ninos_id}\" 
    where \"PROVINCIA_CENTRO\"='${provincia}' ) AS x_axis 
    from \"${ninos_id}\" as t1 
    where t1.\"PROVINCIA_CENTRO\"='${provincia}'`

    return query;
}

function getCoordenadasProvincias(ninos_id,provincia){
    query = createCoordenadasProvinciaSQL(ninos_id,provincia);
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
            var coordenadas = result.records[0]
            
            createShapes(coordenadas,50,provincia)
        }

    });

}






/*
var popup = L.popup()
    .setLatLng([-0.281842978746666, -78.5420724454252])
    .setContent("I am a standalone popup.")
    .openOn(mymap);


function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
}
*/
/*
mymap.on('click', onMapClick);
*/

