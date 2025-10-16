// FUNCTIONS FROM GOOGLE AI
// This is the function for our custom cluster force
function forceCluster() {
    const strength = 0.2; // How strongly the force pulls nodes to their cluster center
    let nodes;

    function force(alpha) {
        // Group nodes by their 'group' property and calculate the centroid of each group
        const centroids = d3.rollup(nodes, centroid, d => d.group);

        // Apply the force to each node
        const l = alpha * strength;
        for (const d of nodes) {
            const { x: cx, y: cy } = centroids.get(d.group);
            d.vx -= (d.x - cx) * l;
            d.vy -= (d.y - cy) * l;
        }
    }

    // Define the accessor functions
    force.initialize = _ => nodes = _;

    return force;
}

// A helper function to find the centroid of an array of points
function centroid(nodes) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const d of nodes) {
        x += d.x;
        y += d.y;
        z += 1;
    }
    return { x: x / z, y: y / z };
}


// ... AND CODE TO IMPLEMENT CUSTOM FORCE:
// ... AND CODE TO IMPLEMENT CUSTOM FORCE:
// ... AND CODE TO IMPLEMENT CUSTOM FORCE:



// Define the dimensions of the SVG
const width = 928;
const height = 600;

// Data: an array of nodes, each with a 'group' property
const data = Array.from({ length: 200 }, (_, i) => ({
    group: i % 4, // Divide nodes into 4 groups
    radius: 10
}));

// Create the SVG container
const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);

// Define the colors for the groups
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create the force simulation and add our custom cluster force
const simulation = d3.forceSimulation(data)
    .force("charge", d3.forceManyBody().strength(3))
    .force("cluster", forceCluster().strength(0.2))
    .force("collide", d3.forceCollide().radius(d => d.radius + 1))
    .force("center", d3.forceCenter(width / 2, height / 2));

// Create the nodes on the SVG
const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.radius)
    .attr("fill", d => color(d.group));

// Add a tick handler to update node positions
simulation.on("tick", () => {
    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
});

// Append the SVG to the document body
document.body.appendChild(svg.node());