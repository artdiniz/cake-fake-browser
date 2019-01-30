barraEndereco.onkeydown = function(event) {
    if(event.key == 'Enter'){
        const endereco = barraEndereco.value.substr(0,6) == 'http://'
            ? barraEndereco.value
            : 'http://' + barraEndereco.value
        
        janelaPrincipal.src = endereco
    }
}