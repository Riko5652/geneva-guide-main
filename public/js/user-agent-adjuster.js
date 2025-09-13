/**
 * User Agent Adjustment System
 * Automatically detects device type and applies appropriate styles
 * Prevents UI breaking across different devices
 */

class UserAgentAdjuster {
    constructor() {
        this.deviceType = this.detectDevice();
        this.screenSize = this.getScreenSize();
        this.orientation = this.getOrientation();
        this.isInitialized = false;
        
        if (this.screenSize && this.screenSize.width && this.screenSize.height) {
            console.log(`🔧 User Agent Adjuster initialized: ${this.deviceType} (${this.screenSize.width}x${this.screenSize.height})`);
        } else {
            console.log(`🔧 User Agent Adjuster initialized: ${this.deviceType} (screen size not available)`);
        }
        
        this.init();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        console.log('🔍 User Agent:', userAgent);
        
        // Check for mobile devices first
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
        
        console.log('🔍 isMobile:', isMobile, 'isTablet:', isTablet);
        
        // Prioritize user agent detection for test compatibility
        if (isTablet) {
            console.log('🔍 Detected: tablet');
            return 'tablet';
        } else if (isMobile) {
            console.log('🔍 Detected: mobile');
            return 'mobile';
        }
        
        // Fallback to screen size detection
        const screenWidth = window.innerWidth;
        console.log('🔍 Screen width:', screenWidth);
        
        if (screenWidth >= 768 && screenWidth < 1024) {
            console.log('🔍 Detected: tablet (by screen)');
            return 'tablet';
        } else if (screenWidth < 768) {
            console.log('🔍 Detected: mobile (by screen)');
            return 'mobile';
        } else {
            console.log('🔍 Detected: desktop (by screen)');
            return 'desktop';
        }
    }

    getScreenSize() {
        if (typeof window !== 'undefined' && window.innerWidth) {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        return {
            width: 1024,
            height: 768
        };
    }

    getOrientation() {
        if (typeof window !== 'undefined' && window.innerWidth) {
            return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        }
        return 'landscape';
    }

    init() {
        if (this.isInitialized) return;
        
        this.addDeviceClasses();
        this.setupResponsiveHandlers();
        this.setupOrientationChange();
        
        this.isInitialized = true;
        console.log(`✅ User Agent Adjuster setup complete for ${this.deviceType}`);
    }

    addDeviceClasses() {
        const body = document.body;
        
        // Remove existing device classes (both prefixed and non-prefixed)
        body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        body.classList.remove('mobile', 'tablet', 'desktop');
        
        // Add current device class (both prefixed and non-prefixed for compatibility)
        body.classList.add(`device-${this.deviceType}`);
        body.classList.add(this.deviceType);
        
        // Add orientation class
        body.classList.remove('orientation-portrait', 'orientation-landscape');
        body.classList.add(`orientation-${this.orientation}`);
        
        // Add screen size classes
        body.classList.remove('screen-small', 'screen-medium', 'screen-large', 'screen-xlarge');
        if (this.screenSize && this.screenSize.width) {
            if (this.screenSize.width < 768) {
                body.classList.add('screen-small');
            } else if (this.screenSize.width < 1024) {
                body.classList.add('screen-medium');
            } else if (this.screenSize.width < 1440) {
                body.classList.add('screen-large');
            } else {
                body.classList.add('screen-xlarge');
            }
        } else {
            // Fallback: add medium screen class if screenSize is not available
            body.classList.add('screen-medium');
        }
    }

    setupResponsiveHandlers() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newDeviceType = this.detectDevice();
                const newScreenSize = this.getScreenSize();
                const newOrientation = this.getOrientation();
                
                if (newDeviceType !== this.deviceType || 
                    (this.screenSize && newScreenSize && newScreenSize.width !== this.screenSize.width) ||
                    newOrientation !== this.orientation) {
                    
                    this.deviceType = newDeviceType;
                    this.screenSize = newScreenSize;
                    this.orientation = newOrientation;
                    
                    this.addDeviceClasses();
                    
                    console.log(`🔄 Device changed to: ${this.deviceType} (${this.screenSize ? this.screenSize.width : 'unknown'}x${this.screenSize ? this.screenSize.height : 'unknown'})`);
                }
            }, 250);
        });
    }




    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                const newOrientation = this.getOrientation();
                if (newOrientation !== this.orientation) {
                    this.orientation = newOrientation;
                    this.addDeviceClasses();
                    
                    console.log(`🔄 Orientation changed to: ${this.orientation}`);
                }
            }, 100);
        });
    }

    // Public methods for external use
    getDeviceType() {
        return this.deviceType;
    }

    // getScreenSize() method already defined above

    isMobile() {
        return this.deviceType === 'mobile';
    }

    isTablet() {
        return this.deviceType === 'tablet';
    }

    isDesktop() {
        return this.deviceType === 'desktop';
    }

    // Force refresh of all adjustments
    refresh() {
        this.deviceType = this.detectDevice();
        this.screenSize = this.getScreenSize();
        this.orientation = this.getOrientation();
        
        this.addDeviceClasses();
        
        console.log(`🔄 User Agent Adjuster refreshed: ${this.deviceType}`);
    }
}

// Initialize the User Agent Adjuster
let userAgentAdjuster;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        userAgentAdjuster = new UserAgentAdjuster();
        window.userAgentAdjuster = userAgentAdjuster;
    });
} else {
    userAgentAdjuster = new UserAgentAdjuster();
    window.userAgentAdjuster = userAgentAdjuster;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAgentAdjuster;
}
