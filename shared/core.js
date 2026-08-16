/**
 * Arcade Hub Core Module
 * Shared utilities for all games to ensure modularity and native feel.
 */

const ArcadeHub = {
    /**
     * Trigger a haptic vibration (if supported)
     * @param {number|number[]} pattern - Duration in ms or an array for patterns
     */
    vibrate: function(pattern = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * Save a high score for a specific game
     * @param {string} gameId - Unique identifier for the game
     * @param {number} score - The score to save
     */
    saveScore: function(gameId, score) {
        const scores = JSON.parse(localStorage.getItem('arcade_hub_scores') || '{}');
        if (!scores[gameId] || score > scores[gameId]) {
            scores[gameId] = score;
            localStorage.setItem('arcade_hub_scores', JSON.stringify(scores));
            return true; // New high score
        }
        return false;
    },

    /**
     * Get the high score for a game
     * @param {string} gameId
     */
    getHighScore: function(gameId) {
        const scores = JSON.parse(localStorage.getItem('arcade_hub_scores') || '{}');
        return scores[gameId] || 0;
    },

    /**
     * Go back to the main hub
     */
    goHome: function() {
        window.location.href = '../../index.html';
    },

    /**
     * Initialize common game UI elements
     */
    initCommonUI: function() {
        // Add back button listener if it exists
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.onclick = this.goHome;
        }

        // Prevent default long-press menus on mobile
        window.oncontextmenu = function(event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
    }
};

// Export for use in game scripts
window.ArcadeHub = ArcadeHub;
ArcadeHub.initCommonUI();