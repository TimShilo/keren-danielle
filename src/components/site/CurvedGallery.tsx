import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Endless photo gallery drawn with WebGL: round-cornered cards drift along, and the cards near the left and
 * right edges are stretched taller (a curved "wall" bending towards the viewer). The drift slows while the
 * pointer is over it and the gallery can be dragged. About five photos are visible on a desktop screen.
 * Falls back to `fallback` where WebGL isn't available.
 */
export interface CurvedPhoto {
  src: string;
  alt: string;
}

const VERT = `
attribute vec2 aPos;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform vec2 uHalf;
uniform float uCurve;
varying vec2 vLocal;
void main() {
  vec2 local = (aPos - 0.5) * uSize;
  vLocal = local;
  float wx = uCenter.x + local.x;
  float d = abs(wx) / uHalf.x;
  float wy = local.y * (1.0 + uCurve * d * d * d);
  gl_Position = vec4(wx / uHalf.x, wy / uHalf.y, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uCard;
uniform float uRadius;
varying vec2 vLocal;
float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 hb = uCard * 0.5;
  float d = box(vLocal, hb, uRadius);
  float cardA = 1.0 - smoothstep(-1.0, 1.0, d);
  float ds = box(vLocal - vec2(0.0, -uRadius * 0.4), hb, uRadius);
  float shadow = (1.0 - smoothstep(0.0, uRadius * 1.1, ds)) * 0.2;
  vec2 uv = vLocal / uCard + 0.5;
  vec3 tex = texture2D(uTex, uv).rgb;
  vec3 shadowCol = vec3(0.043, 0.078, 0.094);
  float a = cardA + (1.0 - cardA) * shadow;
  vec3 rgb = tex * cardA + shadowCol * (1.0 - cardA) * shadow;
  gl_FragColor = vec4(rgb, a);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

export function CurvedGallery({ photos, label, fallback }: { photos: CurvedPhoto[]; label: string; fallback: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  // the parent builds a new array on every render; only a change of the pictures themselves restarts the gallery
  const key = photos.map((p) => p.src).join("|");
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    const host = wrap.current;
    const cv = canvas.current;
    const list = photosRef.current;
    if (!host || !cv || !list.length) return;
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) {
      setFailed(true);
      return;
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setFailed(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const loc = (n: string) => gl.getUniformLocation(prog, n);
    const uCenter = loc("uCenter");
    const uSize = loc("uSize");
    const uHalf = loc("uHalf");
    const uCurve = loc("uCurve");
    const uCard = loc("uCard");
    const uRadius = loc("uRadius");
    const aPos = gl.getAttribLocation(prog, "aPos");

    // a 24x24 grid so the vertical stretch bends smoothly
    const N = 24;
    const verts: number[] = [];
    for (let y = 0; y <= N; y++) for (let x = 0; x <= N; x++) verts.push(x / N, y / N);
    const idx: number[] = [];
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const a = y * (N + 1) + x;
        idx.push(a, a + 1, a + N + 1, a + 1, a + N + 2, a + N + 1);
      }
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let disposed = false;
    let visible = false;
    let hover = false;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let offset = 0;
    let vel = 0;
    let raf = 0;
    let last = performance.now();

    // layout
    let cw = 0;
    let ch = 0;
    let dpr = 1;
    let cardW = 0;
    let cardH = 0;
    let step = 0;
    let total = 0;
    let count = 0;
    let curve = 0.8;
    let radius = 22;
    let textures: WebGLTexture[] = [];
    const images: HTMLImageElement[] = [];

    const freeTextures = () => {
      textures.forEach((t) => gl.deleteTexture(t));
      textures = [];
    };

    const buildTextures = () => {
      freeTextures();
      const tw = Math.max(64, Math.round(cardW * dpr * 1.2));
      const th = Math.max(64, Math.round(cardH * dpr * 1.2));
      images.forEach((img) => {
        const c = document.createElement("canvas");
        c.width = tw;
        c.height = th;
        const g = c.getContext("2d");
        if (!g) return;
        // object-fit: cover
        const s = Math.max(tw / img.naturalWidth, th / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        g.drawImage(img, (tw - w) / 2, (th - h) / 2, w, h);
        const tex = gl.createTexture();
        if (!tex) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        } catch {
          gl.deleteTexture(tex);
          return;
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        textures.push(tex);
      });
      count = textures.length;
    };

    const layout = () => {
      cw = host.clientWidth;
      if (!cw) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const small = window.innerWidth < 769;
      cardW = small ? cw / 2.3 : cw / 5.3;
      cardH = cardW * 0.72;
      const gap = cardW * 0.08;
      step = cardW + gap;
      curve = small ? 0.45 : 0.8;
      radius = Math.round(cardW * 0.06);
      ch = Math.round(cardH * (small ? 1.6 : 1.85) + 60);
      host.style.height = `${ch}px`;
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      cv.style.width = `${cw}px`;
      cv.style.height = `${ch}px`;
      gl.viewport(0, 0, cv.width, cv.height);
      buildTextures();
      const per = Math.max(1, count);
      const copies = Math.max(1, Math.ceil((cw + step * 3) / (step * per)));
      total = step * per * copies;
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible && count && total) {
        const target = reduced ? 0 : (dragging ? 0 : hover ? 42 * 0.15 : 42);
        // pointer drag leaves a little inertia in `vel`
        vel += (target - vel) * Math.min(1, dt * 3);
        offset += vel * dt;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uHalf, cw / 2, ch / 2);
        gl.uniform1f(uCurve, curve);
        gl.uniform2f(uCard, cardW, cardH);
        gl.uniform1f(uRadius, radius);
        const marginX = radius * 1.6;
        const sizeW = cardW + marginX * 2;
        const sizeH = cardH + marginX * 2;
        gl.uniform2f(uSize, sizeW, sizeH);
        const copies = total / (step * count);
        const n = count * Math.round(copies);
        for (let i = 0; i < n; i++) {
          const base = i * step;
          const x = ((((base + offset) % total) + total) % total) - total / 2;
          if (Math.abs(x) > cw / 2 + sizeW) continue;
          gl.uniform2f(uCenter, x, 0);
          gl.bindTexture(gl.TEXTURE_2D, textures[i % count] ?? null);
          gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    // load the photos, then build
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded === list.length && !disposed) {
        if (!images.length) {
          setFailed(true);
          return;
        }
        layout();
        raf = requestAnimationFrame(draw);
      }
    };
    list.forEach((p) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (img.naturalWidth) images.push(img);
        done();
      };
      img.onerror = done;
      img.src = p.src;
    });

    // interaction
    const onEnter = () => (hover = true);
    const onLeave = () => {
      hover = false;
      dragging = false;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      host.setPointerCapture(e.pointerId);
      host.classList.add("cursor-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      offset += dx;
    };
    const onUp = () => {
      dragging = false;
      host.classList.remove("cursor-grabbing");
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);

    const io = new IntersectionObserver((e) => {
      visible = !!e[0]?.isIntersecting;
      last = performance.now();
    });
    io.observe(host);
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (images.length && !disposed) layout();
      }, 150);
    });
    ro.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      freeTextures();
    };
  }, [key]);

  if (failed) return <>{fallback}</>;
  return (
    <div
      ref={wrap}
      role="group"
      aria-label={label}
      className="relative -mx-[5%] cursor-grab select-none touch-pan-y [mask-image:linear-gradient(90deg,transparent_0,#000_8%,#000_92%,transparent_100%)]"
      style={{ minHeight: 280 }}
    >
      <canvas ref={canvas} aria-hidden className="block" />
      <ul className="sr-only">
        {photos.map((p, i) => (
          <li key={i}>{p.alt}</li>
        ))}
      </ul>
    </div>
  );
}
