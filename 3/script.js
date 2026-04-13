// 作品集主頁面腳本

class Portfolio {
    constructor() {
        this.setupEventListeners();
        this.initNavigation();
    }

    setupEventListeners() {
        // 平滑滾動並更新導航
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.updateActiveLink(link);
                }
            });
        });

        // 視口感知導航
        window.addEventListener('scroll', () => this.updateNavigationOnScroll());

        // 項目卡片點擊效果
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.animation = 'none';
                setTimeout(() => {
                    card.style.animation = '';
                }, 10);
            });
        });
    }

    initNavigation() {
        // 初始化導航
        this.updateNavigationOnScroll();
    }

    updateNavigationOnScroll() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    updateActiveLink(link) {
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
        });
        link.classList.add('active');
    }
}

// 添加性能優化：使用 Intersection Observer 進行懶加載
class LazyLoadObserver {
    constructor() {
        this.setupObserver();
    }

    setupObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.project-card, .skill-category, .stat-box').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
}

// 初始化頁面
window.addEventListener('DOMContentLoaded', () => {
    new Portfolio();
    new LazyLoadObserver();
    
    // 添加頁面加載完成提示
    console.log('✅ 作品集頁面加載完成！');
    console.log('📚 技術棧: HTML5 + CSS3 + JavaScript ES6+');
    console.log('🎨 設計模式: 響應式設計 + 動畫優化');
});

// 添加滾動性能優化
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // 更新導航
            ticking = false;
        });
        ticking = true;
    }
});

// 根據設備類型優化
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}
