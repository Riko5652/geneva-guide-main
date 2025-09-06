// Family-Friendly Loading Experience
// Makes waiting fun for kids with animated messages

export class FamilyLoader {
    constructor() {
        this.loadingMessages = [
            '🧸 מכינים את הדובים לטיול...',
            '🍫 אורזים שוקולד שוויצרי...',
            '🚂 מתדלקים את הרכבת ההרים...',
            '🏔️ מצחצחים את ההרים...',
            '🦢 מאכילים את הברבורים...',
            '⛷️ משחיזים את המגלשיים...',
            '🧀 חותכים גבינה שוויצרית...',
            '🎨 מציירים את הנוף...',
            '🚁 ממריאים לשמיים...',
            '🌊 ממלאים את האגם...'
        ];
        
        this.currentMessageIndex = 0;
        this.messageInterval = null;
    }
    
    show(target = document.body) {
        // Create loading overlay
        const loader = document.createElement('div');
        loader.id = 'family-loader';
        loader.className = 'fixed inset-0 bg-white/95 backdrop-blur-md z-[9999] flex items-center justify-center';
        loader.innerHTML = `
            <div class="text-center p-8 max-w-md">
                <div class="relative w-32 h-32 mx-auto mb-6">
                    <!-- Swiss flag animation -->
                    <div class="absolute inset-0 bg-red-500 rounded-lg animate-pulse"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="bg-white w-16 h-4"></div>
                        <div class="bg-white w-4 h-16 absolute"></div>
                    </div>
                    <!-- Animated plane -->
                    <div class="absolute -top-4 -right-4 text-4xl animate-bounce">✈️</div>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">הטיול שלכם נטען...</h2>
                <p id="loading-message" class="text-lg text-gray-600 animate-pulse"></p>
                <div class="mt-6 flex justify-center space-x-2 space-x-reverse">
                    <div class="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        
        target.appendChild(loader);
        
        // Start rotating messages
        this.updateMessage();
        this.messageInterval = setInterval(() => this.updateMessage(), 2000);
    }
    
    updateMessage() {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = this.loadingMessages[this.currentMessageIndex];
                messageEl.style.opacity = '1';
                this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
            }, 200);
        }
    }
    
    hide() {
        const loader = document.getElementById('family-loader');
        if (loader) {
            clearInterval(this.messageInterval);
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }
}

// Create global instance
export const familyLoader = new FamilyLoader();

// Note: Auto-hide removed to prevent race conditions
// Loading screen is now controlled manually by the app initialization
