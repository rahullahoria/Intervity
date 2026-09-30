# Keep React Native JSI, Hermes, and native libraries
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.op.sqlite.** { *; }
-keep class com.rnllama.** { *; }
-keep class com.rnwhisper.** { *; }
-keep class com.offlineinterview.** { *; }
