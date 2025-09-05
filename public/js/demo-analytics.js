/* Demo Analytics & User Experience Tracking
   Professional analytics for $30M demo presentation
*/

class DemoAnalytics {
    constructor() {
        this.startTime = Date.now();
        this.interactions = [];
        this.userJourney = [];
        this.performanceMetrics = {};
        
        this.init();
    }
    
    init() {
        this.trackPageLoad();
        this.trackInteractions();
        this.trackPerformance();
        this.createDashboard();
    }
    
    trackPageLoad() {
        window.addEventListener('load', () => {
            this.performanceMetrics.pageLoadTime = performance.now();
            this.performanceMetrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            this.performanceMetrics.firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;
            
            this.logEvent('page_loaded', {
                loadTime: this.performanceMetrics.pageLoadTime,
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                connection: navigator.connection?.effectiveType || 'unknown'
            });
        });
    }
    
    trackInteractions() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const element = e.target.closest('button, a, [data-track]');
            if (element) {
                this.logInteraction('click', {
                    element: element.tagName,
                    text: element.textContent?.trim().substring(0, 50),
                    id: element.id || '',
                    className: element.className || '',
                    timestamp: Date.now() - this.startTime
                });
            }
        });
        
        // Track modal opens
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('modal')) {
                        this.logInteraction('modal_opened', {
                            modalId: node.id || 'unknown',
                            timestamp: Date.now() - this.startTime
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.logInteraction('form_submitted', {
                formId: e.target.id || 'unknown',
                timestamp: Date.now() - this.startTime
            });
        });
    }
    
    trackPerformance() {
        // Track long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        this.logEvent('long_task', {
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            });
            
            try {
                if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
                    observer.observe({ entryTypes: ['longtask'] });
                }
            } catch (e) {
                // Long task API not supported
            }
        }
        
        // Track Core Web Vitals
        this.trackWebVitals();
    }
    
    trackWebVitals() {
        // Largest Contentful Paint
        try {
            if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.performanceMetrics.lcp = lastEntry.startTime;
                }).observe({ entryTypes: ['largest-contentful-paint'] });
            }
        } catch (e) {
            // LCP not supported
        }
        
        // First Input Delay
        new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                this.performanceMetrics.fid = entry.processingStart - entry.startTime;
            });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        try {
            if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
                let clsScore = 0;
                new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    });
                    this.performanceMetrics.cls = clsScore;
                }).observe({ entryTypes: ['layout-shift'] });
            }
        } catch (e) {
            // CLS not supported
        }
    }
    
    logEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.startTime,
            data
        };
        
        this.userJourney.push(event);
        this.updateDashboard();
    }
    
    logInteraction(interactionType, data) {
        const interaction = {
            type: interactionType,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.startTime,
            data
        };
        
        this.interactions.push(interaction);
        this.updateDashboard();
    }
    
    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'demo-analytics-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 60px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 10001;
            min-width: 250px;
            max-height: 300px;
            overflow-y: auto;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: none;
        `;
        
        dashboard.innerHTML = `
            <div style="margin-bottom: 8px; font-weight: bold; color: #00ff00;">📊 DEMO ANALYTICS</div>
            <div id="analytics-content"></div>
        `;
        
        document.body.appendChild(dashboard);
        
        // Toggle dashboard with keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        this.dashboardElement = dashboard;
        this.updateDashboard();
    }
    
    updateDashboard() {
        if (!this.dashboardElement) return;
        
        const content = this.dashboardElement.querySelector('#analytics-content');
        const sessionTime = Math.round((Date.now() - this.startTime) / 1000);
        
        content.innerHTML = `
            <div style="color: #0891b2;">⏱ Session: ${sessionTime}s</div>
            <div style="color: #10b981;">🖱 Interactions: ${this.interactions.length}</div>
            <div style="color: #f59e0b;">⚡ Load Time: ${Math.round(this.performanceMetrics.pageLoadTime || 0)}ms</div>
            <div style="color: #ef4444;">🎯 LCP: ${Math.round(this.performanceMetrics.lcp || 0)}ms</div>
            <div style="color: #8b5cf6;">📱 Viewport: ${window.innerWidth}x${window.innerHeight}</div>
            <div style="margin-top: 8px; font-size: 10px; opacity: 0.7;">Press Ctrl+Shift+A to toggle</div>
            <div style="margin-top: 8px; border-top: 1px solid #333; padding-top: 8px;">
                <div style="color: #00ff00; font-size: 10px;">Recent Interactions:</div>
                ${this.interactions.slice(-3).map(i => `
                    <div style="font-size: 9px; opacity: 0.8; margin-top: 2px;">
                        ${i.type}: ${i.data.text || i.data.modalId || 'action'} (${Math.round(i.sessionTime/1000)}s)
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    generateReport() {
        const sessionTime = Date.now() - this.startTime;
        
        return {
            sessionDuration: sessionTime,
            totalInteractions: this.interactions.length,
            interactionRate: (this.interactions.length / (sessionTime / 1000 / 60)).toFixed(2), // per minute
            performanceMetrics: this.performanceMetrics,
            userJourney: this.userJourney,
            topInteractions: this.getTopInteractions(),
            recommendations: this.generateRecommendations()
        };
    }
    
    getTopInteractions() {
        const counts = {};
        this.interactions.forEach(i => {
            const key = i.data.text || i.data.modalId || i.type;
            counts[key] = (counts[key] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([key, count]) => ({ action: key, count }));
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.pageLoadTime > 3000) {
            recommendations.push('Consider optimizing page load time (currently > 3s)');
        }
        
        if (this.performanceMetrics.lcp > 2500) {
            recommendations.push('Largest Contentful Paint could be improved (currently > 2.5s)');
        }
        
        if (this.interactions.length / (Date.now() - this.startTime) * 60000 < 0.5) {
            recommendations.push('Low interaction rate - consider improving engagement');
        }
        
        return recommendations;
    }
    
    exportData() {
        const report = this.generateReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geneva-demo-analytics-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics
window.demoAnalytics = new DemoAnalytics();

// Add export function to global scope
window.exportDemoAnalytics = () => window.demoAnalytics.exportData();

// Console message for demo purposes
console.log('%c🎯 DEMO ANALYTICS ACTIVE', 'background: linear-gradient(90deg, #0891b2, #10b981); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;');
console.log('%cPress Ctrl+Shift+A to view real-time analytics', 'color: #0891b2; font-weight: bold;');
console.log('%cCall exportDemoAnalytics() to download session data', 'color: #10b981; font-weight: bold;');
