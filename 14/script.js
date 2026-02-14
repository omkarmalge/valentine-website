document.addEventListener('DOMContentLoaded', ()=>{
 	// populate background hearts when idle to avoid startup jank
 	if('requestIdleCallback' in window){
 		requestIdleCallback(populateBackgroundHearts, {timeout:1000});
 	}else{
 		setTimeout(populateBackgroundHearts, 700);
 	}

	const openBtn = document.getElementById('openBtn');
	const message = document.getElementById('message');
	const typedEl = document.getElementById('typed');
	const canvas = document.getElementById('confetti');

	openBtn.addEventListener('click', ()=>{
		if(!message.classList.contains('hidden')) return;
		const card = document.querySelector('.card');
		if(card) card.classList.add('opened');
		// start pre-reveal sequence: overlay, sparkles, intensified heart, floating hearts
		openBtn.disabled = true;
		startPreRevealSequence().then(()=>{
			// show notes stack first; reveal message only after all notes dismissed
			showNotesStack().then(()=>{
				message.classList.remove('hidden');
				setTimeout(()=> message.classList.add('fade-in'), 20);
				const text = "Every moment with you feels like a song — you are my today and all of my tomorrows.";
				typeText(text, typedEl, 30);
				// celebratory confetti and hearts after reveal
				startConfetti(canvas);
				spawnFloatingHearts(12);
				// show collage after message
				setTimeout(()=> showCollage(), 1200);
			});
		});
	});

	// Clicking anywhere spawns a tiny heart
	document.body.addEventListener('click', (e)=>{
		if(e.target.id === 'openBtn') return;
		spawnFloatingHearts(1, e.clientX, e.clientY);
	});
});

function typeText(text, el, delay=40){
	el.textContent = '';
	let i=0;
	const t = setInterval(()=>{
		el.textContent += text.charAt(i);
		i++;
		if(i>=text.length) clearInterval(t);
	},delay);
}

function startPreRevealSequence(){
	return new Promise((resolve)=>{
		// create overlay with sparkles
		const overlay = document.createElement('div'); overlay.className = 'reveal-overlay';
		const veil = document.createElement('div'); veil.className = 'veil'; overlay.appendChild(veil);
		const sparkleCount = 18;
		for(let i=0;i<sparkleCount;i++){
			const s = document.createElement('div'); s.className = 'reveal-sparkle' + (Math.random()>0.78? ' tiny':'');
			const left = Math.random()*100; const top = 40 + Math.random()*36; // concentrate toward upper card area
			s.style.left = left + '%'; s.style.top = top + '%';
			const delay = (Math.random()*0.6).toFixed(2);
			s.style.animation = `sparkle-pop 1000ms cubic-bezier(.2,.9,.2,1) ${delay}s both`;
			s.style.opacity = 0;
			overlay.appendChild(s);
		}
		document.body.appendChild(overlay);

		// highlight heart
		const heartEl = document.querySelector('.heart');
		if(heartEl) heartEl.classList.add('reveal');

		// add a gentle burst of floating hearts
		spawnFloatingHearts(8);
		playMelody();

		// remove overlay after animation completes
		setTimeout(()=>{
			overlay.style.transition = 'opacity 420ms ease'; overlay.style.opacity = '0';
			if(heartEl) heartEl.classList.remove('reveal');
			setTimeout(()=>{ overlay.remove(); resolve(); },460);
		},1800);
	});
}

function populateBackgroundHearts(){
	const existing = document.querySelector('.bg-layer');
	if(existing) return;
	const layer = document.createElement('div');
	layer.className = 'bg-layer';
	const count = (innerWidth < 600) ? 28 : 110;
	const colors = ['#ffd6e0','#ffc9d9','#ffb3c6','#ff9aa8','#ff6b81'];
	for(let i=0;i<count;i++){
		const s = Math.round(8 + Math.random()*28); // size in px
		const left = Math.random()*100;
		const top = Math.random()*100;
		const delay = (Math.random()*6).toFixed(2);
		const heart = document.createElement('div');
		heart.className = 'bg-heart float';
		heart.style.left = left + '%';
		heart.style.top = top + '%';
		heart.style.width = s + 'px';
		heart.style.height = s + 'px';
		heart.style.opacity = (0.25 + Math.random()*0.85).toFixed(2);
		heart.style.transform = `translate(-50%, -50%) scale(${0.7 + Math.random()*1.2})`;
		heart.style.animationDelay = (delay) + 's';
		heart.style.fill = colors[i % colors.length];
		heart.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
		// apply color to svg path
		const svg = heart.querySelector('svg');
		if(svg) svg.querySelector('path').setAttribute('fill', colors[Math.floor(Math.random()*colors.length)]);
		layer.appendChild(heart);
	}

	// add repeated decorative name labels across the background
	const nameCount = (innerWidth < 600) ? 12 : 28;
	for(let j=0;j<nameCount;j++){
		const n = document.createElement('div');
		n.className = 'bg-name floaty';
		n.textContent = 'Rashi ♥ Radha';
		const left = Math.random()*100;
		const top = Math.random()*100;
		n.style.left = left + '%';
		n.style.top = top + '%';
		const scale = 0.7 + Math.random()*1.2;
		n.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${Math.random()*40-20}deg)`;
		n.style.opacity = (0.08 + Math.random()*0.22).toFixed(2);
		if(Math.random() > 0.7) n.classList.add('small');
		layer.appendChild(n);
	}
	document.body.appendChild(layer);
}

/* Simple confetti canvas */
function startConfetti(canvas){
	if(!canvas) return;
	const ctx = canvas.getContext('2d');
	let w = canvas.width = innerWidth;
	let h = canvas.height = innerHeight;
	const colors = ['#ff6b6b','#ff9a9e','#ffd166','#ffb4a2','#f08aac'];
	let particles = [];
	for(let i=0;i<120;i++){
		particles.push({
			x: Math.random()*w,
			y: Math.random()*h - h,
			vx: (Math.random()-0.5)*3,
			vy: Math.random()*5+2,
			size: Math.random()*7+4,
			color: colors[Math.floor(Math.random()*colors.length)],
			rot: Math.random()*360,
			vr: (Math.random()-0.5)*6,
			life: Math.random()*80+60
		});
	}

	let raf;
	function render(){
		ctx.clearRect(0,0,w,h);
		particles.forEach((p)=>{
			p.x += p.vx; p.y += p.vy; p.vr += 0;
			p.rot += p.vr; p.life -= 1;
			ctx.save();
			ctx.translate(p.x,p.y);
			ctx.rotate(p.rot*Math.PI/180);
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
			ctx.restore();
		});
		particles = particles.filter(p=>p.life>0 && p.y < h+50);
		if(particles.length>0) raf = requestAnimationFrame(render);
	}
	render();

	function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight }
	window.addEventListener('resize', resize);
	// stop after ~6s
	setTimeout(()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize', resize); ctx.clearRect(0,0,w,h); },6500);
}

/* Floating hearts created as elements that animate via JS */
function spawnFloatingHearts(count=6, x, y){
	for(let i=0;i<count;i++){
		const el = document.createElement('div');
		el.className = 'floating-heart';
		el.style.left = (x? x + (Math.random()*40-20) : (innerWidth*0.5 + (Math.random()*200-100))) + 'px';
		el.style.top = (y? y + (Math.random()*24-12) : (innerHeight*0.6 + (Math.random()*100-50))) + 'px';
		el.style.opacity = '0';
		el.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>';
		document.body.appendChild(el);
		// animate
		requestAnimationFrame(()=>{ el.style.transition = 'transform 3s ease-out, opacity 1.6s ease-out'; el.style.opacity = '1'; el.style.transform = `translateY(-${120+Math.random()*220}px) scale(${0.8+Math.random()*0.6}) rotate(${Math.random()*40-20}deg)`});
		setTimeout(()=>{ el.style.opacity = '0'; },2000 + Math.random()*800);
		setTimeout(()=> el.remove(),4200 + Math.random()*1000);
	}
}

/* Play a short melody using WebAudio */
function playMelody(){
	try{
		const ctx = new (window.AudioContext||window.webkitAudioContext)();
		const notes = [440,550,660,880,660,550,440];
		let t = ctx.currentTime;
		notes.forEach((f,i)=>{
			const o = ctx.createOscillator();
			const g = ctx.createGain();
			o.type = 'sine'; o.frequency.value = f;
			g.gain.value = 0.0001;
			o.connect(g); g.connect(ctx.destination);
			o.start(t + i*0.12);
			g.gain.exponentialRampToValueAtTime(0.08, t + i*0.12 + 0.02);
			g.gain.exponentialRampToValueAtTime(0.0001, t + i*0.12 + 0.12);
			o.stop(t + i*0.12 + 0.13);
		});
	}catch(e){/* ignore if AudioContext not allowed */}
}

/* Draggable stacked notes (swipe one-by-one) */


function showNotesStack(){
 	return new Promise((resolve)=>{
	const quotes = [
		"You're my favorite hello and hardest goodbye.",
		"In a sea of people, my eyes will always search for you.",
		"You are the reason I believe in love at first sight.",
		"Every day with you is my new best day.",
		"I still get butterflies even though I've seen you a thousand times."
	];

	// create overlay
	const overlay = document.createElement('div');
	overlay.className = 'notes-overlay';
	const stack = document.createElement('div');
	stack.className = 'notes-stack';
	overlay.appendChild(stack);

 	// build cards in order (1..N) into a fragment to reduce reflow
 	const frag = document.createDocumentFragment();
 	for(let i=0;i<quotes.length;i++){
 		const note = document.createElement('div');
 		note.className = 'note-card note-in depth-' + Math.min(2, i);
 		note.style.setProperty('--delay', `${i*0.02}s`);
		note.innerHTML = `<div class="note-index">${i+1}/${quotes.length}</div><div class="note-content"><div class="note-text">${quotes[i]}<span class="note-quote">— A heartful note</span></div></div>`;
 		frag.appendChild(note);
 	}
 	stack.appendChild(frag);
 	// attach draggable handlers after appended to minimize layout thrash
 	const cards = stack.querySelectorAll('.note-card');
 	cards.forEach(c=> makeDraggable(c, stack, overlay, ()=>{}));
 	// ensure visual stacking is 1..N with 1 on top
 	restack(stack);

	// hint text
	const hint = document.createElement('div'); hint.className = 'note-hint'; hint.textContent = 'Drag the top note away to reveal the next';
	stack.appendChild(hint);

	document.body.appendChild(overlay);
	// attach a check that resolves when overlay removed by last card
	overlay._resolveNotes = resolve;
	});
}

// rearrange depth classes and z-indexes for smooth restacking
function restack(stack){
	const cards = Array.from(stack.querySelectorAll('.note-card'));
	// top card should be last in DOM order; we position based on index
	for(let i=0;i<cards.length;i++){
		const idx = cards.length-1-i; // 0 -> top
		const c = cards[idx];
		c.classList.remove('depth-0','depth-1','depth-2');
		const depth = Math.min(2, i);
		c.classList.add('depth-' + depth);
		c.style.zIndex = 60 + (idx);
		c.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), box-shadow .25s';
		// remove note-in class after initial entrance
		c.classList.remove('note-in');
	}
}

function openPhotoModal(src){
 	const m = document.createElement('div'); m.className = 'photo-modal';
 	const img = document.createElement('img'); img.src = src; img.alt = 'photo';
 	const hint = document.createElement('div'); hint.className = 'close-hint'; hint.textContent = 'Click to close';
 	m.appendChild(img); m.appendChild(hint);
 	m.addEventListener('click', ()=> m.remove());
 	document.body.appendChild(m);
}

function makeDraggable(el, stack, overlay, doneCallback){
	let finished = false;
	const finishOnce = ()=>{
		if(finished) return; finished = true;
		if(typeof doneCallback === 'function') doneCallback();
		if(overlay){
			// remove overlay and resolve if provided
			if(typeof overlay._resolveNotes === 'function') overlay._resolveNotes();
			overlay.remove();
		}
	};

	let startX=0, startY=0, x=0, y=0, isDown=false;
	let rafId = null;

	function applyTransform(){
		rafId = null;
		const rot = x / 20;
		// keep the base centered translate and apply pointer delta via translate3d for GPU compositing
		el.style.transform = `translate(-50%,-50%) translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
	}

	el.addEventListener('pointerdown', (ev)=>{
		el.setPointerCapture(ev.pointerId);
		isDown = true; startX = ev.clientX; startY = ev.clientY;
		x = 0; y = 0;
		el.style.transition = 'none';
		el.style.willChange = 'transform';
		// bring to top visually
		el.style.zIndex = 9999;
	});

	el.addEventListener('pointermove', (ev)=>{
		if(!isDown) return;
		x = ev.clientX - startX; y = ev.clientY - startY;
		if(rafId === null) rafId = requestAnimationFrame(applyTransform);
	});

	el.addEventListener('pointerup', (ev)=>{
		if(!isDown) return; isDown=false; el.releasePointerCapture(ev.pointerId);
		if(rafId !== null){ cancelAnimationFrame(rafId); rafId = null; applyTransform(); }
		const threshold = Math.max(window.innerWidth*0.18, 90);
		// if dragged far horizontally or far up/down, remove card
		if(Math.abs(x) > threshold || Math.abs(y) > threshold*0.9){
			const dirX = x > 0 ? 1 : -1; const dirY = y > 0 ? 1 : -1;
			el.classList.add('removing');
			// animate to center-bottom to collect
			el.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 500ms';
			el.style.transform = `translate(-50%, 200px) scale(0.7) rotate(${dirX*8}deg)`;
			el.style.opacity = '0';
			setTimeout(()=>{
				el.remove();
				// if no more cards, remove overlay
				const remaining = stack.querySelectorAll('.note-card');
				if(remaining.length === 0){ finishOnce(); }
				else{ restack(stack); }
			},500);
		}else{
			// return to stacked position
			el.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
			el.style.transform = 'translate(-50%,-50%)';
			el.style.zIndex = ''; x=0; y=0;
		}
	});

	el.addEventListener('pointercancel', ()=>{ if(rafId!==null){ cancelAnimationFrame(rafId); rafId=null;} el.style.transform='translate(-50%,-50%)'; el.style.zIndex=''; });
}

function showCollage(){
	const overlay = document.createElement('div'); overlay.className = 'collage-overlay';
	const container = document.createElement('div'); container.className = 'collage-container';
	const title = document.createElement('div'); title.className = 'collage-title'; title.textContent = 'Our Beautiful Memories';
	container.appendChild(title);

	const grid = document.createElement('div'); grid.className = 'collage-grid';
	const images = [
		'c:\Users\malge\OneDrive\Desktop\IMG_20251026_004037_682.jpg', 'c:\Users\malge\OneDrive\Desktop\IMG_20251026_005257_585.jpg.jpg', 'c:\Users\malge\OneDrive\Desktop\IMG_20251029_164829_634.jpg.jpg',
		'collage4.jpg', 'collage5.jpg', 'collage6.jpg'
	];
	images.forEach(src=>{
		const item = document.createElement('div'); item.className = 'collage-item';
		const img = document.createElement('img'); img.src = src; img.alt = 'memory';
		item.appendChild(img);
		grid.appendChild(item);
	});
	container.appendChild(grid);

	const hint = document.createElement('div'); hint.className = 'collage-close'; hint.textContent = 'Click anywhere to close and enjoy the rest of the evening ♥';
	container.appendChild(hint);
	overlay.appendChild(container);
	overlay.addEventListener('click', ()=> overlay.remove());
	document.body.appendChild(overlay);
}
