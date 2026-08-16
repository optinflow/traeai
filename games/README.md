# Adding a New Game to Arcade Hub

To add a new game to this hub, follow these modular steps:

1. **Create a Folder**: Add a new folder in `games/[game-name]`.
2. **Include Core Logic**: Include `<script src="../../shared/core.js"></script>` in your `index.html`.
3. **Use ArcadeHub Utilities**:
   - Use `ArcadeHub.vibrate()` for haptics.
   - Use `ArcadeHub.saveScore(gameId, score)` to persist high scores.
   - Use `ArcadeHub.initCommonUI()` to handle standard mobile interactions.
4. **License**: Ensure you include a redistribution-friendly license (like the provided MIT license).
5. **Update Hub**: Add a new game card to the main `index.html` in the root directory.

All games should be self-contained within their folders but share the `shared/core.js` for consistent mobile performance.