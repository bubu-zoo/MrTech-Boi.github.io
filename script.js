document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    const loaderBar = document.querySelector('.loader-bar');
    const loaderText = document.querySelector('.loader-text');

    if (preloader && loaderBar && loaderText) {
        body.style.overflow = 'hidden';
        let progress = 0;
        const texts = ["Initializing...", "Scanning Your IP...", "Avoiding Firewall...", "Unsecuring Channels...", "System Online."];
        let textIndex = 0;
        loaderText.textContent = texts[textIndex];

        const interval = setInterval(() => {
            progress += Math.random() * 20 + 10;
            if (progress >= 100) {
                progress = 100; clearInterval(interval);
                loaderText.textContent = texts[texts.length - 1];
                gsap.to(loaderBar, { width: '100%', duration: 0.3, onComplete: hidePreloader });
            } else {
                gsap.to(loaderBar, { width: `${progress}%`, duration: 0.4, ease: "power1.out" });
                if (progress > (textIndex + 1) * 25 && textIndex < texts.length - 2) {
                    textIndex++; loaderText.textContent = texts[textIndex];
                }
            }
        }, 300);

        function hidePreloader() {
            gsap.to(preloader, {
                opacity: 0, duration: 0.6, ease: "power2.inOut",
                onComplete: () => {
                    if (preloader) preloader.style.display = 'none';
                    body.style.overflow = '';
                    initPageInteractions();
                }
            });
        }
    } else {
        console.warn("Preloader elements not found.");
        body.style.overflow = '';
        initPageInteractions();
    }

    function initPageInteractions() {
        // --- Real-time Custom Cursor ---
        const customCursor = document.querySelector('.custom-cursor');
        if (customCursor && window.matchMedia('(pointer: fine)').matches) {
            window.addEventListener('mousemove', (e) => {
                gsap.set(customCursor, { x: e.clientX, y: e.clientY });
            });
            const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-card, .blog-post-card, .logo');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { customCursor.classList.add('text-input-hover'); }
                    else { customCursor.classList.add('pointer-hover'); }
                });
                el.addEventListener('mouseleave', () => { customCursor.classList.remove('pointer-hover'); customCursor.classList.remove('text-input-hover'); });
            });
            document.addEventListener('mousedown', () => customCursor.classList.add('clicking'));
            document.addEventListener('mouseup', () => customCursor.classList.remove('clicking'));
        } else if (customCursor) { customCursor.style.display = 'none'; }

        // --- Header Reveal ---
        gsap.to(".site-header", { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.1 });

        // --- Theme Toggle (persisted) ---
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('vv-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        if (currentTheme === 'light') document.body.classList.add('theme-light');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('theme-light');
                const newTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
                localStorage.setItem('vv-theme', newTheme);
            });
        }

        // --- Section (Page) Switching Logic ---
        const navLinks = document.querySelectorAll('.main-nav .nav-link');
        const pageSections = document.querySelectorAll('.page-section');
        const pageContentWrapper = document.getElementById('page-content-wrapper');
        const siteHeader = document.querySelector('.site-header');
        let currentHeroAnimation = null;
        let asciiTerminalAnimationTimeout = null; 

        function showSection(targetId, firstLoad = false) {
            let sectionToShow = null;
            pageSections.forEach(section => {
                if (section.id === targetId) {
                    sectionToShow = section;
                } else {
                    gsap.to(section, { 
                        opacity: 0, 
                        duration: 0.3, 
                        onComplete: () => {
                            section.classList.remove('active-section');
                            section.style.display = 'none'; 
                        }
                    });
                }
            });

            if (sectionToShow) {
                sectionToShow.style.display = sectionToShow.id === 'hero' ? 'flex' : 'block';
                sectionToShow.classList.add('active-section'); 
                
                gsap.fromTo(sectionToShow, 
                    { opacity: 0, y: 15 }, 
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: firstLoad ? 0.4 : 0.1 }
                );

                if (!firstLoad && pageContentWrapper && siteHeader) {
                    const headerHeight = siteHeader.offsetHeight;
                    let scrollToY = pageContentWrapper.offsetTop - headerHeight;
                    if (scrollToY < 0) scrollToY = 0; 
                    window.scrollTo({ top: scrollToY, behavior: 'smooth' });
                } else if (firstLoad) {
                     window.scrollTo({ top: 0 }); 
                }
            }

            navLinks.forEach(link => {
                link.classList.toggle('active-nav-link', link.dataset.target === targetId);
            });
            
            if (targetId !== 'hero' && currentHeroAnimation) {
                currentHeroAnimation.kill(); currentHeroAnimation = null;
            }

            const terminalContainer = document.querySelector('.ascii-terminal-container');
            const terminalOutput = document.getElementById('ascii-terminal-output');
            
            if (asciiTerminalAnimationTimeout) { clearTimeout(asciiTerminalAnimationTimeout); asciiTerminalAnimationTimeout = null; }
            if (terminalOutput) terminalOutput.textContent = ''; 

            if (targetId === 'hero' && sectionToShow) { 
                currentHeroAnimation = animateHeroTitle(); 
                if (terminalContainer && terminalOutput) { initAsciiTerminalAnimation(); }
            } else {
                if (terminalContainer) gsap.set(terminalContainer, {opacity:0, y: 15});
            }
        }
        
        function animateHeroTitle() {
            const heroTitle = document.querySelector('#hero .hero-title.cyber-reveal-text');
            const heroSubtitle = document.querySelector('#hero .hero-subtitle');
            const tlHero = gsap.timeline();

            if (heroTitle && (!heroTitle.classList.contains('animated') || heroTitle.querySelectorAll('.char').length === 0) ) {
                heroTitle.classList.remove('animated');
                const originalText = heroTitle.getAttribute('data-original-text') || heroTitle.textContent.trim();
                heroTitle.setAttribute('data-original-text', originalText);

                if (originalText.length > 0) {
                    heroTitle.innerHTML = '';
                    originalText.split('').forEach(char => {
                        const span = document.createElement('span'); span.className = 'char';
                        span.textContent = char === ' ' ? '\u00A0' : char; heroTitle.appendChild(span);
                    });
                }

                tlHero.fromTo(heroTitle.querySelectorAll('.char'),
                    { opacity:0, y:30, scale:0.7, filter:'blur(3px)', rotationX:-60 },
                    { opacity:1, y:0, scale:1, filter:'blur(0px)', rotationX:0, duration:0.8, stagger:0.03, ease:'expo.out', 
                      onComplete: () => heroTitle.classList.add('animated') 
                    }, 0.4); 
                
                if(heroSubtitle) {
                    tlHero.fromTo(heroSubtitle, {opacity:0, y:20}, {opacity:1, y:0, duration:0.8, ease:'expo.out'}, 0.9);
                }
            } else if (heroTitle && heroSubtitle && heroTitle.classList.contains('animated')) { 
                gsap.set(heroTitle.querySelectorAll('.char'), {opacity:1, y:0, scale:1, filter:'blur(0px)', rotationX:0});
                gsap.set(heroSubtitle, {opacity:1, y:0});
            }
            return tlHero;
        }

        // --- Inject skill bars into skill-cards and animate on scroll ---
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            const level = parseInt(card.dataset.level || '70', 10);
            const bar = document.createElement('div'); bar.className = 'skill-bar';
            const fill = document.createElement('div'); fill.className = 'skill-fill';
            bar.appendChild(fill); card.appendChild(bar);
            // animate when in view using ScrollTrigger if available
            if (gsap && gsap.registerPlugin && gsap.utils && gsap.core) {
                try {
                    gsap.registerPlugin(ScrollTrigger);
                } catch (e) { /* already registered */ }
                gsap.fromTo(fill, { width: '0%' }, {
                    width: level + '%', duration: 1.2, ease: 'power2.out', scrollTrigger: {
                        trigger: card, start: 'top 85%', toggleActions: 'play none none reverse'
                    }
                });
            } else {
                // fallback: simple timeout
                setTimeout(() => { fill.style.width = level + '%'; }, 700);
            }
        });

        // --- Statistics Counter Animation ---
        const statNumbers = document.querySelectorAll('.stat-number');
        let statsAnimated = false;
        
        function animateStats() {
            if (statsAnimated) return;
            statsAnimated = true;
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.target);
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        stat.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        stat.textContent = target;
                    }
                };
                
                updateCounter();
            });
        }
        
        // Trigger stats animation when stats section is visible
        const statsSection = document.getElementById('stats');
        if (statsSection && gsap && gsap.registerPlugin) {
            try {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.create({
                    trigger: statsSection,
                    start: 'top 80%',
                    onEnter: animateStats,
                    once: true
                });
            } catch (e) {
                // Fallback: animate when section becomes active
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.attributeName === 'class' && 
                            statsSection.classList.contains('active-section')) {
                            animateStats();
                        }
                    });
                });
                observer.observe(statsSection, { attributes: true });
            }
        }


        function initAsciiTerminalAnimation() {
            const terminalOutput = document.getElementById('ascii-terminal-output');
            const terminalContainer = document.querySelector('.ascii-terminal-container');
        
            if (!terminalOutput || !terminalContainer) return;
        
            if (asciiTerminalAnimationTimeout) { clearTimeout(asciiTerminalAnimationTimeout); asciiTerminalAnimationTimeout = null; }
            terminalOutput.textContent = ''; 
        
            const phrases = [ "> Accessing mainframe...", "> Encrypting funny_cat_videos.zip...", "> Bypassing firewall with 'please!!!'...", "> Found vulnerabilities: 0 (today!)...", "> System status: Mostly harmless.", "> Initiate cat.exe...", "> Reality is a simulation. Secure it." ];
            let currentPhraseIndex = 0; let charIndex = 0;
            const typingSpeed = 70; const phraseDelay = 2200; 
        
            function typeCharacter() {
                if (!document.getElementById('hero').classList.contains('active-section') || !terminalOutput) {
                    if (asciiTerminalAnimationTimeout) clearTimeout(asciiTerminalAnimationTimeout); return; 
                }
                if (charIndex < phrases[currentPhraseIndex].length) {
                    terminalOutput.textContent += phrases[currentPhraseIndex].charAt(charIndex); charIndex++;
                    asciiTerminalAnimationTimeout = setTimeout(typeCharacter, typingSpeed);
                } else {
                    asciiTerminalAnimationTimeout = setTimeout(nextPhraseInTerminal, phraseDelay);
                }
            }
        
            function nextPhraseInTerminal() {
                if (!document.getElementById('hero').classList.contains('active-section') || !terminalOutput) {
                     if (asciiTerminalAnimationTimeout) clearTimeout(asciiTerminalAnimationTimeout); return; 
                }
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length; charIndex = 0;
                terminalOutput.textContent = ''; typeCharacter(); 
            }
        
            gsap.to(terminalContainer, {
                opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.5, 
                onComplete: () => { if (document.getElementById('hero').classList.contains('active-section')) { typeCharacter(); } }
            });
        }

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); const targetId = e.target.dataset.target; showSection(targetId);
                if (history.pushState) { history.pushState(null, null, `#${targetId}`); } else { location.hash = `#${targetId}`; }
            });
        });

        let initialSectionId = location.hash.substring(1) || 'hero';
        if (!document.getElementById(initialSectionId)) { initialSectionId = 'hero'; }
        setTimeout(() => { showSection(initialSectionId, true); }, 50); 
        

        // --- Plexus Background for Hero ---
        const heroSectionCanvasEl = document.getElementById('hero');
        const canvasPlexus = document.getElementById('plexus-canvas');
        if (canvasPlexus && heroSectionCanvasEl && window.matchMedia('(min-width: 769px)').matches) {
            const ctx = canvasPlexus.getContext('2d');let particlesArray = [], animationFrameIdPlexus = null;
            function resizeCanvasPlexus() { if(heroSectionCanvasEl.offsetWidth > 0 && heroSectionCanvasEl.offsetHeight > 0) {canvasPlexus.width = heroSectionCanvasEl.offsetWidth; canvasPlexus.height = heroSectionCanvasEl.offsetHeight;} }
            class Particle { constructor(x,y,dX,dY,s){this.x=x;this.y=y;this.dX=dX;this.dY=dY;this.s=s;} draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2,false);ctx.fillStyle='rgba(0,255,255,0.2)';ctx.fill();} update(){if(this.x>canvasPlexus.width+this.s||this.x<-this.s){this.dX=-this.dX;}if(this.y>canvasPlexus.height+this.s||this.y<-this.s){this.dY=-this.dY;}this.x+=this.dX;this.y+=this.dY;this.draw();}}
            function initPlexusParticles(){particlesArray=[];if(canvasPlexus.width === 0 || canvasPlexus.height === 0) return; let n=(canvasPlexus.width*canvasPlexus.height)/25000;n=Math.min(n,70);for(let i=0;i<n;i++){let s=(Math.random()*1.2)+0.5,xc=Math.random()*canvasPlexus.width,yc=Math.random()*canvasPlexus.height,dX=(Math.random()*.2)-.1,dY=(Math.random()*.2)-.1;particlesArray.push(new Particle(xc,yc,dX,dY,s));}}
            function connectPlexusLines(){if(canvasPlexus.width === 0 || canvasPlexus.height === 0) return; for(let a=0;a<particlesArray.length;a++){for(let b=a+1;b<particlesArray.length;b++){let d=Math.sqrt(((particlesArray[a].x-particlesArray[b].x)**2)+((particlesArray[a].y-particlesArray[b].y)**2));const cD=Math.min(canvasPlexus.width/9,110);if(d<cD){const o=1-(d/cD);ctx.strokeStyle=`rgba(0,200,200,${o*.2})`;ctx.lineWidth=.2;ctx.beginPath();ctx.moveTo(particlesArray[a].x,particlesArray[a].y);ctx.lineTo(particlesArray[b].x,particlesArray[b].y);ctx.stroke();}}}}
            function animatePlexusFrame(){animationFrameIdPlexus=requestAnimationFrame(animatePlexusFrame);if(canvasPlexus.width > 0 && canvasPlexus.height > 0){ctx.clearRect(0,0,canvasPlexus.width,canvasPlexus.height);particlesArray.forEach(p=>p.update());connectPlexusLines();}}
            function startPlexus() { if (!animationFrameIdPlexus && heroSectionCanvasEl.classList.contains('active-section')) { resizeCanvasPlexus(); initPlexusParticles(); animatePlexusFrame(); } }
            function stopPlexus() { if (animationFrameIdPlexus) { cancelAnimationFrame(animationFrameIdPlexus); animationFrameIdPlexus = null; } }
            if (heroSectionCanvasEl.classList.contains('active-section')) { startPlexus(); }
            window.addEventListener('resize',() => { if(heroSectionCanvasEl.classList.contains('active-section')){ resizeCanvasPlexus(); initPlexusParticles(); }});
            const heroObserver = new MutationObserver(mutations=>{mutations.forEach(mutation=>{if(mutation.attributeName==='class'){if(heroSectionCanvasEl.classList.contains('active-section')){startPlexus();}else{stopPlexus();}}});});
            heroObserver.observe(heroSectionCanvasEl, { attributes: true });
        }

        // --- Contact Form ---
        const contactForm = document.getElementById('contactForm'); const formStatus = document.getElementById('form-status');
        if(contactForm && formStatus){contactForm.addEventListener('submit',function(e){e.preventDefault();const d=new FormData(contactForm),b=contactForm.querySelector('button[type="submit"]'),t=b.textContent;b.disabled=true;b.textContent='Transmitting...';formStatus.textContent='';formStatus.className='form-status-message';fetch(contactForm.action,{method:'POST',body:d,headers:{'Accept':'application/json'}}).then(r=>{if(r.ok)return r.json();return r.json().then(j=>{throw new Error(j.errors?j.errors.map(er=>er.message).join(', '):'Network error.');});}).then(j=>{formStatus.textContent="Message sent! I'll be in touch.";formStatus.classList.add('success');contactForm.reset();}).catch(er=>{console.error('Form error:',er);formStatus.textContent="Error: "+(er.message||"Could not send. Try again.");formStatus.classList.add('error');}).finally(()=>{b.disabled=false;b.textContent=t;});});}

        // --- Copyright Year ---
        const currentYearEl = document.getElementById('current-year'); if(currentYearEl) currentYearEl.textContent = new Date().getFullYear();

        // --- Project modal/lightbox ---
        // create modal node
        let projectModal = document.querySelector('.project-modal');
        if (!projectModal) {
            projectModal = document.createElement('div'); projectModal.className = 'project-modal';
            projectModal.innerHTML = '<div class="modal-card"><button class="modal-close">✕</button><div class="modal-body"></div></div>';
            document.body.appendChild(projectModal);
        }
        const modalBody = projectModal.querySelector('.modal-body');
        const modalCloseBtn = projectModal.querySelector('.modal-close');
        document.querySelectorAll('.project-card-link-wrapper').forEach((linkWrapper, idx) => {
            linkWrapper.addEventListener('click', (e) => {
                e.preventDefault();
                const card = linkWrapper.closest('.project-card');
                const img = card.querySelector('img');
                const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
                const excerpt = card.querySelector('.project-excerpt') ? card.querySelector('.project-excerpt').textContent : '';
                const tags = Array.from(card.querySelectorAll('.project-tags span')).map(s => s.textContent).join(' • ');
                modalBody.innerHTML = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;"><div style="flex:1 1 300px;min-width:240px;"><img src="'+(img?img.src:'')+'" alt="'+title+'" style="width:100%;border-radius:6px;display:block;object-fit:cover;" /></div><div style="flex:1 1 320px;min-width:240px;"><h3 style="margin-top:0;color:var(--accent-color);font-family:var(--font-mono);">'+title+'</h3><p style="color:var(--primary-text-color);">'+excerpt+'</p><p style="color:var(--secondary-text-color);"><small>'+tags+'</small></p><p style="margin-top:12px;"><a href="#" style="color:var(--accent-color);text-decoration:none;font-family:var(--font-mono);">View details →</a></p></div></div>';
                projectModal.classList.add('open');
            });
        });
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => projectModal.classList.remove('open'));
        projectModal.addEventListener('click', (e) => { if (e.target === projectModal) projectModal.classList.remove('open'); });

        // --- Project card tilt on pointer move ---
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('pointermove', e => {
                const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height;
                const rotateY = (px - 0.5) * 8; const rotateX = (0.5 - py) * 6;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
                card.classList.add('tilt');
            });
            card.addEventListener('pointerleave', () => { card.style.transform = ''; card.classList.remove('tilt'); });
        });

        // --- Back to top button ---
        let backToTop = document.querySelector('.back-to-top');
        if (!backToTop) { backToTop = document.createElement('button'); backToTop.className = 'back-to-top'; backToTop.textContent = '↑ Top'; document.body.appendChild(backToTop); }
        window.addEventListener('scroll', () => { if (window.scrollY > 400) backToTop.classList.add('show'); else backToTop.classList.remove('show'); });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // --- Matrix / falling binary background ---
        (function initMatrix() {
            const canvas = document.getElementById('matrix-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let width = 0, height = 0, columns = [], animationId = null; const symbols = ['0','1','A','B','C','D','E','F'];

            function resize() {
                width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; const fontSize = Math.max(12, Math.min(20, Math.floor(width / 90)));
                ctx.font = fontSize + 'px monospace'; const cols = Math.floor(width / (fontSize * 0.6)); columns = new Array(cols).fill(0).map(() => Math.floor(Math.random() * height));
            }

            function draw() {
                ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0,0,width,height);
                ctx.fillStyle = 'rgba(0,200,200,0.9)'; ctx.shadowColor = 'rgba(0,200,200,0.6)'; ctx.shadowBlur = 10;
                for (let i = 0; i < columns.length; i++) {
                    const x = i * (ctx.measureText('A').width * 0.9);
                    const y = columns[i] * (parseInt(ctx.font, 10));
                    const text = Math.random() > 0.15 ? symbols[Math.floor(Math.random() * symbols.length)] : Math.floor(Math.random()*16).toString(16);
                    ctx.fillText(text, x, y);
                    if (y > height + 20 || Math.random() > 0.995) columns[i] = 0; else columns[i] += 1;
                }
                animationId = requestAnimationFrame(draw);
            }

            function start() { if (!animationId) { resize(); animationId = requestAnimationFrame(draw); } }
            function stop() { if (animationId) { cancelAnimationFrame(animationId); animationId = null; } }

            window.addEventListener('resize', () => { stop(); resize(); start(); });
            document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
            // always start matrix, but the resize() computes an appropriate fontSize so very small screens are lightweight
            start();
        })();
    }
});
