

$("#Combinar").click((event)=>{
        
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    var id_option;

    

    if(sexo!==""){
        sexo=sexoDict[sexo]
    }
    if(sexo!=="" || provincia!=="" || canton!==""){
       id_option = createOption(sexo+"-"+provincia+"-"+canton,"Combinacion")
    }

    $(`#${id_option.id}`).click((event)=>{
       $(`#${id_option.id}`).remove()
    })
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