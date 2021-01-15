function makeIcicle() {

  const height = 600
  const width  = 800
  const mapDepth = 4
  let rootNode

  format = d3.format(",d")
  //color = d3.scaleOrdinal(d3.schemeCategory20c);
  // color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))

  d3.json("sessao-estudos.json").then(function(data) {

    partition = data => {
      const root = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.height - a.height || b.value - a.value)
      return d3.partition()
          .size([height, (root.height + 1) * width / mapDepth])
        (root);
    }

    rootNode = partition(data)
    let focus = rootNode

    // bind the data to the nodes
    let cell = d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      .selectAll('g')
      .data(rootNode.descendants(), d => d.data.name)
      .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`)

    const rect = cell
      .append('rect')
      .attr("width", d => d.y1 - d.y0 - 1)//y
      .attr("height", d => rectHeight(d))//x
      .attr("fill-opacity", 0.6)
      .style("fill", d => {
        return d3.interpolateRdYlGn(d.data.name)
      }
      )
      .style("cursor", "pointer")
      .on("click", clicked)
      .on('mouseover', function (d) {
        d3.select(this)
          .attr('fill-opacity', '1')
          .attr('style', 'cursor: pointer')
      })
      .on('mouseout', function (d) {
        d3.select(this).attr('fill-opacity', '0.7')
      })

    // lable the rectangles
    const text = cell
      .style("user-select", "none")
      .append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .attr('fill-opacity', 0)
      .text(d =>{
        console.log(d)
        +labelVisible(d)
      } ).style('fill', 'darkOrange')

    text.append("tspan")
      .text(d => d.data.name)
      .attr("fill-opacity", d => labelVisible(d) * 0.7)
    
    const tspan = text.append("tspan")
      .attr("fill-opacity", d => labelVisible(d) * 0.7)
      .style('fill', 'darkOrange')
      .text(d => {
        console.log(d)
        //return ` ${format(d.data.value)} horas`
        return ` ${format(d.value)} min`
      });
               

    cell.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")} \n ${format(d.value)}`)


    function clicked(p) {
      focus = focus === p ? p = p.parent : p

      rootNode.each(d => d.target = {
        x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
        x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
        y0: d.y0 - p.y0,
        y1: d.y1 - p.y0
      });

      const t = cell.transition().duration(750)
          .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`)

      rect.transition(t).attr("height", d => {
        //console.log((d.target))
        return rectHeight(d.target)}
      )

      text
        .transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .text(d => d.data.name +  `\n ${format(d.value)} min`)
      tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7)
    }

  });

  const rectHeight = d => d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2)

  const labelVisible = d => {
    //console.log(d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16)
    return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16
  }

}
