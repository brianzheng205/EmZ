# EmZ

All things EmZ

# Firebase Emulator

Firebase Emulator can be used to emulate Cloud Firebase products (e.g. Firestore) locally.
This is useful when you want a fresh, controlled environment (e.g. empty Firestore that you can
add to manually) or if you want to develop offline, which is possible since the emulator runs locally.

Run the following command to start the emulator:

```
firebase emulators:start --project=fake-project-id --only firestore
```
