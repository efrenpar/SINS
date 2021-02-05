

$("#Combinar").click((event)=>{
        
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    if(sexo!==""){
        sexo=sexoDict[sexo]
    }
    if(sexo!=="" || provincia!=="" || canton!==""){
        createOption(sexo+"-"+provincia+"-"+canton,"Combinacion")
    }

})


$("#Remover").click((event)=>{
        
    $("#Combinacion").empty()
    $("#numberLabel").attr("data-sexo","")
    $("#numberLabel").attr("data-provincia","")
    $("#numberLabel").attr("data-canton","")

})