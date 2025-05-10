# Ciano

A react native frontend for [Blu](https://github.com/diegostafa/blu)

run with:

- `npm install`
- `npx react-native start`
- `npx react-native run-android`

todo:

- app:
  - [ ] add app icon
  - [ ] splash screen
  - [ ] storage permissions to download media
  - [ ] dark and light themes
  - [ ] better error handling and messages
- history:
  - [ ] add button to clear the history
  - [ ] add input to filter the history
- settings:
  - [ ] fill the various sections (appearance, accessibility ...)
- catalog:
  - [ ] hide FAB when scrolling down
  - [ ] sort and filter the catalog
- thread:
  - [ ] hide FAB when scrolling down
  - [ ] ~~swipe to reply~~ maybe not
  - [ ] sort and filter the thread
- notifications:
  - [ ] add state.myThreads
  - [ ] periodically update threads in state.myThreads
  - [ ] in app/push Notification when replies arrive
- gallery:
  - [ ] gallery for catalog and thread images
  - [ ] tap and hold for a menu (download, copy name, copy link, share)
