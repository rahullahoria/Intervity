# Native Rive Android Enhancements for React Native 0.76 (Fabric / Bridgeless)

In React Native 0.76 with Bridgeless and Fabric enabled, `RiveReactNativeViewManager` requires explicit command registration and dynamic animation switching:

1. **`getCommandsMap()` Registration:**
   Maps string commands (`play`, `pause`, `stop`, `setBooleanState`, `setNumberState`, `fireState`, etc.) to integer command IDs expected by the Android view manager dispatcher.

2. **`receiveCommand(view, commandId: Int, args)` Dispatcher:**
   Handles integer command IDs dispatched by React Native and forwards them to their respective state machine and playback methods.

3. **Dynamic Seamless Animation Switching in `RiveReactNativeView.kt`:**
   When `animationName` prop changes while the view is active, it calls `riveAnimationView.play(animationName, ...)` directly, avoiding unnecessary reloading of the Rive file.
