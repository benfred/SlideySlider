// A basic slider component using d3.

declare var d3: any;

export default class Slider {
    private handle: any;
    private scale: any;
    private sliderDiv: any;
    private margin: {left: number, right: number};

    constructor(public element: HTMLElement,
                name: string,
                public callback: (value: number) => void,
                {scale = d3.scaleLinear(),
                 height = 35,
                 width = 0,
                 format = (d: number) => d.toString(),
                 tickFormat = format,
                 margin = {left: 15, right: 15},
                 domain = [0, 1],
                 initial = 0,
                 ticks = 3,
                 displayName = name,
                 className = "form-group col-xs-6 col-md-6",
                }: {scale?: any, height?: number, width?: number,
                    format?: (d: number) => string, tickFormat?: (d: number) => string,
                    margin?: {left: number, right: number}, domain?: number[], initial?: number,
                    ticks?: number, displayName?: string, className?: string} = {}) {
        const {sliderDiv, valueDiv} = createDivs(element, name, displayName, className);

        const div = d3.select(sliderDiv);
        div.selectAll("svg").data([0]).enter().append("svg");
        if (width === 0) {
            width = sliderDiv.offsetWidth;
        }

        const svg = div.select("svg")
            .attr("width", width)
            .attr("height", height);

        scale.domain(domain)
            .range([0, width - margin.left - margin.right])
            .clamp(true);

        initial = initial || scale.invert(0);
        valueDiv.innerText = format(initial);

        const slider = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + 10 + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", scale.range()[0])
            .attr("x2", scale.range()[1])
            .style("stroke-linecap", "round")
            .style("stroke", "#000")
            .style("stroke-opacity", 0.3)
            .style("stroke-width", "10px");

        slider.append("line")
            .attr("class", "track-insert")
            .attr("x1", scale.range()[0])
            .attr("x2", scale.range()[1])
            .style("stroke-linecap", "round")
            .style("stroke", "#ddd")
            .style("stroke-width", "8px");

        slider.append("line")
            .attr("class", "track-insert")
            .attr("x1", scale.range()[0])
            .attr("x2", scale.range()[1])
            .style("cursor", "crosshair")
            .style("pointer-events", "stroke")
            .style("stroke-width", "50px");

        svg.call(d3.drag()
                .on("start drag", () => {
                    const value = scale.invert(d3.event.x);
                    valueDiv.innerText = format(value);
                    this.handle.attr("cx", scale(value));
                    this.callback(value);
                }));

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .style("font", "10px sans-serif")
            .selectAll("text")
            .data(scale.ticks(ticks))
            .enter().append("text")
                .attr("x", scale)
                .attr("text-anchor", "middle")
                .text(tickFormat);

        this.handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("r", 9)
            .attr("cx", scale(initial))
            .style("fill", "#fff")
            .style("stroke", "#000")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", "1.25px");
        this.scale = scale;
        this.sliderDiv = sliderDiv;
        this.margin = margin;
        window.addEventListener("resize", () => this.resize());
    }

    public move(value: number): void {
        this.handle.attr("cx", this.scale(value));
    }

    public change(value: number): void {
        this.handle.attr("cx", this.scale(value));
        this.callback(value);
    }

    public resize(width = 0): void {
        let previousValue = this.scale.invert(this.handle.attr("cx"));
        if (width === 0) {
            width = this.sliderDiv.offsetWidth;
        }

        const div = d3.select(this.sliderDiv);
        const svg = div.select("svg")
            .attr("width", width);
        this.scale
            .range([0, width - this.margin.left - this.margin.right]);

        svg.selectAll("line")
            .attr("x1", this.scale.range()[0])
            .attr("x2", this.scale.range()[1])
        svg.selectAll("text")
            .attr("x", this.scale);
        this.move(previousValue);
    }
}

function createDivs(element: HTMLElement,
                    parameterName: string,
                    parameterDisplay: string,
                    className: string): {sliderDiv: HTMLElement,
                                         valueDiv: HTMLElement} {
    const outer = element.appendChild(document.createElement("div"));
    outer.className = className;

    // Create inner divs to center text
    let inner = outer.appendChild(document.createElement("div"));
    inner.style.textAlign = "center";
    inner = inner.appendChild(document.createElement("div"));
    inner.style.display = "inline-block";

    // Add a label
    const label = inner.appendChild(document.createElement("label"));
    label.style.fontSize = "12px";
    label.htmlFor = parameterName;
    label.innerText = parameterDisplay + " = ";
    const value = label.appendChild(document.createElement("span"));
    value.id = parameterName + "value";

    const ret = outer.appendChild(document.createElement("div"));
    ret.id = parameterName;
    return {sliderDiv: ret, valueDiv: value};
}

