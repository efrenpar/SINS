

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
        
    $('#Combinacion').each(function() {
        $(this).find("option:last").remove();
      });
    //$("#Combinacion").empty()

})

$("#basura").click((event)=>{
        
    $("#Combinacion").empty()

})