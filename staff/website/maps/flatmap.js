// Flat vector world map: country outlines only, drag to move, wheel/buttons to zoom.
// Same interface the page expects (window.NostrixGlobe.mount → {show, focus, reset, zoom, destroy}).
window.NostrixGlobe = (() => {
  "use strict";
  const LIBS = [
    "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js",
    "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js"
  ];
  const WORLD = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  let ready;
  const script = src => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.async = true; s.crossOrigin = "anonymous";
    s.onload = resolve; s.onerror = () => reject(new Error("map library"));
    document.head.appendChild(s);
  });
  function load() {
    if (!ready) ready = (async () => {
      if (!window.d3) await script(LIBS[0]);
      if (!window.topojson) await script(LIBS[1]);
      const world = await fetch(WORLD).then(r => { if (!r.ok) throw new Error("map data"); return r.json(); });
      return window.topojson.feature(world, world.objects.countries);
    })().catch(e => { ready = null; throw e; });
    return ready;
  }

  function mount(stage, choose, onError) {
    const d3 = () => window.d3;
    const canvas = stage.querySelector("canvas");
    if (canvas) canvas.hidden = true;
    const ns = "http://www.w3.org/2000/svg";
    const svgEl = document.createElementNS(ns, "svg");
    svgEl.setAttribute("class", "flat-map");
    svgEl.setAttribute("role", "img");
    svgEl.setAttribute("aria-label", canvas?.getAttribute("aria-label") || "Visitor map");
    svgEl.tabIndex = 0;
    stage.prepend(svgEl);
    const zoomLabel = stage.querySelector(".zoom-level");
    let dead = false, svg, root, landG, pinG, projection, path, zoom, size = { w: 0, h: 0 }, land, sites = [], latestKey = null, k = 1;

    const fmt = n => new Intl.NumberFormat(document.documentElement.lang || "en", { maximumFractionDigits: 1 }).format(n) + "×";
    const radius = s => Math.max(3.2, Math.min(11, 2.6 + Math.sqrt(s.count || 1) * 1.6));

    function drawPins() {
      if (!pinG) return;
      const sel = pinG.selectAll("g.pin").data(sites, s => s.key);
      sel.exit().remove();
      const enter = sel.enter().append("g").attr("class", "pin").attr("tabindex", 0).attr("role", "button");
      enter.append("circle").attr("class", "pin-halo");
      enter.append("circle").attr("class", "pin-dot");
      enter.append("title");
      const all = enter.merge(sel);
      all.attr("transform", s => { const p = projection([s.lon, s.lat]); return p ? `translate(${p[0]},${p[1]})` : "translate(-99,-99)"; })
        .classed("recent", s => !!s.recent).classed("latest", s => s.key === latestKey)
        .attr("aria-label", s => s.label).on("click", (e, s) => choose(s))
        .on("keydown", (e, s) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(s); } });
      all.select("title").text(s => s.label);
      all.select(".pin-dot").attr("r", s => radius(s) / k);
      all.select(".pin-halo").attr("r", s => (radius(s) + 5) / k);
    }

    function layout() {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height || !land) return;
      size = { w: r.width, h: r.height };
      svg.attr("viewBox", `0 0 ${size.w} ${size.h}`);
      projection = d3().geoNaturalEarth1().fitExtent([[8, 8], [size.w - 8, size.h - 8]], { type: "Sphere" });
      path = d3().geoPath(projection);
      landG.selectAll("path.sphere").data([{ type: "Sphere" }]).join("path").attr("class", "sphere").attr("d", path);
      landG.selectAll("path.graticule").data([d3().geoGraticule10()]).join("path").attr("class", "graticule").attr("d", path);
      landG.selectAll("path.land").data(land.features).join("path").attr("class", "land").attr("d", path);
      zoom.translateExtent([[0, 0], [size.w, size.h]]).extent([[0, 0], [size.w, size.h]]);
      drawPins();
    }

    load().then(features => {
      if (dead) return;
      land = features;
      svg = d3().select(svgEl);
      root = svg.append("g");
      landG = root.append("g").attr("class", "land-layer");
      pinG = root.append("g").attr("class", "pin-layer");
      zoom = d3().zoom().scaleExtent([1, 14]).on("zoom", e => {
        k = e.transform.k;
        root.attr("transform", e.transform);
        root.selectAll("path").attr("stroke-width", 0.6 / k);
        drawPins();
        if (zoomLabel) zoomLabel.textContent = fmt(k);
      });
      svg.call(zoom).on("dblclick.zoom", null);
      svgEl.addEventListener("keydown", e => {
        const step = 60;
        const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
        if (moves[e.key]) { e.preventDefault(); svg.transition().duration(200).call(zoom.translateBy, ...moves[e.key].map(v => v / k)); }
        if (e.key === "+" || e.key === "=") api.zoom(1.6);
        if (e.key === "-") api.zoom(1 / 1.6);
      });
      layout();
      if (zoomLabel) zoomLabel.textContent = fmt(1);
    }).catch(() => { if (!dead) onError?.(); });

    const resize = new ResizeObserver(() => layout());
    resize.observe(stage);

    const api = {
      show(rows, newestKey) { sites = rows || []; latestKey = newestKey || null; drawPins(); },
      focus(site) {
        if (!svg || !site || !projection) return;
        const p = projection([site.lon, site.lat]);
        if (!p) return;
        const target = Math.max(k, 4.2);
        svg.transition().duration(750).call(zoom.transform, d3().zoomIdentity.translate(size.w / 2, size.h / 2).scale(target).translate(-p[0], -p[1]));
      },
      reset() { if (svg) svg.transition().duration(600).call(zoom.transform, d3().zoomIdentity); },
      zoom(factor) { if (svg) svg.transition().duration(250).call(zoom.scaleBy, factor); },
      destroy() { dead = true; resize.disconnect(); svgEl.remove(); if (canvas) canvas.hidden = false; }
    };
    return api;
  }
  return { mount };
})();
