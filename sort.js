function shift_through(s0, from, to){
    // Make a local copy of the input array.
    var work = s0.slice(0);

    // Store the sequence of states here.
    var states = [];

    for(var i=from; i<to; i++){
        // Move the element along by one spot.
        var tmp = work[i];
        work[i] = work[i+1]
        work[i+1] = tmp;

        // Store a snapshot in the states array.
        states.push(work.slice(0));
    }

    return states;
}

function bubble_sort(v_){
    var v = v_.slice(0);
    var states = [];

    for(var j=v.length-1; j>0; j--){
        var did_a_swap = false;
        for(var i=0; i<j; i++){
            if(v[i].value > v[i+1].value){
                var tmp = v[i];
                v[i] = v[i+1];
                v[i+1] = tmp;

                did_a_swap = true;

                states.push(v.slice(0));
            }
        }

        if(!did_a_swap){
            return states;
        }
    }

    return states;
}

function quicksort(v){
    var quicksort_helper = function(v, left, right, states){
        console.log("quicksort_helper(" + [left, right].join(", ") + ")");

        if(left == right){
            console.log("left = right = " + left + "; returning early");
            return;
        }

        var work = v.slice(left, right);

        var value = function(w) { return w.value; };
        if(left == 5 && right == 7){
            console.log(v);
            console.log(work);
        }
        console.log("(" + left + ", " + right + "), before: " + work.map(value));

        var pivot = work[0];
        var smaller = work.filter(function(x) { return x.value < pivot.value; });
        var bigger = work.filter(function(x) { return x.value > pivot.value; });
        var pivots = work.filter(function(x) { return x.value == pivot.value; });
        // var pivots = (function(){
        //     var a = Array(work.length - (smaller.length + bigger.length));
        //     for(var i=0; i<a.length; i++){
        //         a[i] = pivot;
        //     }
        //     return a;
        // })();

        console.log("pivot: " + pivot.value);
        console.log("smaller: " + smaller.map(value));
        console.log("bigger: " + bigger.map(value));
        console.log("pivots: " + pivots.map(value));

        work = smaller.concat(pivots).concat(bigger);
        console.log("(" + left + ", " + right + "), after: " + work.map(value));

        console.log("v before: " + v.map(value));
        // v.splice(left, right-left, work);
        v = v.slice(0, left).concat(work).concat(v.slice(right));
        console.log("v after: " + v.map(value));

        if(states.length == 0 || states.slice(-1)[0].map(value) < v.map(value) || states.slice(-1)[0].map(value) > v.map(value)){
            states.push(v.slice(0));
        }

        quicksort_helper(v, left, left + smaller.length, states);
        console.log("v between helper calls: " + v.map(value));
        quicksort_helper(v, left + smaller.length + pivots.length, right, states);

        console.log("leaving quicksort_helper(" + [left, right].join(", ") + ")");
    }

    var states = [];
    quicksort_helper(v, 0, v.length, states);
    return states;
}

window.onload = function(){
    // Capture some of the elements in the html.
    var body = d3.select('body');

    var form = d3.select('#the-form');
    var input = body.select('#input-values');
    input.property("value", "3,1,2,3,5,3,4");

    var deposit = body.append('div');

    // Formulate the actions to take when submit button is clicked.
    form.node().onsubmit = function(){
        // Clear out whatever was here before.
        var svg = d3.select('svg');
        svg.selectAll("g").data([]).exit().remove();

        // Split the input into tokens and convert into numbers.
        var text = input.property("value");
        var tokens = text.split(",");
        var values = tokens.map(Number);

        // Validate the numbers.
        bad = [];
        for(var i=0; i<values.length; i++){
            if(isNaN(values[i])){
                bad.push(i);
            }
        }
        if(bad.length > 0){
            var noun = "Input" + (bad.length == 1 ? "" : "s");
            var verb = bad.length == 1 ? "is" : "are";
            var items = null;
            if(bad.length == 1){
                items = bad[0];
            }
            else if(bad.length == 2){
                items = bad.join(" and ");
            }
            else{
                items = bad.slice(0,-1).join(", ") + ", and " + bad.slice(-1);
            }

            deposit.html("ERROR: " + noun + " " + items + " " + verb + " bad!");

            return false;
        }

        deposit.html("Thank you!");

        // Create a bunch of objects to represent the glyphs.
        var glyphs = [];
        for(var i=0; i<values.length; i++){
            glyphs.push(
                {
                    value: values[i],
                    id: String(i),
                }
            );
        }

        // Fade some glyphs in.
        // var r = 40;
        var r = 10;
        var cmap = d3.scale.linear()
            .domain([d3.min(values), d3.max(values)])
            .range(["yellow", "green"]);

        svg.append('g')
          .selectAll('circle')
            .data(glyphs)
          .enter().append('circle')
            .classed("data-glyph", true)
            .attr("r", r)
            .attr("cy", r+2)
            // .attr("cx", function(d, i){
            //     return r+2 + i*(1.5*2*r);
            // })
            .attr("cx", 0)
            .attr("fill", function(d) { return cmap(d.value); })
            .attr("fill-opacity", 0.0)
          .transition()
            .duration(1000)
            .attr("cx", function(d, i) {
                return r+2 + i*(1.5*2*r);
            })
            .attr("fill-opacity", 1.0)

        // Compute the sequence of states.
        //
        // var states = shift_through(glyphs, 0, 4);
        // var states = [glyphs].concat(bubble_sort(glyphs));
        var states = [glyphs].concat(quicksort(glyphs));

        var horz = function(d, i){
            return r+2 + i*(1.5*2*r);
        }

        // // Create transitions for each state in the state list.
        // for(var i=1; i<states.length; i++){
        //     svg.select('g')
        //       .selectAll("circle")
        //         .data(states[i], function(d) { return d.id; })
        //       .transition()
        //         .delay(1500 + 1000*i)
        //         .duration(1000)
        //         .attr("cx", function(d, i){
        //            return r+2 + i*(1.5*2*r);
        //         });

        // Create transitions for each state in the state list.
        //
        // Start them at the positions of the *last* state, then
        // transition to the new state.
        for(var i=1; i<states.length; i++){
            // TODO(choudhury): use javascript's argument-binding
            // capability to generate both functions from a single,
            // general function of two variables.
            var old_vert = r+2 + (i-1)*(1.5*2*r);
            var new_vert = r+2 + (i)*(1.5*2*r);

            var group = svg.append('g');

            group.selectAll("circle")
                .data(states[i-1], function(d) { return d.id; })
              .enter().append("circle")
                .classed("data-glyph", true)
                .attr("r", r)
                .attr("cx", horz)
                .attr("cy", old_vert)
                .attr("fill", function(d) { return cmap(d.value); })
                .attr("fill-opacity", 0.0)
                .attr("stroke-opacity", 0.0);
            
            group.selectAll("circle")
                .data(states[i], function(d) { return d.id; })
              .transition()
                .delay(1000*i)
                .duration(0)
                .attr("fill-opacity", 1.0)
                .attr("stroke-opacity", 1.0)
              .transition()
                .delay(1000*i)
                .duration(1000)
                .attr("cx", horz)
                .attr("cy", new_vert)

        }

        return false;
    };
}
