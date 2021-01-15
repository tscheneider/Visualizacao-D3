/*Cria a canvas **/
var svg = d3.select("svg"),
    margin = 20,//define o tamanho de margem
    width = +svg.attr("width"),//define o tamanho de largura

    /**cria um grupo de informações, ajustando as largura das margens através do transform */
    g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");//transação responsavél por deslocar as margens altura/2 e na largura/2 (á área do gráfico é quadrada, por isso usamos só o valor de width)
        
/*Define o conjunto de cores que será usado**/
var color = d3.scaleLinear()
    .domain([-1, 5])//o dominio de cores vai de -1 a 5
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])//as cores variam entre hsl(152,80%,80%) até hsl(228,30%,40%)
    .interpolate(d3.interpolateHcl);//define que as cores vão variar de acordo com a escala de range

/** d3.pack - Cria um layout de pacote com as configurações padrão: a ordem de classificação padrão é por valor crescente; o acesso os filhos padrão assume que cada dado de entrada é um objeto com um array de filho; o tamanho padrão é 1 × 1*/
var pack = d3.pack()
    .size([width - margin, width - margin])//determina a largura e a altura do Circle Packing
    .padding(2);//espaçamento entre os circulos


/*Realiza a leitura do arquivo json**/
d3.json("data/flare.json", function(error, root) {
    /*Caso ocorra um erro na leitura do arquivo, apresenta o erro**/
    if (error) throw error;

   /* Uma vez que estamos lidando com dados hierárquicos precisamos converter os dados para o formato correto*/
   /*root recebe os dados em formato hierarquico**/
    root = d3.hierarchy(root)
        .sum(function(d) { return d.size; })//soma os tamanhos dos nós
        .sort(function(a, b) { return b.value - a.value; });// classifica os filhos em cada nível dos dados 

    var focus = root,//focus recebe os dados em formato hierarquicos
        nodes = pack(root).descendants(),//recebe os dados no farmato pack hierarquiamente criando uma matriz que começa com o nó raiz e depois seguido por cada filho em ordem topológica.
        view;
        //console.log(focus)
    /** */
    var circle = g.selectAll("circle")//seleciona todos os grupos de circle 
        .data(nodes)//adiciona os nós da árvore
        .enter().append("circle")//acrescenta cada circulo
        .attr("class", function(d) { 
            //console.log(d.parent)
            //console.log(d.children)
            return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; 
        })//se não existir d.parent retorna "node node -root", se existir verifica se há filhos, se tiver filhos retorna node, se não tiver filhos retorna node node--leaf
        .style("fill", function(d) { return d.children ? color(d.depth) : null; })//se houver filhos preenche com uma cor de acordo com a profundidade do nó
        .on("click", function(d) { //ao clicar
            console.log(focus)
            console.log(d)
            if (focus !== d) //verifica se o gráfico está com o zoom focado em um dos circulos internos
                zoom(d), d3.event.stopPropagation();//chama a função zoom passando o circulo que ele esta focando e o d3.event.stopPropagation();impede que o evento se propague para o manipulador de cliques SVG. Sem ele, um novo ponteiro seria criado onde o atual está sendo removido.
         }); 

    /*Adicione rótulos de texto**/
    var text = g.selectAll("text")//seleciona todos os grupos de text
    .data(nodes)//coloca o texto dentro de seu respectivo circulo
    .enter().append("text")//adiciona um novo texto
        .attr("class", "label")//atribui novo label
        .style("fill-opacity", function(d) { 
            return d.parent === root ? 1 : 0; 
         })//opacidade de pre nnchimento
    .style("font-size", "23px")//tamanho de fonte
    .text(function(d) { return d.data.name; })//adiciona o texto 

    //console.log(nodes)
    /**node recebe todos os grupos de circulos e texto */
    var node = g.selectAll("circle,text");

    //console.log(node)
    /** Ao clicar no backgrounnd chama a função zoom*/
    svg.style("background", color(-1))
        .on("click", function() {//ao clicar chama a função zoom passando a arvore
             zoom(root); 
        });

    /** */
    zoomTo([root.x, root.y, root.r * 2 + margin]);

    /**Função responsável por realizar o zoom */
    function zoom(d) {

        var focus0 = focus; //recebe focus
            focus = d;//focus recebe em qual circulo foi clicado

        /**Realiza a transição de um circulo para outro */
        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)//tempo em que ocorre a movimentação
            .tween("zoom", function(d) {//realiza a interpolação do zoom
                 var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);//atribui a i o retorno interpolador entre os dois pontos em um plano bidimensional. Cada visualização é definida como uma matriz de três números: focus.x , focus.y e focus.r * 2 + margin . As duas primeiras coordenadas representam o centro da janela de exibição; a última largura da última coordenada representa o tamanho da janela de visualização. 
                return function(t) {//chama a função zoomTo para cada valor i
                    zoomTo(i(t)); 
                 };
            });
        /*Transição do texto*/
        transition.selectAll("text")
        .filter(function(d) { 
            return d.parent === focus || this.style.display === "inline"; 
            })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }
        /**Realiza a transformação do zoom */
        function zoomTo(v) {
            var k = width / v[2]; 
                view = v;
            node.attr("transform", function(d) {//todos os grupos de circulos serão transformados
                 return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; //realiza a movimentação dos circulos
            });
            circle.attr("r", function(d) { //calcula o raio de cada circulo 
                return d.r * k; 
            });
   }
});