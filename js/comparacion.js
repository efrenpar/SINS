function checkBars(){
    
    var check = $("#pie-chart").attr("data-porcentajes");
    if(check!="ok"){
        $("#pie-chart").attr("data-porcentajes","ok");
    }else{
        $("#pie-chart").attr("data-porcentajes","");
    }

}


$("#Combinar").click((event)=>{
        
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    var id_option;

    if(provincia =="TODO EL ECUADOR" ){
        provincia = "";
    }
    var query = createFilterSQL(provincia,canton,sexo);
    getNumeroNinos(query,"numberLabel")
    id_porcentajes.forEach((element)=>{
        var queryUp = updatePorcentajesSQL(query,element.id);
        executeUpPorcen(queryUp,element.name)
        
    })
    var cequery = createCedulaSQL()
    var newquery = updatePorcentajesSameOrSQL(cequery,provincia,canton,sexo);
    executeUpPorcen(newquery,"Cedulados")
    

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

$(function() {
    $('#slide').bootstrapToggle({
      on: 'Absoluto',
      off: 'Porcentajes'
    });
  })

  $(function() {
    $('#slide').change((event)=>{
        checkBars()
    })
  })