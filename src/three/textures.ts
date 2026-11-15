import * as THREE from "three";

type WoodOptions = {
  base: string;
  light: string;
  dark: string;
  repeat?: [number, number];
  planks?: number;
};

export function createWoodTexture({
  base,
  light,
  dark,
  repeat = [2, 1],
  planks = 0,
}: WoodOptions): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  baseGradient.addColorStop(0, light);
  baseGradient.addColorStop(0.4, base);
  baseGradient.addColorStop(1, dark);
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Long, lazy grain lines running with the boards.
  for (let i = 0; i < 220; i += 1) {
    const y = Math.random() * canvas.height;
    const amplitude = 2 + Math.random() * 9;
    const frequency = 0.004 + Math.random() * 0.01;
    const phase = Math.random() * Math.PI * 2;
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 10) {
      const nextY = y + Math.sin(x * frequency + phase) * amplitude;
      if (x === 0) ctx.moveTo(x, nextY);
      else ctx.lineTo(x, nextY);
    }
    ctx.strokeStyle =
      Math.random() > 0.45
        ? `rgba(255, 232, 198, ${0.025 + Math.random() * 0.06})`
        : `rgba(20, 10, 4, ${0.035 + Math.random() * 0.09})`;
    ctx.lineWidth = 0.5 + Math.random() * 2;
    ctx.stroke();
  }

  // A few knots give the walnut some history.
  for (let k = 0; k < 4; k += 1) {
    const x = 80 + Math.random() * (canvas.width - 160);
    const y = 60 + Math.random() * (canvas.height - 120);
    const radius = 8 + Math.random() * 26;
    for (let ring = 0; ring < 4; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        radius + ring * 7,
        (radius + ring * 7) * 0.55,
        Math.random() * 0.4 - 0.2,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = `rgba(24, 11, 4, ${0.08 - ring * 0.015})`;
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
  }

  if (planks > 0) {
    const plankHeight = canvas.height / planks;
    for (let i = 1; i < planks; i += 1) {
      const y = i * plankHeight;
      ctx.fillStyle = "rgba(18, 9, 4, 0.28)";
      ctx.fillRect(0, y, canvas.width, 2);
      ctx.fillStyle = "rgba(255, 230, 195, 0.08)";
      ctx.fillRect(0, y + 2, canvas.width, 1);
    }
    for (let i = 0; i < planks; i += 1) {
      const y = i * plankHeight + plankHeight / 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= canvas.width; x += 24) {
        ctx.lineTo(x, y + Math.sin(x * 0.006 + i * 3) * 4);
      }
      ctx.strokeStyle = "rgba(12, 6, 2, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Fine tooth so the texture does not read as plastic.
  for (let i = 0; i < 4500; i += 1) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "10, 5, 2" : "255, 235, 205"}, ${
      Math.random() * 0.035
    })`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#7d858c");
  gradient.addColorStop(0.18, "#cbd2d7");
  gradient.addColorStop(0.42, "#8d969d");
  gradient.addColorStop(0.65, "#e1e6ea");
  gradient.addColorStop(0.85, "#9da6ad");
  gradient.addColorStop(1, "#6c747b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 1) {
    const alpha = Math.random() * 0.1;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, 0, 1, canvas.height);
    ctx.fillStyle = `rgba(20, 24, 28, ${Math.random() * 0.07})`;
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  for (let i = 0; i < 2500; i += 1) {
    ctx.fillStyle = `rgba(20, 24, 28, ${Math.random() * 0.05})`;
    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 3,
      1,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createGaugeTexture(label = "bar"): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const radial = ctx.createRadialGradient(256, 190, 40, 256, 256, 250);
  radial.addColorStop(0, "#3d4d50");
  radial.addColorStop(0.62, "#1b282b");
  radial.addColorStop(1, "#080d0f");
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(256, 256, 250, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(256, 256);
  ctx.strokeStyle = "rgba(117, 236, 196, 0.5)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, 193, -0.42, 0.7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(235, 240, 237, 0.92)";
  ctx.lineCap = "round";
  for (let i = 0; i <= 30; i += 1) {
    const angle = (-210 + i * 8.4) * (Math.PI / 180);
    const major = i % 5 === 0;
    ctx.lineWidth = major ? 3.8 : 1.6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (major ? 170 : 183), Math.sin(angle) * (major ? 170 : 183));
    ctx.lineTo(Math.cos(angle) * 207, Math.sin(angle) * 207);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(237, 242, 239, 0.92)";
  ctx.font = "600 30px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText("0", 256, 392);
  ctx.fillText("5", 134, 280);
  ctx.fillText("10", 256, 142);
  ctx.fillText("15", 386, 280);

  ctx.fillStyle = "rgba(199, 154, 91, 0.95)";
  ctx.font = "700 22px ui-monospace, monospace";
  ctx.fillText(label.toUpperCase(), 256, 438);

  ctx.fillStyle = "rgba(234, 240, 238, 0.4)";
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.fillText("OFFICINA", 256, 462);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createSteamTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.72)");
  gradient.addColorStop(0.45, "rgba(255, 252, 244, 0.28)");
  gradient.addColorStop(1, "rgba(255, 252, 244, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(8, 4, 2, 0.55)");
  gradient.addColorStop(0.45, "rgba(8, 4, 2, 0.28)");
  gradient.addColorStop(1, "rgba(8, 4, 2, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createWindowTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#382c25");
  sky.addColorStop(0.32, "#b87342");
  sky.addColorStop(0.62, "#e7b878");
  sky.addColorStop(1, "#f6ddae");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Warm bokeh from the street beyond the glass.
  for (let i = 0; i < 44; i += 1) {
    const x = Math.random() * width;
    const y = height * 0.25 + Math.random() * height * 0.7;
    const radius = 3 + Math.random() * 22;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(255, 235, 191, ${0.18 + Math.random() * 0.4})`);
    glow.addColorStop(1, "rgba(255, 235, 191, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(81, 48, 28, 0.18)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMenuTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  ctx.fillStyle = "#1d2922";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(226, 196, 154, 0.5)";
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  ctx.fillStyle = "#e8dcc6";
  ctx.textAlign = "center";
  ctx.font = "600 34px Georgia, serif";
  ctx.fillText("TODAY'S BAR", width / 2, 92);
  ctx.font = "500 17px ui-monospace, monospace";
  ctx.fillStyle = "rgba(232, 220, 198, 0.6)";
  ctx.fillText("CAFÉ · FOCUS · REPEAT", width / 2, 124);

  ctx.strokeStyle = "rgba(226, 196, 154, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 148);
  ctx.lineTo(width - 70, 148);
  ctx.stroke();

  const items = [
    ["ESPRESSO", "2.5"],
    ["CAPPUCCINO", "3.8"],
    ["FLAT WHITE", "4.0"],
    ["FILTER", "3.2"],
    ["OAT MILK", "+0.5"],
    ["A PERFECT BREAK", "25 MIN"],
  ];
  ctx.font = "500 22px ui-monospace, monospace";
  items.forEach(([name, price], index) => {
    const y = 210 + index * 66;
    ctx.textAlign = "left";
    ctx.fillStyle = index === items.length - 1 ? "#d8ae70" : "#eadfcb";
    ctx.fillText(name, 74, y);
    ctx.textAlign = "right";
    ctx.fillText(price, width - 74, y);
    ctx.strokeStyle = "rgba(226, 196, 154, 0.12)";
    ctx.beginPath();
    ctx.moveTo(74, y + 17);
    ctx.lineTo(width - 74, y + 17);
    ctx.stroke();
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(232, 220, 198, 0.5)";
  ctx.font = "italic 20px Georgia, serif";
  ctx.fillText("made slowly, on purpose", width / 2, height - 56);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createLabelTexture(
  text: string,
  options: { color?: string; background?: string; font?: string } = {},
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = options.color ?? "#e8d8bc";
  ctx.font = options.font ?? "600 34px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 51);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function drawLcd(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  lines: { main: string; sub: string; progress: number; tone: "focus" | "break" | "idle" | "ready" },
): void {
  ctx.fillStyle = "#06110b";
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createLinearGradient(0, 0, width, height);
  glow.addColorStop(0, "rgba(20, 84, 59, 0.36)");
  glow.addColorStop(1, "rgba(3, 18, 12, 0.6)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle =
    lines.tone === "break"
      ? "rgba(117, 236, 196, 0.26)"
      : lines.tone === "ready"
        ? "rgba(238, 190, 118, 0.25)"
        : "rgba(110, 220, 174, 0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(9, 9, width - 18, height - 18);

  ctx.strokeStyle = "rgba(150, 255, 213, 0.035)";
  ctx.lineWidth = 1;
  for (let y = 14; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(12, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }

  const mainColor =
    lines.tone === "break" ? "#8ff0c9" : lines.tone === "ready" ? "#f4cf94" : "#93efc2";
  ctx.fillStyle = mainColor;
  ctx.font = "700 31px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillText(lines.main, 24, 53);

  ctx.fillStyle = "rgba(174, 236, 208, 0.72)";
  ctx.font = "500 20px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(lines.sub.slice(0, 34), 24, 88);

  const barX = 24;
  const barY = height - 30;
  const barWidth = width - 48;
  ctx.fillStyle = "rgba(130, 240, 197, 0.14)";
  ctx.fillRect(barX, barY, barWidth, 5);
  ctx.fillStyle = lines.tone === "break" ? "#67e6b8" : "#d8a864";
  ctx.fillRect(barX, barY, barWidth * Math.min(1, Math.max(0, lines.progress)), 5);

  ctx.fillStyle = "rgba(170, 240, 209, 0.5)";
  ctx.font = "500 14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "right";
  ctx.fillText("OFFICINA POMODORO", width - 24, height - 13);
}
