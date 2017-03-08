var screenW = window.innerWidth/2;
var screenH = window.innerHeight/2;

function makeViz() {

//    d3.json("../data/d3_orbit_s.json", function (data) {
    d3.json("network_ReturnNetworkData_V2_Orbit_flat.json", function (data) {
        drawOrbit(data)
    });

}

function drawOrbit(_data) {

    var center = {};
    var recenter = false;

    for (var x = 0; x < _data.children.length; x++) {
        _data.children[x].size = _data.children[x].children ? _data.children[x].children.length : 0;
    }

    // decide the sequence of dataset
    _data.children.sort(function (a, b) {
        if (a.radius > b.radius) { // a.size > b.size
            return 1;
        }
        if (a.radius < b.radius) {
            return -1;
        }
        return 0;
    }) 

    console.log(_data);
    
    sizeScale = d3.scale.linear().domain([0, 4]).range([4, 12]).clamp(true);
//    sizeScale = d3.scale.linear().domain([0, 1, 5, 10, 20]).range([4, 6, 8, 10, 12]).clamp(true);
    colorScale = d3.scale.linear().domain([0, 1, 2, 3, 4]).range(["rgb(161,208,120)", "rgb(247,148,72)", "rgb(225,203,208)", "rgb(174,223,228)", "rgb(245,132,102)"]);
    planetColors = {
        Mercury: "gray",
        Venus: "#d6bb87",
        Earth: "#677188",
        Mars: "#7c5541",
        Jupiter: "#a36a3e",
        Saturn: "#e9ba85",
        Uranus: "#73cbf0",
        Neptune: "#6383d1"
    }
    
    var dataTree = d3.nest()
          .key(function(d) { 
              return d.radius; 
          })
          .entries(_data.children);
    console.log(dataTree);

    var orbitRadius = Math.min(screenW, screenH);
    orbit = d3.layout.orbit().size([orbitRadius, orbitRadius])
        .revolution(customRevolution)
        .orbitSize(function (d) {
            return d.radius;
//            return d.depth >= 2 ? 6 : 4;
        })
        .speed(.1)
        .mode([dataTree[0].values.length,dataTree[1].values.length,dataTree[2].values.length])
//        .mode([35, 36, 8, 3, 1])
        .nodes(_data);

    center = orbit.nodes()[0];
    
    //console.log(orbit.nodes()); // return all nodes

    d3.select("svg")
        .append("g")
        .attr("class", "viz")
        .attr("transform", "translate(50,50)")
        .selectAll("g.node").data(orbit.nodes())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .on("mouseover", nodeOver)
        .on("click", recenter)

    d3.selectAll("g.node")
        .append("circle")
        .attr("class", "satellite")
        .attr("r", function (d) {
            return sizeScale(d.radius?d.radius:4);
//            return sizeScale(d.children ? d.children.length : 0)
        })
        .style("fill", function (d) {
            return colorScale(d.radius?d.radius:5)
        })
        .style("stroke", "brown")
        .style("stroke-width", "1px")

    d3.selectAll("g.node").filter(function (d) {
            return d.depth == 1
        })
        .append("text")
        .text(function (d) {
            return d.depth == 0 ? "Sun" : d.key
        })
        .attr("y", 20)
        .style("text-anchor", "middle")
    
    console.log(orbit.orbitalRings());

    d3.select("g.viz")
        .selectAll("circle.ring")
        .data(orbit.orbitalRings())
        .enter()
        .insert("circle", "g")
        .attr("class", "ring")
        .attr("r", function (d) {
            return d.r
        })
        .attr("cx", function (d) {
            return d.x
        })
        .attr("cy", function (d) {
            return d.y
        })

    orbit.on("tick", orbitTick);

    orbit.start();

    function orbitTick() {

        var newX = screenW - center.x;
        var newY = screenH - center.y;

        d3.select("g.viz")
            .attr("transform", "scale(" + (1 + (center.depth * .1)) + ") translate(" + newX + "," + newY + ")")


        d3.selectAll("g.node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            });

        d3.selectAll("circle.ring")
            .attr("cx", function (d) {
                return d.x
            })
            .attr("cy", function (d) {
                return d.y
            });

        d3.selectAll("line.visible")
            .attr("x1", function (p) {
                return p.source.x
            })
            .attr("x2", function (p) {
                return p.target.x
            })
            .attr("y1", function (p) {
                return p.source.y
            })
            .attr("y2", function (p) {
                return p.target.y
            })

    }

    function changeCenter() {
        recenter = false;
        orbit.stop();
        var newX = screenW - center.x;
        var newY = screenH - center.y;

        d3.select("g.viz")
            .transition()
            .duration(1000)
            .attr("transform", "scale(" + (1 + (center.depth * .1)) + ") translate(" + newX + "," + newY + ")")
            .each("end", function () {
                orbit.start()
            })

    }

    function customRevolution(d) {
//        console.log(d);
        if (d.radius == "Level_1") { // "time"
            return d.depth * .25;
        }
        if (d.radius == "Level_2") { // "geo"
            return -d.depth * .25;
        }
        return d.depth
    }

    function nodeOver(d) {
        orbit.stop();

        center = d;
        changeCenter();

        d3.selectAll("text.sat").remove();

        d3.selectAll("line.visible").remove();

        if (d.children) {
            var lines = d.children.map(function (p) {
                return {
                    source: d,
                    target: p
                }
            })
            d3.select("g.viz").selectAll("line.visible")
                .data(lines)
                .enter()
                .insert("line", "g")
                .attr("x1", function (p) {
                    return p.source.x
                })
                .attr("x2", function (p) {
                    return p.target.x
                })
                .attr("y1", function (p) {
                    return p.source.y
                })
                .attr("y2", function (p) {
                    return p.target.y
                })
                .attr("class", "visible")
                .style("stroke", "rgb(73,106,154)")
                .style("stroke-width", 2)
        }

        if (d.parent) {

            d3.select("g.viz").selectAll("line.fake")
                .data([{
                    source: d,
                    target: d.parent
                    }])
                .enter()
                .insert("line", "g")
                .attr("x1", function (p) {
                    return p.source.x
                })
                .attr("x2", function (p) {
                    return p.target.x
                })
                .attr("y1", function (p) {
                    return p.source.y
                })
                .attr("y2", function (p) {
                    return p.target.y
                })
                .attr("class", "visible")
                .style("stroke", "rgb(165,127,124)")
                .style("stroke-width", 3)
        }


        d3.selectAll("g.node")
            .filter(function (p) {
                return p == d || p == d.parent || (d.children ? d.children.indexOf(p) > -1 : false)
            })
            .append("text")
            .text(function (p) {
                return p["Institution"]
            })
            .style("text-anchor", "middle")
            .attr("y", -15)
            .attr("class", "sat")
            .style("fill", "none")
            .style("stroke", "orange")
            .style("stroke-width", 2)
            .style("stroke-opacity", .7);

        d3.selectAll("g.node")
            .filter(function (p) {
                return p == d || p == d.parent || (d.children ? d.children.indexOf(p) > -1 : false)
            })
            .append("text")
            .text(function (p) {
                return p.name
            })
            .style("text-anchor", "middle")
            .attr("y", function(d){
                return d.depth ? -30: 26;
            })
            .attr("class", "sat");

        d3.selectAll("g.node > circle").style("stroke", "brown").style("stroke-width", 1);

        d3.select(this).select("circle").style("stroke", "black").style("stroke-width", 3);

    }


}
