
/** Cria a margem */
var margin = {top: 20, right: 120, bottom: 20, left: 180},
	width = 1400 - margin.right - margin.left,
	height = 1700 - margin.top - margin.bottom;


var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// carrega os dados do arquivo json
d3.json("data/data2.json", function(error, treeData) {
 //root recebe raiz da árvores (arvore na posição 0)
  root = treeData[0];
  //chama a atualização passando o nó raiz
  update(root);
});

function update(source) {

  // Calcule o novo layout de árvore.
  var nodes = tree.nodes(root).reverse(), //recebe o primeiro nó
	  links = tree.links(nodes);
	  console.log(links[0]);
  // Normaliza a profundidade fixa
  //https://stackoverflow.com/questions/56321884/d3-js-tree-how-to-set-y-depth-of-a-specific-level
  nodes.forEach(function(d) { //define os espaçod entre os nós
	  d.y = d.depth * 150; //d.y rece a profundidade vezes
	 // console.log(d.name)
	  //console.log(d.depth);
	  //console.log(d.id)
  });

  // Declara os nós
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { 
		  return d.id /* || (d.id = ++i) */; 
	   });

  // Insere os nós
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		  return "translate(" + d.y + "," + d.x + ")"; 
	  });

 /**cria o circulo  */
  nodeEnter.append("circle")
	  .attr("r", 8) //raio de cada circulo
	  .style("fill", "#fff");

/**responsavel pelo texto de cada nó */
  nodeEnter.append("text")
	  .attr("x", function(d) { // nos itens folhas posiciona o texto após o
		  return d.children || d._children ? -12 : 12; })
	  .attr("dy", ".10em")
	  /**nos itens raiz os nomes dos itens estarão antes do nó */
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "start"; }) 
	
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1);

  // Declare the links…
  //se o target.id for null, não será impresso a linha
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { 
		  return d.target.id;
	 });	  

  // Enter the links.
   link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal); 

}