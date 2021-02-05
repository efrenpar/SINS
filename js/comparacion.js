

$("#Combinar").click((event)=>{
        
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    if(sexo!==""){
        sexo=sexoDict[sexo]
    }
    createOption(sexo+"-"+provincia+"-"+canton,"Combinacion")

})


$("#Remover").click((event)=>{
        
    $("#Combinacion").empty()

})