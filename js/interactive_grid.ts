/**
 * Interactive Pistachio Green Line Grid with Glowing Mouse Tracking & Dynamic Ripples
 * Translucent Cyberpunk / Tech Aesthetics matching reference UI:
 * Palette: Deep Emerald Black, Pistachio Green (#BEF264), and Crisp White (#ffffff)
 */

interface Ripple {
	x: number;
	y: number;
	radius: number;
	maxRadius: number;
	alpha: number;
	speed: number;
}

export function initInteractiveGrid(canvasId: string = 'workbench_interactive_bg') {
	const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
	if (!canvas) return;

	const ctx = canvas.getContext('2d', { alpha: false });
	if (!ctx) return;

	let width = (canvas.width = window.innerWidth);
	let height = (canvas.height = window.innerHeight);

	// Mouse state with smooth damping
	let mouseX = width / 2;
	let mouseY = height / 2;
	let targetMouseX = width / 2;
	let targetMouseY = height / 2;
	let mouseActive = false;
	let mouseHoverIntensity = 0.8;

	// Grid configuration
	const gridSize = 42; // Size of each grid square in px (sleek, high-density tech grid)
	const ripples: Ripple[] = [];
	let time = 0;

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		width = window.innerWidth;
		height = window.innerHeight;
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	window.addEventListener('resize', resize);
	resize();

	window.addEventListener('mousemove', (e) => {
		targetMouseX = e.clientX;
		targetMouseY = e.clientY;
		mouseActive = true;
	});

	window.addEventListener('mouseleave', () => {
		mouseActive = false;
	});

	window.addEventListener('mousedown', (e) => {
		ripples.push({
			x: e.clientX,
			y: e.clientY,
			radius: 0,
			maxRadius: Math.max(width, height) * 0.75,
			alpha: 0.9,
			speed: 14
		});
		if (ripples.length > 8) ripples.shift();
	});

	function draw() {
		time += 0.02;

		// Smooth lerp for mouse cursor
		mouseX += (targetMouseX - mouseX) * 0.14;
		mouseY += (targetMouseY - mouseY) * 0.14;

		if (mouseActive) {
			mouseHoverIntensity += (1.0 - mouseHoverIntensity) * 0.08;
		} else {
			mouseHoverIntensity += (0.45 - mouseHoverIntensity) * 0.04;
		}

		// 1. Atmospheric Deep Emerald Black background
		const bgGrad = ctx.createRadialGradient(
			width * 0.5, height * 0.45, 100,
			width * 0.5, height * 0.5, Math.max(width, height) * 0.85
		);
		bgGrad.addColorStop(0, '#030a03');
		bgGrad.addColorStop(0.65, '#010501');
		bgGrad.addColorStop(1, '#000000');
		ctx.fillStyle = bgGrad;
		ctx.fillRect(0, 0, width, height);

		// 2. High-contrast Glowing Pistachio Grid Lines
		ctx.lineWidth = 1;

		// Draw Vertical Lines
		for (let x = 0; x <= width; x += gridSize) {
			const distToMouse = Math.abs(x - mouseX);
			const proximity = Math.max(0, 1 - distToMouse / 340);
			// Base line alpha 0.16 ensures grid is clearly visible through translucent cards
			const lineAlpha = 0.16 + proximity * 0.32 * mouseHoverIntensity;

			ctx.strokeStyle = `rgba(190, 242, 100, ${lineAlpha.toFixed(3)})`;
			ctx.beginPath();
			ctx.moveTo(x + 0.5, 0);
			ctx.lineTo(x + 0.5, height);
			ctx.stroke();
		}

		// Draw Horizontal Lines
		for (let y = 0; y <= height; y += gridSize) {
			const distToMouse = Math.abs(y - mouseY);
			const proximity = Math.max(0, 1 - distToMouse / 340);
			const lineAlpha = 0.16 + proximity * 0.32 * mouseHoverIntensity;

			ctx.strokeStyle = `rgba(190, 242, 100, ${lineAlpha.toFixed(3)})`;
			ctx.beginPath();
			ctx.moveTo(0, y + 0.5);
			ctx.lineTo(width, y + 0.5);
			ctx.stroke();
		}

		// 3. Dynamic Click Ripples
		for (let i = ripples.length - 1; i >= 0; i--) {
			const r = ripples[i];
			r.radius += r.speed;
			r.alpha *= 0.955;

			if (r.alpha < 0.01 || r.radius > r.maxRadius) {
				ripples.splice(i, 1);
				continue;
			}

			ctx.save();
			ctx.strokeStyle = `rgba(190, 242, 100, ${(r.alpha * 0.75).toFixed(3)})`;
			ctx.lineWidth = 2.5;
			ctx.beginPath();
			ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
			ctx.stroke();

			ctx.strokeStyle = `rgba(255, 255, 255, ${(r.alpha * 0.35).toFixed(3)})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(r.x, r.y, Math.max(0, r.radius - 6), 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		// 4. Radiant Pistachio Glow Spotlight following Mouse
		const glowRadius = 420;
		const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
		glow.addColorStop(0, `rgba(190, 242, 100, ${(0.36 * mouseHoverIntensity).toFixed(3)})`);
		glow.addColorStop(0.2, `rgba(190, 242, 100, ${(0.18 * mouseHoverIntensity).toFixed(3)})`);
		glow.addColorStop(0.55, `rgba(190, 242, 100, ${(0.07 * mouseHoverIntensity).toFixed(3)})`);
		glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

		ctx.fillStyle = glow;
		ctx.fillRect(
			Math.max(0, mouseX - glowRadius),
			Math.max(0, mouseY - glowRadius),
			glowRadius * 2,
			glowRadius * 2
		);

		// High-end inner white core highlight
		const coreRadius = 80;
		const coreGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, coreRadius);
		coreGlow.addColorStop(0, `rgba(255, 255, 255, ${(0.22 * mouseHoverIntensity).toFixed(3)})`);
		coreGlow.addColorStop(0.4, `rgba(190, 242, 100, ${(0.10 * mouseHoverIntensity).toFixed(3)})`);
		coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

		ctx.fillStyle = coreGlow;
		ctx.beginPath();
		ctx.arc(mouseX, mouseY, coreRadius, 0, Math.PI * 2);
		ctx.fill();

		// 5. Glowing Grid Intersection Nodes near Cursor
		const minCol = Math.max(0, Math.floor((mouseX - glowRadius) / gridSize));
		const maxCol = Math.min(Math.ceil(width / gridSize), Math.ceil((mouseX + glowRadius) / gridSize));
		const minRow = Math.max(0, Math.floor((mouseY - glowRadius) / gridSize));
		const maxRow = Math.min(Math.ceil(height / gridSize), Math.ceil((mouseY + glowRadius) / gridSize));

		for (let c = minCol; c <= maxCol; c++) {
			for (let r = minRow; r <= maxRow; r++) {
				const nx = c * gridSize;
				const ny = r * gridSize;
				const dx = nx - mouseX;
				const dy = ny - mouseY;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist < glowRadius) {
					const nodeIntensity = Math.pow(1 - dist / glowRadius, 1.6) * mouseHoverIntensity;
					if (nodeIntensity > 0.06) {
						const pulse = 1 + Math.sin(time * 3.5 + (c + r) * 0.4) * 0.25;
						const nodeRadius = (1.6 + nodeIntensity * 2.8) * pulse;

						ctx.fillStyle = `rgba(190, 242, 100, ${(nodeIntensity * 0.95).toFixed(3)})`;
						ctx.beginPath();
						ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
						ctx.fill();

						if (nodeIntensity > 0.5) {
							ctx.fillStyle = `rgba(255, 255, 255, ${(nodeIntensity * 0.85).toFixed(3)})`;
							ctx.beginPath();
							ctx.arc(nx, ny, 1.2, 0, Math.PI * 2);
							ctx.fill();
						}
					}
				}
			}
		}

		requestAnimationFrame(draw);
	}

	requestAnimationFrame(draw);
}
