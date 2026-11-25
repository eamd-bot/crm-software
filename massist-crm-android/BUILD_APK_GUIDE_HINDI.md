# MassistCRM Android APK — GitHub Cloud Build Guide

Is project mein aapka poora **MassistCRM** web app Android WebView app ke andar bundled hai (`app/src/main/assets/www/`) aur `.github/workflows/build-apk.yml` ke saath configured hai.

## GitHub par Cloud APK Build Kaise Karein (Bina Android Studio ke)

1. **GitHub Repository Banayein:**
   - [github.com/new](https://github.com/new) par jaayein aur ek new repository banayein (e.g., `massist-crm-android`).
2. **Project Files Upload Karein:**
   - Is folder (`massist-crm-android`) ke andar ki saari files aur folders (`.github/`, `app/`, `gradle/`, `build.gradle`, `settings.gradle`, `gradle.properties`) upload/push karein.
   - Dhyan rakhein ki hidden `.github/workflows/build-apk.yml` folder bhi zaroor upload ho (GitHub Web UI par drag-and-drop ya `git push` dono kaam karte hain).
3. **Actions Tab se APK Build Chalayein / Dekhein:**
   - Repository ke **Actions** tab mein jaayein.
   - Push karte hi **Build Android APK** workflow automatically start ho jayega (ya **Run workflow** button se manually chala sakte hain).
4. **APK Download Karein:**
   - Build green (complete) hone ke baad workflow run par click karein.
   - Neeche **Artifacts** section mein **`MassistCRM-FieldForce-APK`** par click karke `.zip` download karein.
   - Zip extract karein — uske andar **`app-debug.apk`** milegi, jise aap kisi bhi Android phone mein directly install kar sakte hain.
