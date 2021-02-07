function calcularRelativos(chart){
    labels = getLabels(chart);
    bars = getBars(chart,labels.length)

    for(var i=labels.length-1;i>=0;i--){
        addData(chart,labels[i],bars[i])
    }

    
    chart.update();
}

function calcularReversa(chart){
    labels = getLabels(chart);
    bars = getBars(chart,labels.length)
    var total=$(`#numberLabel`).text();

    for(var i=labels.length-1;i>=0;i--){
        addData(chart,labels[i],Math.ceil((bars[i]/100)*total))
    }

    //
    chart.update();


}


function checkBars(chart){
    var bars;
    var labels;
    var check = $("#pie-chart").attr("data-porcentajes");
    if(check!="ok"){
        $("#pie-chart").attr("data-porcentajes","ok");
        calcularRelativos(chart);
    }else{
        $("#pie-chart").attr("data-porcentajes","");
        calcularReversa(chart)
    }
    
    
    

}


$("#Combinar").click((event)=>{
        
    var sexo = $("#numberLabel").attr("data-sexo");
    var provincia = $("#numberLabel").attr("data-provincia");
    var canton = $("#numberLabel").attr("data-canton");
    var id_option;
    var mixed;
    var numeroDeOpciones = $("#Combinacion option").length
    if(sexo!==""){
        sexo=sexoDict[sexo]
    }else{
        sexo = "CUALQUIER SEXO"
    }

    if(canton==""){

        canton = "TODOS"
    }

    mixed = provincia+"-"+canton+"-"+sexo;
    if(!$(`#Combinacion option[id='${mixed.replace(/\s/g, '-')}']`).length > 0){
        if(provincia!=="" || canton!=="" || sexo!==""){
            id_option = createOption(provincia+"-"+canton+"-"+sexo,"Combinacion")
         }
    };

    

    $(`#${id_option.id}`).click(event=>{
        $("#Combinacion > option").each(function() {
            $(this).removeAttr("value")
        });
        $(`#${id_option.id}`).attr("value","x")
    })

    if(numeroDeOpciones>=6){
        Lobibox.notify('info', {
            position: 'top left',
            msg: 'Se recomienda generar hasta un máximo de 6 comibinaciones.'
        });
    }

})


$("#Remover").click((event)=>{
        
    $('#Combinacion').each(function() {
        $(this).find("[value=x]").remove();
      });

})

$("#basura").click((event)=>{
        
    $("#Combinacion").empty()

})

$(function() {
    $('#slide').bootstrapToggle({
      on: 'Absoluto',
      off: 'Porcentual'
    });
  })

  $(function() {
    $('#slide').change((event)=>{
        checkBars(chart)
    })
  })


